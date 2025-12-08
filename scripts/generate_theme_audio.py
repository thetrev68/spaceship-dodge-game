"""
Procedurally generate lightweight theme audio for the game.

Outputs MP3 files into public/sounds without any external binaries.
Requires the Python package `lameenc` (pure Python MP3 encoder):

    pip install lameenc

This keeps the audio deterministic and easy to regenerate.
"""

from __future__ import annotations

import math
import random
import struct
from pathlib import Path
from typing import Callable, Iterable, List

import lameenc


SAMPLE_RATE = 44_100
PI2 = math.tau  # 2 * pi

SoundFn = Callable[[float, int], float]


def _normalize(samples: List[float], peak: float = 0.92) -> List[float]:
    """Scale samples to a safe peak level."""
    max_amp = max(abs(s) for s in samples) or 1.0
    scale = peak / max_amp
    return [s * scale for s in samples]


def _pcm16le(samples: Iterable[float]) -> bytes:
    """Convert normalized float samples (-1..1) to 16-bit PCM."""
    return b"".join(
        struct.pack("<h", max(-32768, min(32767, int(s * 32767)))) for s in samples
    )


def _encode_mp3(samples: List[float]) -> bytes:
    """Encode mono float samples to MP3 using lameenc."""
    enc = lameenc.Encoder()
    enc.set_in_sample_rate(SAMPLE_RATE)
    enc.set_channels(1)
    enc.set_quality(2)  # 2 = high, 7 = fastest
    enc.set_bit_rate(192)
    pcm = _pcm16le(_normalize(samples))
    return enc.encode(pcm) + enc.flush()


def _render(duration: float, fn: SoundFn) -> List[float]:
    """Render a mono buffer for the given generator function."""
    total = int(duration * SAMPLE_RATE)
    return [fn(i / SAMPLE_RATE, i) for i in range(total)]


def _mix(*layers: List[float]) -> List[float]:
    """Mix multiple layers (all same length)."""
    return [sum(values) for values in zip(*layers)]


def _percussive_env(length: int, attack: float = 0.01, decay: float = 0.25) -> List[float]:
    """Simple percussive envelope."""
    attack_n = max(1, int(attack * SAMPLE_RATE))
    env: List[float] = []
    for i in range(length):
        if i < attack_n:
            env.append(i / attack_n)
        else:
            env.append(math.exp(-(i - attack_n) / (SAMPLE_RATE * decay)))
    return env


def _slow_env(length: int, attack: float = 0.5, release: float = 0.5) -> List[float]:
    """Gentle fade in/out envelope for pads."""
    rel_start = length - int(release * SAMPLE_RATE)
    env: List[float] = []
    for i in range(length):
        if i < attack * SAMPLE_RATE:
            env.append(i / (attack * SAMPLE_RATE))
        elif i > rel_start:
            env.append(max(0.0, 1 - (i - rel_start) / (length - rel_start)))
        else:
            env.append(1.0)
    return env


def _sweep_wave(duration: float, start_freq: float, end_freq: float, shape: str = "sine") -> List[float]:
    """Generate a frequency sweep."""
    total = int(duration * SAMPLE_RATE)
    phase = 0.0
    samples: List[float] = []

    def wave(phi: float) -> float:
        if shape == "square":
            return 1.0 if math.sin(phi) >= 0 else -1.0
        if shape == "triangle":
            return 2.0 * abs(2.0 * ((phi / PI2) % 1) - 1.0) - 1.0
        return math.sin(phi)

    for i in range(total):
        t = i / total
        freq = start_freq + (end_freq - start_freq) * t
        phase += PI2 * freq / SAMPLE_RATE
        samples.append(wave(phase))
    return samples


def _noise(length: int, color: str = "white") -> List[float]:
    """Generate white or gently filtered noise."""
    buf: List[float] = []
    last = 0.0
    for _ in range(length):
        n = random.uniform(-1, 1)
        if color == "brown":
            last = 0.02 * n + 0.98 * last
            buf.append(last)
        elif color == "pink":
            last = 0.1 * n + 0.9 * last
            buf.append(last)
        else:
            buf.append(n)
    return buf


def _apply(env: List[float], signal: List[float], gain: float = 1.0) -> List[float]:
    """Apply envelope to signal."""
    return [e * s * gain for e, s in zip(env, signal)]


def underwater_fire() -> List[float]:
    length = int(0.65 * SAMPLE_RATE)
    env = _percussive_env(length, attack=0.012, decay=0.35)

    sweep = _sweep_wave(0.65, 180, 520, shape="sine")
    bubbles = []
    last = 0.0
    for i in range(length):
        # bubbly clicks with slight pitch wobble
        wobble = 0.5 * math.sin(PI2 * 6 * (i / SAMPLE_RATE))
        last = 0.2 * math.sin(PI2 * (480 + wobble * 40) * (i / SAMPLE_RATE)) + 0.8 * last
        bubbles.append(last)

    fizz = _noise(length, color="pink")
    return _mix(
        _apply(env, sweep, 0.7),
        _apply(env, bubbles, 0.4),
        _apply(env, fizz, 0.15),
    )


def underwater_break() -> List[float]:
    length = int(0.75 * SAMPLE_RATE)
    env = _percussive_env(length, attack=0.006, decay=0.4)
    pop = _sweep_wave(0.75, 420, 90, shape="triangle")
    fizz = _noise(length, color="white")
    ripple = _sweep_wave(0.75, 160, 210, shape="sine")
    return _mix(
        _apply(env, pop, 0.6),
        _apply(env, fizz, 0.18),
        _apply(env, ripple, 0.25),
    )


def underwater_bgm() -> List[float]:
    duration = 12.0
    total = int(duration * SAMPLE_RATE)
    pad_env = _slow_env(total, attack=1.8, release=2.0)

    def pad(t: float, _: int) -> float:
        lfo = 0.3 * math.sin(PI2 * 0.2 * t)
        return 0.6 * math.sin(PI2 * (140 + lfo * 6) * t) + 0.3 * math.sin(PI2 * 220 * t)

    base_pad = _render(duration, pad)
    sub = _render(duration, lambda t, _: 0.25 * math.sin(PI2 * 55 * t))
    shimmer = _render(
        duration,
        lambda t, _: 0.08 * math.sin(PI2 * (420 + 30 * math.sin(PI2 * 0.35 * t)) * t),
    )

    # Occasional bubble plucks
    bubble_layer = [0.0] * total
    for _ in range(24):
        center = random.randint(0, total - 1)
        blen = int(0.08 * SAMPLE_RATE)
        env = _percussive_env(blen, attack=0.005, decay=0.08)
        tone = _sweep_wave(blen / SAMPLE_RATE, 320, 180, shape="sine")
        for i in range(blen):
            idx = center + i
            if idx < total:
                bubble_layer[idx] += env[i] * tone[i] * 0.35

    return _apply(pad_env, _mix(base_pad, sub, shimmer, bubble_layer), gain=0.5)


def medieval_fire() -> List[float]:
    length = int(0.75 * SAMPLE_RATE)
    env = _percussive_env(length, attack=0.01, decay=0.45)
    roar = _sweep_wave(0.75, 320, 110, shape="square")
    hiss = _noise(length, color="pink")
    crackle = _noise(length, color="white")
    return _mix(
        _apply(env, roar, 0.55),
        _apply(env, hiss, 0.25),
        _apply(env, crackle, 0.12),
    )


def medieval_break() -> List[float]:
    length = int(0.6 * SAMPLE_RATE)
    env = _percussive_env(length, attack=0.006, decay=0.35)
    thump = _sweep_wave(0.6, 180, 60, shape="triangle")
    grit = _noise(length, color="brown")
    chime = _sweep_wave(0.6, 660, 420, shape="sine")
    return _mix(
        _apply(env, thump, 0.6),
        _apply(env, grit, 0.18),
        _apply(env, chime, 0.22),
    )


def medieval_bgm() -> List[float]:
    duration = 12.0
    total = int(duration * SAMPLE_RATE)
    env = _slow_env(total, attack=1.2, release=1.5)

    pattern = [
        (0.0, 196.0),
        (0.5, 246.9),
        (1.0, 293.7),
        (1.5, 246.9),
        (2.0, 220.0),
        (2.5, 261.6),
        (3.0, 329.6),
        (3.5, 261.6),
    ]

    buf = [0.0] * total
    for start, freq in pattern * 3:  # repeat pattern
        note_len = int(0.9 * SAMPLE_RATE)
        note_env = _percussive_env(note_len, attack=0.01, decay=0.6)
        tone = _sweep_wave(note_len / SAMPLE_RATE, freq, freq * 0.97, shape="sine")
        offset = int(start * SAMPLE_RATE)
        for i in range(note_len):
            idx = offset + i
            if idx < total:
                buf[idx] += note_env[i] * tone[i] * 0.55

    drone = _render(duration, lambda t, _: 0.22 * math.sin(PI2 * 110 * t))
    shimmer = _render(duration, lambda t, _: 0.08 * math.sin(PI2 * 660 * t))
    return _apply(env, _mix(buf, drone, shimmer), gain=0.8)


def write_sound(path: Path, samples: List[float]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(_encode_mp3(samples))
    print(f"wrote {path}")


def main() -> None:
    random.seed(42)
    out_dir = Path("public/sounds")
    write_sound(out_dir / "underwater-fire.mp3", underwater_fire())
    write_sound(out_dir / "underwater-break.mp3", underwater_break())
    write_sound(out_dir / "underwater-bg-music.mp3", underwater_bgm())
    write_sound(out_dir / "medieval-fire.mp3", medieval_fire())
    write_sound(out_dir / "medieval-break.mp3", medieval_break())
    write_sound(out_dir / "medieval-bg-music.mp3", medieval_bgm())
    # Simple neutral beep for quick wiring tests
    test_tone = _render(0.35, lambda t, _: 0.4 * math.sin(PI2 * 880 * t))
    write_sound(out_dir / "test-sound.mp3", test_tone)


if __name__ == "__main__":
    main()

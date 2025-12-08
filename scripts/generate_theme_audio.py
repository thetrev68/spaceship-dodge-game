"""
Procedurally generate all game audio using only Python and lameenc.

Focus: stylized, synthetic cues (no realism needed). Deterministic with a fixed seed.
Outputs MP3 files to public/sounds following the naming scheme {theme}-{sound}.mp3,
with size/type suffixes where needed (e.g., -small/-medium/-large, -wyvern/-bat/-crystal).

Prereqs:
    pip install lameenc
"""

from __future__ import annotations

import math
import random
import struct
from pathlib import Path
from typing import Callable, Iterable, List, Tuple

import lameenc


SAMPLE_RATE = 44_100
PI2 = math.tau  # 2 * pi

SoundFn = Callable[[], List[float]]


# ---------- low-level helpers ----------
def _normalize(samples: List[float], peak: float = 0.9) -> List[float]:
    max_amp = max(abs(s) for s in samples) or 1.0
    scale = peak / max_amp
    return [s * scale for s in samples]


def _pcm16le(samples: Iterable[float]) -> bytes:
    return b"".join(
        struct.pack("<h", max(-32768, min(32767, int(s * 32767)))) for s in samples
    )


def _encode_mp3(samples: List[float]) -> bytes:
    enc = lameenc.Encoder()
    enc.set_in_sample_rate(SAMPLE_RATE)
    enc.set_channels(1)
    enc.set_quality(2)  # 2 = high, 7 = fastest
    enc.set_bit_rate(192)
    pcm = _pcm16le(_normalize(samples))
    return enc.encode(pcm) + enc.flush()


def _render(duration: float, fn) -> List[float]:
    total = int(duration * SAMPLE_RATE)
    return [fn(i / SAMPLE_RATE, i) for i in range(total)]


def _mix(*layers: List[float]) -> List[float]:
    return [sum(values) for values in zip(*layers)]


def _env_percussive(length: int, attack: float = 0.01, decay: float = 0.25) -> List[float]:
    attack_n = max(1, int(attack * SAMPLE_RATE))
    env: List[float] = []
    for i in range(length):
        if i < attack_n:
            env.append(i / attack_n)
        else:
            env.append(math.exp(-(i - attack_n) / (SAMPLE_RATE * decay)))
    return env


def _env_slow(length: int, attack: float = 0.5, release: float = 0.5) -> List[float]:
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


def _sweep(duration: float, start_freq: float, end_freq: float, shape: str = "sine") -> List[float]:
    total = int(duration * SAMPLE_RATE)
    phase = 0.0
    out: List[float] = []

    def wave(phi: float) -> float:
        if shape == "square":
            return 1.0 if math.sin(phi) >= 0 else -1.0
        if shape == "triangle":
            return 2.0 * abs(2.0 * ((phi / PI2) % 1) - 1.0) - 1.0
        if shape == "saw":
            return 2.0 * ((phi / PI2) % 1) - 1.0
        return math.sin(phi)

    for i in range(total):
        t = i / total
        freq = start_freq + (end_freq - start_freq) * t
        phase += PI2 * freq / SAMPLE_RATE
        out.append(wave(phase))
    return out


def _noise(length: int, color: str = "white") -> List[float]:
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
    return [e * s * gain for e, s in zip(env, signal)]


# ---------- building blocks ----------
def _chime(notes: List[Tuple[float, float]], base_gain: float = 0.6) -> List[float]:
    """notes: list of (start_time_seconds, frequency)."""
    duration = max(t for t, _ in notes) + 0.6
    total = int(duration * SAMPLE_RATE)
    out = [0.0] * total
    for start, freq in notes:
        n_len = int(0.4 * SAMPLE_RATE)
        env = _env_percussive(n_len, attack=0.005, decay=0.25)
        tone = _sweep(n_len / SAMPLE_RATE, freq, freq * 1.01, "sine")
        offset = int(start * SAMPLE_RATE)
        for i in range(n_len):
            idx = offset + i
            if idx < total:
                out[idx] += env[i] * tone[i] * base_gain
    return out


def _ui_click(frequency: float, tone: str = "sine") -> List[float]:
    length = int(0.15 * SAMPLE_RATE)
    env = _env_percussive(length, attack=0.001, decay=0.08)
    wave = _sweep(length / SAMPLE_RATE, frequency, frequency * 1.02, tone)
    return _apply(env, wave, gain=0.8)


def _short_explosion(base_freq: float, depth: float = 0.6, noise_color: str = "pink") -> List[float]:
    dur = 0.45
    length = int(dur * SAMPLE_RATE)
    env = _env_percussive(length, attack=0.005, decay=0.32)
    thump = _sweep(dur, base_freq * 1.3, base_freq * 0.7, "triangle")
    grit = _noise(length, color=noise_color)
    return _mix(_apply(env, thump, depth), _apply(env, grit, 0.25))


# ---------- space ----------
def space_fire() -> List[float]:
    dur = 0.28
    length = int(dur * SAMPLE_RATE)
    env = _env_percussive(length, attack=0.002, decay=0.12)
    zap = _sweep(dur, 1400, 900, "saw")
    hiss = _noise(length, "pink")
    return _mix(_apply(env, zap, 0.7), _apply(env, hiss, 0.15))


def space_break(size: str) -> List[float]:
    base = {"small": 320, "medium": 230, "large": 150}[size]
    return _short_explosion(base_freq=base, depth=0.6 + 0.1 * (size == "large"))


def space_levelup() -> List[float]:
    notes = [(0.00, 660.0), (0.08, 770.0), (0.16, 880.0), (0.24, 1040.0)]
    return _chime(notes, base_gain=0.65)


def space_gameover() -> List[float]:
    dur = 1.4
    sweep = _sweep(dur, 880, 220, "saw")
    env = _env_percussive(int(dur * SAMPLE_RATE), attack=0.01, decay=0.8)
    return _apply(env, sweep, 0.45)


def space_player_hit() -> List[float]:
    dur = 0.35
    length = int(dur * SAMPLE_RATE)
    env = _env_percussive(length, attack=0.003, decay=0.18)
    zap = _sweep(dur, 1200, 500, "square")
    clank = _short_explosion(420, depth=0.35, noise_color="white")
    return _mix(_apply(env, zap, 0.5), clank)


def space_powerup_collect() -> List[float]:
    notes = [(0.00, 880.0), (0.06, 1040.0), (0.12, 1240.0)]
    return _chime(notes, base_gain=0.7)


def space_ui_click() -> List[float]:
    return _ui_click(1200, "sine")


def space_bgm() -> List[float]:
    dur = 14.0
    total = int(dur * SAMPLE_RATE)
    env = _env_slow(total, attack=1.2, release=1.2)
    bass = _render(dur, lambda t, _: 0.35 * math.sin(PI2 * 90 * t))
    arp = _render(
        dur,
        lambda t, _: 0.18
        * math.sin(PI2 * (320 + 80 * math.sin(PI2 * 1.2 * t)) * t),
    )
    lead = _render(dur, lambda t, _: 0.12 * math.sin(PI2 * 660 * t))
    hat = _render(
        dur,
        lambda t, _: 0.05 * math.sin(PI2 * 12 * t) * random.uniform(0.7, 1.0),
    )
    return _apply(env, _mix(bass, arp, lead, hat), gain=0.6)


# ---------- medieval ----------
def medieval_fire() -> List[float]:
    dur = 0.5
    length = int(dur * SAMPLE_RATE)
    env = _env_percussive(length, attack=0.006, decay=0.3)
    roar = _sweep(dur, 320, 140, "square")
    crackle = _noise(length, "pink")
    return _mix(_apply(env, roar, 0.55), _apply(env, crackle, 0.2))


def medieval_break_wyvern() -> List[float]:
    dur = 0.5
    length = int(dur * SAMPLE_RATE)
    env = _env_percussive(length, attack=0.005, decay=0.28)
    thump = _sweep(dur, 220, 140, "triangle")
    rasp = _noise(length, "brown")
    flap = _sweep(dur, 90, 70, "sine")
    return _mix(_apply(env, thump, 0.5), _apply(env, rasp, 0.18), _apply(env, flap, 0.15))


def medieval_break_bat() -> List[float]:
    dur = 0.28
    length = int(dur * SAMPLE_RATE)
    env = _env_percussive(length, attack=0.004, decay=0.18)
    squeak = _sweep(dur, 1800, 1300, "sine")
    wing = _noise(length, "white")
    return _mix(_apply(env, squeak, 0.4), _apply(env, wing, 0.12))


def medieval_break_crystal() -> List[float]:
    dur = 0.5
    length = int(dur * SAMPLE_RATE)
    env = _env_percussive(length, attack=0.003, decay=0.32)
    chime = _sweep(dur, 1600, 1200, "sine")
    shards = _noise(length, "white")
    return _mix(_apply(env, chime, 0.5), _apply(env, shards, 0.18))


def medieval_levelup() -> List[float]:
    notes = [(0.00, 392.0), (0.10, 523.25), (0.20, 659.25)]
    return _chime(notes, base_gain=0.7)


def medieval_gameover() -> List[float]:
    dur = 1.8
    env = _env_percussive(int(dur * SAMPLE_RATE), attack=0.02, decay=1.0)
    horn = _sweep(dur, 260, 180, "triangle")
    return _apply(env, horn, 0.45)


def medieval_player_hit() -> List[float]:
    dur = 0.4
    length = int(dur * SAMPLE_RATE)
    env = _env_percussive(length, attack=0.002, decay=0.22)
    clang = _sweep(dur, 900, 400, "saw")
    scrape = _noise(length, "pink")
    return _mix(_apply(env, clang, 0.5), _apply(env, scrape, 0.15))


def medieval_powerup_collect() -> List[float]:
    notes = [(0.00, 660.0), (0.07, 740.0), (0.14, 880.0)]
    return _chime(notes, base_gain=0.65)


def medieval_ui_click() -> List[float]:
    return _ui_click(680, "triangle")


def medieval_bgm() -> List[float]:
    dur = 14.0
    total = int(dur * SAMPLE_RATE)
    env = _env_slow(total, attack=1.0, release=1.2)
    drone = _render(dur, lambda t, _: 0.22 * math.sin(PI2 * 110 * t))
    pattern = []
    motif = [196.0, 246.9, 293.7, 246.9, 220.0, 261.6, 329.6, 261.6]
    beat = 0.45
    for i, freq in enumerate(motif * 3):
        pattern.append((i * beat, freq))
    lead = _chime(pattern, base_gain=0.4)
    shimmer = _render(dur, lambda t, _: 0.06 * math.sin(PI2 * 660 * t))
    return _apply(env, _mix(drone, lead, shimmer), gain=0.8)


# ---------- underwater ----------
def underwater_fire() -> List[float]:
    dur = 0.4
    length = int(dur * SAMPLE_RATE)
    env = _env_percussive(length, attack=0.005, decay=0.22)
    thump = _sweep(dur, 220, 360, "sine")
    bubbles = _noise(length, "pink")
    return _mix(_apply(env, thump, 0.6), _apply(env, bubbles, 0.18))


def underwater_break(size: str) -> List[float]:
    base = {"small": 320, "medium": 220, "large": 140}[size]
    dur = {"small": 0.28, "medium": 0.45, "large": 0.6}[size]
    length = int(dur * SAMPLE_RATE)
    env = _env_percussive(length, attack=0.004, decay=0.25 + 0.1 * (size != "small"))
    blup = _sweep(dur, base, base * 0.7, "sine")
    fizz = _noise(length, "pink")
    return _mix(_apply(env, blup, 0.55), _apply(env, fizz, 0.15))


def underwater_levelup() -> List[float]:
    notes = [(0.00, 520.0), (0.08, 620.0), (0.16, 740.0)]
    sonar = _render(0.28, lambda t, _: 0.25 * math.sin(PI2 * 6 * t))
    return _mix(_chime(notes, base_gain=0.6), sonar)


def underwater_gameover() -> List[float]:
    dur = 1.6
    env = _env_percussive(int(dur * SAMPLE_RATE), attack=0.01, decay=0.9)
    klaxon = _sweep(dur, 220, 140, "sine")
    return _apply(env, klaxon, 0.45)


def underwater_player_hit() -> List[float]:
    dur = 0.4
    length = int(dur * SAMPLE_RATE)
    env = _env_percussive(length, attack=0.003, decay=0.2)
    hull = _sweep(dur, 180, 90, "triangle")
    hiss = _noise(length, "white")
    return _mix(_apply(env, hull, 0.6), _apply(env, hiss, 0.12))


def underwater_powerup_collect() -> List[float]:
    notes = [(0.00, 720.0), (0.05, 880.0), (0.10, 1040.0)]
    bubbles = _render(0.2, lambda t, _: 0.18 * math.sin(PI2 * 10 * t))
    return _mix(_chime(notes, base_gain=0.6), bubbles)


def underwater_ui_click() -> List[float]:
    return _ui_click(520, "sine")


def underwater_bgm() -> List[float]:
    dur = 14.0
    total = int(dur * SAMPLE_RATE)
    env = _env_slow(total, attack=1.5, release=1.5)
    pad = _render(
        dur,
        lambda t, _: 0.4 * math.sin(PI2 * (140 + 6 * math.sin(PI2 * 0.2 * t)) * t),
    )
    sub = _render(dur, lambda t, _: 0.22 * math.sin(PI2 * 55 * t))
    ping = _render(dur, lambda t, _: 0.08 * math.sin(PI2 * 1.0 * t))
    return _apply(env, _mix(pad, sub, ping), gain=0.6)


# ---------- registry ----------
SOUNDS: dict[str, SoundFn] = {
    # Space
    "space-bgm.mp3": space_bgm,
    "space-fire.mp3": space_fire,
    "space-break-small.mp3": lambda: space_break("small"),
    "space-break-medium.mp3": lambda: space_break("medium"),
    "space-break-large.mp3": lambda: space_break("large"),
    "space-levelup.mp3": space_levelup,
    "space-gameover.mp3": space_gameover,
    "space-player_hit.mp3": space_player_hit,
    "space-powerup_collect.mp3": space_powerup_collect,
    "space-ui_click.mp3": space_ui_click,
    # Medieval
    "medieval-bgm.mp3": medieval_bgm,
    "medieval-fire.mp3": medieval_fire,
    "medieval-break-wyvern.mp3": medieval_break_wyvern,
    "medieval-break-bat.mp3": medieval_break_bat,
    "medieval-break-crystal.mp3": medieval_break_crystal,
    "medieval-levelup.mp3": medieval_levelup,
    "medieval-gameover.mp3": medieval_gameover,
    "medieval-player_hit.mp3": medieval_player_hit,
    "medieval-powerup_collect.mp3": medieval_powerup_collect,
    "medieval-ui_click.mp3": medieval_ui_click,
    # Underwater
    "underwater-bgm.mp3": underwater_bgm,
    "underwater-fire.mp3": underwater_fire,
    "underwater-break-small.mp3": lambda: underwater_break("small"),
    "underwater-break-medium.mp3": lambda: underwater_break("medium"),
    "underwater-break-large.mp3": lambda: underwater_break("large"),
    "underwater-levelup.mp3": underwater_levelup,
    "underwater-gameover.mp3": underwater_gameover,
    "underwater-player_hit.mp3": underwater_player_hit,
    "underwater-powerup_collect.mp3": underwater_powerup_collect,
    "underwater-ui_click.mp3": underwater_ui_click,
    # Simple wiring test tone
    "test-sound.mp3": lambda: _render(0.35, lambda t, _: 0.4 * math.sin(PI2 * 880 * t)),
}


def write_sound(path: Path, samples: List[float]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(_encode_mp3(samples))
    print(f"wrote {path}")


def main() -> None:
    random.seed(42)
    out_dir = Path("public/sounds")
    for name, fn in SOUNDS.items():
        write_sound(out_dir / name, fn())


if __name__ == "__main__":
    main()

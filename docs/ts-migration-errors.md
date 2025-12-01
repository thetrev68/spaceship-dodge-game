
## Typecheck status (branch: typscript-conversion)
- Command: `npm run typecheck` (fails)
- Last commits: `200f69b` (shared JSDoc types/guards), `d378e5b` (tsconfig/typecheck scripts/docs)

## Outstanding buckets (ordered)
1) **Logger**: `LogLevel[key]` still yields `number | undefined`; adjust lookup mapping or add index signature; ensure config.level always number.  
2) **Type alias imports**: use `import('@types/shared')` (alias configured in jsconfig/tsconfig) instead of `@types/shared.js`; TS currently rejects “type declaration files”.  
3) **Entities & pools**: pooled objects must return full shapes; add missing fields (`creationTime`, `rotation`, `shape`, `speed`), guard undefined before use, add index signatures.  
4) **Starfield**: per-frame ctx guard and `stars[i]` defined checks.  
5) **gameLoop/gameStateManager**: guard nullable canvas/ctx when passed to render/clear.  
6) **Input/mobile/overlays/settings/audioControls**: add typed settings shape/index signatures, event target casts, TimerId as number, DOM null guards, focus guards.  
7) **soundManager**: guard `import.meta.env`, add sound map index signature, null-safe audio map, `Promise<void>` JSDoc on unlocks, volumes shape, background music nullability.  
8) **Collision/poolManager**: type arrays and entities (no bare Object), nearbyObstacles typing; guard bullets/obstacles undefined.  
9) **HUD**: set `ctx.textAlign` to `CanvasTextAlign` literal; type score popups array items.

## Quick reproduction
- Run: `npm run typecheck`
- Most recent output (truncated) shows failures in logger, state imports, asteroid/bullet/powerup shapes, input/overlays/settings, soundManager, collision, HUD.
  Type 'null' is not assignable to type 'HTMLCanvasElement'.
src/core/main.js(118,21): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/core/main.js(120,17): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/core/main.js(128,21): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/core/main.js(134,16): error TS2345: Argument of type 'HTMLElement | null' is not assignable to parameter of type 'HTMLCanvasElement'.
  Type 'null' is not assignable to type 'HTMLCanvasElement'.
src/core/main.js(157,15): error TS2345: Argument of type 'HTMLElement | null' is not assignable to parameter of type 'HTMLCanvasElement'.
  Type 'null' is not assignable to type 'HTMLCanvasElement'.
src/core/main.js(190,19): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/core/main.js(192,19): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/core/main.js(194,26): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/core/main.js(198,26): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/core/main.js(200,17): error TS2345: Argument of type 'HTMLElement | null' is not assignable to parameter of type 'HTMLCanvasElement'.
  Type 'null' is not assignable to type 'HTMLCanvasElement'.
src/core/main.js(202,26): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/core/main.js(204,17): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/core/state.js(17,7): error TS7053: Element implicitly has an 'any' type because expression of type 'string | symbol' can't be used to index type 'Object'.
  No index signature with a parameter of type 'string' was found on type 'Object'.
src/core/state.js(23,9): error TS2339: Property 'watch' does not exist on type 'Object'.
src/core/state.js(23,18): error TS7006: Parameter 'fn' implicitly has an 'any' type.
src/core/state.js(24,3): error TS2696: The 'Object' type is assignable to very few other types. Did you mean to use the 'any' type instead?
  Property 'revocable' is missing in type 'Object' but required in type 'ProxyConstructor'.
src/core/state.js(73,11): error TS2314: Generic type 'Array<T>' requires 1 type argument(s).
src/core/state.js(79,11): error TS2314: Generic type 'Array<T>' requires 1 type argument(s).
src/effects/starfield.js(15,9): error TS7034: Variable 'stars' implicitly has type 'any[]' in some locations where its type cannot be determined.
src/effects/starfield.js(44,5): error TS18047: 'ctx' is possibly 'null'.
src/effects/starfield.js(47,5): error TS18047: 'ctx' is possibly 'null'.
src/effects/starfield.js(48,5): error TS18047: 'ctx' is possibly 'null'.
src/effects/starfield.js(51,20): error TS7005: Variable 'stars' implicitly has an 'any[]' type.
src/effects/starfield.js(60,7): error TS18047: 'ctx' is possibly 'null'.
src/effects/starfield.js(63,5): error TS18047: 'ctx' is possibly 'null'.
src/entities/asteroid.js(84,39): error TS2345: Argument of type 'number | undefined' is not assignable to parameter of type 'number'.
  Type 'undefined' is not assignable to type 'number'.
src/entities/asteroid.js(88,5): error TS7053: Element implicitly has an 'any' type because expression of type 'number' can't be used to index type '{}'.
  No index signature with a parameter of type 'number' was found on type '{}'.
src/entities/asteroid.js(91,14): error TS7053: Element implicitly has an 'any' type because expression of type 'number' can't be used to index type '{}'.
  No index signature with a parameter of type 'number' was found on type '{}'.
src/entities/asteroid.js(92,5): error TS7053: Element implicitly has an 'any' type because expression of type 'number' can't be used to index type '{}'.
  No index signature with a parameter of type 'number' was found on type '{}'.
src/entities/asteroid.js(95,5): error TS7053: Element implicitly has an 'any' type because expression of type 'number' can't be used to index type '{}'.
  No index signature with a parameter of type 'number' was found on type '{}'.
src/entities/asteroid.js(170,16): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'.
src/entities/asteroid.js(172,9): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'.
src/entities/asteroid.js(173,13): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'.
src/entities/asteroid.js(174,18): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'.
src/entities/asteroid.js(184,28): error TS2551: Property 'value' does not exist on type 'Object'. Did you mean 'valueOf'?
src/entities/asteroid.js(188,38): error TS2532: Object is possibly 'undefined'.
src/entities/asteroid.js(189,8): error TS2532: Object is possibly 'undefined'.
src/entities/asteroid.js(192,22): error TS2551: Property 'value' does not exist on type 'Object'. Did you mean 'valueOf'?
src/entities/asteroid.js(252,16): error TS2339: Property 'level' does not exist on type 'Object'.
src/entities/asteroid.js(253,32): error TS2339: Property 'level' does not exist on type 'Object'.
src/entities/asteroid.js(263,27): error TS2339: Property 'dx' does not exist on type 'Object'.
src/entities/asteroid.js(264,27): error TS2339: Property 'dy' does not exist on type 'Object'.
src/entities/asteroid.js(266,18): error TS2339: Property 'x' does not exist on type 'Object'.
src/entities/asteroid.js(266,31): error TS2339: Property 'radius' does not exist on type 'Object'.
src/entities/asteroid.js(267,18): error TS2339: Property 'y' does not exist on type 'Object'.
src/entities/asteroid.js(267,31): error TS2339: Property 'radius' does not exist on type 'Object'.
src/entities/asteroid.js(271,18): error TS2339: Property 'parentId' does not exist on type 'Object'.
src/entities/asteroid.js(271,39): error TS2339: Property 'id' does not exist on type 'Object'.
src/entities/asteroid.js(276,12): error TS2551: Property 'value' does not exist on type 'Object'. Did you mean 'valueOf'?
src/entities/asteroid.js(276,30): error TS2339: Property 'scoreValue' does not exist on type 'Object'.
src/entities/asteroid.js(277,30): error TS2339: Property 'scoreValue' does not exist on type 'Object'.
src/entities/asteroid.js(277,53): error TS2339: Property 'x' does not exist on type 'Object'.
src/entities/asteroid.js(277,66): error TS2339: Property 'radius' does not exist on type 'Object'.
src/entities/asteroid.js(277,83): error TS2339: Property 'y' does not exist on type 'Object'.
src/entities/asteroid.js(279,16): error TS2339: Property 'parentId' does not exist on type 'Object'.
src/entities/asteroid.js(279,46): error TS2339: Property 'level' does not exist on type 'Object'.
src/entities/asteroid.js(280,5): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'.
src/entities/asteroid.js(280,30): error TS2339: Property 'parentId' does not exist on type 'Object'.
src/entities/asteroid.js(281,9): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'.
src/entities/asteroid.js(281,34): error TS2339: Property 'parentId' does not exist on type 'Object'.
src/entities/asteroid.js(282,16): error TS2551: Property 'value' does not exist on type 'Object'. Did you mean 'valueOf'?
src/entities/asteroid.js(283,84): error TS2339: Property 'x' does not exist on type 'Object'.
src/entities/asteroid.js(283,96): error TS2339: Property 'y' does not exist on type 'Object'.
src/entities/asteroid.js(284,14): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'.
src/entities/asteroid.js(284,39): error TS2339: Property 'parentId' does not exist on type 'Object'.
src/entities/bullet.js(22,1): error TS18047: 'bctx' is possibly 'null'.
src/entities/bullet.js(23,1): error TS18047: 'bctx' is possibly 'null'.
src/entities/bullet.js(24,1): error TS18047: 'bctx' is possibly 'null'.
src/entities/bullet.js(25,1): error TS18047: 'bctx' is possibly 'null'.
src/entities/bullet.js(82,17): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/entities/player.js(58,12): error TS2339: Property 'overridePosition' does not exist on type '{ x: number; y: number; width: number; height: number; speed: number; dx: number; dy: number; }'.
src/entities/player.js(65,17): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/entities/player.js(67,14): error TS2339: Property 'overridePosition' does not exist on type '{ x: number; y: number; width: number; height: number; speed: number; dx: number; dy: number; }'.
src/entities/player.js(68,30): error TS2339: Property 'overridePosition' does not exist on type '{ x: number; y: number; width: number; height: number; speed: number; dx: number; dy: number; }'.
src/entities/player.js(68,57): error TS2339: Property 'overridePosition' does not exist on type '{ x: number; y: number; width: number; height: number; speed: number; dx: number; dy: number; }'.
src/entities/player.js(69,12): error TS2339: Property 'overridePosition' does not exist on type '{ x: number; y: number; width: number; height: number; speed: number; dx: number; dy: number; }'.
src/entities/player.js(80,19): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/entities/player.js(86,81): error TS2339: Property 'SHIELD_RADIUS_FACTOR' does not exist on type '{ INITIAL_X: number; INITIAL_Y: number; WIDTH: number; HEIGHT: number; SPEED: number; NARROW_FACTOR: number; ENGINE_TOP_WIDTH_FACTOR: number; ENGINE_BOTTOM_WIDTH_FACTOR: number; ENGINE_HEIGHT_FACTOR: number; ... 6 more ...; SINGLE_BLASTER_OFFSET: number; }'.
src/entities/powerup.js(25,11): error TS2314: Generic type 'Array<T>' requires 1 type argument(s).
src/entities/powerup.js(87,9): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ doubleBlaster: { active: boolean; timer: number; }; shield: { active: boolean; timer: number; }; }'.
  No index signature with a parameter of type 'string' was found on type '{ doubleBlaster: { active: boolean; timer: number; }; shield: { active: boolean; timer: number; }; }'.
src/entities/powerup.js(88,7): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ doubleBlaster: { active: boolean; timer: number; }; shield: { active: boolean; timer: number; }; }'.
  No index signature with a parameter of type 'string' was found on type '{ doubleBlaster: { active: boolean; timer: number; }; shield: { active: boolean; timer: number; }; }'.
src/entities/powerup.js(89,11): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ doubleBlaster: { active: boolean; timer: number; }; shield: { active: boolean; timer: number; }; }'.
  No index signature with a parameter of type 'string' was found on type '{ doubleBlaster: { active: boolean; timer: number; }; shield: { active: boolean; timer: number; }; }'.
src/entities/powerup.js(90,9): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ doubleBlaster: { active: boolean; timer: number; }; shield: { active: boolean; timer: number; }; }'.
  No index signature with a parameter of type 'string' was found on type '{ doubleBlaster: { active: boolean; timer: number; }; shield: { active: boolean; timer: number; }; }'.
src/entities/powerup.js(179,18): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ doubleBlaster: { DURATION: number; }; shield: { DURATION: number; }; SPAWN_INTERVAL: number; }'.
  No index signature with a parameter of type 'string' was found on type '{ doubleBlaster: { DURATION: number; }; shield: { DURATION: number; }; SPAWN_INTERVAL: number; }'.
src/entities/powerup.js(185,3): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ doubleBlaster: { active: boolean; timer: number; }; shield: { active: boolean; timer: number; }; }'.
  No index signature with a parameter of type 'string' was found on type '{ doubleBlaster: { active: boolean; timer: number; }; shield: { active: boolean; timer: number; }; }'.
src/entities/powerup.js(186,3): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ doubleBlaster: { active: boolean; timer: number; }; shield: { active: boolean; timer: number; }; }'.
  No index signature with a parameter of type 'string' was found on type '{ doubleBlaster: { active: boolean; timer: number; }; shield: { active: boolean; timer: number; }; }'.
src/game/flowManager.js(43,19): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/game/flowManager.js(57,43): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/game/flowManager.js(58,23): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/game/flowManager.js(62,24): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/game/flowManager.js(73,23): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/game/flowManager.js(74,23): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/game/flowManager.js(76,27): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/game/gameLoop.js(36,5): error TS7034: Variable 'animationId' implicitly has type 'any' in some locations where its type cannot be determined.
src/game/gameLoop.js(37,5): error TS7034: Variable 'gameCanvas' implicitly has type 'any' in some locations where its type cannot be determined.
src/game/gameLoop.js(38,5): error TS7034: Variable 'ctx' implicitly has type 'any' in some locations where its type cannot be determined.
src/game/gameLoop.js(73,7): error TS7005: Variable 'gameCanvas' implicitly has an 'any' type.
src/game/gameLoop.js(74,57): error TS7005: Variable 'gameCanvas' implicitly has an 'any' type.
src/game/gameLoop.js(96,17): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/game/gameLoop.js(108,56): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/game/gameLoop.js(118,110): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/game/gameLoop.js(129,47): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/game/gameLoop.js(129,64): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/game/gameLoop.js(145,3): error TS7005: Variable 'ctx' implicitly has an 'any' type.
src/game/gameLoop.js(146,13): error TS7005: Variable 'ctx' implicitly has an 'any' type.
src/game/gameLoop.js(169,7): error TS7005: Variable 'animationId' implicitly has an 'any' type.
src/game/gameStateManager.js(20,15): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/game/gameStateManager.js(23,19): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/game/gameStateManager.js(24,15): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/game/gameStateManager.js(26,36): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/game/gameStateManager.js(26,53): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/game/gameStateManager.js(28,15): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/game/gameStateManager.js(30,43): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/game/gameStateManager.js(30,60): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/game/gameStateManager.js(50,13): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/game/gameStateManager.js(51,9): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/game/gameStateManager.js(52,13): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/game/gameStateManager.js(53,15): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/game/gameStateManager.js(79,3): error TS18047: 'ctx' is possibly 'null'.
src/game/gameStateManager.js(86,13): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/input/inputManager.js(57,21): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/input/inputManager.js(57,54): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/input/inputManager.js(61,35): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/input/inputManager.js(62,17): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/input/inputManager.js(75,19): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/input/inputManager.js(80,47): error TS2339: Property 'dx' does not exist on type 'Object'.
src/input/inputManager.js(84,47): error TS2339: Property 'dx' does not exist on type 'Object'.
src/input/inputManager.js(88,66): error TS2339: Property 'dy' does not exist on type 'Object'.
src/input/inputManager.js(92,65): error TS2339: Property 'dy' does not exist on type 'Object'.
src/input/inputManager.js(105,19): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/input/inputManager.js(112,47): error TS2339: Property 'dx' does not exist on type 'Object'.
src/input/inputManager.js(118,50): error TS2339: Property 'dy' does not exist on type 'Object'.
src/input/inputManager.js(124,19): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/input/inputManager.js(128,13): error TS2339: Property 'width' does not exist on type 'Object'.
src/input/inputManager.js(128,20): error TS2339: Property 'height' does not exist on type 'Object'.
src/input/inputManager.js(133,19): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/input/inputManager.js(138,32): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/input/inputManager.js(144,7): error TS2322: Type 'Timeout' is not assignable to type 'number'.
src/input/inputManager.js(157,19): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/input/inputManager.js(157,52): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/input/inputManager.js(159,35): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/input/inputManager.js(160,17): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/input/mobileControls.js(47,5): error TS7034: Variable 'fireIntervalId' implicitly has type 'any' in some locations where its type cannot be determined.
src/input/mobileControls.js(50,7): error TS7005: Variable 'fireIntervalId' implicitly has an 'any' type.
src/input/mobileControls.js(50,35): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/input/mobileControls.js(52,35): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/input/mobileControls.js(62,7): error TS7005: Variable 'fireIntervalId' implicitly has an 'any' type.
src/input/mobileControls.js(76,29): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/input/mobileControls.js(93,18): error TS18047: 'canvasEl' is possibly 'null'.
src/input/mobileControls.js(103,24): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/input/mobileControls.js(113,18): error TS18047: 'canvasEl' is possibly 'null'.
src/input/mobileControls.js(127,19): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/input/mobileControls.js(129,17): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/input/mobileControls.js(137,19): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/input/mobileControls.js(147,11): error TS2339: Property 'width' does not exist on type 'Object'.
src/input/mobileControls.js(147,18): error TS2339: Property 'height' does not exist on type 'Object'.
src/systems/collisionHandler.js(111,30): error TS2339: Property 'x' does not exist on type 'Object'.
src/systems/collisionHandler.js(111,43): error TS2339: Property 'radius' does not exist on type 'Object'.
src/systems/collisionHandler.js(112,30): error TS2339: Property 'y' does not exist on type 'Object'.
src/systems/collisionHandler.js(112,43): error TS2339: Property 'radius' does not exist on type 'Object'.
src/systems/collisionHandler.js(130,11): error TS7034: Variable 'nearbyObstacles' implicitly has type 'any[]' in some locations where its type cannot be determined.
src/systems/collisionHandler.js(139,12): error TS7005: Variable 'nearbyObstacles' implicitly has an 'any[]' type.
src/systems/collisionHandler.js(174,39): error TS2339: Property 'x' does not exist on type 'Object'.
src/systems/collisionHandler.js(174,52): error TS2339: Property 'radius' does not exist on type 'Object'.
src/systems/collisionHandler.js(175,39): error TS2339: Property 'y' does not exist on type 'Object'.
src/systems/collisionHandler.js(175,52): error TS2339: Property 'radius' does not exist on type 'Object'.
src/systems/collisionHandler.js(178,47): error TS2339: Property 'radius' does not exist on type 'Object'.
src/systems/poolManager.js(7,5): error TS7008: Member 'pool' implicitly has an 'any[]' type.
src/systems/renderManager.js(20,17): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/systems/soundManager.js(8,30): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
src/systems/soundManager.js(56,3): error TS18047: 'audio' is possibly 'null'.
src/systems/soundManager.js(57,3): error TS18047: 'audio' is possibly 'null'.
src/systems/soundManager.js(58,3): error TS18047: 'audio' is possibly 'null'.
src/systems/soundManager.js(61,3): error TS18047: 'audio' is possibly 'null'.
src/systems/soundManager.js(66,14): error TS2314: Generic type 'Promise<T>' requires 1 type argument(s).
src/systems/soundManager.js(78,9): error TS2810: Expected 1 argument, but got 0. 'new Promise()' needs a JSDoc hint to produce a 'resolve' that can be called without arguments.
src/systems/soundManager.js(88,11): error TS2810: Expected 1 argument, but got 0. 'new Promise()' needs a JSDoc hint to produce a 'resolve' that can be called without arguments.
src/systems/soundManager.js(92,11): error TS2810: Expected 1 argument, but got 0. 'new Promise()' needs a JSDoc hint to produce a 'resolve' that can be called without arguments.
src/systems/soundManager.js(97,9): error TS2810: Expected 1 argument, but got 0. 'new Promise()' needs a JSDoc hint to produce a 'resolve' that can be called without arguments.
src/systems/soundManager.js(102,7): error TS2810: Expected 1 argument, but got 0. 'new Promise()' needs a JSDoc hint to produce a 'resolve' that can be called without arguments.
src/systems/soundManager.js(120,5): error TS2322: Type 'HTMLAudioElement' is not assignable to type 'null'.
src/systems/soundManager.js(121,5): error TS18047: 'sounds.bgm' is possibly 'null'.
src/systems/soundManager.js(122,5): error TS18047: 'sounds.bgm' is possibly 'null'.
src/systems/soundManager.js(123,5): error TS18047: 'sounds.bgm' is possibly 'null'.
src/systems/soundManager.js(126,3): error TS18047: 'sounds.bgm' is possibly 'null'.
src/systems/soundManager.js(128,3): error TS18047: 'sounds.bgm' is possibly 'null'.
src/systems/soundManager.js(128,31): error TS2339: Property 'backgroundMusic' does not exist on type 'Object'.
src/systems/soundManager.js(129,3): error TS18047: 'sounds.bgm' is possibly 'null'.
src/systems/soundManager.js(131,3): error TS18047: 'sounds.bgm' is possibly 'null'.
src/systems/soundManager.js(135,13): error TS7006: Parameter 'err' implicitly has an 'any' type.
src/systems/soundManager.js(145,14): error TS2339: Property 'pause' does not exist on type 'never'.
src/systems/soundManager.js(146,14): error TS2339: Property 'currentTime' does not exist on type 'never'.
src/systems/soundManager.js(177,44): error TS2339: Property 'backgroundMusic' does not exist on type 'Object'.
src/systems/soundManager.js(180,44): error TS2339: Property 'soundEffects' does not exist on type 'Object'.
src/systems/soundManager.js(193,11): error TS2339: Property 'soundEffects' does not exist on type 'Object'.
src/systems/soundManager.js(203,11): error TS2339: Property 'backgroundMusic' does not exist on type 'Object'.
src/systems/soundManager.js(206,16): error TS2339: Property 'volume' does not exist on type 'never'.
src/systems/soundManager.js(215,11): error TS2339: Property 'soundEffects' does not exist on type 'Object'.
src/systems/soundManager.js(226,39): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ bgm: null; fire: HTMLAudioElement; break: HTMLAudioElement; gameover: HTMLAudioElement; levelup: HTMLAudioElement; }'.
  No index signature with a parameter of type 'string' was found on type '{ bgm: null; fire: HTMLAudioElement; break: HTMLAudioElement; gameover: HTMLAudioElement; levelup: HTMLAudioElement; }'.
src/systems/soundManager.js(228,16): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ bgm: null; fire: HTMLAudioElement; break: HTMLAudioElement; gameover: HTMLAudioElement; levelup: HTMLAudioElement; }'.
  No index signature with a parameter of type 'string' was found on type '{ bgm: null; fire: HTMLAudioElement; break: HTMLAudioElement; gameover: HTMLAudioElement; levelup: HTMLAudioElement; }'.
src/systems/soundManager.js(230,24): error TS2339: Property 'soundEffects' does not exist on type 'Object'.
src/systems/soundManager.js(237,13): error TS7006: Parameter 'err' implicitly has an 'any' type.
src/ui/controls/audioControls.js(35,34): error TS2339: Property 'isMuted' does not exist on type 'Object'.
src/ui/controls/audioControls.js(49,37): error TS2339: Property 'isMuted' does not exist on type 'Object'.
src/ui/controls/audioControls.js(60,37): error TS2339: Property 'isMuted' does not exist on type 'Object'.
src/ui/controls/audioControls.js(76,33): error TS2339: Property 'soundEffectsVolume' does not exist on type 'Object'.
src/ui/controls/audioControls.js(79,28): error TS18047: 'e.target' is possibly 'null'.
src/ui/controls/audioControls.js(79,37): error TS2339: Property 'value' does not exist on type 'EventTarget'.
src/ui/controls/audioControls.js(99,49): error TS2339: Property 'BUTTON_MARGIN_LEFT' does not exist on type '{ Z_INDEX: number; POSITION_TOP: string; POSITION_RIGHT: string; GAP: string; BUTTON_FONT_SIZE: string; BUTTON_SIZE: string; SLIDER_WIDTH: string; }'.
src/ui/hud/perfHUD.js(5,5): error TS7034: Variable 'hudElement' implicitly has type 'any' in some locations where its type cannot be determined.
src/ui/hud/perfHUD.js(10,7): error TS7005: Variable 'hudElement' implicitly has an 'any' type.
src/ui/hud/perfHUD.js(59,8): error TS7005: Variable 'hudElement' implicitly has an 'any' type.
src/ui/hud/scoreDisplay.js(16,5): error TS2322: Type 'string' is not assignable to type 'CanvasTextAlign'.
src/ui/hud/scoreDisplay.js(17,34): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/ui/hud/scoreDisplay.js(18,38): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/ui/hud/scoreDisplay.js(19,40): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/ui/hud/scorePopups.js(12,11): error TS2314: Generic type 'Array<T>' requires 1 type argument(s).
src/ui/hud/scorePopups.js(34,11): error TS2339: Property 'text' does not exist on type 'Object'.
src/ui/hud/scorePopups.js(35,11): error TS2339: Property 'x' does not exist on type 'Object'.
src/ui/hud/scorePopups.js(36,11): error TS2339: Property 'y' does not exist on type 'Object'.
src/ui/hud/scorePopups.js(37,11): error TS2339: Property 'opacity' does not exist on type 'Object'.
src/ui/hud/scorePopups.js(38,11): error TS2339: Property 'color' does not exist on type 'Object'.
src/ui/overlays/overlayManager.js(46,5): error TS7034: Variable 'activeOverlay' implicitly has type 'any' in some locations where its type cannot be determined.
src/ui/overlays/overlayManager.js(47,5): error TS7034: Variable 'lastFocusedElement' implicitly has type 'any' in some locations where its type cannot be determined.
src/ui/overlays/overlayManager.js(63,48): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/ui/overlays/overlayManager.js(63,74): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/ui/overlays/overlayManager.js(63,106): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/ui/overlays/overlayManager.js(71,18): error TS7005: Variable 'lastFocusedElement' implicitly has an 'any' type.
src/ui/overlays/overlayManager.js(80,8): error TS7005: Variable 'activeOverlay' implicitly has an 'any' type.
src/ui/overlays/overlayManager.js(105,7): error TS2339: Property 'watch' does not exist on type 'ProxyConstructor'.
src/ui/overlays/overlayManager.js(106,11): error TS2339: Property 'watch' does not exist on type 'ProxyConstructor'.
src/ui/overlays/overlayManager.js(107,13): error TS2339: Property 'watch' does not exist on type 'ProxyConstructor'.
src/ui/overlays/overlayManager.js(131,28): error TS2339: Property 'focus' does not exist on type 'Element'.
src/ui/overlays/overlayManager.js(149,74): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/ui/overlays/overlayManager.js(150,74): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/ui/overlays/overlayManager.js(151,74): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/ui/overlays/overlayManager.js(177,12): error TS2345: Argument of type 'HTMLElement | null' is not assignable to parameter of type 'HTMLElement'.
  Type 'null' is not assignable to type 'HTMLElement'.
src/ui/overlays/overlayManager.js(187,12): error TS2345: Argument of type 'HTMLElement | null' is not assignable to parameter of type 'HTMLElement'.
  Type 'null' is not assignable to type 'HTMLElement'.
src/ui/overlays/overlayManager.js(200,12): error TS2345: Argument of type 'HTMLElement | null' is not assignable to parameter of type 'HTMLElement'.
  Type 'null' is not assignable to type 'HTMLElement'.
src/ui/overlays/overlayManager.js(210,12): error TS2345: Argument of type 'HTMLElement | null' is not assignable to parameter of type 'HTMLElement'.
  Type 'null' is not assignable to type 'HTMLElement'.
src/ui/overlays/overlayManager.js(239,13): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/ui/overlays/overlayManager.js(244,5): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ doubleBlaster: { active: boolean; timer: number; }; shield: { active: boolean; timer: number; }; }'.
  No index signature with a parameter of type 'string' was found on type '{ doubleBlaster: { active: boolean; timer: number; }; shield: { active: boolean; timer: number; }; }'.
src/ui/overlays/overlayManager.js(245,5): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ doubleBlaster: { active: boolean; timer: number; }; shield: { active: boolean; timer: number; }; }'.
  No index signature with a parameter of type 'string' was found on type '{ doubleBlaster: { active: boolean; timer: number; }; shield: { active: boolean; timer: number; }; }'.
src/ui/overlays/overlayManager.js(249,34): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/ui/overlays/overlayManager.js(249,51): error TS2339: Property 'value' does not exist on type 'ProxyConstructor'.
src/ui/overlays/overlayManager.js(258,5): error TS2322: Type 'HTMLElement | null' is not assignable to type 'HTMLElement'.
  Type 'null' is not assignable to type 'HTMLElement'.
src/ui/overlays/overlayManager.js(259,5): error TS2322: Type 'HTMLElement | null' is not assignable to type 'HTMLElement'.
  Type 'null' is not assignable to type 'HTMLElement'.
src/ui/overlays/overlayManager.js(260,5): error TS2322: Type 'HTMLElement | null' is not assignable to type 'HTMLElement'.
  Type 'null' is not assignable to type 'HTMLElement'.
src/ui/overlays/overlayManager.js(261,5): error TS2322: Type 'HTMLElement | null' is not assignable to type 'HTMLElement'.
  Type 'null' is not assignable to type 'HTMLElement'.
src/ui/settings/settingsManager.js(100,5): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Object'.
  No index signature with a parameter of type 'string' was found on type 'Object'.
src/ui/settings/settingsManager.js(113,31): error TS2339: Property 'backgroundMusicVolume' does not exist on type 'Object'.
src/ui/settings/settingsManager.js(114,32): error TS2339: Property 'soundEffectsVolume' does not exist on type 'Object'.
src/ui/settings/settingsManager.js(115,28): error TS2339: Property 'isMuted' does not exist on type 'Object'.
src/ui/settings/settingsManager.js(119,23): error TS2339: Property 'isMuted' does not exist on type 'Object'.
src/ui/settings/settingsManager.js(126,57): error TS2339: Property 'backgroundMusicVolume' does not exist on type 'Object'.
src/ui/settings/settingsManager.js(127,54): error TS2339: Property 'soundEffectsVolume' does not exist on type 'Object'.
src/ui/settings/settingsManager.js(145,24): error TS2339: Property 'platformSpecificText' does not exist on type 'Object'.
src/ui/settings/settingsManager.js(165,10): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ start: { mobile: string; desktop: string; }; pause: { mobile: string; desktop: string; }; controls: { mobile: string; desktop: string; }; }'.
  No index signature with a parameter of type 'string' was found on type '{ start: { mobile: string; desktop: string; }; pause: { mobile: string; desktop: string; }; controls: { mobile: string; desktop: string; }; }'.
src/ui/settings/settingsManager.js(179,10): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ start: string; pause: string; controls: string; }'.
  No index signature with a parameter of type 'string' was found on type '{ start: string; pause: string; controls: string; }'.
src/ui/settings/settingsUI.js(100,34): error TS2339: Property 'backgroundMusicVolume' does not exist on type 'Object'.
src/ui/settings/settingsUI.js(104,30): error TS18047: 'e.target' is possibly 'null'.
src/ui/settings/settingsUI.js(104,39): error TS2339: Property 'value' does not exist on type 'EventTarget'.
src/ui/settings/settingsUI.js(122,30): error TS2339: Property 'soundEffectsVolume' does not exist on type 'Object'.
src/ui/settings/settingsUI.js(126,30): error TS18047: 'e.target' is possibly 'null'.
src/ui/settings/settingsUI.js(126,39): error TS2339: Property 'value' does not exist on type 'EventTarget'.
src/ui/settings/settingsUI.js(145,35): error TS2339: Property 'isMuted' does not exist on type 'Object'.
src/ui/settings/settingsUI.js(149,23): error TS18047: 'e.target' is possibly 'null'.
src/ui/settings/settingsUI.js(149,32): error TS2339: Property 'checked' does not exist on type 'EventTarget'.
src/ui/settings/settingsUI.js(178,43): error TS2339: Property 'platformSpecificText' does not exist on type 'Object'.
src/ui/settings/settingsUI.js(182,40): error TS18047: 'e.target' is possibly 'null'.
src/ui/settings/settingsUI.js(182,49): error TS2339: Property 'checked' does not exist on type 'EventTarget'.
src/ui/settings/settingsUI.js(196,42): error TS2339: Property 'vibrationEnabled' does not exist on type 'Object'.
src/ui/settings/settingsUI.js(200,38): error TS18047: 'e.target' is possibly 'null'.
src/ui/settings/settingsUI.js(200,47): error TS2339: Property 'checked' does not exist on type 'EventTarget'.
src/ui/settings/settingsUI.js(239,58): error TS2339: Property 'focus' does not exist on type 'Element'.

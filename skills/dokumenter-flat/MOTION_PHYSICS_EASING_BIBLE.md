# MOTION PHYSICS & EASING BIBLE
### Instructions for Claude when building animated videos in code (Remotion / React / Canvas / WebGL / Python)

> Read this whole file before you write a single keyframe. Every motion in the video must follow these rules.
> The goal is not "smooth enough". The goal is motion that looks like a top-tier motion designer made it: continuous, physical, intentional, with **zero dead frames**.

---

## 0. THE 7 LAWS (memorize these)

1. **Easing gives each motion its feeling, so choose it on purpose.** Every curve is a *velocity profile*: it says where the object is fast and where it is slow. Pick the curve from the feeling you want (Section 2), never at random and never `linear` for a primary move.
2. **Overlap, don't chain.** When one element does several motions, the next motion starts **before** the previous one ends. For decelerating curves, start the next one around 50–75% of the way through the first. Never use A → stop → B.
3. **An ease-IN curve never hands off early.** A motion that ends at full speed (ease-in) must **finish** before the same element starts a new motion. Ease-in can *receive* an overlap but must never *give* one (Section 4.4).
4. **The video is always moving.** No frame should have everything static. Something always moves: a primary motion, a secondary motion, an ambient drift, or the camera (Section 5).
5. **The camera never stops, and it moves BIG.** Camera moves overlap each other just like element moves do. They travel far enough to be *felt*, and a slow drift runs underneath everything (Section 6).
6. **Nothing moves in sync.** When several elements do the same motion, each starts slightly after the previous one, so the group moves as one wave (Section 4.5).
7. **Fast motion smears like a real camera.** Motion blur is computed from real velocity, follows the direction of motion, and is zero at rest (Section 7).

---

## 1. THE MATH: exact easing functions

All functions take `t ∈ [0,1]` (normalized time) and return progress `p ∈ [0,1]`.
**Always clamp `t` before easing.** Use these exact formulas. Don't approximate them by eye.

```ts
// easing.ts — the only easing source of truth for the project
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

// ---- EASE OUT (fast start → soft landing). Velocity is maximal at t=0
export const outQuad  = (t: number) => 1 - (1 - t) ** 2;
export const outCubic = (t: number) => 1 - (1 - t) ** 3;
export const outQuart = (t: number) => 1 - (1 - t) ** 4;
export const outQuint = (t: number) => 1 - (1 - t) ** 5;
export const outExpo  = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

// ---- EASE IN (slow start → hits the end at full speed). Velocity is maximal at t=1
export const inQuad  = (t: number) => t * t;
export const inCubic = (t: number) => t ** 3;
export const inQuint = (t: number) => t ** 5;
export const inCirc  = (t: number) => 1 - Math.sqrt(1 - t * t);

// ---- EASE IN-OUT (rest → fast middle → rest). Velocity is maximal at t=0.5
export const inOutQuad  = (t: number) => t < 0.5 ? 2 * t * t        : 1 - (-2 * t + 2) ** 2 / 2;
export const inOutCubic = (t: number) => t < 0.5 ? 4 * t ** 3       : 1 - (-2 * t + 2) ** 3 / 2;
export const inOutQuint = (t: number) => t < 0.5 ? 16 * t ** 5      : 1 - (-2 * t + 2) ** 5 / 2;
export const inOutSine  = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2; // for ambient loops / drifts

// ---- EASE OUT-IN (fast → slow middle "hang" → fast). Built from halves
const outIn = (outF: (t:number)=>number, inF: (t:number)=>number) => (t: number) =>
  t < 0.5 ? outF(t * 2) / 2 : 0.5 + inF(t * 2 - 1) / 2;
export const outInQuad  = outIn(outQuad,  inQuad);
export const outInCubic = outIn(outCubic, inCubic);
export const outInQuint = outIn(outQuint, inQuint);
```

### 1.1 Cubic-bezier equivalents (for Remotion `Easing.bezier`, CSS, Framer Motion, GSAP CustomEase)

| Curve | cubic-bezier |
|---|---|
| outQuad | `0.5, 1, 0.89, 1` |
| outQuart | `0.25, 1, 0.5, 1` |
| outExpo | `0.16, 1, 0.3, 1` |
| inCubic | `0.32, 0, 0.67, 0` |
| inQuint | `0.64, 0, 0.78, 0` |
| inCirc | `0.55, 0, 1, 0.45` |
| inOutQuad | `0.45, 0, 0.55, 1` |
| inOutCubic | `0.65, 0, 0.35, 1` |
| inOutQuint | `0.83, 0, 0.17, 1` |
| outIn* | no single bezier. Use the piecewise functions above |

The bezier versions are close approximations. **Prefer the exact functions above.** This matters most for `outExpo` and `inCirc`, because their character lives at the extremes.

### 1.2 The physical fingerprint of each curve (measured numbers)

- **Peak velocity** is the fastest speed during the move, as a multiple of the average speed (distance ÷ duration).
- **p@50%** is how much of the distance is covered at half the time.
- **t95** is the fraction of the duration at which the move is 95% done. That's when the eye reads it as "finished".

| Curve | Peak velocity | Where peak happens | p@50% | t95 (visually done) |
|---|---|---|---|---|
| outQuad | 2.0× | start | 0.75 | 0.78 |
| outQuart | 4.0× | start | 0.94 | 0.53 |
| **outExpo** | **6.9×** | start | 0.97 | **0.43** |
| inCubic | 3.0× | end | 0.125 | 0.98 |
| inQuint | 5.0× | end | 0.03 | 0.99 |
| **inCirc** | **→ ∞** | end | 0.13 | 1.00 |
| inOutQuad | 2.0× | middle | 0.50 | 0.84 |
| inOutCubic | 3.0× | middle | 0.50 | 0.77 |
| inOutQuint | 5.0× | middle | 0.50 | 0.68 |

**What these numbers mean in practice:**
- `outExpo` is visually done at **43%** of its duration. The rest is a long, luxurious settle. That is why it reads as "premium", and it's also why the next motion can start very early.
- Every ease-in reaches 95% only in the last 1–2% of its time. **There is no window to hand off.** The motion *is* its ending.
- `inCirc` speed tends to infinity at the end. Over a 12-frame move, **the last frame alone covers 40% of the distance.** That is an impact. Use it only when you want a hit or slam.

---

## 2. CHOOSING THE CURVE BY FEELING (physics → emotion)

Think of every move as a physical object with mass and a force acting on it. Ask: *what force is acting, and when?*

| Curve | Physical story | Feeling | Use for |
|---|---|---|---|
| **outExpo** | A huge impulse at t=0 (a kick, a launch), then strong friction or air resistance stops it | Snappy, confident, expensive, "Apple" | **Entrances**, elements launched or pushed into place, text and UI reveals, punch-in zooms, cards snapping in, an element *pushed up*, logo hits |
| **outQuart** | A strong impulse with slightly less friction | Smooth and confident, softer than expo | Panel and card slides, secondary entrances, larger objects (more mass → softer impulse), a follow-up move after an expo |
| **outQuad** | A gentle push. It's the exact physics of an object **thrown upward** decelerating under gravity | Light, calm, natural | Subtle settles, opacity, small secondary moves, the *rising half* of a jump or bounce, slow-tier calm videos |
| **inCubic** | Starts from rest, a force accelerates it away | Departure, "leaving" | **Exits**: an element leaving the frame, sliding away, scaling down out |
| **inQuint** | Holds back, then gets violently pulled away | Dramatic, "sucked out", whoosh | Dramatic exits, things pulled into a portal or off-screen, whip-out transitions |
| **inCirc** | Free fall that ends in a hard impact. Velocity explodes at the end | Weight, impact, slam | **Falling** objects hitting a surface, stamps, a title slamming down, a hammer hit. Always pair it with an impact reaction (Section 4.4) |
| **inQuad** | Exact physics of **free fall** from rest (constant gravity) | Natural gravity | The falling half of a jump or bounce, natural drops |
| **inOutQuad** | Gentle push, gentle stop | Soft, relaxed | Slow repositioning, calm camera moves, ambient-ish moves |
| **inOutCubic** | Accelerate then brake. The default for A→B when both ends are at rest | Professional, balanced, **works almost anywhere** | Moving an element from one layout spot to another, camera pans and dollies, morphs, default transform moves |
| **inOutQuint** | Long slow start, a burst of speed, long slow stop | Cinematic, dramatic, intentional | Big scene transitions, hero camera moves, whip pans (fast tier), dramatic layout changes |
| **outIn (Quad/Cubic/Quint)** | Rushes in, *hangs* in the middle (slow-motion moment), rushes out | Speed ramp, "bullet-time" | An element passing *through* the frame with a showcase pause in the middle, speed-ramp transitions, flythroughs. Use it rarely, as a spice |

**Projectile rule (physically exact):** an object thrown up and coming down uses `outQuad` going up and `inQuad` coming down, with equal durations. For a bounce, each bounce is about 55–60% of the previous height and about 75% of the previous duration.

**Mass rule:** heavier or larger objects get **softer curves and longer durations**. Small light objects (icons, dots, small text) can use outExpo fast-tier. Big objects (full-screen panels, the camera) use outQuart, inOutCubic or inOutQuint in medium or slow tiers.

These are defaults, not prisons. outExpo = entrance and inCubic = exit are the strongest defaults, but **the required feeling always wins.** Say in a code comment *why* you chose each curve.

---

## 3. THE THREE SPEED TIERS (match the video's rhythm)

Every curve has 3 versions: **Fast / Medium / Slow.** Pick **one dominant tier for the whole video** to match its rhythm. You may borrow from the next tier for contrast (a slow camera under fast elements is excellent).

**Tie the tier to the music or voice-over:** one beat = `60 / BPM` seconds.
- Fast tier ≈ ½ beat. For energetic or hype content (120+ BPM, fast VO).
- Medium tier ≈ 1 beat. Standard, explainer, UI showcase.
- Slow tier ≈ 2 beats. Cinematic, luxury, emotional.

### Durations (seconds, then frames @30fps / @60fps)

| Curve | FAST | MEDIUM | SLOW |
|---|---|---|---|
| outExpo | 0.35s (10f / 21f) | 0.6s (18f / 36f) | 1.0s (30f / 60f) |
| outQuart | 0.3s (9f / 18f) | 0.5s (15f / 30f) | 0.8s (24f / 48f) |
| outQuad | 0.25s (8f / 15f) | 0.4s (12f / 24f) | 0.7s (21f / 42f) |
| inCubic | 0.25s (8f / 15f) | 0.4s (12f / 24f) | 0.6s (18f / 36f) |
| inQuint | 0.3s (9f / 18f) | 0.5s (15f / 30f) | 0.8s (24f / 48f) |
| inCirc | 0.25s (8f / 15f) | 0.4s (12f / 24f) | 0.6s (18f / 36f) |
| inOutQuad | 0.35s (10f / 21f) | 0.6s (18f / 36f) | 1.0s (30f / 60f) |
| inOutCubic | 0.4s (12f / 24f) | 0.7s (21f / 42f) | 1.2s (36f / 72f) |
| inOutQuint | 0.5s (15f / 30f) | 0.9s (27f / 54f) | 1.5s (45f / 90f) |
| Camera move (inOutCubic/Quint) | 0.8s | 1.5s | 2.5–4s |

Notes:
- **outExpo needs more duration than you think.** Its visible motion ends at 43%, so a 0.6s expo looks like a ~0.26s snap with a 0.34s silky settle. Too short and the settle disappears, which kills the premium feel.
- **Ease-in curves must stay short.** A slow ease-in looks laggy and hesitant, because the viewer waits for the object to "decide" to move. Exits are always quicker than entrances: aim for exit ≈ 60–70% of the matching entrance duration.
- **Scale durations with distance.** As a rule, duration ∝ distance^0.5. If a move travels 4× farther, give it about 2× the time, not 4×.
- Render at **60fps** whenever possible. Fast expo and circ moves look much smoother at 60.

---

## 4. THE OVERLAP PRINCIPLE (motion that flows like real life)

### 4.1 Why it works

In real life, a body never fully stops before the next action begins. A hand starts turning before the arm finishes reaching. Momentum carries from one action into the next. In animation, if motion A fully stops and then motion B starts, the viewer sees **two separate robotic commands**. If B starts while A is still settling, the viewer sees **one continuous gesture**.

This is how pros do it in DaVinci Resolve Fusion: they stack transform nodes. In the reference project, for example:
- `Transform6 Center (Displacement)` animates from frame **36 → 47** (ease-out).
- `Transform7 Size` starts at about frame **42**, while Transform6 is only ~55% through its time (and already ~90%+ through its distance), and runs to frame **51**.
- In another shot, `Transform3 Size` runs **15 → 28** and `Transform4 Center` starts at frame **19**, very early, overlapping most of the first move.

The second motion always starts during the **settle tail** of the first. The two transforms are **stacked (additive)**, so their effects sum and nothing ever jumps.

### 4.2 Handoff timing table (same element, consecutive motions)

Start motion B when motion A has reached this fraction of **its own duration**:

| Motion A's curve | Start B at (% of A's duration) | Default | A's progress at default |
|---|---|---|---|
| outExpo | 40–65% | **50%** | 97% |
| outQuart | 50–70% | **60%** | 97% |
| outQuad | 60–80% | **70%** | 91% |
| inOutQuint | 60–75% | **68%** | 95% |
| inOutCubic | 65–80% | **72%** | 91% |
| inOutQuad | 70–85% | **75%** | 94% |
| **inCubic / inQuint / inCirc / inQuad** | **100% (no overlap)** | **100%** | — |

The general law behind the table: **hand off when A has covered about 90–97% of its distance and its velocity has fallen to ≤ ~30% of its peak.** At that point A's remaining motion is a gentle tail that B can blend on top of.

Use the earlier end of each range for fast, energetic videos and the later end for calm or slow videos. Never wait until 100% for decelerating curves.

### 4.3 How to implement overlap in code: ADDITIVE LAYERS (mandatory)

**Never** animate one property with `if (frame < x) {…} else {…}` segments that restart from the current value. That causes jumps when they overlap.

Instead, mirror Fusion's stacked transforms: **each motion is a delta, and all deltas are summed.**

```ts
type Tween = {
  start: number;        // start frame
  dur: number;          // duration in frames
  delta: number;        // how much this motion ADDS (px, scale units, degrees…)
  ease: (t: number) => number;
};

// Value at a frame = base + sum of every tween's eased delta.
export const additive = (frame: number, base: number, tweens: Tween[]) =>
  tweens.reduce((v, tw) => v + tw.delta * tw.ease(clamp01((frame - tw.start) / tw.dur)), base);

// Helper: schedule B relative to A using the handoff ratio
export const after = (a: Tween, ratio: number) => Math.round(a.start + a.dur * ratio);
```

Example: an element enters, then grows, then moves aside. Each step overlaps the previous one.

```ts
const enterY: Tween = { start: 0,  dur: 18, delta: -400, ease: outExpo };   // rises into place
const grow:   Tween = { start: after(enterY, 0.5), dur: 15, delta: 0.25, ease: outQuart }; // starts at f9
const slideX: Tween = { start: after(grow, 0.6),  dur: 21, delta: -300, ease: inOutCubic }; // starts at f18

const y     = additive(frame, 400, [enterY]);
const scale = additive(frame, 1,   [grow]);
const x     = additive(frame, 0,   [slideX]);
```

Why additive is mandatory: every eased delta is continuous, so their sum is continuous. **Position can never jump**, no matter how much the motions overlap. It also lets you put two motions on *the same property* (for example a big `outExpo` move plus a small `inOutQuad` correction) and they blend naturally.

Remotion version (with `interpolate`):

```ts
import { interpolate, Easing } from "remotion";
const seg = (f: number, s: number, d: number, ease: (t:number)=>number) =>
  interpolate(f, [s, s + d], [0, 1], { easing: ease, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
// Exact functions from easing.ts can be passed directly as `easing`.
const y = 400 + (-400) * seg(frame, 0, 18, outExpo);
```

### 4.4 THE EASE-IN EXCEPTION (critical, read carefully)

**Rule:** if motion A uses an **ease-in** curve (inQuad, inCubic, inQuint, inCirc), then the next motion B **on the same element** must **not** start before A ends. B starts **exactly at A's last frame**, or after a deliberate hold.

**Why (physics):**
- An ease-out motion is *losing* energy. By 60–70% of its time its velocity is close to zero, so starting a new motion feels like a natural continuation.
- An ease-in motion is *gaining* energy all the way. Its **maximum velocity is at the very last frame** (3× average for cubic, 5× for quint, near-infinite for circ). The end is the climax: the landing, the impact, the exit. If B starts before that climax, you change the object's course while it's at full speed. The eye reads that as a glitch or a "steering" error, and it also *steals the impact*: the viewer never feels the hit.
- In numbers: at 70% of its duration, inCubic has covered only **34%** of its distance and inQuint only **17%**. Handing off at 70% would mean cutting the motion while two thirds of it is still to come.

**What to do at the end of an ease-in instead:**

1. **Impact reaction on the exact last frame** (for inCirc, inQuad and inCubic landings). The *reaction* starts on the impact frame:
   - Squash: `scaleY` 1 → 0.85–0.9 and `scaleX` 1 → 1.08–1.12 at impact, recovering with `outQuart` over 6–10 frames (@30fps).
   - Or a bounce: an `outQuad` rebound of 8–15% of the fall distance, then an `inQuad` fall back (shorter each time).
   - Optional camera shake on impact: 2–4 frames, amplitude 4–12px, decaying.
   - Optional secondary motion: dust, ripples or other elements nudged by the impact, starting at the impact frame with outExpo.
2. **Clean exit (inCubic or inQuint off-screen).** The element is gone. Its own chain ends there.
3. **A deliberate hold** of 2–6 frames before the next action, when you want a beat of tension. (The rest of the frame must keep moving; see Section 5.)

**What IS allowed with ease-in:**
- **Ease-in can RECEIVE an overlap.** An ease-in motion starts at velocity zero, so it can start during the settle tail of a previous ease-out motion. For example: an element enters with outExpo, then starts its exit with inCubic at 60% of the entrance. That works perfectly in additive layers.
- **A different element may overlap an ease-in exit.** The rule protects the *same* element's chain. In a transition, the outgoing element exits with inCubic or inQuint, and the incoming element can start its outExpo entrance at **60–80% of the exit's duration**. The handoff of attention then becomes seamless.

> Mnemonic: **Out-curves hand off early. In-curves land, then react.**

### 4.5 OFFSET / STAGGER: several elements doing the same motion together

**Rule: when 2 or more elements do the same (or a similar) motion "together", they NEVER start on the same frame.** Each one starts slightly after the previous one. Frame-identical starts look mechanical and computer-generated. Real things never move in perfect sync: a flock of birds, falling dominoes, a crowd standing up all ripple.

The offset turns N separate motions into **one wave**. The eye reads a single fluid gesture that travels across the group. It is the overlap principle (Section 4) applied *across elements* instead of across motions.

#### 4.5.1 How big the offset is

The base rule: **offset = 8–30% of a single item's motion duration.**
- **8–15%** → *tight cascade*. It reads as one connected wave. This is the default.
- **15–30%** → *distinct sequence*. Each item is perceived separately, for emphasis or counting.
- **> 40%** → no longer a stagger; it's just a sequence of separate animations. Avoid unless intended.
- **0%** → forbidden for groups (except elements that are physically one object, like an icon and its own shadow).

Concrete gaps by element type:

| Elements | Gap @30fps | Gap @60fps | ms |
|---|---|---|---|
| Characters (letter-by-letter) | 1 f | 1–2 f | 25–40 ms |
| Words | 2–3 f | 3–5 f | 60–100 ms |
| Lines of text | 3–5 f | 6–10 f | 100–170 ms |
| Icons / small UI items / list rows | 2–4 f | 4–8 f | 70–130 ms |
| Cards / tiles | 3–5 f | 6–10 f | 100–170 ms |
| Big panels / full-width sections | 5–8 f | 10–16 f | 170–270 ms |

Tier adjustment: **fast tier ×0.7, slow tier ×1.4.**

#### 4.5.2 Cap the total spread

The total spread is `gap × (n − 1)`. It must stay **≤ 100% of one item's duration** (≤ 60% in fast-tier videos). Otherwise the group feels slow and the viewer waits for the last item.

For large groups, shrink the gap automatically:

```ts
const gapFor = (n: number, baseGap: number, itemDur: number, maxSpreadRatio = 1.0) =>
  n <= 1 ? 0 : Math.min(baseGap, (itemDur * maxSpreadRatio) / (n - 1));
```

For example, 40 characters with a 1-frame gap and 18-frame motions would spread over 39 frames (more than 2× the duration). Either the gap gets compressed to ~0.46 f (sub-frame offsets are fine, because easing is evaluated on continuous time), or you stagger **by word** instead of by character.

#### 4.5.3 Offset patterns (choose by layout)

```ts
// i = item index, n = count. Returns a delay in frames (can be fractional — that's fine).

// 1) Linear: reading order. Default for lists and text.
const linearDelay = (i: number, gap: number) => i * gap;

// 2) Eased distribution: total spread stays fixed but the gaps vary.
//    outQuad → items bunch at the start, then spread (energetic burst that relaxes).
//    inQuad  → slow start, then rush (build-up).
const easedDelay = (i: number, n: number, spread: number, ease = outQuad) =>
  n <= 1 ? 0 : spread * ease(i / (n - 1));

// 3) Center-out: the middle item starts first and the wave spreads to both sides.
//    Good for symmetric rows, logos, titles.
const centerOutDelay = (i: number, n: number, gap: number) => Math.abs(i - (n - 1) / 2) * gap;

// 4) From-a-point (distance-based): delay ∝ distance from an origin point.
//    The most physical pattern: a shockwave or ripple. Use it for grids, scattered
//    elements, and anything reacting to an impact or click.
const radialDelay = (x: number, y: number, ox: number, oy: number, pxPerFrame: number) =>
  Math.hypot(x - ox, y - oy) / pxPerFrame;   // pxPerFrame ≈ wave speed (e.g. 40–120 px/f @1080p)

// 5) Grid diagonal: sweeps from top-left to bottom-right.
const diagonalDelay = (row: number, col: number, gap: number) => (row + col) * gap;

// 6) Organic jitter: add ±15–30% DETERMINISTIC randomness on top of any pattern.
//    NEVER use Math.random() — Remotion renders frames out of order and in parallel,
//    so values must be identical every time a frame renders. Use a seeded hash.
const seeded = (i: number, seed = 1) => {
  const s = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return s - Math.floor(s); // 0..1, stable per index
};
const jitter = (delay: number, gap: number, i: number, amount = 0.25) =>
  delay + (seeded(i) * 2 - 1) * gap * amount;
```

Direction rules:
- Follow **reading order** (left→right, top→bottom) for text and lists.
- Follow the **direction of motion**. If items slide in from the right, the rightmost (the one closest to where they come from) can lead. That makes the group look like it is being *pulled* in.
- Use **from-a-point** when there is a cause: an impact, a click, a "drop", a logo landing. The wave starts at the cause. This connects nicely with the ease-in impact reactions in Section 4.4: the impact frame becomes the origin of a radial stagger.

#### 4.5.4 Stagger on exits

- Exits stagger too, with a **shorter gap: ~60–70% of the entrance gap**, because exits are shorter and should feel decisive.
- Order: either **same order** as the entrance (first in, first out: a flowing "conveyor" feel), or **reverse order** (last in, first out: "rewinding" or closing). Pick one deliberately.
- Each item's exit is an ease-in, but **these are different elements**, so overlapping their exits is allowed (Section 4.4).

#### 4.5.5 Stagger the secondary properties too

When elements stagger, **every property of each element shifts by that element's delay**: position, opacity, blur, scale, rotation. Never stagger position while fading the whole group in at once.

Inside each element, keep the property offsets from Section 4.6. The result is a two-level offset: **between** elements (stagger) and **within** each element (secondary properties).

#### 4.5.6 Groups and the handoff rule

A staggered group behaves like **one motion** for timing purposes:
- The group's "duration" runs from the first item's start to the last item's end.
- The **next beat** starts when the **last item** reaches its handoff point from the Section 4.2 table. If the next beat happens in a different area of the frame, it can start even earlier, around when the middle item reaches its handoff point.
- For very organic results, also vary each item's **duration** by ±5–10% (seeded), not just its start time.

### 4.6 Secondary properties ride on the primary motion

Every primary move (position or scale) should carry **secondary properties** with their own, slightly offset timing. This is what separates pro motion from basic tweening.

| Secondary | Timing relative to primary move (duration D) | Curve |
|---|---|---|
| Opacity in (0→1) | starts with the move, lasts 30–40% of D | outQuad or linear |
| Opacity out (1→0) | last 40–50% of an exit | inQuad |
| Blur in (12–24px → 0) | starts with the move, lasts 50–60% of D | outQuad |
| Scale in (0.85–0.92 → 1) | same start, 80–100% of D | outQuart / outExpo |
| Rotation settle (±2–6° → 0) | same start, 100–120% of D (finishes last) | outQuart |
| Follow-through children (icon inside card, text inside button) | start 2–4 frames after the parent | same curve as the parent |

- **Drag and follow-through:** child elements lag their parent by 2–4 frames and settle *after* it. That is the overlap principle applied inside one object.
- Entrances rarely start from scale 0. Use 0.85–0.92 plus opacity plus blur. Scale-from-0 only makes sense for a "pop" (dots, badges, bubbles); in that case use outExpo, or outBack with an overshoot of ~1.2–1.7.

---

## 5. THE VIDEO MUST MOVE EVERY SINGLE FRAME

A professional video never freezes. When motion stops, the viewer's brain reads the video as "a slideshow" and attention drops. **Movement = life = retention.**

### 5.1 The rules

1. **Zero dead frames.** A dead frame is one where every visible element *and* the camera move less than **0.3px per frame at 1080p**. Allowed number of dead frames: **0**.
2. **A primary event happens at least every 0.5–1.0s** (every 0.3–0.5s in fast-tier videos). A primary event is a new entrance, transform, exit, transition or camera beat.
3. **Every motion starts before the previous one ends** (Section 4). At the whole-video level, the next beat's first motion starts during the current beat's settle tail.
4. **Nothing "lands and freezes."** When an element settles, it switches to an **ambient (living) hold** instead of stopping:
   - Slow scale creep: +1–3% over the hold (linear or inOutSine).
   - Drift: 3–10px over the hold, in the direction of its last motion (this preserves momentum).
   - Optional float: a sine wave with a 3–6s period and 2–6px amplitude, with a different phase per element.
   - Background: slow gradient shift, particle drift, or grain. Keep it subtle.
5. **The camera drift runs underneath everything** (Section 6). Even if every element were static, the camera would keep the frame alive.

### 5.2 Momentum continuity across beats

When beat 1 ends with motion in direction X, beat 2 should **enter in the same direction X**. If a card slides out to the left, the new content comes in from the right *moving left*. Energy is conserved across the cut. Reversing direction across a transition feels like a collision unless you want exactly that.

### 5.3 Self-check: dead-frame detector (run it before delivering)

```ts
// Sample every animated element's screen position and scale for each frame.
// getStateAt(frame) returns [{id, x, y, scale, rotation}, ...] plus the camera.
function findDeadFrames(totalFrames: number, getStateAt: (f:number)=>any[], thresholdPx = 0.3) {
  const dead: number[] = [];
  for (let f = 1; f < totalFrames; f++) {
    const a = getStateAt(f - 1), b = getStateAt(f);
    const maxMove = Math.max(...b.map((s, i) => {
      const p = a[i];
      const dPos = Math.hypot(s.x - p.x, s.y - p.y);
      const dScale = Math.abs(s.scale - p.scale) * 1000; // 0.001 scale ≈ 1px on a ~1000px element
      const dRot = Math.abs(s.rotation - p.rotation) * 10;
      return Math.max(dPos, dScale, dRot);
    }));
    if (maxMove < thresholdPx) dead.push(f);
  }
  return dead; // must be []
}
```

Also check: **the longest gap between primary-event start frames** must be ≤ 1.0s (≤ 0.5s in fast tier).

---

## 6. CAMERA: continuous, big, layered

Treat the camera like a living operator, not a tripod. In code, the camera is a transform (translate, scale, rotate) applied to a root container (or a 3D camera in Three.js), and **all elements live inside it.**

### 6.1 Camera = three layers summed (additive, like elements)

```ts
camX = drift(frame) + moves(frame) + shake(frame);
```

1. **Base drift (always on, never stops):**
   - Linear or very long `inOutSine`, for the whole scene.
   - Push-in: scale 1.00 → 1.05–1.10 over the scene, *or* lateral drift of 2–5% of frame width over the scene.
   - Slight roll: 0.5–1.5° over the scene, very subtle, adds organic life.
2. **Camera moves (the beats):**
   - Punch-in on a key moment: scale +15–35% with `outExpo` (medium tier).
   - Pans and dollies between areas: `inOutCubic`, or `inOutQuint` for drama.
   - Whip transitions: `inOutQuint` fast tier, or `inQuint` out + `outExpo` in, with motion blur.
   - **Camera moves overlap each other with the same handoff table as elements (Section 4.2).** The next camera move starts at 65–75% of the previous one. The camera never parks.
3. **Shake and micro-motion (optional, event-driven):** impact shakes as in Section 4.4; a handheld feel can come from low-frequency noise of 1–3px amplitude at 0.5–1 Hz.

### 6.2 Camera moves must be BIG enough to be felt

- **Translate** at least **15–40% of the frame width or height** per camera move. A move under ~5% of the frame doesn't read as camera work; it reads as an accidental wobble. Either commit to a big move or make it a drift.
- **Zoom** at least **±12–15%** for a felt move, 25–60% for a dramatic one. Use multiplicative zoom (scale × factor) so it feels even at every level.
- **Rotation:** 2–8° for a felt camera roll in transitions. Keep the ambient roll ≤ 1.5°.
- The distance comes from **layout**: place content across a larger "world" canvas (for example 3–4× the frame size) so the camera has real places to travel to.

### 6.3 Depth & parallax

Give every layer a depth `z` and move it by `camera × parallaxFactor`:
- Background: 0.2–0.5× camera motion.
- Main content: 1.0×.
- Foreground accents (particles, blurred shapes): 1.3–2.0×.

Parallax turns flat 2D motion into felt space. It is the cheapest way to look expensive.

### 6.4 Camera follow (organic tracking)

When the camera follows a moving element, it should **lag** it, not lock onto it. Smooth the target with a critically damped spring, computed *deterministically per frame* (Remotion renders frames out of order, so never use mutable state across frames):

```ts
import { spring } from "remotion";
// Follow the element with ~4–8 frames of lag
const follow = spring({ frame: frame - moveStart, fps, config: { damping: 200, stiffness: 80, mass: 1 } });
const camX = startCamX + (targetX - startCamX) * follow;
```

---

## 7. REALISTIC MOTION BLUR (mandatory)

Fast easing moves (outExpo, inQuint, inCirc, whip pans) cover large distances in 1–3 frames. Without motion blur they **strobe**: the eye sees separate sharp copies jumping across the screen instead of continuous motion. That is the #1 tell of amateur code animation.

Real footage never has this problem, because a real camera's shutter stays open for a fraction of each frame and records the object *smeared along its path*. Our job is to reproduce that physics, not to slap a generic blur filter on things.

### 7.1 The physics: what a real camera does

- **Exposure time per frame** = `(shutterAngle / 360) / fps`.
  At 180° and 30fps that is 1/60 s; at 180° and 60fps, 1/120 s.
- **Blur length (px)** = `velocity (px/frame) × shutterAngle / 360`.
  An element moving 80 px/frame at 180° gets a 40 px smear.
- The smear follows the **actual path** of each point during the exposure, so:
  - A translation gives a **directional** blur along the velocity vector.
  - A scale or zoom gives a **radial** blur away from the scale origin. Points far from the center smear more.
  - A rotation gives a **rotational** (arc) blur. Points far from the pivot smear more.
  - An eased move has **blur that changes every frame**, because velocity changes. An outExpo entrance is heavily blurred in its first 2–4 frames, then sharpens as it settles. An inCirc fall is sharp at first and smears hardest on the impact frame.
  - Anything **at rest has zero blur**, so text stays perfectly crisp when it lands.
  - Elements moving at different speeds (parallax layers, staggered items) each get their **own** blur.

**Any blur that doesn't obey these rules looks fake.** Examples: a constant blur amount, a blur that doesn't follow the motion direction, blur on static elements, Gaussian blur used to "fake" movement.

### 7.2 Shutter angle (how much blur)

| Shutter | Look | Use |
|---|---|---|
| 90° | Crisp, staccato, a bit strobey | Action/hyper-energetic edits, rarely |
| **180°** | **Natural cinema standard** | **Default for everything** |
| 225–270° | Smoother, softer, "premium" | Fast-tier videos with lots of expo moves, UI showcases |
| 360° | Dreamy, very smeared | Whip transitions, speed ramps, stylized moments |

Pick one shutter for the video. Raise it only for specific transition moments.

### 7.3 Method A (preferred, physically exact): sub-frame sampling

Render the scene at several moments *inside* the exposure window of each frame and average the results. This reproduces all the physics in 7.1 automatically: direction, curvature, radial and rotational blur, velocity changes, zero blur at rest, per-element blur, and correct opacity in the trails.

**Remotion:**

```tsx
import { CameraMotionBlur } from "@remotion/motion-blur";

<CameraMotionBlur shutterAngle={180} samples={12}>
  <Scene />   {/* everything inside must be deterministic per frame */}
</CameraMotionBlur>
```

- Wrap the **camera root** so that camera moves blur the whole frame and every layer blurs by its own speed (parallax for free).
- **Samples:** gaps between samples must be ≤ ~2–3 px, or you'll see "ghost copies" instead of a smooth smear. So `samples ≈ clamp(ceil(maxBlurLengthPx / 2.5), 8, 32)`. For example: max velocity 120 px/f at 180° → 60 px blur → 24 samples.
- It renders the scene `samples` times per frame, which is expensive. If render time matters, wrap only the sections or layers that move fast, and keep slow ambient layers outside.
- Requirements: everything inside must depend on `frame` only. No `Math.random()`, no state across frames, no CSS transitions.

**Canvas / WebGL / Three.js / Python (generic):**

```ts
// Render the frame as the average of N sub-frame renders across the exposure window.
// Trailing shutter: the exposure covers [f - shutter, f], like a real camera recording up to this moment.
function renderWithMotionBlur(f: number, shutterAngle = 180, samples = 12) {
  const exposure = shutterAngle / 360;            // fraction of a frame
  accumulator.clear();
  for (let s = 0; s < samples; s++) {
    const subT = f - exposure * (s + 0.5) / samples;   // sub-frame time (fractional frame)
    drawScene(subT);                                   // the scene must accept fractional frames
    accumulator.add(currentImage, 1 / samples);        // average in LINEAR light if possible
  }
  return accumulator.result();
}
```

- All animation functions must accept **fractional frames**. The easing is continuous, so this works naturally with the additive tweens in Section 4.3.
- Average in linear color space (convert from sRGB → linear → average → sRGB) for the most realistic bright trails. Averaging in sRGB is acceptable but slightly darker.

### 7.4 Method B (cheap approximation): velocity-driven blur per element

When sub-frame sampling is too expensive, compute the blur from each element's **actual velocity** on every frame.

```ts
// Velocity from the same functions that drive the animation (central difference).
const vel = (fn: (f: number) => number, f: number) => (fn(f + 0.5) - fn(f - 0.5));

const vx = vel(getX, frame), vy = vel(getY, frame);           // px per frame
const speed = Math.hypot(vx, vy);
const blurLen = speed * (shutterAngle / 360);                 // px
const angle = Math.atan2(vy, vx);                             // direction of motion
const blurOn = blurLen > 1.5;                                 // below that, keep it perfectly sharp
```

Apply it as a **directional** blur along `angle`:
- SVG filter: rotate a wrapper to `angle`, apply `<feGaussianBlur stdDeviation="{blurLen/2.5} 0"/>` (x-only), then rotate back. Or use the matrix/convolution approach.
- WebGL: a single-pass line-blur shader along the velocity vector with `blurLen` length.
- For **scale/zoom**: use a radial blur from the transform origin, strength ∝ scale velocity. For **rotation**: use an angular blur around the pivot, strength ∝ angular velocity.

Limitations: it blurs symmetrically, can't do curved paths, and gets overlaps between elements wrong. That's fine for UI and text moves. Use Method A for camera whips and anything that rotates or zooms hard.

**Never** use a plain, non-directional Gaussian blur "to simulate motion". That is a different effect: the entrance blur in Section 4.6 is a *focus/style* effect, not motion blur. You can combine both, but don't confuse them.

### 7.5 Motion blur rules checklist

- [ ] Blur comes from **velocity**, every frame. It's never a constant or keyframed amount.
- [ ] Blur follows the **direction** of motion (and the radial/rotational path for zoom and rotation).
- [ ] Elements at rest are **perfectly sharp**. Text is readable the moment it settles.
- [ ] The camera root is blurred, so camera moves smear the whole frame, scaled by each layer's parallax speed.
- [ ] Sample count is high enough that there are **no visible ghost copies** in the fastest frame. Check that frame specifically.
- [ ] One shutter angle for the whole video (180° default), with exceptions only for whips and speed ramps.
- [ ] After rendering, inspect the fastest frames of: the biggest outExpo entrance (its first 3 frames), every inCirc impact frame, and every whip pan.

---

## 8. PLANNING WORKFLOW: write a MOTION SCORE before coding

Before writing components, write a **motion score**: a table of every motion in the video. This forces correct overlaps and curve choices.

```
FPS: 60 | Tier: MEDIUM | BPM: 100 (beat = 0.6s = 36f)

| # | Element      | Property  | Start | Dur | Δ          | Curve      | Why                        | Handoff rule        |
|---|--------------|-----------|-------|-----|------------|------------|----------------------------|---------------------|
| 1 | Camera       | scale     | 0     | 600 | 1.00→1.08  | linear     | base drift, always on       | —                   |
| 2 | Title        | y         | 0     | 36  | +80→0      | outExpo    | confident entrance          | next @50% → f18     |
| 3 | Title        | opacity   | 0     | 12  | 0→1        | outQuad    | secondary of #2             | —                   |
| 4 | Title        | scale     | 18    | 30  | 1→1.15     | outQuart   | emphasis on VO word         | next @60% → f36     |
| 5 | Camera       | x         | 36    | 54  | 0→-600     | inOutCubic | travel to section 2         | next cam @72% → f75 |
| 6 | Title        | x (exit)  | 40    | 18  | 0→-900     | inCubic    | leaves; IN-curve → no early | ends f58, no handoff|
| 7 | Card A       | y         | 50    | 36  | +120→0     | outExpo    | enters while #6 exits       | different element ✓ |
...
```

Then verify the score:
- [ ] Every same-element handoff after an **out** or **in-out** curve is within the Section 4.2 range.
- [ ] No same-element motion starts before an **ease-in** motion ends (Section 4.4).
- [ ] Every ease-in landing has an impact reaction, an exit, or a deliberate hold.
- [ ] A primary event starts at least every 0.5–1.0s.
- [ ] The camera has base drift for the whole video, and its moves overlap.
- [ ] Every camera move is ≥ 15% of the frame (translate) or ≥ 12% (zoom), or it's a drift.
- [ ] Every group of elements doing the same motion has an offset/stagger (no two start on the same frame), and the total spread is ≤ 1× item duration.
- [ ] Velocity-based motion blur is on (sub-frame sampling preferred), with no ghosting in the fastest frames.
- [ ] Momentum direction is preserved across transitions.

---

## 9. ANTI-PATTERNS (never do these)

- ❌ `linear` on primary moves (allowed only for drifts, rotations of loaders, and opacity in some cases).
- ❌ A → full stop → B. Anything that waits for 100% of an out-curve before the next action.
- ❌ Starting a new motion on the same element in the middle of an ease-in (it steals the impact and reads as a glitch).
- ❌ Re-targeting a running animation from its current value without velocity matching. Use additive layers instead.
- ❌ Several elements starting the same motion on the same frame (always offset them, Section 4.5).
- ❌ Stagger spreads so long that the viewer waits for the last item.
- ❌ `Math.random()` for stagger jitter (use seeded, deterministic randomness).
- ❌ Fake motion blur: a constant or keyframed Gaussian blur, or blur that ignores the direction of motion.
- ❌ Too few motion blur samples (visible ghost copies).
- ❌ Scale from 0 for everything.
- ❌ Tiny camera moves (2–5% of the frame) that read as jitter.
- ❌ A frozen frame "to let the viewer read". Use a living hold instead.
- ❌ Mixing too many curve families in one shot. Pick a **house style**: for example outExpo for entrances, inCubic for exits, inOutCubic for moves and the camera. Use others only with a reason.
- ❌ Slow-tier ease-in exits (they feel laggy).
- ❌ Fast moves without motion blur.
- ❌ Easing with bezier approximations when the exact function is available (expo and circ lose their character).

---

## 10. ONE-SCREEN CHEAT SHEET

```
ENTRANCE / PUSHED UP / POP ...... outExpo   (fast 0.35s | med 0.6s | slow 1.0s)  hand off @50%
SOFT ENTRANCE / HEAVY OBJECT ..... outQuart  (0.3 | 0.5 | 0.8)                      hand off @60%
GENTLE / THROWN UP / SECONDARY ... outQuad   (0.25 | 0.4 | 0.7)                     hand off @70%
EXIT ............................. inCubic   (0.25 | 0.4 | 0.6)                     NO early handoff
DRAMATIC EXIT / SUCKED AWAY ...... inQuint   (0.3 | 0.5 | 0.8)                      NO early handoff
FALL → IMPACT / SLAM ............. inCirc    (0.25 | 0.4 | 0.6)                     land → react on impact frame
A→B MOVE (universal) ............. inOutCubic(0.4 | 0.7 | 1.2)                      hand off @72%
SOFT REPOSITION .................. inOutQuad (0.35 | 0.6 | 1.0)                     hand off @75%
CINEMATIC / BIG TRANSITION ....... inOutQuint(0.5 | 0.9 | 1.5)                      hand off @68%
SPEED RAMP / PASS-THROUGH ........ outIn*    (rare spice)
CAMERA ........................... drift always + inOutCubic/Quint moves ≥15% frame, overlap @65–75%

GROUPS ........................... offset 8–30% of item duration (chars 1f, words 2–3f, cards 3–5f @30fps), spread ≤ 1× duration
MOTION BLUR ...................... from velocity, 180° shutter, sub-frame sampling, sharp at rest

OUT-CURVES HAND OFF EARLY. IN-CURVES LAND, THEN REACT.
NOTHING STARTS IN SYNC. EVERYTHING FAST SMEARS LIKE A REAL CAMERA.
EVERY FRAME MOVES. THE CAMERA NEVER PARKS. ADDITIVE LAYERS ALWAYS.
```

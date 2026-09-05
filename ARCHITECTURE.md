# VOX FREAK AI — Production Architecture

## 1. Product layers

### Experience layer
React + TypeScript desktop UI. Owns session navigation, visual editing, AI suggestions, automation history and user intent.

### Audio engine
For the prototype, Web Audio handles playback and TypeScript handles analysis. For production, move all latency-sensitive and resynthesis work into a JUCE/C++ engine.

### Analysis engine
Pitch, onset/offset, voicing confidence, vibrato, sibilance, formants, phoneme/timing landmarks and key/chord context.

### AI orchestration
A deterministic safety layer wraps any ML/LLM component. AI can propose edit graphs, but cannot directly destructively alter source media.

### Persistence
Session document stores references to source audio plus a non-destructive edit graph. Rendered cache is disposable.

## 2. Non-destructive edit graph

Each vocal note should eventually support:

- pitch center
- pitch drift
- pitch modulation
- transition curve
- timing start/end
- local stretch/compress
- formant offset
- amplitude/gain
- breath/sibilance protection flag
- confidence and AI rationale

## 3. Master/Slave alignment

The Lead Master is the timing reference. Each Slave can use:

1. coarse cross-correlation;
2. onset/phoneme landmark matching;
3. constrained dynamic time warping;
4. transient-safe local stretch markers;
5. confidence score + maximum correction limits.

Harmony slaves may intentionally diverge from the master; therefore alignment strength must be layer-specific.

## 4. AI Tune strategy

Suggested inference pipeline:

```text
voice -> pitch/voicing -> note segmentation -> key/chord context
      -> phrase intent -> correction proposal -> constraint/safety layer
      -> editable note graph -> preview renderer
```

Important constraints:

- do not flatten intentional scoops or blue notes by default;
- protect vibrato rate unless the user explicitly changes it;
- separate note center from transition behavior;
- detect low-confidence consonant/breath regions and avoid forcing pitch;
- never modify source destructively.

## 5. Native DSP target

Recommended production split:

- C++20 + JUCE
- FFT backend abstraction
- SIMD optimized mono/stereo processing
- lock-free real-time parameter transport
- background analysis worker pool
- offline high-quality render path separate from real-time preview path
- ARA2 host integration after standalone/VST3 stability

## 6. AI privacy

Studio recordings can be commercially sensitive. The production product should support:

- local-only analysis mode;
- opt-in cloud AI;
- explicit upload indicator;
- per-project cloud disable switch;
- no model training on sessions unless separately and explicitly opted in.

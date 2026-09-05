# VOX FREAK AI

**AI-first vocal tuning, pitch editing and Master/Slave vocal alignment workstation.**

VOX FREAK AI is an original vocal-production application concept focused on fast musical decisions: import one lead or a stack of vocals, map pitch into editable note regions, detect tonal context, receive AI-assisted correction suggestions, and align doubles/harmonies against a Master vocal.

> Status: **v0.1 functional prototype**. Pitch/key analysis, note mapping, AI decision macros, multitrack playback and Master/Slave offset estimation are implemented. Production-grade pitch resynthesis/formant preservation is the next DSP milestone.

## Current features

- Multi-vocal audio import / drag and drop
- Lead Master + Slave vocal model
- Monophonic pitch analysis
- Automatic note-region segmentation
- Piano-roll style neon pitch visualization
- Automatic key/scale estimation
- **AI Tune** with Strength + Humanize controls
- **AI Align** using Master/Slave timing offset analysis
- Multitrack audition
- Session-aware AI Assistant recommendations
- WAV source-preview export
- Electron desktop shell
- GitHub Actions typecheck/build pipeline

## Run

```bash
npm install
npm run dev
```

Desktop development mode:

```bash
npm run dev:desktop
```

Build:

```bash
npm run build
```

## Architecture

```text
src/
  App.tsx           workstation / AI workflow
  dsp/              pitch, waveform, alignment, WAV export
  lib/              musical context + AI decision layer
  types/            session/audio model
  styles.css        VOX FREAK neon design system
electron/            desktop shell
```

## DSP roadmap

The TypeScript DSP is intentionally the analysis/prototyping layer. The commercial audio core should move to **C++20 + JUCE** and add:

1. formant-preserving monophonic pitch resynthesis;
2. independent pitch center, drift, modulation and transition editing;
3. transient/phoneme-aware time warp for vocal alignment;
4. high-quality offline rendering separate from real-time preview;
5. VST3/AU standalone targets, then ARA2 integration;
6. optional local AI inference for private studio sessions.

## Product principle

**AI proposes. The musician decides.** Every automatic action should remain visible, reversible and non-destructive.

## Important

This project uses an original interface and architecture. It is inspired by the broader category of professional vocal tuning software, not by proprietary source code or internal implementation details of any specific commercial product.

## License

No license has been selected yet. For a commercial product, keep the repository private or add an appropriate proprietary/open-source license before third-party distribution.

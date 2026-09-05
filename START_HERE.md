# Start here — VOX FREAK AI

## 1. Install

```bash
npm install
```

## 2. Run the browser development build

```bash
npm run dev
```

## 3. Run the desktop shell

```bash
npm run dev:desktop
```

## First test

1. Import a clean mono lead vocal.
2. VOX FREAK maps pitch into note regions and estimates the key.
3. Press **AI Tune** and vary Strength/Humanize.
4. Import one or more doubles/harmonies as Slave tracks.
5. Press **Auto Align** to estimate timing offsets against Lead Master.
6. Audition the stack with Play.

## DSP status

This is the v0.1 analysis/editor prototype. High-quality corrected-audio resynthesis is the next native C++/JUCE milestone; the current app does not pretend that source-preview WAV export is a finished Melodyne-class render engine.

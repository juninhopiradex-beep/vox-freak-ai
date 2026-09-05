# VOX FREAK AI — Product specification v0.1

## North star
Make professional vocal tuning feel like a musical conversation instead of corrective surgery.

## Primary modes

### Tune
Single-voice and multi-layer pitch editing. The default view shows detected pitch as a fine trace and editable musical notes as neon blobs.

### Align
A Lead Master controls timing reference. Doubles, harmonies and stacks are Slaves with independent alignment strength and millisecond offsets.

### Layers
Organizes lead, doubles, harmonies, ad-libs and generated guide layers. Layers can be grouped and linked without forcing identical tuning.

### AI Assistant
Analyzes the current session, explains problems in musical language and proposes reversible actions.

## AI controls

- AI Tune — pitch-center correction using key/scale context.
- AI Align — Master/Slave timing correction.
- Detect Key — tonal center and scale estimation.
- Naturalize Vibrato — avoid flattening healthy modulation.
- Formant Protect — preserve singer identity when pitch is changed.
- Harmony Assist — propose harmony-layer workflow.

## Editing primitives for production

- Note center
- Pitch drift
- Pitch modulation
- Transition shape
- Timing start/end
- Warp marker
- Formant
- Gain
- Sibilance/breath protection
- AI confidence

## UX rules

1. AI edits are always visible.
2. Every AI action is reversible.
3. The user can audition before committing.
4. Low-confidence regions are corrected less aggressively.
5. Master/Slave alignment never assumes harmonies should perfectly clone the lead.
6. One-click presets expose macro intent; advanced editing remains available below the surface.

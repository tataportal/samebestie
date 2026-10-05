# Same, Bestie audio sources

The five environment layers are real recordings, not procedural approximations.

Files were obtained from Blanket, commit
`775f2a767230a9681850d1b1e085be58656f1382`, `data/resources/sounds/`.
Source registry: https://github.com/rafaelmardojai/blanket/blob/775f2a767230a9681850d1b1e085be58656f1382/SOUNDS_LICENSING.md

| File | Recording / author | License | Original |
| --- | --- | --- | --- |
| rain-recorded.mp3 | rain ambience — alex36917; Blanket edit by Porrumentzio | CC BY 4.0 | https://freesound.org/people/alex36917/sounds/524605/ |
| forest-recorded.mp3 | WoodThrushinMorningShawneeForestMay272012.wav — kvgarlic (Kevin Boucher); Blanket edit by Porrumentzio | CC0 1.0 | https://freesound.org/people/kvgarlic/sounds/156826/ |
| crickets-recorded.mp3 | Crickets Chirping At Night — Lisa Redfern | Public domain | https://soundbible.com/2083-Crickets-Chirping-At-Night.html |
| fireplace-recorded.mp3 | Fireplace — ezwa | Public domain | https://soundbible.com/1543-Fireplace.html |
| cafe-recorded.mp3 | Restaurant Ambiance — stephan | Public domain | https://soundbible.com/1664-Restaurant-Ambiance.html |

Licenses checked on 2026-10-05 against the original publishing pages.
CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
CC0 1.0: https://creativecommons.org/publicdomain/zero/1.0/
No author endorsement is implied. Attribution is also visible in Audio credits.

Changes: excerpts (rain 8–83 seconds, forest 5–100 seconds, others from beginning),
1.5-second equal-power loop crossfade, linear level matching with peak headroom,
32 kHz stereo MP3 encoding. No generated nature sounds added. See
`scripts/prepare-field-recordings.py` for the reproducible processing.

The remaining five files (white/pink/brown noise and 10/40 Hz binaurals) are
original generated test signals, not field recordings. Binaurals use 180 Hz in
the left channel and 190/220 Hz in the right. No health or focus benefits claimed.
All layers start off, load on demand, loop through Web Audio, and fade on toggles.

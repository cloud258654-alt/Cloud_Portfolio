# Film Sequence

This package is now based on `94` source images.

Use these files together:

- `flow_manifest.csv`
  Maps each numbered image to its renamed image path, prompt file, and suggested output video name.
- `film_sequence.csv`
  The exact recommended edit order for the final assembled film.
- `prompts/`
  One Google Flow prompt per image-to-video shot.

## Story Arc

1. `001-016` Opening and world setup
   Fireworks, sakura, study scenes, green magic, and soft introductions.

2. `017-032` Moon, water, and hero reveal
   Blue fantasy scenes, moonlight, water magic, male hero shots, and pastel character reveals.

3. `033-048` Festival and rising energy
   Warmer tones, festival outfits, orange action, fireworks, and stronger performance shots.

4. `049-064` Mid-film escalation
   Sakura shrine visuals, void combat, palace characters, and red-violet tension.

5. `065-080` High fantasy build
   Forest guardians, celestial light, water magic, night parasol scenes, and red-haired dance beats.

6. `081-094` Final burst
   Purple action, gold fashion, ice sorcery, dessert-palace glamour, aqua dance, and a fire-queen ending.

## Edit Rules

- Use `film_sequence.csv` as the true clip order.
- End each 8-second shot on a clear pose, eye-line, light pulse, weapon flare, petal sweep, or water burst.
- Use short dissolves when color palettes stay soft or related.
- Use hard cuts when a weapon flash, lightning pulse, ember burst, or dramatic pose lands on beat.
- Do not cut in the middle of chaotic limb motion.
- When possible, match the next clip using one of these bridges:
  petal to petal, glow to glow, blade line to blade line, water circle to water circle, or gaze direction to gaze direction.

## New Batch Note

- The project no longer uses the earlier `44`-image prompt set.
- The current working batch is the `94`-image set in `image_to_video_batch/input`.
- The newly added bunny-and-eagle sakura image is included in this rebuilt batch and mapped to `002`.

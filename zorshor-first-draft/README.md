# Zorsho SHOAR — First Draft

First-draft website for **Zor Shor**, a film and content studio. It covers three pages from the wireframe (Home, Films and Socials), the loader, and the animations. Copy, logos, stats and media are placeholders.

- **Live preview:** https://claude.ai/artifact/1f7ErstyfXn76eU4ek4UVK (private until shared from the page's Share menu)
- **Single file:** `standalone.html`. Open it in any browser or host it anywhere.
- **Framer components:** `framer/*.tsx`. Paste them into Framer under Assets → Code → **+** → New file.

## What's where

| Wireframe | Draft |
|---|---|
| Loading 1.1: polaroid, Lottie, "text over here" | Tilted polaroid drops in, a doodle elephant (Hathi) walks inside as the **Lottie placeholder**, the caption and counter run, then the photo window **opens into the hero video**. |
| 1.1 hero: logo, 3 links, "schedule a call", strong video behind | Full-bleed film loop (placeholder canvas: foggy forest, grain, green light leak, REC timecode), "ZOR SHOR" title with hand underlines, Films / Brands / Socials tags. |
| Brands · Worked with best | Heading plus a tilted **green brush band** with a logo ticker. |
| What you do? (3 cascading frames) | "Our expertise": three staggered cards with parallax. |
| Process in 3 steps | Three polaroid steps joined by a **dashed line that draws itself as you scroll**, with a green dot on the tip. Each step lights up as the line reaches it. |
| Plans · Have your custom plan | Plan request card (name, brand, need, contact). It's a draft form, so nothing is sent. |
| FAQ | Dark accordion. |
| Footer | Doodled hand → blob CTA, large wordmark, page links, socials. |
| Films page | Title and B&W stamp, featured player, "text about vision" plus "Start new project", **What we offer** gallery, **Our projects box** (flaps open and polaroids pop out; the category chips swap them), stats, green strip, **polaroid storyboard wall** (blank page: drag the frames, tap to open), "your idea" block. |
| Socials page | **Shoot. Edit. Deliver. Repeat.** pinned scroll animation, text + "Book your meeting", **What we offer** tree whose branches grow on scroll, projects bento, reel list + player, strip, story + stats, "your idea". |

## Design tokens (use them as Framer styles)

**Colours:** Ink `#0D0F0C` · Paper `#FFFFFF` · Paper 2 `#F3F5F0` · Green `#54D668` (sampled from the wireframe) · Dark green `#1D7A33` (green text on white) · Line `#D5DAD1` · Muted `#565D53`

**Fonts (all on Google Fonts, all available in Framer)**
- Display: **Bricolage Grotesque** 700–800, width 78–86 %, tracking −3 to −4.5 %
- Body: **Instrument Sans** 400–600
- Hand notes, pills, captions: **Caveat Brush**

| Text style | Font | Size (desktop → mobile) | Line height |
|---|---|---|---|
| Mega (hero) | Bricolage 800, uppercase | 232 → 64 px | 0.8 |
| H1 | Bricolage 750 | 116 → 46 px | 0.9 |
| H2 | Bricolage 720 | 76 → 36 px | 0.96 |
| H3 | Bricolage 650 | 27 → 21 px | 1.12 |
| Body | Instrument Sans 400 | 17 px | 1.55 |
| Lead | Instrument Sans 400, Muted | 20 → 17 px | 1.55 |
| Label | Mono 500, uppercase, +8 % | 11 px | 1 |
| Hand | Caveat Brush | 21–26 px, Dark green | 1.1 |

**Doodle language** (from the wireframe notes "doodle · Hathi · [ !! * " " ]"): exclamation marks, asterisks, `//` slashes, quote marks, wobbly underlines and circles, green highlighter swashes behind key words, and hand-drawn borders.

## Framer code components (`framer/`)

| File | Use it for | Notes |
|---|---|---|
| `PolaroidLoader.tsx` | Loader | Fixed layer, 100vw × 100vh, top z-index, Home page only. Drop Framer's **Lottie** component into the *Lottie* slot. |
| `ReelVideo.tsx` | Hero video, film players, "your idea" | Upload an mp4 and it plays muted and looped. With no file it shows the cinematic placeholder. |
| `ScrollDrawPath.tsx` | Process line | Put it behind the 3 step polaroids and stretch it to the section. Paste a path drawn in the view box (defaults to a 3-step zigzag, 1200 × 1400). |
| `BrushMarquee.tsx` | Logo band and green strips | Rotate −4.5° for the Home band, 0° for flat strips. Put logo components in *Slots*. |
| `PolaroidBoard.tsx` | Films · Polaroids wall | Images, captions, shot notes (`Heading|Body`), and positions are all props. |
| `ProjectBox.tsx` | Films · Our projects | Up to 8 categories × 3 cards. |
| `WordStack.tsx` | Socials · Shoot/Edit/Deliver/Repeat | Turn off *Clip content* on the parent so the sticky pin works. |
| `HandDoodle.tsx` | Any doodle | `* ! !! // → underline circle sparkle ↓`. Draws in on view. |

All eight type-check with TypeScript and were run in Chromium without errors.

### Building it natively in Framer

1. Create the project **"Zorsho SHOAR First Draft"** with web pages `/`, `/films` and `/socials`.
2. Add the colour and text styles from the tables above.
3. Build each section as a Framer stack, following the table under *What's where*. Native effects cover the rest:
   - hero letters: *Appear* effect per character, Y 100 % → 0, stagger 0.06 s
   - cascade cards and step copy: *Scroll transform* (Y ±60 px)
   - highlighter swashes: *Appear*, scale X 0 → 1
4. Drop in the code components above wherever the wireframe calls for the bespoke animations.

Once the Framer MCP plugin is open in the project, Claude can do steps 1–4 directly.

## Placeholders to replace before sharing publicly

Showreel and film videos, the Hathi Lottie (`hathi.json`), brand logos, stills (the green and black gradient blocks), stats (50+ films, 100+ reels, 100+ AI ads), the contact email, phone and address, and the social links.

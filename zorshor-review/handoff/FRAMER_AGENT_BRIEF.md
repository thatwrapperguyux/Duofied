# Build brief: zorshor website (Framer)

Build the 3-page zorshor website in Framer. Two finished reference builds are in `reference/`; open them in a browser and match them exactly:

- `zorshor-premium.html`: **Premium** theme. This is the main direction.
- `zorshor-draft.html`: **Draft 1** theme. Same structure, white/black/green hand-drawn look.

Both themes share one page structure; only the styling tokens differ (section 2). Brand assets are in `assets/`. Ready-made animation components are in `code-components/`.

**Principles:** design less, think more.
- Everything is centred and aligned to a 1200 px grid with 40 px gutters.
- Nothing overlaps.
- Font weights never go above 600.
- Text in image or video slots stays empty: every slot is a plain warm-white box (Premium) or a dark green-black box (Draft 1).
- There's no copyright line, because the client will supply one.
- The elephant (Hathi) appears **only on the loading screen**.

---

## 1. Project setup
- Pages: `/` Home, `/socials` Socials, `/films` Films. "Plans" is a section on Home (`#plans`).
- Nav, in this order: **Home · Socials · Films · Plans**, centred. The logo sits on the left and links home. A small **Book a call** button sits on the right.
- Breakpoints: 1440 / 810 / 390.

## 2. Theme tokens
| Token | Premium | Draft 1 |
|---|---|---|
| Page | `#FFFFFF` | `#FFFFFF` |
| Soft panel | `#FAF7F1` | `#F3F5F0` |
| Ink | `#16211E` | `#0D0F0C` |
| Muted | `#68716D` | `#565D53` |
| Hairline | `#ECE7DE` | `#E1E5DD` |
| Accent | `#379F62` (text accents `#22874F`) | `#54D668` (text accents `#1D7A33`) |
| Dark section | `#16211E` | `#0D0F0C` |
| Logo colour | `#229B61` | `#0D0F0C` (white over hero) |
| Display font | League Spartan 600 | Bricolage Grotesque 600 |
| Body font | Inter Tight 400/500 | Instrument Sans 400/500 |
| Accent font | n/a | Caveat Brush (eyebrows, captions, stats labels) |
| Page-change word | **Chicken Dinner** (brand secondary font; upload the licensed file) | same |
| Radius | buttons 999, cards 18, panels 28, media 22 | hand-drawn uneven radii |
| Buttons | Ink fill, white text; hover slides Green up from below | Green fill, 2 px ink outline, `3px 3px 0` ink shadow; hover fills Ink |
| Placeholders | `#F6F4EF → #EFEBE4` gradient, no text | dark green-black gradient; video slots show the film-grain placeholder |

### Type scale (both themes)
| Style | Size (desktop / phone) | Notes |
|---|---|---|
| Hero | 200 / 46 px | lowercase, line height 0.82, tracking −6 % |
| H1 | 80 / 40 px | |
| H2 | 52 / 30 px | |
| H3 | 20 / 17 px | |
| Body | 16 px | |
| Lead | 18 px, muted | |
| Eyebrow | 12 px uppercase, +14 % tracking, 18 px green dash before | Draft 1: Caveat Brush 22 px |

### Buttons
- Sizes: 48 px tall (small: 40 px), 22 px side padding, 10 px gap.
- **Hover animation:** the label rolls up and a copy rolls in from below (0.5 s, `cubic-bezier(.16,1,.3,1)`). The fill sweeps up from the bottom, and arrow icons nudge 4 px right.

## 3. Global elements
- **Loader:** a white polaroid drops in, tilted −5°. Inside, on cream `#FFFDC7`, Hathi (`assets/hathi.svg`, or the Lottie later) juggles his yellow ball while a 000–100 counter and a thin green bar run. The frame then straightens and its photo window zooms open into the page.
- **Page change ("action!"):**
  - Three ragged paper cut-outs slide across in layers, 60 ms apart and slightly rotated, each with a soft shadow. Premium uses ink, cream then green; Draft 1 uses black, white then green.
  - Centred on top: a small outlined pill "SCENE 02 — FILMS" (scene number and page name) and the word **action** in Chicken Dinner (~200 px), followed by a hand-drawn "!".
  - The layers then slide out to the left while the new page appears underneath.
- **Footer** (compact):
  1. CTA row: "Got an idea? *Let's make it.*" (42 px) with the subline "Tell us what you're making — a producer replies within a day." On the right, small buttons: **Start a project →** and **Book a call** (ghost).
  2. A 4-column grid:
     - logo (30 px tall) plus the line "Films, brand content and socials — made zor shor se."
     - Pages: Home, Socials, Films, Plans
     - Studio: Process, Storyboard, FAQ
     - Follow: Instagram, YouTube, LinkedIn, Behance, each with a ↗ that nudges on hover
  3. Base row: an empty slot on the left for the client's legal line, and "Back to top ↗" on the right.

## 4. Home (centred throughout)
1. **Hero:**
   - Media frame: Premium is inset 18 px with a 24 px radius; Draft 1 is full-bleed video with a dark gradient.
   - Centred: the eyebrow "We shoot stories that stick", then the hero title **“zor [Films / Brands / Socials pills] shor”**, letters rising with a stagger. Under it, the sub "A film & content studio telling brand stories **zor shor se** — loud, bold and impossible to scroll past."
   - Buttons: **▶ Watch showreel** and **Book a call** (ghost). A small "Scroll" cue with a 1 px moving line sits at the bottom.
2. **Brands:** a centred head ("Worked with the **best**" plus lead), then a green band tilted −2.5° with a ticker of client names separated by small dots.
3. **Our expertise:** a centred head ("We make things people actually **watch**."), then **three cards in a row**: Ad films, Brand content, Social & reels. They're staggered down 0 / 56 / 112 px and never overlap. Each card has an image slot, a title with a tag, and one line of text; hover lifts it 6 px.
4. **Process:** a centred head, then three polaroid steps in a zig-zag. The dashed path draws itself on scroll with a green dot at the tip (`ScrollDrawPath`). Each step lights up when the line reaches it: its number turns green and the polaroid gets a green outline.
5. **Plans:** a centred head and a soft-panel card: polaroid on the left; on the right, the form fields and a **Send my brief →** button next to "Average reply: 4 hours".
6. **FAQ** (dark):
   - Left: the eyebrow FAQ, "Questions, **answered**.", "Still curious? Talk to a producer — 15 minutes, no deck.", and a **small** "Book a call" button. It must not stretch.
   - Right: a 5-item accordion with a + that turns into ×.

## 5. Socials
1. **Shoot. Edit. Deliver. Repeat.:**
   - The stack stays pinned while you scroll. Idle words are small (48 px) and light grey; done words turn ink.
   - The active word grows to 56 px as an accent sticker (Draft 1 adds a 3 px ink outline and a hard ink shadow, and alternates the tilt).
   - A small megaphone sits **clear of the words**, top-right.
   - Below: 4 thin progress bars and a tiny "Keep scrolling" cue with a 1 px line (no big arrow).
2. **Always on:** an image on the left; on the right, an eyebrow, H2 "Content that keeps up with the **feed**.", text, and a "Book your meeting" card (calendar tile, 15 min · video call, ↗).
3. **What we offer:** "Three ways we keep your feed **busy**."
   - A numbered list of 3 rows: 01 Reels & shorts, 02 Creator collabs, 03 AI ad sprints.
   - Each row: number, title and one line on the left; a small image on the right. Hairlines between rows.
   - A **thin green vertical line draws through the numbers on scroll**, filling each number in green as it passes. **No arrows.**
4. **Made for the scroll:** a smaller bento grid with 15 px titles, 11 px tags and 12 px gaps.
5. **Reel list:** 4 thumbnails with progress bars that auto-advance every 6.5 s, plus the main player.
6. A green strip of thumbnails.
7. **Why we started:** an image beside the story copy and 3 stat cards.
8. **Your idea, in the feed:** a frame, then the text and a button.

## 6. Films
1. Eyebrow, H1 "Films that earn the **second** watch.", the subline, and a tilted stamp.
2. The featured player, then a "{ vision }" line and **Start a project →**.
3. **What we offer:** "Four kinds of **film**". Four cards; hovering one makes it the large card.
4. **Open the box:** the dashed box's flaps open and 3 polaroids pop out. The category chips swap the cards; the label sits on the right half of the box.
5. **Stats:** three cards that count up.
6. A green strip of thumbnails.
7. **Storyboard wall:** a blank lined page with empty polaroids you can drag and tap to open.
8. **Your idea, on screen.**

## 7. Code components (`code-components/`)
Paste these via Assets → Code. Their colours match Premium; for Draft 1, change the colour props to the Draft 1 tokens.

| Component | Use |
|---|---|
| `PolaroidLoader` | the loader (put the Hathi Lottie in its slot later) |
| `ScrollDrawPath` | the Process line |
| `ProjectBox` | Open the box |
| `PolaroidBoard` | the storyboard wall |
| `WordStack` | Shoot / Edit / Deliver / Repeat |
| `ReelVideo` | any video slot (plain placeholder until an mp4 is added) |
| `BrushMarquee` | the Draft 1 brush bands |

Premium uses a native Framer Ticker on a solid green band. `HandDoodle` isn't used.

## 8. Motion
- Reveals: transform only (24 px rise), `cubic-bezier(.16,1,.3,1)`. Never hide content waiting for a scroll trigger.
- Hovers: 0.35–0.5 s.
- Respect reduced motion.

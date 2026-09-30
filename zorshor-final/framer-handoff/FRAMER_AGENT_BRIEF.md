# Build brief: "Zorsho SHOAR" (Framer, final version)

You are building a 3-page Framer website for **Zor Shor**, a Mumbai film and content studio. A working HTML version of the exact design is in `reference-site/index.html`: open it and match it pixel for pixel. Brand assets (the Hathi elephant, sub-brand logos) are in `assets/`. Bespoke animations are ready-made code components in `code-components/`. This is the **final, client-ready** version: no "draft" or "placeholder" labels should be visible anywhere.

Style direction: the v1 **white, black and wireframe-green** hand-drawn look, laid out as a playful sticker portfolio in the spirit of nudge-folio.framer.website.
- Floating pill nav with a hard ink shadow.
- Chunky lowercase Bricolage headlines.
- Draggable stickers, colour-block cards with hard `0 10px 0 #0D0F0C` shadows, big rounded corners (26–40 px), and spring hovers.
- Doodles in the brand's vocabulary (`!! * // " "`), wobbly hand-drawn borders, and green highlighter swashes behind key words.
- Polaroids, and ragged green brush-stroke bands.
- Strong cinematic video (movence-studio style).

---

## 1. Project setup
- Project name: **Zorsho SHOAR**
- Web pages: `/` (Home), `/films` (Films), `/socials` (Socials)
- Breakpoints: Desktop 1440, Tablet 810, Phone 390

### Colour styles
| Style | Hex |
|---|---|
| Ink | `#0D0F0C` |
| Ink 2 | `#1B1F1A` |
| Paper | `#FFFFFF` |
| Paper 2 | `#F3F5F0` (Process section) |
| Green | `#54D668` (sampled from the wireframe; main accent) |
| Green Ink | `#1D7A33` (green text on white) |
| Green Soft | `#DDF6E1` |
| Line | `#D5DAD1` |
| Muted | `#565D53` |

### Fonts (all Google Fonts)
- **Bricolage Grotesque** 700–800, width 78–86 %: display
- **Instrument Sans** 400–600: body
- **Caveat Brush**: hand notes, pills, captions

### Text styles
| Style | Font | Desktop / Phone | Line height |
|---|---|---|---|
| Mega (hero) | Bricolage 800, UPPERCASE, tracking −4.5 % | 232 / 64 px | 0.8 |
| H1 | Bricolage 750, −3.5 % | 116 / 46 | 0.9 |
| H2 | Bricolage 720, −3 % | 76 / 36 | 0.96 |
| H3 | Bricolage 650 | 27 / 21 | 1.12 |
| Body | Instrument Sans 400 | 17 | 1.55 |
| Lead | Instrument Sans 400, Muted | 20 / 17 | 1.55 |
| Label | Mono 500 UPPERCASE, +8 % | 11 | 1 |
| Hand | Caveat Brush, Green Ink | 21–26 | 1.1 |

**Recurring components** (make them Framer components):
- **Pill:** ink fill, green Caveat Brush 19 px text, radius 999, rotated −2°.
- **Button:** green fill, ink text, radius 999, shadow `0 5px 0 Ink`. On hover it lifts −3 px and rotates −1.5°. Ghost variant: 2 px ink outline.
- **Highlight:** a green swash behind one key word per heading, growing in width on appear.
- **Polaroid:** white card, 2 px ink border, 10 px padding, 44 px bottom caption in Caveat Brush, green tape on top.
- **Placeholder image:** dark green-black gradient with grain and a small mono tag (e.g. "STILL · 4:3").

## 2. Code components (`code-components/`)
Add each one under Assets → Code → New file, pasting the file contents. The defaults are already the v1 colours and fonts.

| File | Where it goes |
|---|---|
| `PolaroidLoader.tsx` | Home: fixed layer, 100vw × 100vh, top z-index. Put the Hathi **Lottie** in its "Lottie" slot when available; until then a doodle elephant walks in the frame. |
| `ReelVideo.tsx` | Every video block (hero, film player, reel player, "your idea"). Upload mp4s later; until then it plays a cinematic placeholder (foggy forest or bokeh). |
| `ScrollDrawPath.tsx` | Home Process: behind the 3 step polaroids, stretched to the section. |
| `BrushMarquee.tsx` | Home logo band (rotate −4.5°) and the flat strips on Films and Socials (0°). |
| `ProjectBox.tsx` | Films: Our projects. |
| `PolaroidBoard.tsx` | Films: Polaroids storyboard wall. |
| `WordStack.tsx` | Socials: Shoot / Edit / Deliver / Repeat (turn off Clip Content on the parent). |
| `HandDoodle.tsx` | Decorative `! !! * //` arrows, underlines and scribble circles. |

## 3. Global
- **Nav:** a floating pill, fixed 14 px from the top, max width 1180, height 66, white at 86 % with blur, radius 999, border 1.5 px Ink plus shadow `0 6px 0 Ink`.
  - Left: the logo, `hathi-watercolor.png` (42 px) plus the wordmark "zorshor" in Bricolage 800 lowercase with a green dot after it.
  - Centre: links Socials / Films / Plans; hover and active states use a green pill with ink text.
  - Right: green button **Schedule a call** with a camera icon.
  - Hide on scroll down, show on scroll up. On phone, a Menu button opens a dropdown card.
- **Page transition:** a ragged green brush panel wipes across with "action!" in Caveat Brush.
- **Custom cursor** (desktop): a small green dot that grows into a label ("play", "view") over videos and cards.
- **Footer** (all pages):
  - A doodled pointing hand, a squiggle arrow, and a morphing green blob button "Got an idea? — let's shoot it zor shor se".
  - A hand-drawn line, then a giant ink "zorshor" wordmark spanning the full width, with a green dot after it.
  - Columns: Pages (Home, Films, Socials, Plans, FAQ) and Say hi (hello@zorshor.studio · +91 00000 00000 · Andheri West, Mumbai).
  - Social buttons: Instagram, YouTube, LinkedIn, Behance.
  - Legal line: "© 2026 zorshor · Made loud in Mumbai".

## 4. Home `/`
1. **Loader (wireframe 1.1):** `PolaroidLoader` (uses the brand Hathi vector: ear flaps and the ball bounces on the trunk).
   - A polaroid drops in tilted −6° with `! // // *` doodles drawing themselves around it.
   - Inside, on green, the Hathi elephant walks (Lottie slot). Captions: "rolling camera… / finding the light… / one more take…", a 000–100 counter and a progress bar.
   - Then "action!": the frame straightens and the **photo window zooms open into the hero video**.
2. **Hero** (white):
   - Kicker in Caveat Brush, Green Ink, with a dot: "film · brand · social studio — mumbai".
   - Headline in Bricolage 800 lowercase, 178 / 48 px, tracking −5.5 %, on 2 lines: "stories told [pill-shaped video chip]" / "zor shor [inline watercolor Hathi, bobbing] se."
     - "zor" and "shor" each get a green highlighter bar behind the lower third.
     - The lines fade up with a stagger after the loader.
   - Below: Lead "A film & content studio making loud, lovable films for brands that have something to say — ad films, reels and AI ads." and buttons **Schedule a call** (green) / **See our films** (outlined).
   - **Draggable stickers** (Framer Drag, desktop only): "ad films!!" green, "★ 50+ films" ink with green text, "reels" white, "ai ads" soft green. Each is rotated ±4–10° with a 2 px ink border and a `0 5px 0 Ink` shadow.
   - **Showreel card:** `ReelVideo` (forest), about 82vh tall. It starts inset with a 40 px radius and grows to full-bleed with radius 0 as it scrolls in (Scroll transform on width and radius). Overlays: "● REC 00:00:00:00" and a "▶ Watch showreel 01:42" pill.
3. **Brands:**
   - Pill "Brands", H2 "Worked with the **best**", and lead: "Homegrown D2C labels, national launches and a few legends in between — brands that trusted us with their story, their budget and, occasionally, their CEO on camera."
   - A tilted `BrushMarquee` of logo placeholders: monsoon&co, Bharat Chai, NOVA MOTORS, lumen., KIRO, TIDAL FOODS, Haathi Toys, orbit/pay.
4. **Our expertise ("What you do?"):**
   - Pill, then H2 "“We make things people actually watch.”" with a green scribble circle round "watch".
   - A side note "what do we do?" with an arrow doodle.
   - Three cards cascade diagonally with parallax:
     - *Ad films* (TVC · DIGITAL): "TVCs and digital films, 15 seconds to 3 minutes, script to screen."
     - *Brand content*: "Launch films, founder stories and product films that sound like you."
     - *Social & reels* (IG · YT · LI): "Always-on reels, shorts and creator collabs, cut native for every feed."
   - Cards: radius 30, 2.5 px ink border, shadow `0 10px 0 Ink`, slight rotations. Colours: Ad films green, Brand content ink with white text, Social & reels white.
5. **Process** (Paper 2 background with a dot grid):
   - Pill "Process", H2 "If you're getting **started** with us", lead "Three steps, zero jargon. Here's how an idea turns into a film."
   - Zig-zag steps (polaroid plus copy):
     1. Polaroid left, copy right. **Tell us the story:** "A 30-minute call, a brief and a doodle board. We figure out what you want people to feel, not just what they should see." Chips: Discovery call · Creative brief · Moodboard. Caption "the brief, day 1".
     2. Copy left, polaroid right. **We shoot it:** "Scripts, storyboards, casting, locations and a crew that moves fast. You're on set — or on call — for every take that matters." Chips: Script & storyboard · Casting · Shoot days. Caption "on set, take 14".
     3. Copy bottom-left, polaroid centre. **Edit, deliver, repeat:** "Edit, grade, sound and every cut-down your platforms need. Then we look at what worked and do it again, louder." Chips: Edit & grade · Cut-downs · Performance review. Caption "final cut!".
   - `ScrollDrawPath`: a dashed ink line, with a faint dotted ghost of the full route, draws from step 1 → 2 → 3 as you scroll. A pulsing green dot rides the tip.
   - Each step's polaroid gets a green offset shadow once the line reaches it. *This is the main animation of the site.*
6. **Plans** (id `plans`):
   - Pill "Plans", H2 "Have your **custom** plan", lead "Tell us a little about the project — we'll come back with a plan and a ballpark, usually the same day."
   - An ink card (radius 40, shadow `0 12px 0 Green`): a polaroid on the left ("your brief lives here").
   - On the right, underline inputs: Your name, Brand / company, a chip group (Ad film, Reels pack, AI ads, Not sure yet), and Email or phone with a green square arrow submit.
   - A black tag "AVG. REPLY · 4 HRS" (4 hrs in green).
7. **FAQ** (Ink background):
   - Left, sticky: "“FAQ”" with green quotes, a note "still curious? just ask →" and a button.
   - Right, an accordion with green hand-drawn plus icons:
     - How long does an ad film take?
     - What does a project cost?
     - Do you shoot outside Mumbai?
     - Can you handle scripts and ideas too?
     - What are AI ads, exactly?

     Answers are in the reference site.

## 5. Films `/films`
1. **Header:**
   - The `logo-filam.png` sub-brand logo, H1 "Films that earn the **second** watch.", label "BRAND FILMS · TVCS · DOCUMENTARIES · MUSIC VIDEOS".
   - Top-right: a black-and-white still/logo stamp, rotated 5°, green offset shadow.
   - Big `ReelVideo` player (ink border, green round play button, timecode and progress bar).
   - Below: text in large green braces "{ Every film starts as a doodle on a napkin. We keep the energy of that first sketch all the way to the final grade. }" and the button **Start new project →**.
2. **What we offer!** (Caveat Brush title): 4 cards (Documentary 10–40 min, **TVC & ad films** 15s–3 min large, Brand films 1–5 min, Music videos 3–5 min). Hovering a card makes it the large one.
3. **Our projects:**
   - Copy "Open the **box**." on the left, `ProjectBox` on the right: a green dashed box whose flaps open and 3 polaroids pop out on scroll.
   - Categories: Ad films, Motion graphics, AI, VFX, 3D, with the note "[ or whatever you provide ]" and a "!!" doodle.
4. **Our stats:**
   - Copy "We've spent **2,000+ hours** on set and in the edit — and we still get goosebumps at the first playback."
   - 3 outlined stat cards that count up: 50+ films, 100+ reels, 100+ AI ads.
5. **Strip:** a flat `BrushMarquee` of project thumbnails.
6. **Polaroids:** pill "Polaroids", H2 "The storyboard wall", then `PolaroidBoard`.
   - A **blank page**: lined paper, a paperclip, green hatched empty frames (sc 01 — wide, sc 02 — macro, sc 03 — mid, sc 04 — end card) and handwritten shot notes.
   - Drag the polaroids around; tapping one opens it with its note.
7. **Your idea:** a big `ReelVideo` (bokeh) with "Your idea, on **screen.**" and a green “your idea” sticker, then a sketch-bordered text box and **Start new project**.

## 6. Socials `/socials`
1. **Shoot / Edit / Deliver / Repeat:** the `logo-social.png` sub-brand logo, then `WordStack`, pinned while scrolling.
   - The active word becomes a big green sticker with an ink shadow.
   - Around it: a megaphone doodle, a "!" doodle, "keep scrolling ↓" and progress bars.
2. A large image with "Content that keeps up with the feed." overlaid, and the side text "We run always-on social for brands that post every day…"
   - Plus a **Book your meeting** card: ink background, green calendar icon, "15 MIN · VIDEO CALL", rotated −2°.
3. **What we offer!** (hand title in a green wobbly box): a green vertical line draws on scroll, and branches with arrows grow to three cards:
   - I *Reels & shorts* (right)
   - II *Creator collabs* (left)
   - III *AI ad sprints* (right)
4. **Our projects:** pill, H2 "Made for the **scroll**." Bento grid:
   - Kiro — 30 reels in 30 days (wide)
   - Bharat Chai — street stories (tall)
   - Lumen launch
   - Nova teaser
   - Orbit/Pay explainers
   - Tidal Foods — recipe cuts (wide)
   - Haathi Toys — unboxing (wide)
5. **Reel list:** 4 thumbnails on the left (Kiro · Day 12, Bharat Chai · Ep 3, Nova · Teaser, Tidal · Recipe 7) with progress bars that auto-advance every 6.5 s; the main `ReelVideo` (bokeh) on the right; an arrow doodle between them.
6. A flat thumbnail strip, running in reverse.
7. **Story:** a tall image with the note "vision / story", pill "Our stats", H2 "Why we **started**.", lead "Brand content had become polite…", and 3 stat cards.
8. **Your idea:** "Your idea, in the **feed.**" plus a text box and **Book your meeting**.

## 7. Content to swap in before launch (do NOT show placeholder labels)
Replace these as the client supplies them:
- videos (`showreel.mp4`, `featured-film.mp4`, `reel.mp4`, `your-idea.mp4`)
- the Hathi Lottie (`hathi.json`)
- the client logos
- all photos
- the stats
- the contact details

## 8. Motion rules
- Hovers: spring `cubic-bezier(.34,1.56,.64,1)`.
- Reveals: `cubic-bezier(.16,1,.3,1)`, transform only; never park content at opacity 0.
- Doodles draw themselves in (stroke dash) when they scroll into view.
- Respect reduced motion.

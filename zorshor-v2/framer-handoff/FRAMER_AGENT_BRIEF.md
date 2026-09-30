# Build brief: "Zorsho SHOAR First Draft" (Framer)

You are building a 3-page Framer website for **zorshor**, a Mumbai film and content studio. A working HTML version of the exact design is in `reference-site/index.html`: open it and match it. Brand assets are in `assets/`. Bespoke animations are ready-made code components in `code-components/`.

Style direction: a playful sticker-portfolio in the spirit of nudge-folio.framer.website, built strictly on the zorshor brand kit.
- Cream background.
- Chunky lowercase League Spartan headlines.
- Pill-shaped buttons and nav.
- Bright colour-block cards with hard offset shadows (`0 10px 0 #29423D`).
- Draggable stickers.
- Bouncy spring hovers (stiffness ~400, damping ~20).

---

## 1. Project setup
- Project name: **Zorsho SHOAR First Draft**
- Web pages: `/` (Home), `/films` (Films, sub-brand **filam**), `/socials` (Socials, sub-brand **zorshor social**)
- Breakpoints: Desktop 1440, Tablet 810, Phone 390

### Colour styles (brand kit)
| Style | Hex |
|---|---|
| Brand/Green | `#379F62` |
| Brand/Green Dark | `#1E7A4A` |
| Brand/Cream | `#FBF0E3` (page background) |
| Brand/Cream Light | `#FFFDC7` |
| Brand/Yellow | `#FDC529` |
| Brand/Orange | `#FD5A15` |
| Brand/Raspberry | `#D22B54` |
| Brand/Forest | `#29423D` (dark sections, shadows) |
| Brand/Ink | `#1F332E` (text) |
| Brand/Muted | `#5B6A64` |
| Brand/Line | `#E6D9C6` |

### Fonts
- **League Spartan** (Google): display, weight 800, tracking −3.5 % to −5.5 %.
- **Inter Tight** (Google): body. It stands in for the brand's *Helvetica Now Display*; upload the licensed font if available.
- **Grandstander** 700–800, UPPERCASE, +3 % tracking: labels, pills, captions. It stands in for the brand's *Chicken Dinner*; upload the licensed font if available.

### Text styles
| Style | Font | Desktop / Phone | Line height |
|---|---|---|---|
| Hero | League Spartan 800 | 178 / 48 px | 0.88 |
| H1 | League Spartan 800 | 112 / 46 | 0.92 |
| H2 | League Spartan 800 | 72 / 36 | 0.95 |
| H3 | League Spartan 800 | 26 / 21 | 1.1 |
| Body | Inter Tight 400 | 17 | 1.55 |
| Lead | Inter Tight 500, Muted | 20 / 17 | 1.45 |
| Label | Grandstander 700 UPPERCASE | 13 | 1 |

**Recurring components** (make them Framer components):
- **Pill label:** green fill, cream Label text, radius 999, rotated −2°.
- **Button primary:** green fill, cream text, radius 999, shadow `0 5px 0 Forest`; hover lifts −3 px and rotates −1.5°.
- **Button ghost:** 2 px Forest inside border.
- **Highlight:** a yellow rounded swash behind one key word per heading, which grows in width on appear.

## 2. Assets (`assets/`)
- `hathi-watercolor.png`: the Hathi elephant illustration (logo mark, hero, footer, process line rider).
- `hathi.svg`: vector Hathi split into parts (`.h-body`, `.h-ear`, `.h-ball`, `.h-headg`, `.h-smile`, `.h-tail`) for animation. Use it until the Lottie arrives.
- `logo-social.png`, `logo-filam.png`, `logo-events.png`: sub-brand logos.
- Wordmark: the logo is the word **zorshor** set in League Spartan 800 lowercase, tracking −6 %, Brand/Green (as in the brand guidelines). Don't stretch, rotate, recolour or add shadows.

## 3. Code components (`code-components/`)
Add each one under Assets → Code → New file, pasting the file contents.

| File | Where it goes |
|---|---|
| `PolaroidLoader.tsx` | Home: fixed layer, 100vw × 100vh, top z-index. Put the Hathi **Lottie** in its slot when available. |
| `ReelVideo.tsx` | Every video block. Upload mp4s later; until then it plays a cinematic placeholder. |
| `ScrollDrawPath.tsx` | Home Process: behind the 3 step cards, stretched to the section. |
| `BrushMarquee.tsx` | Logo band (rotate −4.5°) and flat strips (0°). |
| `ProjectBox.tsx` | Films: Our projects. |
| `PolaroidBoard.tsx` | Films: Polaroids storyboard wall. |
| `WordStack.tsx` | Socials: Shoot / Edit / Deliver / Repeat (turn off Clip Content on the parent). |
| `HandDoodle.tsx` | Decorative `!! * //` arrows, underlines and circles. |

## 4. Global
- **Nav:** a floating pill, fixed 14 px from the top, max width 1180, background Cream Light at 82 % with blur, radius 999.
  - Left: the logo, Hathi PNG (42 px) plus the "zorshor" wordmark.
  - Centre: links Socials / Films / Plans. Hover and active states use a green pill.
  - Right: primary button **Schedule a call** with a camera icon.
  - Hide on scroll down, show on scroll up. On phone, a Menu button opens a dropdown card.
- **Page transition:** a green panel wipes across with "action!" in League Spartan cream.
- **Footer** (all pages):
  - Watercolor Hathi (bobbing), a hand-drawn arrow, and a yellow blob button "Got an idea? — LET'S SHOOT IT ZOR SHOR SE" (morphing border-radius).
  - A giant green "zorshor" wordmark spanning the full width.
  - A row labelled "THE FAMILY" with the social, filam and events logos.
  - Columns: Pages (Home, Films, Socials, Plans, FAQ) and Say hi (hello@zorshor.studio · +91 00000 00000 · Andheri West, Mumbai).
  - Social pills: Instagram, YouTube, LinkedIn, Behance. Legal line: © 2026 zorshor.

## 5. Home `/`
1. **Loader:** `PolaroidLoader`. A polaroid drops in tilted with `! // *` doodles, Hathi juggles his ball inside, captions run "rolling camera… / finding the light… / one more take…" with a 000–100 counter. Then "action!", the frame straightens, and the photo window zooms open into the page.
2. **Hero** (cream):
   - Kicker with an orange dot: "FILM · BRAND · SOCIAL STUDIO — MUMBAI".
   - Headline on 2 lines: "stories told [green pill-shaped video chip]" / "**zor shor** [inline watercolor Hathi] se." The "zor shor" part is green. Lines fade up with a stagger.
   - Below: Lead "A film & content studio making loud, lovable films for brands that have something to say — ad films, reels and AI ads." and buttons **Schedule a call** / **See our films**.
   - **Draggable stickers** (Framer Drag): "AD FILMS!!" yellow, "★ 50+ FILMS" raspberry, "REELS" orange, "AI ADS" green; each rotated ±4–10° with a hard shadow.
   - **Showreel card:** `ReelVideo` about 82vh tall. It starts inset with a 40 px radius and grows to full-bleed with radius 0 as it scrolls into view (Scroll transform on width and radius). Overlays: "● REC 00:00:00:00" top-left and a "Watch showreel 01:42" pill bottom-right.
3. **Brands:**
   - Pill "BRANDS", H2 "Worked with the **best**" (yellow highlight), and a lead: "Homegrown D2C labels, national launches and a few legends in between…"
   - `BrushMarquee` at −4.5° with logos: monsoon&co, Bharat Chai, NOVA MOTORS, lumen., KIRO, TIDAL FOODS, Haathi Toys, orbit/pay.
4. **Our expertise:**
   - H2 "“We make things people actually watch.”" with an orange scribble circle round "watch".
   - Three cards cascade diagonally, with parallax at different speeds:
     - Yellow: *Ad films*, "TVCs and digital films, 15 seconds to 3 minutes, script to screen."
     - Orange: *Brand content*, "Launch films, founder stories and product films that sound like you."
     - Green: *Social & reels*, "Always-on reels, shorts and creator collabs, cut native for every feed."
   - Cards have radius 30 and shadow `0 10px 0 Forest`.
5. **Process** (Cream Light background with a dot grid):
   - H2 "If you're getting **started** with us". Three steps in a zig-zag, each a polaroid with yellow tape plus text:
     1. **Tell us the story:** "A 30-minute call, a brief and a doodle board…" Chips: Discovery call · Creative brief · Moodboard.
     2. **We shoot it:** "Scripts, storyboards, casting, locations and a crew that moves fast…" Chips: Script & storyboard · Casting · Shoot days.
     3. **Edit, deliver, repeat:** "Edit, grade, sound and every cut-down your platforms need…" Chips: Edit & grade · Cut-downs · Performance review.
   - `ScrollDrawPath` draws a dashed Forest line from step 1 → 2 → 3 as you scroll, with the watercolor Hathi riding the tip. Each step's polaroid gets a green offset shadow once the line reaches it. *This is the main animation of the site.*
6. **Plans** (id `plans`):
   - H2 "Have your **custom** plan".
   - A green card (radius 40, Forest shadow) with a polaroid on the left. On the right, inputs: Your name, Brand / company, a chip group (Ad film, Reels pack, AI ads, Not sure yet), and Email or phone with a yellow round arrow submit.
   - A raspberry tag reading "AVG. REPLY · 4 HRS".
7. **FAQ** (Forest background): "“FAQ”" with yellow quotes, plus an accordion of 5 rounded cards:
   - How long does an ad film take?
   - What does a project cost?
   - Do you shoot outside Mumbai?
   - Can you handle scripts and ideas too?
   - What are AI ads, exactly?

   Answers are in the reference site.

## 6. Films `/films`
1. **Header:**
   - The filam logo, H1 "Films that earn the **second** watch.", and the label "BRAND FILMS · TVCS · DOCUMENTARIES · MUSIC VIDEOS".
   - A black-and-white still/logo stamp top-right with a yellow offset shadow.
   - Below: a big `ReelVideo` player (radius 32) with a yellow play button, then the vision text "{ Every film starts as a doodle on a napkin… }" and the button **Start new project →**.
2. **What we offer!:** 4 cards in a row (Documentary, **TVC & ad films** large, Brand films, Music videos). Hovering a card makes it the large one.
3. **Our projects:**
   - Copy "Open the **box**." on the left, `ProjectBox` on the right. Categories: Ad films, Motion graphics, AI, VFX, 3D, plus a note "[ OR WHATEVER YOU PROVIDE ]".
   - When the box scrolls into view, its flaps open and 3 polaroids pop out.
4. **Our stats:**
   - Copy "We've spent **2,000+ hours** on set and in the edit — and we still get goosebumps at the first playback."
   - 3 stat cards that count up: 50+ films, 100+ reels, 100+ AI ads.
5. **Strip:** a flat `BrushMarquee` of project thumbnails.
6. **Polaroids:** H2 "The storyboard wall", then `PolaroidBoard`. It's a blank lined page with a paperclip and hatched empty frames (sc 01 wide, sc 02 macro, sc 03 mid, sc 04 end card) plus handwritten shot notes. Polaroids drag, and tapping one opens it.
7. **Your idea:** a big `ReelVideo` (bokeh) with the text "Your idea, on **screen.**" and a yellow “YOUR IDEA” sticker, then a text box and **Start new project**.

## 7. Socials `/socials`
1. The zorshor social logo, then `WordStack`: "Shoot. / Edit. / Deliver. / Repeat." pinned while scrolling. The active word is a green pill with a Forest shadow; a megaphone doodle and "keep scrolling ↓" sit alongside.
2. A large image with "Content that keeps up with the feed." overlaid, a side text, and a **Book your meeting** card (Forest background, yellow calendar icon, "15 MIN · VIDEO CALL").
3. **What we offer!:** a yellow pill title and a green vertical line that draws on scroll.
   - Branches grow to cards I *Reels & shorts* (right), II *Creator collabs* (left) and III *AI ad sprints* (right).
4. **Our projects:** H2 "Made for the **scroll**." Bento grid:
   - Kiro — 30 reels in 30 days (wide)
   - Bharat Chai — street stories (tall)
   - Lumen launch
   - Nova teaser
   - Orbit/Pay explainers
   - Tidal Foods — recipe cuts
   - Haathi Toys — unboxing
5. **Reel list:** 4 thumbnails on the left (Kiro · Day 12, Bharat Chai · Ep 3, Nova · Teaser, Tidal · Recipe 7) with progress bars that auto-advance every 6.5 s, and the main `ReelVideo` player on the right.
6. A flat thumbnail strip.
7. **Why we started:** a tall image labelled "vision / story", H2 "Why we **started**.", and 3 stat cards.
8. **Your idea:** "Your idea, in the **feed.**" plus **Book your meeting**.

## 8. Placeholders (keep them clearly marked)
All copy is draft. Also placeholders:
- videos (`showreel.mp4`, `featured-film.mp4`, `reel.mp4`, `your-idea.mp4`)
- the Hathi Lottie (`hathi.json`)
- the client logos in the marquee
- all photos
- the stats
- the contact details

## 9. Motion rules
Use spring easing for hovers and stickers, and `cubic-bezier(.16,1,.3,1)` for reveals. Scroll animations go through transform only; never hide content at opacity 0 waiting for a scroll trigger. Respect reduced motion.

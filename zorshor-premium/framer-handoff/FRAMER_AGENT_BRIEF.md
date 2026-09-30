# Build brief: "zorshor" website (Framer, final draft)

You are building a 3-page Framer website for **zorshor**, a film and content studio. The exact design is in `reference-site/index.html` (one file, open it in a browser) — match its layout, spacing and motion. Assets are in `assets/`; bespoke animations are ready-made code components in `code-components/`.

**Direction: super minimal and premium.** White pages, the brand green used sparingly, one near-black ink, lots of air, hairline borders, soft long shadows, pill buttons. No doodles, no hand-drawn borders, no textures. The Hathi elephant appears **only in the loading screen**.

**Placeholders:** every image/video slot is a plain warm-white box (`linear-gradient(#F7F5F1, #F0EDE7)`) with **no text or labels on it**. No copyright line — the client will supply it.

---

## 1. Project setup
- Project name: **zorshor**
- Web pages: `/` (Home), `/films` (Films), `/socials` (Socials)
- Breakpoints: Desktop 1440, Tablet 810, Phone 390

### Colour styles (from the brand kit)
| Style | Hex |
|---|---|
| Ink | `#16211E` (text, dark buttons, FAQ background) |
| Green | `#379F62` (accent, key words, band) |
| Green Logo | `#229B61` (logo colour) |
| White | `#FFFFFF` (page) |
| Warm White | `#FBF7F0` (Process, Plans card, soft panels) |
| Placeholder | `#F7F5F1 → #F0EDE7` |
| Line | `#E9E4DB` (1 px hairlines) |
| Muted | `#6B736F` |
| Cream Yellow | `#FFFDC7` (loader photo only) |

### Fonts
- **League Spartan** 700 (Google) — headlines, tracking −4 % (hero −6 %, lowercase).
- **Inter Tight** 400/500 (Google) — body and labels; stands in for the brand's Helvetica Now Display.

### Text styles
| Style | Font | Desktop / Phone | Line height |
|---|---|---|---|
| Hero | League Spartan 700 lowercase, −6 % | 232 / 64 px | 0.8 |
| H1 | League Spartan 700 | 116 / 46 | 0.95 |
| H2 | League Spartan 700 | 76 / 36 | 0.98 |
| H3 | League Spartan 700 | 27 / 21 | 1.12 |
| Body | Inter Tight 400 | 17 | 1.55 |
| Lead | Inter Tight 400, Muted | 20 / 17 | 1.55 |
| Label | Inter Tight 500 UPPERCASE, +16 % | 11–12 | 1 |

**Recurring components**
- **Label pill:** transparent, 1 px Line border, radius 999, Label text in Ink with a 6 px green dot before it.
- **Button:** Ink fill, white Inter Tight 500 15 px, radius 999, padding 16 × 24. Hover: fill turns Green, lifts 1 px. Ghost: 1 px Ink outline.
- **Key word:** one word per heading in Green (no highlighter).
- **Polaroid:** white card, radius 4, 10 px padding, caption = Label style in Muted, shadow `0 24px 50px -30px rgba(22,33,30,.35)`.
- **Card:** white, radius 20–22, 1 px Line border or soft long shadow.

### Logo
`assets/zorshor-logo.svg` — the exact brand wordmark (League Spartan Bold glyphs from the brand kit). Use it in Green Logo `#229B61` (nav, 26 px tall) and white on dark. Never stretch, rotate, recolour outside brand colours, add shadows or put it in a container.

## 2. Code components (`code-components/`)
Add each one under Assets → Code → New file, pasting the file contents. The defaults are already the v1 colours and fonts.

| File | Where it goes |
|---|---|
| `PolaroidLoader.tsx` | Home: fixed layer, 100vw × 100vh, top z-index. Uses the brand Hathi vector (ear flaps, ball bounces on the trunk); put the Hathi **Lottie** in its slot when available. This is the **only** place the elephant appears. |
| `ReelVideo.tsx` | Every video block (hero, film player, reel player, "your idea"). Upload mp4s later; until then it shows a plain warm-white box. |
| `ScrollDrawPath.tsx` | Home Process: behind the 3 step polaroids, stretched to the section. |
| `BrushMarquee.tsx` | Optional. Simpler: a native Framer **Ticker** inside a solid Green band (86–112 px tall), items = client names in League Spartan 700 white lowercase, band rotated −2.5° on Home, flat elsewhere. |
| `ProjectBox.tsx` | Films: Our projects. |
| `PolaroidBoard.tsx` | Films: Polaroids storyboard wall. |
| `WordStack.tsx` | Socials: Shoot / Edit / Deliver / Repeat (turn off Clip Content on the parent). |
| `HandDoodle.tsx` | **Not used** in this version (minimal). |

## 3. Global
- **Nav** (fixed, 78 px): transparent at the top, white 88 % + blur + 1 px bottom hairline once scrolled. Left: logo. Centre: Socials / Films / Plans in a hairline pill group (active/hover = Ink fill, white text). Right: Ink button **Schedule a call** with a camera icon. Hides on scroll down, shows on scroll up. Phone: Menu button → white dropdown card.
- **Page transition:** an Ink panel slides across with the white logo in the centre.
- **Footer** (all pages): centred Green pill CTA "Got an idea? LET'S MAKE IT" (hover → Ink); hairline; the full-width Green logo; a Pages column (Home, Films, Socials, Plans, FAQ) and social pills (Instagram, YouTube, LinkedIn, Behance). **No copyright / contact line** — client to supply.

## 4. Home `/`
1. **Loader:** `PolaroidLoader` on white. A white polaroid drops in slightly tilted; inside, on Cream Yellow, the green Hathi juggles his yellow ball. Caption (Label style) runs "rolling camera… / finding the light… / one more take…" with a 000–100 counter and a thin green progress line. Then "action!", the frame straightens and the photo window zooms open into the page.
2. **Hero:** white page with a large rounded placeholder frame (radius 28, inset 96 px top / gutter on the sides and bottom) — the showreel video goes here later. Inside, bottom-aligned:
   - Label "WE SHOOT STORIES THAT STICK" with green dot.
   - Hero title **“ zor [stack] shor ”** — green quote marks; between the words a stack of three small pills: FILMS / **BRANDS** (green fill, white) / SOCIALS. Letters rise in with a stagger after the loader.
   - Right-aligned sub: "A film & content studio telling brand stories **zor shor se** — loud, bold and impossible to scroll past."
   - Bottom row: hairline note "AD FILMS · REELS · AI ADS / MUMBAI → EVERYWHERE" (left) and a white pill "▶ Watch showreel 01:42" with a green play dot (right). "SCROLL" cue with an animated 1 px line.
3. **Brands:**
   - Pill "Brands", H2 "Worked with the **best**", and lead: "Homegrown D2C labels, national launches and a few legends in between — brands that trusted us with their story, their budget and, occasionally, their CEO on camera."
   - A solid Green band tilted −2.5° with a Ticker of client names (white, League Spartan 700 lowercase): monsoon&co, bharat chai, nova motors, lumen., kiro, tidal foods, haathi toys, orbit/pay.
4. **Our expertise ("What you do?"):**
   - Label pill, then H2 "“We make things people actually watch.”"
   - Three cards cascade diagonally with parallax:
     - *Ad films* (TVC · DIGITAL): "TVCs and digital films, 15 seconds to 3 minutes, script to screen."
     - *Brand content*: "Launch films, founder stories and product films that sound like you."
     - *Social & reels* (IG · YT · LI): "Always-on reels, shorts and creator collabs, cut native for every feed."
   - Cards: white, radius 22, 12 px padding, soft long shadow, no rotation; hover lifts 6 px. Tag in Green Label style.
5. **Process** (Warm White background):
   - Pill "Process", H2 "If you're getting **started** with us", lead "Three steps, zero jargon. Here's how an idea turns into a film."
   - Zig-zag steps (polaroid plus copy):
     1. Polaroid left, copy right. **Tell us the story:** "A 30-minute call, a brief and a doodle board. We figure out what you want people to feel, not just what they should see." Chips: Discovery call · Creative brief · Moodboard. Caption "the brief, day 1".
     2. Copy left, polaroid right. **We shoot it:** "Scripts, storyboards, casting, locations and a crew that moves fast. You're on set — or on call — for every take that matters." Chips: Script & storyboard · Casting · Shoot days. Caption "on set, take 14".
     3. Copy bottom-left, polaroid centre. **Edit, deliver, repeat:** "Edit, grade, sound and every cut-down your platforms need. Then we look at what worked and do it again, louder." Chips: Edit & grade · Cut-downs · Performance review. Caption "final cut!".
   - `ScrollDrawPath` (stroke 1.5 px Ink, dash 6/8, ghost 12 % Ink): the line draws from step 1 → 2 → 3 as you scroll, a green dot with a white ring rides the tip. **No elephant here.**
   - Each step's polaroid gets a 1 px green outline and its number turns green once the line reaches it. *This is the main animation of the site.*
6. **Plans** (id `plans`):
   - Pill "Plans", H2 "Have your **custom** plan", lead "Tell us a little about the project — we'll come back with a plan and a ballpark, usually the same day."
   - A Warm White card (radius 32): a polaroid on the left ("your brief lives here").
   - On the right, hairline underline inputs: Your name, Brand / company, a chip group (Ad film, Reels pack, AI ads, Not sure yet), and Email or phone with a round Ink arrow submit (hover Green). Selected chip = Ink fill.
   - A small Green pill "AVG. REPLY · 4 HRS".
7. **FAQ** (Ink background):
   - Left, sticky: "“FAQ”" with green quotes, a note "still curious? just ask →" and a button.
   - Right, a hairline accordion with green plus icons:
     - How long does an ad film take?
     - What does a project cost?
     - Do you shoot outside Mumbai?
     - Can you handle scripts and ideas too?
     - What are AI ads, exactly?

     Answers are in the reference site.

## 5. Films `/films`
1. **Header:**
   - Pill "Films", H1 "Films that earn the **second** watch.", label "BRAND FILMS · TVCS · DOCUMENTARIES · MUSIC VIDEOS".
   - Top-right: a small white placeholder stamp, rotated 3°, soft shadow.
   - Big player (radius 24, placeholder) with an Ink round play button (hover Green), timecode and a thin progress line.
   - Below, in a Warm White rounded panel: text in thin green braces "{ Every film starts as a doodle on a napkin. We keep the energy of that first sketch all the way to the final grade. }" and the button **Start new project →**.
2. **What we offer!** (H2, "offer!" in Green): 4 cards (Documentary 10–40 min, **TVC & ad films** 15s–3 min large, Brand films 1–5 min, Music videos 3–5 min). Hovering a card makes it the large one.
3. **Our projects:**
   - Copy "Open the **box**." on the left, `ProjectBox` on the right: a green dashed box whose flaps open and 3 white polaroids pop out on scroll.
   - Category chips (hairline pills, selected = Ink): Ad films, Motion graphics, AI, VFX, 3D, with the note "[ OR WHATEVER YOU PROVIDE ]".
4. **Our stats:**
   - Copy "We've spent **2,000+ hours** on set and in the edit — and we still get goosebumps at the first playback."
   - 3 hairline stat cards (radius 20) that count up: 50+ films, 100+ reels, 100+ AI ads ("+" in Green).
5. **Strip:** a flat Green band with a Ticker of white placeholder thumbnails.
6. **Polaroids:** pill "Polaroids", H2 "The storyboard wall", then `PolaroidBoard`.
   - A **blank page**: white sheet (radius 22, faint ruled lines), a grey paperclip, plain white polaroid frames (sc 01 — wide, sc 02 — macro, sc 03 — mid, sc 04 — end card) and small shot notes in Inter Tight.
   - Drag the polaroids around; tapping one opens it with its note.
7. **Your idea:** a big placeholder frame (radius 28) with "Your idea, on **screen.**" in Ink and a small Green pill “YOUR IDEA”, then a Warm White text panel and **Start new project**.

## 6. Socials `/socials`
1. **Shoot / Edit / Deliver / Repeat:** pill "Socials", then `WordStack`, pinned while scrolling.
   - Words are hairline pills in light grey text; the active word becomes an Ink pill with white text (scale 1.1).
   - Beside it: "KEEP SCROLLING ↓" label and thin green progress bars.
2. A large image with "Content that keeps up with the feed." overlaid, and the side text "We run always-on social for brands that post every day…"
   - Plus a **Book your meeting** card: Ink background, green calendar icon, "15 MIN · VIDEO CALL"; hover turns Green.
3. **What we offer!** (H2 centred): a 2 px green vertical line draws on scroll, and thin branches with arrows grow to three hairline cards:
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
5. **Reel list:** 4 thumbnails in a hairline panel on the left (Kiro · Day 12, Bharat Chai · Ep 3, Nova · Teaser, Tidal · Recipe 7) with green progress bars that auto-advance every 6.5 s; the main player on the right.
6. A flat thumbnail strip, running in reverse.
7. **Story:** a tall placeholder image, label pill "Our stats", H2 "Why we **started**.", lead "Brand content had become polite…", and 3 stat cards.
8. **Your idea:** "Your idea, in the **feed.**" plus a text box and **Book your meeting**.

## 7. Content the client will supply (do NOT show placeholder labels)
- Videos (hero showreel, featured film, reels, "your idea").
- The Hathi Lottie for the loader.
- Photos for every white frame.
- Client names/logos for the band, real stats, contact details and the copyright line.

## 8. Motion rules
- Hovers: 0.3 s ease-out, small lifts (1–6 px), colour changes Ink ↔ Green.
- Reveals: `cubic-bezier(.16,1,.3,1)`, transform only (translate 30 px); never park content at opacity 0.
- Keep motion calm: the loader, the hero letter rise, the process line, the project box, the Shoot/Edit/Deliver/Repeat stack and the offer tree are the only showpieces.
- Respect reduced motion.

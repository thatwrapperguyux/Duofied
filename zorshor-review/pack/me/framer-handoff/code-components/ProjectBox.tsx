import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { useEffect, useRef, useState, type CSSProperties } from "react"

type Img = { src?: string; srcSet?: string; alt?: string }
type Category = { label: string; title1: string; image1?: Img; title2: string; image2?: Img; title3: string; image3?: Img }

type Props = {
    categories: Category[]
    accent: string
    accentInk: string
    ink: string
    paper: string
    chipFont: CSSProperties
    handFont: CSSProperties
    style?: CSSProperties
}

/**
 * Films · "Our projects" — the dashed box from the wireframe.
 * When it scrolls into view the flaps open and three project polaroids pop
 * out. Picking a category closes the box, swaps the cards and reopens it.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 * @framerIntrinsicWidth 720
 * @framerIntrinsicHeight 560
 */
export default function ProjectBox(props: Props) {
    const { categories, accent, accentInk, ink, paper, chipFont, handFont } = props
    const onCanvas = RenderTarget.current() === RenderTarget.canvas
    const ref = useRef<HTMLDivElement>(null)
    const [open, setOpen] = useState(onCanvas)
    const [cat, setCat] = useState(0)
    const [shown, setShown] = useState(0)

    useEffect(() => {
        if (onCanvas || !ref.current) return
        const io = new IntersectionObserver(([e]) => e.isIntersecting && setOpen(true), { threshold: 0.45 })
        io.observe(ref.current)
        return () => io.disconnect()
    }, [])

    const pick = (i: number) => {
        if (i === cat) return
        setCat(i)
        setOpen(false)
        window.setTimeout(() => {
            setShown(i)
            setOpen(true)
        }, 560)
    }

    const c = categories[shown] || categories[0]
    if (!c) return null
    const cards = [
        { t: c.title1, img: c.image1, x: "-120%", y: "-78%", r: -12, delay: 0.12 },
        { t: c.title2, img: c.image2, x: "0%", y: "-104%", r: 3, delay: 0.22 },
        { t: c.title3, img: c.image3, x: "118%", y: "-72%", r: 13, delay: 0.32 },
    ]
    const dash = { fill: "none", stroke: accentInk, strokeWidth: 3, strokeDasharray: "12 9", strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
    const flap = (side: "l" | "r"): CSSProperties => ({
        transformBox: "fill-box",
        transformOrigin: side === "l" ? "100% 100%" : "0 100%",
        transform: open ? `rotate(${side === "l" ? -14 : 14}deg)` : `rotate(${side === "l" ? -100 : 100}deg) scaleY(.35)`,
        transition: "transform .8s cubic-bezier(.34,1.56,.64,1)",
    })

    return (
        <div ref={ref} style={{ ...props.style, position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ position: "relative", flex: 1, minHeight: 320, display: "grid", placeItems: "end center" }}>
                {cards.map((k, i) => (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            left: "50%",
                            bottom: "22%",
                            width: "clamp(110px, 12vw, 160px)",
                            marginLeft: "calc(clamp(110px, 12vw, 160px) / -2)",
                            zIndex: 1,
                            transform: open ? `translate(${k.x}, ${k.y}) rotate(${k.r}deg) scale(1)` : "translate(0, 30%) scale(.7)",
                            transition: `transform .9s cubic-bezier(.34,1.56,.64,1) ${open ? k.delay : 0}s`,
                            background: paper,
                            padding: "7px 7px 0",
                            border: `2px solid ${ink}`,
                            borderRadius: "3px 5px 4px 6px",
                            boxShadow: "0 18px 40px -22px rgba(13,15,12,.55)",
                        }}
                    >
                        {k.img && k.img.src ? (
                            <img src={k.img.src} srcSet={k.img.srcSet} alt={k.img.alt || ""} style={{ display: "block", width: "100%", aspectRatio: "1 / 1", objectFit: "cover" }} />
                        ) : (
                            <div style={{ width: "100%", aspectRatio: "1 / 1", background: "linear-gradient(180deg, #F7F5F1, #F0EDE7)" }} />
                        )}
                        <p style={{ margin: 0, padding: "8px 2px 10px", fontSize: 17, lineHeight: 1, color: ink, ...handFont }}>{k.t}</p>
                    </div>
                ))}
                <svg viewBox="0 0 400 300" aria-hidden="true" style={{ position: "relative", width: "min(100%, 480px)", zIndex: 2 }}>
                    <path d="M62 124c46-1 92 0 138-1l-16-66c-44 6-88 12-132 20z" {...dash} fill={paper} style={flap("l")} />
                    <path d="M200 123c46 1 92 0 138 1l12-46c-44-8-88-14-132-20z" {...dash} fill={paper} style={flap("r")} />
                    <path d="M62 124c92-2 184-2 276 0 1 55 1 110 0 164-92 2-184 2-276 0-1-54-1-109 0-164z" fill={paper} />
                    <path d="M62 124c92-2 184-2 276 0 1 55 1 110 0 164-92 2-184 2-276 0-1-54-1-109 0-164z" {...dash} />
                    <path d="M200 124c-1 55 1 110 0 164" fill="none" stroke={accentInk} strokeWidth={4} strokeLinecap="round" />
                    <text x="270" y="220" textAnchor="middle" fontSize="30" fill={accentInk} style={{ ...handFont }}>
                        {c.label.toLowerCase()}
                    </text>
                </svg>
            </div>
            <div role="group" aria-label="Project categories" style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
                {categories.map((k, i) => (
                    <button
                        key={i}
                        type="button"
                        aria-pressed={i === cat}
                        onClick={() => pick(i)}
                        style={{
                            fontSize: 15,
                            lineHeight: 1,
                            padding: ".75em 1.1em",
                            border: `2px solid ${i === cat ? ink : accent}`,
                            borderRadius: "255px 14px 225px 16px / 14px 225px 16px 255px",
                            background: i === cat ? accent : paper,
                            color: ink,
                            cursor: "pointer",
                            transform: i === cat ? "rotate(-2deg)" : "none",
                            transition: "background .2s, transform .25s cubic-bezier(.34,1.56,.64,1)",
                            ...chipFont,
                        }}
                    >
                        {k.label}
                    </button>
                ))}
            </div>
        </div>
    )
}

ProjectBox.defaultProps = {
    categories: [
        { label: "Ad films", title1: "Monsoon Letters", title2: "Chai at 5", title3: "Night Drive" },
        { label: "Motion graphics", title1: "Orbit/Pay explainer", title2: "Kiro type loop", title3: "Lumen UI film" },
        { label: "AI", title1: "Tidal AI spot", title2: "Dream kitchen", title3: "100 faces" },
        { label: "VFX", title1: "Rain on cue", title2: "City fold", title3: "Glass sky" },
        { label: "3D", title1: "Haathi toy spin", title2: "Bottle hero", title3: "Sneaker drop" },
    ],
    accent: "#379F62",
    accentInk: "#1E7A4A",
    ink: "#16211E",
    paper: "#FFFFFF",
    chipFont: { fontFamily: '"Inter Tight", sans-serif', fontWeight: 500 },
    handFont: { fontFamily: '"Inter Tight", sans-serif' },
}

addPropertyControls(ProjectBox, {
    categories: {
        type: ControlType.Array,
        title: "Categories",
        maxCount: 8,
        control: {
            type: ControlType.Object,
            controls: {
                label: { type: ControlType.String, title: "Label" },
                title1: { type: ControlType.String, title: "Card 1" },
                image1: { type: ControlType.ResponsiveImage, title: "Image 1" },
                title2: { type: ControlType.String, title: "Card 2" },
                image2: { type: ControlType.ResponsiveImage, title: "Image 2" },
                title3: { type: ControlType.String, title: "Card 3" },
                image3: { type: ControlType.ResponsiveImage, title: "Image 3" },
            },
        },
    },
    accent: { type: ControlType.Color, title: "Green" },
    accentInk: { type: ControlType.Color, title: "Dark green" },
    ink: { type: ControlType.Color, title: "Ink" },
    paper: { type: ControlType.Color, title: "Paper" },
    chipFont: { type: ControlType.Font, title: "Chip font", controls: "extended", defaultFontType: "sans-serif" },
    handFont: { type: ControlType.Font, title: "Hand font", controls: "extended", defaultFontType: "sans-serif" },
})

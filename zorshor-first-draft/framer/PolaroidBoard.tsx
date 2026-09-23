import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react"

type Img = { src?: string; srcSet?: string; alt?: string }
type Polaroid = { image?: Img; caption: string; note: string; x: number; y: number; rotation: number }
type Note = { text: string; x: number; y: number }

type Props = {
    polaroids: Polaroid[]
    notes: Note[]
    draggable: boolean
    paper: string
    ink: string
    accent: string
    accentInk: string
    rule: boolean
    handFont: CSSProperties
    style?: CSSProperties
}

/**
 * Films · "Polaroids" — a blank storyboard page with frames.
 * Clipped sheet, lined like a notebook, with polaroids you can drag around
 * and tap to open (they flip up into a lightbox with the shot note).
 * Empty images show the green hatch from the wireframe.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 680
 */
export default function PolaroidBoard(props: Props) {
    const { polaroids, notes, draggable, paper, ink, accent, accentInk, rule, handFont } = props
    const onCanvas = RenderTarget.current() === RenderTarget.canvas
    const board = useRef<HTMLDivElement>(null)
    const [pos, setPos] = useState<Record<number, { left: number; top: number; r: number; z: number }>>({})
    const [open, setOpen] = useState<number | null>(null)
    const [shown, setShown] = useState(false)
    const zTop = useRef(10)

    useEffect(() => {
        if (open === null) return setShown(false)
        const id = requestAnimationFrame(() => setShown(true))
        const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null)
        window.addEventListener("keydown", esc)
        return () => {
            cancelAnimationFrame(id)
            window.removeEventListener("keydown", esc)
        }
    }, [open])

    const startDrag = (i: number) => (e: ReactPointerEvent<HTMLElement>) => {
        if (onCanvas || e.button !== 0) return
        const el = e.currentTarget
        const b = board.current
        if (!b) return
        el.setPointerCapture(e.pointerId)
        const sx = e.clientX
        const sy = e.clientY
        const ox = el.offsetLeft
        const oy = el.offsetTop
        let moved = false
        const move = (ev: PointerEvent) => {
            const dx = ev.clientX - sx
            const dy = ev.clientY - sy
            if (!moved && Math.hypot(dx, dy) < 6) return
            if (!draggable) return
            if (!moved) {
                moved = true
                zTop.current++
            }
            setPos((p) => ({
                ...p,
                [i]: {
                    left: clamp(ox + dx, -24, b.clientWidth - el.offsetWidth + 24),
                    top: clamp(oy + dy, -24, b.clientHeight - el.offsetHeight + 24),
                    r: 0,
                    z: zTop.current,
                },
            }))
        }
        const up = () => {
            el.removeEventListener("pointermove", move)
            el.removeEventListener("pointerup", up)
            el.removeEventListener("pointercancel", up)
            if (!moved) setOpen(i)
            else setPos((p) => (p[i] ? { ...p, [i]: { ...p[i], r: +((Math.random() - 0.5) * 14).toFixed(1) } } : p))
        }
        el.addEventListener("pointermove", move)
        el.addEventListener("pointerup", up)
        el.addEventListener("pointercancel", up)
    }

    const photo = (img: Img | undefined, style?: CSSProperties) =>
        img && img.src ? (
            <img src={img.src} srcSet={img.srcSet} alt={img.alt || ""} draggable={false} style={{ display: "block", width: "100%", aspectRatio: "1 / 1", objectFit: "cover", ...style }} />
        ) : (
            <div style={{ width: "100%", aspectRatio: "1 / 1", background: `repeating-linear-gradient(-45deg, ${accent} 0 3px, transparent 3px 9px), ${paper}`, outline: `2px solid ${accentInk}`, outlineOffset: -2, ...style }} />
        )

    const current = open !== null ? polaroids[open] : null
    const [head, body] = current ? (current.note || "|").split("|") : ["", ""]

    return (
        <div
            ref={board}
            style={{
                ...props.style,
                position: "relative",
                width: "100%",
                height: "100%",
                background: rule ? `${paper} linear-gradient(transparent 31px, rgba(29,122,51,.12) 32px) 0 0 / 100% 32px` : paper,
                border: `3px solid ${ink}`,
                borderRadius: "4px 10px 6px 12px",
                boxShadow: `10px 12px 0 ${ink}`,
                touchAction: "pan-y",
            }}
        >
            <svg viewBox="0 0 40 80" aria-hidden="true" style={{ position: "absolute", left: 18, top: -30, width: 40, height: 78, zIndex: 50 }}>
                <path d="M26 22v40c0 10-14 10-14 0V14c0-10 20-10 20 0v42" fill="none" stroke="#6b726a" strokeWidth={4} strokeLinecap="round" />
            </svg>
            {notes.map((n, i) => (
                <p key={"n" + i} style={{ position: "absolute", left: `${n.x}%`, top: `${n.y}%`, margin: 0, maxWidth: "24ch", color: ink, fontSize: 24, lineHeight: 1.15, pointerEvents: "none", whiteSpace: "pre-line", ...handFont }}>
                    {n.text}
                </p>
            ))}
            {polaroids.map((p, i) => {
                const o = pos[i]
                return (
                    <figure
                        key={i}
                        role="button"
                        tabIndex={0}
                        aria-label={"Open " + (p.caption || "polaroid")}
                        onPointerDown={startDrag(i)}
                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setOpen(i))}
                        style={{
                            position: "absolute",
                            margin: 0,
                            left: o ? o.left : `${p.x}%`,
                            top: o ? o.top : `${p.y}%`,
                            width: "clamp(120px, 15vw, 190px)",
                            zIndex: o ? o.z : 5,
                            transform: `rotate(${o ? o.r : p.rotation}deg)`,
                            transition: "transform .35s cubic-bezier(.34,1.56,.64,1)",
                            cursor: draggable ? "grab" : "pointer",
                            touchAction: "none",
                            background: paper,
                            padding: "9px 9px 0",
                            border: `2px solid ${accentInk}`,
                            borderRadius: "3px 5px 4px 6px",
                            boxShadow: "0 18px 40px -22px rgba(13,15,12,.55)",
                        }}
                    >
                        {photo(p.image)}
                        <figcaption style={{ padding: "9px 2px 11px", fontSize: 18, lineHeight: 1, color: ink, ...handFont }}>{p.caption}</figcaption>
                    </figure>
                )
            })}
            <span style={{ position: "absolute", right: 18, bottom: 14, font: "500 11px/1 ui-monospace, Menlo, monospace", letterSpacing: ".08em", textTransform: "uppercase", color: "#565D53" }}>
                {draggable ? "drag · tap to open" : "tap to open"}
            </span>
            {current && (
                <div
                    onClick={() => setOpen(null)}
                    style={{ position: "fixed", inset: 0, zIndex: 1000, display: "grid", placeItems: "center", padding: 24, background: "rgba(13,15,12,.6)", backdropFilter: "blur(4px)", opacity: shown ? 1 : 0, transition: "opacity .35s" }}
                >
                    <div
                        style={{
                            width: "min(460px, 86vw)",
                            background: paper,
                            padding: "12px 12px 0",
                            border: `2px solid ${ink}`,
                            borderRadius: "3px 5px 4px 6px",
                            transform: shown ? "scale(1) rotate(-2deg)" : "scale(.6) rotate(-10deg)",
                            transition: "transform .55s cubic-bezier(.34,1.56,.64,1)",
                        }}
                    >
                        {photo(current.image)}
                        <div style={{ padding: "14px 6px 18px", display: "grid", gap: 4 }}>
                            <span style={{ font: "500 11px/1 ui-monospace, Menlo, monospace", letterSpacing: ".08em", textTransform: "uppercase", color: "#565D53" }}>{head}</span>
                            <p style={{ margin: 0, fontSize: 22, lineHeight: 1.2, color: ink, ...handFont }}>{body}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function clamp(v: number, a: number, b: number) {
    return Math.min(b, Math.max(a, v))
}

PolaroidBoard.defaultProps = {
    polaroids: [
        { caption: "sc 01 — wide", note: "SC 01 · wide · golden hour|Hero walks into frame. Beat. Chai steam catches the light.", x: 7, y: 9, rotation: -6 },
        { caption: "sc 02 — macro", note: "SC 02 · macro|Hands around the glass. Slow push in, 50mm.", x: 72, y: 13, rotation: 7 },
        { caption: "sc 03 — mid", note: "SC 03 · medium · handheld|The first sip. Cut on the laugh.", x: 37, y: 40, rotation: -2 },
        { caption: "sc 04 — end card", note: "SC 04 · end card|Logo lands with the Hathi doodle. Super: zor shor se.", x: 5, y: 60, rotation: 4 },
    ],
    notes: [
        { text: "SC 01 — wide, golden hour.\nhero walks in. beat.", x: 33, y: 8 },
        { text: "SC 03 — the first sip,\ncut on the laugh.", x: 60, y: 47 },
        { text: "SC 04 — logo + hathi doodle,\nsuper: “zor shor se”", x: 30, y: 77 },
    ],
    draggable: true,
    paper: "#FFFFFF",
    ink: "#0D0F0C",
    accent: "#54D668",
    accentInk: "#1D7A33",
    rule: true,
    handFont: { fontFamily: '"Caveat Brush", cursive' },
}

addPropertyControls(PolaroidBoard, {
    polaroids: {
        type: ControlType.Array,
        title: "Polaroids",
        maxCount: 10,
        control: {
            type: ControlType.Object,
            controls: {
                image: { type: ControlType.ResponsiveImage, title: "Image" },
                caption: { type: ControlType.String, title: "Caption" },
                note: { type: ControlType.String, title: "Note", description: "Heading|Body — shown when opened", displayTextArea: true },
                x: { type: ControlType.Number, title: "X %", min: -10, max: 100 },
                y: { type: ControlType.Number, title: "Y %", min: -10, max: 100 },
                rotation: { type: ControlType.Number, title: "Tilt", min: -20, max: 20, unit: "°" },
            },
        },
    },
    notes: {
        type: ControlType.Array,
        title: "Notes",
        control: {
            type: ControlType.Object,
            controls: {
                text: { type: ControlType.String, title: "Text", displayTextArea: true },
                x: { type: ControlType.Number, title: "X %", min: 0, max: 100 },
                y: { type: ControlType.Number, title: "Y %", min: 0, max: 100 },
            },
        },
    },
    draggable: { type: ControlType.Boolean, title: "Draggable" },
    rule: { type: ControlType.Boolean, title: "Lined paper" },
    paper: { type: ControlType.Color, title: "Paper" },
    ink: { type: ControlType.Color, title: "Ink" },
    accent: { type: ControlType.Color, title: "Green" },
    accentInk: { type: ControlType.Color, title: "Dark green" },
    handFont: { type: ControlType.Font, title: "Hand font", controls: "extended", defaultFontType: "sans-serif" },
})

import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"

type Phase = "count" | "straight" | "open" | "zoom" | "done"

type Props = {
    lottie?: ReactNode
    captions: string[]
    doneCaption: string
    slotLabel: string
    duration: number
    accent: string
    ink: string
    paper: string
    captionFont: CSSProperties
    style?: CSSProperties
}

/**
 * Zor Shor loader (wireframe 1.1).
 * A tilted polaroid drops in, the photo "develops" while the counter runs,
 * then the frame straightens and the photo window opens into the page
 * underneath (the hero video shows through the hole as it zooms).
 *
 * Place it on the Home page as a fixed layer: Position Fixed, 100vw × 100vh,
 * z-index above everything. Drop Framer's Lottie component into the
 * "Lottie" slot; until then the Hathi doodle plays as a placeholder.
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 800
 */
export default function PolaroidLoader(props: Props) {
    const { lottie, captions, doneCaption, slotLabel, duration, accent, ink, paper, captionFont } = props
    const onCanvas = RenderTarget.current() === RenderTarget.canvas
    const [phase, setPhase] = useState<Phase>("count")
    const [pct, setPct] = useState(onCanvas ? 0.62 : 0)
    const [zoom, setZoom] = useState<{ transform: string; origin: string } | null>(null)
    const polRef = useRef<HTMLDivElement>(null)
    const photoRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (onCanvas) return
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            const id = window.setTimeout(() => setPhase("done"), 250)
            return () => window.clearTimeout(id)
        }
        const prev = document.body.style.overflow
        document.body.style.overflow = "hidden"
        const t0 = performance.now()
        const D = Math.max(0.6, duration) * 1000
        let raf = 0
        let after = 0
        const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / D)
            setPct(p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)
            if (p < 1) raf = requestAnimationFrame(tick)
            else after = window.setTimeout(() => setPhase("straight"), 380)
        }
        raf = requestAnimationFrame(tick)
        return () => {
            cancelAnimationFrame(raf)
            window.clearTimeout(after)
            document.body.style.overflow = prev
        }
    }, [])

    useEffect(() => {
        if (onCanvas) return
        let id = 0
        if (phase === "straight") id = window.setTimeout(() => setPhase("open"), 480)
        if (phase === "open")
            id = window.setTimeout(() => {
                const pol = polRef.current
                const photo = photoRef.current
                if (!pol || !photo) return setPhase("done")
                const pr = pol.getBoundingClientRect()
                const r = photo.getBoundingClientRect()
                const cx = r.left + r.width / 2
                const cy = r.top + r.height / 2
                const s = Math.max(window.innerWidth / r.width, window.innerHeight / r.height) * 1.3
                setZoom({
                    origin: `${cx - pr.left}px ${cy - pr.top}px`,
                    transform: `translate(${window.innerWidth / 2 - cx}px, ${window.innerHeight / 2 - cy}px) scale(${s})`,
                })
                setPhase("zoom")
            }, 560)
        if (phase === "zoom")
            id = window.setTimeout(() => {
                document.body.style.overflow = ""
                setPhase("done")
            }, 1100)
        return () => window.clearTimeout(id)
    }, [phase])

    if (phase === "done") return null

    const opening = phase === "open" || phase === "zoom"
    const caption =
        phase === "count" ? captions[Math.min(captions.length - 1, Math.floor(pct * captions.length))] ?? "" : doneCaption

    const polStyle: CSSProperties = {
        position: "relative",
        width: "min(330px, 70vw)",
        padding: "14px 14px 0",
        border: `3px solid ${ink}`,
        borderRadius: "4px 8px 5px 9px",
        background: "transparent",
        boxShadow: opening
            ? `inset 0 0 0 14px ${paper}, inset 0 -70px 0 0 ${paper}, 0 0 0 150vmax ${paper}`
            : `inset 0 0 0 14px ${paper}, inset 0 -70px 0 0 ${paper}, 0 24px 50px -24px rgba(13,15,12,.5)`,
        transform: phase === "zoom" && zoom ? zoom.transform : phase === "count" ? "rotate(-6deg)" : "rotate(0deg)",
        transformOrigin: zoom ? zoom.origin : "50% 50%",
        transition:
            phase === "zoom"
                ? "transform 1.05s cubic-bezier(.7,0,.2,1)"
                : "transform .45s cubic-bezier(.34,1.56,.64,1)",
        animation: phase === "count" && !onCanvas ? "zsDrop .9s cubic-bezier(.34,1.56,.64,1) both" : undefined,
    }

    return (
        <div
            aria-hidden="true"
            style={{
                ...props.style,
                position: "relative",
                width: "100%",
                height: "100%",
                display: "grid",
                placeItems: "center",
                backgroundColor: opening ? "transparent" : paper,
                backgroundImage: opening ? "none" : "radial-gradient(rgba(13,15,12,.12) 1px, transparent 1.4px)",
                backgroundSize: "24px 24px",
                pointerEvents: opening ? "none" : "auto",
            }}
        >
            <style>{css(ink, accent)}</style>
            <div ref={polRef} style={polStyle}>
                <Doodle kind="bang" color={ink} style={{ left: -58, top: -8, width: 32, height: 70 }} delay={0.55} />
                <Doodle kind="slashes" color={ink} style={{ right: -50, top: -46, width: 48, height: 48 }} delay={0.7} />
                <Doodle kind="slashes" color={ink} style={{ left: -48, bottom: 30, width: 48, height: 48 }} delay={0.85} />
                <Doodle kind="star" color={accent} style={{ right: -58, bottom: 84, width: 48, height: 48 }} delay={1} />
                <div
                    ref={photoRef}
                    style={{
                        position: "relative",
                        aspectRatio: "1 / 1",
                        background: opening ? "transparent" : accent,
                        border: `2px solid ${opening ? "transparent" : ink}`,
                        overflow: "hidden",
                        transition: "background-color .5s ease, border-color .5s",
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            display: "grid",
                            placeItems: "center",
                            opacity: opening ? 0 : 1,
                            transform: opening ? "scale(.7)" : "none",
                            transition: "opacity .4s, transform .5s cubic-bezier(.7,0,.2,1)",
                        }}
                    >
                        {lottie ?? <Hathi />}
                    </div>
                    {!lottie && slotLabel && (
                        <span
                            style={{
                                position: "absolute",
                                left: 8,
                                top: 8,
                                font: "500 9.5px/1 ui-monospace, Menlo, monospace",
                                letterSpacing: ".08em",
                                textTransform: "uppercase",
                                background: ink,
                                color: accent,
                                padding: "5px 7px",
                                borderRadius: 3,
                                opacity: opening ? 0 : 1,
                            }}
                        >
                            {slotLabel}
                        </span>
                    )}
                </div>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        height: 70,
                        padding: "14px 4px 0",
                        color: ink,
                        fontSize: 25,
                        lineHeight: 1,
                        ...captionFont,
                    }}
                >
                    <span>{caption}</span>
                    <span style={{ font: "700 15px/1 ui-monospace, Menlo, monospace", color: "#1D7A33" }}>
                        {String(Math.round(pct * 100)).padStart(3, "0")}
                    </span>
                </div>
                <div style={{ position: "absolute", left: 18, right: 18, bottom: 16, height: 3, background: "#D5DAD1", borderRadius: 3, overflow: "hidden" }}>
                    <i style={{ position: "absolute", inset: 0, background: ink, transformOrigin: "0 50%", transform: `scaleX(${pct})` }} />
                </div>
            </div>
        </div>
    )
}

function css(ink: string, accent: string) {
    return `
@keyframes zsDrop{from{transform:translateY(-70px) rotate(-18deg) scale(.86)}to{transform:rotate(-6deg)}}
@keyframes zsDash{to{stroke-dashoffset:0}}
@keyframes zsBob{to{transform:translateY(-4px)}}
@keyframes zsLeg{from{transform:rotate(-7deg)}to{transform:rotate(7deg)}}
@keyframes zsTrunk{from{transform:rotate(-7deg)}to{transform:rotate(9deg)}}
@keyframes zsEar{to{transform:scaleX(.9) rotate(-3deg)}}
@keyframes zsTail{from{transform:rotate(-12deg)}to{transform:rotate(14deg)}}
@keyframes zsSpark{50%{opacity:0}}
.zs-hathi .b{animation:zsBob .56s ease-in-out infinite alternate}
.zs-hathi .leg{transform-box:fill-box;transform-origin:50% 0;animation:zsLeg .56s ease-in-out infinite alternate}
.zs-hathi .leg.r{animation-direction:alternate-reverse}
.zs-hathi .trunk{transform-box:view-box;transform-origin:52px 100px;animation:zsTrunk 1.12s ease-in-out infinite alternate}
.zs-hathi .ear{transform-box:view-box;transform-origin:92px 70px;animation:zsEar .56s ease-in-out infinite alternate}
.zs-hathi .tail{transform-box:view-box;transform-origin:206px 88px;animation:zsTail .4s ease-in-out infinite alternate}
.zs-hathi .spark{animation:zsSpark 1.12s steps(2) infinite}
@media (prefers-reduced-motion: reduce){.zs-hathi *{animation:none!important}}
`
}

function Doodle({ kind, color, style, delay }: { kind: "bang" | "slashes" | "star"; color: string; style: CSSProperties; delay: number }) {
    const paths: Record<string, string[]> = {
        bang: ["M17 6c-2.4 13.8.8 27.4-2 41", "M14.6 60.5l.6.8"],
        slashes: ["M12 40L23 8", "M25 42L36 11"],
        star: ["M20 5c-.3 9.8.6 19.9 0 30", "M7 13.2c8.9 4.4 17.4 9 26 13.8", "M7.2 27.6C15.6 22.4 24.4 17.2 33 12"],
    }
    const vb = kind === "bang" ? "0 0 32 70" : kind === "star" ? "0 0 40 40" : "0 0 48 48"
    return (
        <svg viewBox={vb} style={{ position: "absolute", overflow: "visible", ...style }} fill="none" stroke={color} strokeLinecap="round">
            {paths[kind].map((d, i) => (
                <path
                    key={i}
                    d={d}
                    pathLength={1}
                    strokeWidth={kind === "bang" && i === 1 ? 6 : 3.2}
                    style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: `zsDash .7s cubic-bezier(.16,1,.3,1) ${delay + i * 0.12}s forwards` }}
                />
            ))}
        </svg>
    )
}

/** Hathi — placeholder until the Lottie file is dropped in. */
function Hathi() {
    const s = { stroke: "#0D0F0C", strokeWidth: 4.5, strokeLinejoin: "round" as const }
    return (
        <svg className="zs-hathi" viewBox="0 0 240 200" style={{ width: "92%", height: "90%" }} role="img" aria-label="Hathi the elephant">
            <ellipse cx="132" cy="186" rx="80" ry="7" fill="#0D0F0C" opacity=".2" />
            <g className="b">
                <g className="leg r"><path d="M166 124v52c0 4 2 6 6 6h14c4 0 6-2 6-6v-54" fill="#3FB456" {...s} /></g>
                <g className="leg"><path d="M104 126v50c0 4 2 6 6 6h14c4 0 6-2 6-6v-50" fill="#3FB456" {...s} /></g>
                <g className="leg"><path d="M150 132v46c0 4 2 6 6 6h14c4 0 6-2 6-6v-50" fill="#54D668" {...s} /></g>
                <g className="leg r"><path d="M88 130v48c0 4 2 6 6 6h14c4 0 6-2 6-6v-46" fill="#54D668" {...s} /></g>
                <path className="tail" d="M207 88c14 1 19 13 11 21-4 4 3 10 8 6" fill="none" stroke="#0D0F0C" strokeWidth={4} strokeLinecap="round" />
                <path d="M84 70c20-33 92-35 118 0 18 24 12 66-12 76-30 10-80 10-98-2-20-14-22-50-8-74z" fill="#54D668" {...s} />
                <path d="M170 98l9 10-9 8 9 10" fill="none" stroke="#0D0F0C" strokeWidth={3.8} strokeLinecap="round" strokeLinejoin="round" />
                <g className="trunk">
                    <path d="M52 100c-16 18-20 46-10 64 6 10 20 8 20-4" fill="none" stroke="#0D0F0C" strokeWidth={21} strokeLinecap="round" />
                    <path d="M52 100c-16 18-20 46-10 64 6 10 20 8 20-4" fill="none" stroke="#54D668" strokeWidth={12} strokeLinecap="round" />
                </g>
                <path d="M40 66c12-26 56-28 70 0 10 22-2 52-30 56-26 4-50-24-40-56z" fill="#54D668" {...s} />
                <g className="ear">
                    <path d="M88 58c22-16 54-2 50 32-4 28-30 32-42 18-10-12-18-34-8-50z" fill="#54D668" {...s} />
                    <path d="M104 70c14-2 20 14 12 28" fill="none" stroke="#0D0F0C" strokeWidth={3} strokeLinecap="round" />
                </g>
                <circle cx="62" cy="76" r="5.2" fill="#0D0F0C" />
                <circle cx="63.6" cy="74.4" r="1.5" fill="#fff" />
                <path d="M66 108c4 10 14 12 22 8" fill="#fff" stroke="#0D0F0C" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <g className="spark" fill="none" stroke="#0D0F0C" strokeWidth={3.4} strokeLinecap="round">
                <path d="M44 34l-7-11M59 27l-.5-13M74 33l7-10" />
            </g>
        </svg>
    )
}

PolaroidLoader.defaultProps = {
    captions: ["rolling camera…", "finding the light…", "one more take…"],
    doneCaption: "action!",
    slotLabel: "Lottie slot · hathi.json",
    duration: 2.4,
    accent: "#54D668",
    ink: "#0D0F0C",
    paper: "#FFFFFF",
    captionFont: { fontFamily: '"Caveat Brush", cursive' },
}

addPropertyControls(PolaroidLoader, {
    lottie: { type: ControlType.ComponentInstance, title: "Lottie" },
    captions: { type: ControlType.Array, title: "Captions", control: { type: ControlType.String } },
    doneCaption: { type: ControlType.String, title: "Done caption" },
    slotLabel: { type: ControlType.String, title: "Slot label" },
    duration: { type: ControlType.Number, title: "Duration", min: 0.6, max: 8, step: 0.1, unit: "s" },
    accent: { type: ControlType.Color, title: "Green" },
    ink: { type: ControlType.Color, title: "Ink" },
    paper: { type: ControlType.Color, title: "Paper" },
    captionFont: { type: ControlType.Font, title: "Caption font", controls: "extended", defaultFontType: "sans-serif" },
})

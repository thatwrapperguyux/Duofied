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
                        background: opening ? "transparent" : "#FFFDC7",
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
                    <span style={{ font: "700 15px/1 ui-monospace, Menlo, monospace", color: "#1E7A4A" }}>
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

/** Hathi — the zorshor brand elephant (placeholder until the Lottie file is dropped in). */
const HATHI_SVG = "<svg class=\"zs-hathi2\" style=\"width:92%;height:80%\" viewBox=\"0 0 600 400\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"Hathi, the zorshor elephant\">\n<g transform=\"translate(600 0) scale(-1 1)\">\n<g class=\"h-body\"><path class=\"h-tail\" d=\"M66.5 33.5C66.5 36.8 69.3 39.5 72.6 39.5C75.9 39.5 78.7 36.8 78.7 33.5C78.7 30.1 75.9 27.4 72.6 27.4C69.3 27.4 66.5 30.1 66.5 33.5\"/><path d=\"M328.0 369.0C326.1 374.5 314.7 394.1 292.5 391.2C285.3 389.8 277.5 387.6 283.0 373.2C288.6 358.9 316.9 273.1 288.6 273.1C279.8 273.1 270.8 288.1 264.1 317.1C260.8 331.3 249.2 374.1 235.7 388.9C234.2 390.5 232.1 391.5 229.9 391.8C225.6 392.3 220.8 392.8 216.4 392.8C209.0 392.8 202.4 391.4 200.2 385.9C200.2 375.5 221.0 324.0 216.8 298.2C215.2 289.4 218.4 269.5 168.8 269.5C168.8 269.5 131.1 267.3 132.6 293.3C133.5 308.2 137.0 335.0 139.2 344.8C141.8 356.6 146.5 386.3 135.6 389.5C127.5 391.9 110.1 393.4 105.6 373.2C104.1 367.3 100.6 352.3 97.1 336.6C93.7 320.9 90.2 304.6 88.9 295.9C85.4 279.3 83.1 270.8 70.3 270.8C57.6 270.8 52.4 290.0 60.6 331.5C67.5 366.8 76.6 380.9 68.2 389.1C64.8 392.3 59.8 393.2 55.3 391.9C48.0 389.6 36.6 382.4 29.9 359.5C19.5 324.0 15.5 296.2 15.5 296.2C15.5 296.2 7.4 215.7 8.4 173.9C9.0 157.9 9.4 114.2 15.5 87.1C18.6 73.6 20.8 60.2 26.9 49.6C33.0 39.0 43.1 31.2 62.2 29.1C55.1 32.8 34.1 40.2 34.1 62.7C34.1 77.1 43.3 79.0 46.6 79.0L198.8 79.0C195.0 108.7 203.9 135.4 205.4 139.0C219.0 177.2 245.8 193.4 263.7 200.2C263.8 200.4 263.9 200.6 264.0 200.8C264.3 201.3 264.5 201.7 264.7 202.1C264.9 202.5 265.1 202.9 265.3 203.2C265.6 203.6 265.8 204.0 266.0 204.4C266.2 204.7 266.4 205.0 266.6 205.3C266.8 205.7 267.0 206.0 267.2 206.3C267.4 206.6 267.6 206.9 267.9 207.2C268.1 207.6 268.4 208.0 268.7 208.4C269.0 208.8 269.2 209.2 269.5 209.5C269.6 209.6 269.6 209.7 269.6 209.7C269.9 210.1 270.2 210.4 270.5 210.8C270.8 211.2 271.1 211.6 271.4 211.9C271.9 212.5 272.4 213.1 272.9 213.7C272.9 213.7 272.9 213.7 272.9 213.7C273.4 214.3 274.0 214.8 274.5 215.4C276.3 217.3 278.3 219.1 280.3 220.8C280.8 221.3 281.3 221.7 281.8 222.1C283.2 223.2 284.7 224.3 286.2 225.3C286.4 225.5 286.7 225.7 287.0 225.9C287.5 226.2 288.1 226.6 288.6 226.9C289.0 227.2 289.4 227.4 289.8 227.7C290.5 228.1 291.2 228.5 291.9 228.9C292.4 229.3 293.0 229.6 293.6 229.9C293.7 230.0 293.8 230.0 293.9 230.1C294.3 230.3 294.8 230.6 295.2 230.8C295.6 231.0 296.1 231.3 296.5 231.5C296.8 231.7 297.2 231.8 297.5 232.0L298.0 232.2C298.5 232.5 299.0 232.8 299.5 233.0C299.8 233.1 300.1 233.3 300.4 233.4C301.3 233.8 302.2 234.2 303.1 234.6C303.1 234.6 303.2 234.6 303.2 234.7C303.8 234.9 304.4 235.2 305.0 235.4C305.2 235.5 305.5 235.6 305.8 235.7C305.9 235.8 306.1 235.9 306.3 235.9C306.8 236.2 307.3 236.4 307.8 236.6L308.5 236.8C315.6 239.6 323.0 241.6 330.0 243.2L335.3 244.3C337.0 244.6 338.7 244.9 340.4 245.2C342.3 263.6 346.7 324.8 328.0 369.0\"/><g class=\"h-headg\"><path d=\"M362.7 145.4C357.4 139.5 348.8 137.8 341.8 141.7C339.5 142.9 337.3 144.4 335.3 146.2C332.6 148.5 329.2 144.6 331.9 142.2C342.3 133.3 356.2 131.8 365.6 143.1C367.1 145.1 364.2 147.3 362.7 145.4M544.5 11.2C542.5 10.0 534.2 5.8 516.1 5.8C495.0 5.8 465.3 22.6 465.3 61.2C465.3 99.9 475.8 152.9 436.0 152.9C431.1 152.9 419.4 152.1 400.0 123.7C396.0 118.0 363.1 86.8 324.4 86.8C316.1 86.8 306.3 87.0 296.8 89.8C296.6 89.8 296.6 90.0 296.6 90.1C296.6 90.1 296.6 90.2 296.6 90.2C297.1 90.8 297.5 91.5 298.0 92.2C298.3 92.6 298.6 93.0 298.9 93.5C299.1 93.8 299.3 94.1 299.5 94.5C299.9 95.2 300.4 95.9 300.8 96.6C301.0 97.0 301.2 97.4 301.4 97.7C301.6 98.0 301.8 98.3 302.0 98.6C302.3 99.3 302.7 100.0 303.1 100.7C303.4 101.4 303.8 102.0 304.1 102.7C304.1 102.7 304.1 102.7 304.1 102.7C304.5 103.5 304.8 104.2 305.2 105.0C305.5 105.7 305.8 106.5 306.1 107.2C306.1 107.2 306.1 107.2 306.1 107.3C306.2 107.3 306.2 107.4 306.1 107.5C306.1 107.6 306.0 107.8 305.8 108.2C305.7 108.4 305.6 108.5 305.6 108.7C305.5 108.9 305.4 109.2 305.3 109.4C305.2 109.6 305.1 109.8 305.0 110.0C305.0 110.0 305.0 110.0 305.0 110.1C304.9 110.2 304.9 110.4 304.8 110.5C304.8 110.5 304.8 110.6 304.8 110.6C304.7 110.8 304.6 110.9 304.6 111.1C304.2 112.1 303.7 113.3 303.2 114.7C303.0 115.0 302.9 115.3 302.8 115.6C301.9 118.0 301.0 120.8 300.0 123.9C299.9 124.3 299.8 124.7 299.6 125.1C299.2 126.6 298.8 128.1 298.3 129.7C298.3 130.0 298.2 130.3 298.1 130.7C297.9 131.5 297.7 132.4 297.4 133.3C297.4 133.7 297.3 134.0 297.2 134.3C297.1 134.8 297.0 135.2 296.9 135.7C296.8 136.3 296.6 137.0 296.5 137.7C296.5 137.8 296.5 138.0 296.4 138.1C296.3 138.8 296.2 139.6 296.0 140.3C296.0 140.6 295.9 141.0 295.9 141.3C295.6 142.9 295.4 144.5 295.2 146.0C295.2 146.7 295.1 147.4 295.0 148.1C294.9 149.1 294.9 150.1 294.8 151.1C294.8 151.3 294.8 151.5 294.8 151.7C294.8 152.2 294.8 152.8 294.8 153.3C294.7 156.5 294.8 159.6 295.2 162.7C295.3 163.2 295.4 163.8 295.5 164.3C296.3 169.4 297.9 174.2 300.6 178.5C302.3 181.5 303.4 188.4 301.7 194.5C299.7 201.6 293.9 207.6 280.7 204.9C279.7 204.7 277.9 204.4 275.4 203.8C275.2 203.8 274.9 203.7 274.7 203.6C273.3 203.3 271.8 202.9 270.2 202.4C269.8 202.3 269.4 202.2 269.0 202.0C268.6 201.9 268.1 201.8 267.7 201.6C266.8 201.3 265.9 201.0 265.0 200.7C264.8 200.6 264.6 200.5 264.4 200.4C264.1 200.4 263.9 200.6 264.0 200.8C264.3 201.3 264.5 201.7 264.7 202.1C264.9 202.5 265.1 202.9 265.3 203.2C265.6 203.6 265.8 204.0 266.0 204.4C266.2 204.7 266.4 205.0 266.6 205.3C266.8 205.7 267.0 206.0 267.2 206.3C267.4 206.6 267.6 206.9 267.8 207.2C268.1 207.6 268.4 208.0 268.7 208.4C269.0 208.8 269.2 209.2 269.5 209.5C269.5 209.6 269.6 209.7 269.6 209.7C269.9 210.1 270.2 210.4 270.5 210.8C270.8 211.2 271.1 211.6 271.4 211.9C271.9 212.5 272.4 213.1 272.9 213.7C272.9 213.7 272.9 213.7 272.9 213.7C273.4 214.3 273.9 214.9 274.5 215.4C276.3 217.3 278.3 219.1 280.3 220.9C280.8 221.3 281.3 221.7 281.8 222.1C283.2 223.2 284.7 224.3 286.1 225.3C286.4 225.5 286.7 225.7 287.0 225.9C287.5 226.2 288.0 226.6 288.6 226.9C289.0 227.2 289.4 227.4 289.8 227.7C290.5 228.1 291.2 228.5 291.8 228.9C292.4 229.3 293.0 229.6 293.6 229.9C293.7 230.0 293.8 230.1 293.9 230.1C294.3 230.3 294.8 230.6 295.2 230.8C295.6 231.0 296.1 231.3 296.5 231.5C296.8 231.7 297.2 231.8 297.5 232.0L298.0 232.2C298.5 232.5 299.0 232.8 299.5 233.0C299.8 233.1 300.1 233.3 300.4 233.4C301.3 233.8 302.2 234.2 303.1 234.6C303.1 234.6 303.1 234.7 303.2 234.7C303.8 234.9 304.4 235.2 305.0 235.4C305.2 235.5 305.5 235.6 305.8 235.7C305.9 235.8 306.1 235.9 306.3 236.0C306.8 236.2 307.3 236.4 307.8 236.6L308.4 236.8L330.0 243.2L335.3 244.3C337.0 244.6 338.7 244.9 340.4 245.2C355.4 247.7 367.7 248.0 372.2 248.0C372.9 248.0 373.3 247.1 372.8 246.6L365.9 238.9C365.1 238.0 366.0 236.7 367.0 237.1C383.3 242.5 445.0 258.6 498.0 213.2C498.0 213.2 498.0 213.2 498.0 213.2C515.1 196.6 532.7 173.6 517.5 103.6C517.5 103.6 517.5 103.6 517.5 103.6C513.6 91.9 498.3 33.7 543.3 27.1C543.5 27.1 543.6 26.9 543.5 26.7C542.8 25.5 539.8 21.4 533.7 19.1C533.5 19.0 533.5 18.9 533.5 18.8C534.2 15.2 542.3 12.4 544.4 11.6C544.6 11.6 544.7 11.3 544.5 11.2\"/><path class=\"h-ear\" d=\"M306.1 107.3C306.2 107.3 306.2 107.4 306.1 107.5C306.1 107.6 306.0 107.8 305.8 108.2C305.7 108.4 305.7 108.5 305.6 108.7C305.5 108.9 305.4 109.2 305.3 109.4C305.2 109.6 305.1 109.8 305.0 110.0C305.0 110.0 305.0 110.0 305.0 110.1C304.9 110.2 304.9 110.4 304.8 110.5C304.8 110.5 304.8 110.6 304.8 110.6C304.7 110.8 304.6 110.9 304.6 111.1C304.2 112.1 303.7 113.3 303.2 114.7C303.0 115.0 302.9 115.3 302.8 115.6C301.9 118.0 301.0 120.8 300.0 123.9C299.9 124.3 299.8 124.7 299.7 125.1C299.2 126.6 298.8 128.1 298.3 129.7C298.3 130.0 298.2 130.3 298.1 130.7C297.9 131.5 297.7 132.4 297.5 133.3C297.4 133.7 297.3 134.0 297.2 134.3C297.1 134.8 297.0 135.2 296.9 135.7C296.8 136.3 296.7 137.0 296.5 137.7C296.5 137.8 296.5 138.0 296.4 138.1C296.3 138.8 296.2 139.6 296.0 140.3C296.0 140.6 295.9 141.0 295.9 141.3C295.6 142.9 295.4 144.5 295.2 146.0C295.2 146.7 295.1 147.4 295.0 148.1C294.9 149.1 294.9 150.1 294.8 151.1C294.8 151.3 294.8 151.5 294.8 151.7C294.8 152.2 294.8 152.8 294.8 153.3C294.7 156.5 294.8 159.6 295.2 162.7C295.3 163.2 295.4 163.7 295.5 164.3C296.3 169.4 297.9 174.2 300.6 178.5C302.3 181.5 303.4 188.4 301.7 194.5C299.7 201.6 293.9 207.6 280.7 204.9C279.7 204.7 277.9 204.4 275.4 203.8C275.2 203.8 274.9 203.7 274.7 203.6C273.3 203.3 271.8 202.9 270.2 202.4C269.8 202.3 269.4 202.2 269.0 202.0C268.6 201.9 268.1 201.8 267.7 201.6C266.8 201.3 265.9 201.0 265.0 200.7C264.6 200.5 264.1 200.4 263.7 200.2C245.8 193.4 219.0 177.2 205.4 139.0C203.9 135.4 195.0 108.7 198.8 79.0C200.8 63.6 206.2 47.3 217.8 33.0C223.6 25.5 235.4 19.0 239.0 19.0C242.6 19.0 246.5 24.8 249.4 29.7C252.4 34.6 254.0 45.4 266.0 57.5C274.7 66.1 286.9 76.4 296.4 89.9C296.5 90.0 296.5 90.0 296.6 90.1C296.6 90.1 296.6 90.2 296.6 90.2C297.1 90.8 297.5 91.5 298.0 92.2C298.3 92.6 298.6 93.0 298.9 93.5C299.1 93.8 299.3 94.1 299.5 94.5C299.9 95.2 300.4 95.9 300.8 96.6C301.0 97.0 301.2 97.3 301.5 97.7C301.6 98.0 301.8 98.3 302.0 98.6C302.3 99.3 302.7 100.0 303.1 100.7C303.4 101.4 303.8 102.0 304.1 102.7C304.1 102.7 304.1 102.7 304.1 102.7C304.5 103.5 304.8 104.2 305.2 105.0C305.5 105.7 305.8 106.5 306.1 107.2C306.1 107.2 306.1 107.2 306.1 107.3\"/><path class=\"h-smile\" d=\"M362.7 145.2C357.4 139.3 348.8 137.6 341.8 141.5C339.5 142.7 337.3 144.3 335.3 146.1C332.6 148.3 329.2 144.4 331.9 142.1C342.3 133.1 356.2 131.7 365.6 142.9C367.2 144.9 364.2 147.2 362.7 145.2Z\"/></g></g>\n<path class=\"h-ball\" d=\"M530.0 71.1C530.0 88.1 543.8 102.0 560.9 102.0C577.9 102.0 591.7 88.1 591.7 71.1C591.7 54.1 577.9 40.3 560.9 40.3C543.8 40.3 530.0 54.1 530.0 71.1\"/>\n</g></svg>"

function Hathi() {
    return (
        <>
            <style>{`
.zs-hathi2 path{fill:#379F62}
.zs-hathi2 .h-ear{fill:#2A8A55;transform-box:fill-box;transform-origin:30% 30%;animation:zsEar2 .45s ease-in-out infinite alternate}
.zs-hathi2 .h-smile{fill:#FFFDC7}
.zs-hathi2 .h-ball{fill:#FDC529;transform-box:fill-box;transform-origin:50% 100%;animation:zsBall .9s cubic-bezier(.3,0,.4,1) infinite alternate}
.zs-hathi2 .h-headg{transform-box:fill-box;transform-origin:10% 60%;animation:zsHead .9s ease-in-out infinite alternate}
.zs-hathi2 .h-body{animation:zsBob .45s ease-in-out infinite alternate}
@keyframes zsBall{to{transform:translateY(-60px) rotate(40deg)}}
@keyframes zsHead{to{transform:rotate(-4deg)}}
@keyframes zsEar2{to{transform:scaleX(.9) rotate(3deg)}}
@media (prefers-reduced-motion: reduce){.zs-hathi2 *{animation:none!important}}
`}</style>
            <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center" }} dangerouslySetInnerHTML={{ __html: HATHI_SVG }} />
        </>
    )
}

PolaroidLoader.defaultProps = {
    captions: ["rolling camera…", "finding the light…", "one more take…"],
    doneCaption: "action!",
    slotLabel: "Lottie slot · hathi.json",
    duration: 2.4,
    accent: "#379F62",
    ink: "#1F332E",
    paper: "#FBF0E3",
    captionFont: { fontFamily: '"Grandstander", cursive' },
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

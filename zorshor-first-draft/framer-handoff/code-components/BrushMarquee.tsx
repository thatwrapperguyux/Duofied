import { addPropertyControls, ControlType } from "framer"
import { useMemo, type CSSProperties, type ReactNode } from "react"

type Props = {
    items: string[]
    slots: ReactNode[]
    color: string
    streak: string
    textColor: string
    rotate: number
    duration: number
    reverse: boolean
    seed: number
    gap: number
    itemFont: CSSProperties
    style?: CSSProperties
}

/**
 * Green brush band with a logo / thumbnail ticker (wireframe: "Worked with
 * best" band on Home, the strips on Films and Socials).
 * Add logo components to "Slots" — or leave it empty and use text labels.
 * Set "Rotate" to about -4.5° for the tilted Home band, 0 for flat strips.
 * Make the component ~112vw wide and centre it so the ragged ends bleed off.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 * @framerIntrinsicWidth 1440
 * @framerIntrinsicHeight 150
 */
export default function BrushMarquee(props: Props) {
    const { items, slots, color, streak, textColor, rotate, duration, reverse, seed, gap, itemFont } = props
    const { d, s } = useMemo(() => brush(seed), [seed])
    const cells: ReactNode[] = slots && slots.length ? slots : items.map((t) => t)

    const row = (key: string) =>
        cells.map((c, i) => (
            <span
                key={key + i}
                style={{
                    display: "grid",
                    placeItems: "center",
                    height: "100%",
                    minWidth: 160,
                    padding: "0 22px",
                    border: `2.5px solid ${textColor}`,
                    borderRadius: "255px 14px 225px 16px / 14px 225px 16px 255px",
                    color: textColor,
                    flex: "none",
                    transform: `rotate(${((i * 37) % 5) - 2}deg)`,
                    ...itemFont,
                }}
            >
                {c}
            </span>
        ))

    return (
        <div style={{ ...props.style, position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", transform: `rotate(${rotate}deg)` }}>
            <style>{`@keyframes zsMarquee{to{transform:translateX(-50%)}}@media (prefers-reduced-motion: reduce){.zs-track{animation:none!important}}`}</style>
            <svg viewBox="0 0 1200 140" preserveAspectRatio="none" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
                <path d={d} fill={color} />
                <path d={s} fill="none" stroke="#fff" strokeOpacity={0.32} strokeWidth={1.6} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                <path d={s} transform="translate(46 7)" fill="none" stroke={streak} strokeOpacity={0.45} strokeWidth={2.6} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </svg>
            <div style={{ position: "relative", overflow: "hidden", width: "100%", height: "62%" }}>
                <div
                    className="zs-track"
                    style={{
                        display: "flex",
                        gap,
                        width: "max-content",
                        height: "100%",
                        animation: `zsMarquee ${duration}s linear infinite`,
                        animationDirection: reverse ? "reverse" : "normal",
                    }}
                >
                    {row("a")}
                    {row("b")}
                </div>
            </div>
        </div>
    )
}

function rng(seed: number) {
    let s = seed >>> 0 || 1
    return () => {
        s = (s + 0x6d2b79f5) | 0
        let t = Math.imul(s ^ (s >>> 15), 1 | s)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

function brush(seed: number) {
    const r = rng(seed)
    const W = 1200
    const H = 140
    let d = `M-12 ${(16 + r() * 10).toFixed(1)}`
    for (let x = 0; x <= W; x += 12) d += `L${x} ${(13 + Math.sin(x / 150 + seed) * 6 + (r() - 0.5) * 9 + (r() < 0.07 ? r() * 12 : 0)).toFixed(1)}`
    d += `L${W + 16} ${H * 0.28}L${W + 6} ${H * 0.5}L${W + 20} ${H * 0.74}`
    for (let x = W; x >= 0; x -= 12) d += `L${x} ${(H - 13 + Math.sin(x / 170 + seed * 2) * 6 + (r() - 0.5) * 9 - (r() < 0.07 ? r() * 12 : 0)).toFixed(1)}`
    d += `L-18 ${H * 0.72}L-6 ${H * 0.46}L-20 ${H * 0.24}Z`
    let s = ""
    for (let i = 0; i < 28; i++) {
        const y = 22 + r() * (H - 44)
        const x = r() * W
        const len = 60 + r() * 280
        s += `M${x.toFixed(0)} ${y.toFixed(1)}C${(x + len * 0.3).toFixed(0)} ${(y + (r() - 0.5) * 4).toFixed(1)} ${(x + len * 0.7).toFixed(0)} ${(y + (r() - 0.5) * 4).toFixed(1)} ${(x + len).toFixed(0)} ${(y + (r() - 0.5) * 3).toFixed(1)}`
    }
    return { d, s }
}

BrushMarquee.defaultProps = {
    items: ["monsoon&co", "Bharat Chai", "NOVA MOTORS", "lumen.", "KIRO", "TIDAL FOODS", "Haathi Toys", "orbit/pay"],
    slots: [],
    color: "#54D668",
    streak: "#2FA548",
    textColor: "#FFFFFF",
    rotate: -4.5,
    duration: 34,
    reverse: false,
    seed: 7,
    gap: 28,
    itemFont: { fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 800, fontSize: 24 },
}

addPropertyControls(BrushMarquee, {
    slots: { type: ControlType.Array, title: "Slots", control: { type: ControlType.ComponentInstance } },
    items: { type: ControlType.Array, title: "Labels", control: { type: ControlType.String }, hidden: (p: Props) => p.slots && p.slots.length > 0 },
    color: { type: ControlType.Color, title: "Brush" },
    streak: { type: ControlType.Color, title: "Streaks" },
    textColor: { type: ControlType.Color, title: "Items" },
    rotate: { type: ControlType.Number, title: "Rotate", min: -15, max: 15, step: 0.5, unit: "°" },
    duration: { type: ControlType.Number, title: "Loop", min: 5, max: 120, unit: "s" },
    reverse: { type: ControlType.Boolean, title: "Reverse" },
    seed: { type: ControlType.Number, title: "Brush shape", min: 1, max: 99, step: 1 },
    gap: { type: ControlType.Number, title: "Gap", min: 0, max: 120 },
    itemFont: { type: ControlType.Font, title: "Font", controls: "extended", defaultFontType: "sans-serif" },
})

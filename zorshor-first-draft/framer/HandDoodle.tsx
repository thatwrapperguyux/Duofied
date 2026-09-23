import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { useEffect, useRef, useState, type CSSProperties } from "react"

type Kind = "star" | "bang" | "bangs" | "slashes" | "arrow" | "underline" | "circle" | "sparkle" | "down"

type Props = {
    kind: Kind
    color: string
    strokeWidth: number
    drawOnView: boolean
    duration: number
    delay: number
    style?: CSSProperties
}

const SHAPES: Record<Kind, { vb: string; d: string[]; dot?: number[] }> = {
    star: { vb: "0 0 40 40", d: ["M20 5c-.3 9.8.6 19.9 0 30", "M7 13.2c8.9 4.4 17.4 9 26 13.8", "M7.2 27.6C15.6 22.4 24.4 17.2 33 12"] },
    bang: { vb: "0 0 30 70", d: ["M15 6c-2 14 1 28-1 42", "M14 60l.5 1"], dot: [1] },
    bangs: { vb: "0 0 52 74", d: ["M14 6c-2 14 1 26-1 38", "M13 58l.5 1", "M34 8c-2 14 1 26-1 38", "M33 60l.5 1"], dot: [1, 3] },
    slashes: { vb: "0 0 48 48", d: ["M12 40L23 8", "M25 42L36 11"] },
    arrow: { vb: "0 0 110 60", d: ["M6 50C26 14 64 4 98 22", "M84 10l15 13-17 9"] },
    underline: { vb: "0 0 200 20", d: ["M4 12C40 4 80 16 120 9s60-3 76 2"] },
    circle: { vb: "0 0 200 80", d: ["M30 14C80 0 170 4 190 30c14 22-40 46-100 44C30 72 2 56 10 34 16 18 50 8 110 8"] },
    sparkle: { vb: "0 0 40 30", d: ["M4 26l8-10", "M18 22l.5-16", "M32 26l-6-10"] },
    down: { vb: "0 0 20 60", d: ["M10 4c-1.8 16.4 1.6 32.2 0 50", "M3 43.5l7.1 11 6.9-11"] },
}

/**
 * Hand-drawn marks from the wireframe's doodle vocabulary: !! * // arrows,
 * underlines and scribbled circles. They draw themselves in when they
 * scroll into view. Use Fill/Fixed sizing; the doodle stretches for
 * underline and circle, keeps its shape for the rest.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 * @framerIntrinsicWidth 60
 * @framerIntrinsicHeight 60
 */
export default function HandDoodle(props: Props) {
    const { kind, color, strokeWidth, drawOnView, duration, delay } = props
    const onCanvas = RenderTarget.current() === RenderTarget.canvas
    const ref = useRef<SVGSVGElement>(null)
    const [drawn, setDrawn] = useState(onCanvas || !drawOnView)
    const shape = SHAPES[kind] || SHAPES.star

    useEffect(() => {
        if (drawn || !ref.current) return
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setDrawn(true)
        const io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) {
                setDrawn(true)
                io.disconnect()
            }
        }, { rootMargin: "0px 0px -10% 0px" })
        io.observe(ref.current)
        return () => io.disconnect()
    }, [drawn])

    const stretch = kind === "underline" || kind === "circle"
    return (
        <svg
            ref={ref}
            viewBox={shape.vb}
            preserveAspectRatio={stretch ? "none" : "xMidYMid meet"}
            aria-hidden="true"
            style={{ ...props.style, width: "100%", height: "100%", overflow: "visible" }}
            fill="none"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {shape.d.map((d, i) => (
                <path
                    key={i}
                    d={d}
                    pathLength={1}
                    strokeWidth={shape.dot && shape.dot.includes(i) ? strokeWidth * 1.9 : strokeWidth}
                    vectorEffect={stretch ? "non-scaling-stroke" : undefined}
                    style={{
                        strokeDasharray: 1,
                        strokeDashoffset: drawn ? 0 : 1,
                        transition: `stroke-dashoffset ${duration}s cubic-bezier(.16,1,.3,1) ${delay + i * 0.14}s`,
                    }}
                />
            ))}
        </svg>
    )
}

HandDoodle.defaultProps = {
    kind: "star",
    color: "#0D0F0C",
    strokeWidth: 3.2,
    drawOnView: true,
    duration: 1.1,
    delay: 0,
}

addPropertyControls(HandDoodle, {
    kind: {
        type: ControlType.Enum,
        title: "Doodle",
        options: ["star", "bang", "bangs", "slashes", "arrow", "underline", "circle", "sparkle", "down"],
        optionTitles: ["* Star", "! Bang", "!! Double bang", "// Slashes", "→ Arrow", "Underline", "Circle", "Sparkle", "↓ Down"],
    },
    color: { type: ControlType.Color, title: "Color" },
    strokeWidth: { type: ControlType.Number, title: "Stroke", min: 1, max: 10, step: 0.2 },
    drawOnView: { type: ControlType.Boolean, title: "Draw on view" },
    duration: { type: ControlType.Number, title: "Duration", min: 0.2, max: 4, step: 0.1, unit: "s" },
    delay: { type: ControlType.Number, title: "Delay", min: 0, max: 3, step: 0.05, unit: "s" },
})

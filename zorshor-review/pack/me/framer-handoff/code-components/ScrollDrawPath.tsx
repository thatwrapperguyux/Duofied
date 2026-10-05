import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react"

type Props = {
    path: string
    viewBoxWidth: number
    viewBoxHeight: number
    color: string
    ghostColor: string
    headColor: string
    strokeWidth: number
    dash: number
    gap: number
    start: number
    speed: number
    showHead: boolean
    showGhost: boolean
    style?: CSSProperties
}

/**
 * Process line (Home · "Process in 3 steps").
 * A hand-drawn dashed path that draws itself as the section scrolls past,
 * with a green dot riding the tip. Put it behind the three step polaroids
 * (same parent, lower in the layer list), stretch it to the section, and
 * paste any path drawn in the given view box — it scales to the frame.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 1400
 */
export default function ScrollDrawPath(props: Props) {
    const { path, viewBoxWidth, viewBoxHeight, color, ghostColor, headColor, strokeWidth, dash, gap, start, speed, showHead, showGhost } = props
    const onCanvas = RenderTarget.current() === RenderTarget.canvas
    const box = useRef<HTMLDivElement>(null)
    const line = useRef<SVGPathElement>(null)
    const [size, setSize] = useState({ w: viewBoxWidth, h: viewBoxHeight })
    const [len, setLen] = useState(0)
    const [p, setP] = useState(onCanvas ? 0.65 : 0)
    const [head, setHead] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const el = box.current
        if (!el) return
        const ro = new ResizeObserver(([e]) => setSize({ w: Math.max(1, e.contentRect.width), h: Math.max(1, e.contentRect.height) }))
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    // scale the path into pixel space so dashes and the dot stay undistorted
    const d = useMemo(() => scalePath(path, size.w / viewBoxWidth, size.h / viewBoxHeight), [path, size, viewBoxWidth, viewBoxHeight])

    useLayoutEffect(() => {
        if (line.current) setLen(line.current.getTotalLength())
    }, [d])

    useEffect(() => {
        if (onCanvas) return
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setP(1)
        let raf = 0
        const on = () => {
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(() => {
                const el = box.current
                if (!el) return
                const r = el.getBoundingClientRect()
                const v = (window.innerHeight * start - r.top) / (r.height * speed)
                setP(Math.min(1, Math.max(0, v)))
            })
        }
        on()
        window.addEventListener("scroll", on, { passive: true })
        window.addEventListener("resize", on)
        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener("scroll", on)
            window.removeEventListener("resize", on)
        }
    }, [start, speed])

    useLayoutEffect(() => {
        if (!line.current || !len) return
        const pt = line.current.getPointAtLength(Math.max(0.01, len * p))
        setHead({ x: pt.x, y: pt.y })
    }, [p, len])

    const maskId = useMemo(() => "zsm" + Math.random().toString(36).slice(2, 8), [])

    return (
        <div ref={box} style={{ ...props.style, position: "relative", width: "100%", height: "100%", pointerEvents: "none" }}>
            <svg width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} style={{ position: "absolute", inset: 0, overflow: "visible" }} aria-hidden="true">
                <defs>
                    <mask id={maskId} maskUnits="userSpaceOnUse" x={-50} y={-50} width={size.w + 100} height={size.h + 100}>
                        <path d={d} fill="none" stroke="#fff" strokeWidth={strokeWidth + 12} strokeLinecap="round" strokeDasharray={`${len} ${len + 1}`} strokeDashoffset={len * (1 - p)} />
                    </mask>
                </defs>
                {showGhost && <path d={d} fill="none" stroke={ghostColor} strokeWidth={Math.max(1, strokeWidth - 1)} strokeDasharray={`2 ${gap}`} strokeLinecap="round" />}
                <path ref={line} d={d} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={`${dash} ${gap}`} strokeLinecap="round" mask={`url(#${maskId})`} />
                {showHead && p > 0 && (
                    <g transform={`translate(${head.x} ${head.y})`}>
                        <circle r={16} fill={headColor} opacity={0.25} />
                        <circle r={9} fill={headColor} stroke={color} strokeWidth={3} />
                    </g>
                )}
            </svg>
        </div>
    )
}

const ARGS: Record<string, number> = { M: 2, L: 2, T: 2, C: 6, S: 4, Q: 4, H: 1, V: 1, A: 7, Z: 0 }

/** Scale every coordinate of an SVG path by sx / sy (absolute and relative commands). */
function scalePath(d: string, sx: number, sy: number): string {
    const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g) || []
    let out = ""
    let cmd = ""
    let i = 0
    while (i < tokens.length) {
        const tk = tokens[i]
        if (/[a-zA-Z]/.test(tk)) {
            cmd = tk
            out += tk
            i++
            if (cmd.toUpperCase() === "Z") continue
        }
        const U = cmd.toUpperCase()
        const n = ARGS[U] ?? 2
        if (n === 0) {
            i++
            continue
        }
        const nums = tokens.slice(i, i + n).map(Number)
        i += n
        let scaled: number[]
        if (U === "H") scaled = [nums[0] * sx]
        else if (U === "V") scaled = [nums[0] * sy]
        else if (U === "A") scaled = [nums[0] * sx, nums[1] * sy, nums[2], nums[3], nums[4], nums[5] * sx, nums[6] * sy]
        else scaled = nums.map((v, k) => (k % 2 === 0 ? v * sx : v * sy))
        out += scaled.map((v) => +v.toFixed(2)).join(" ") + " "
    }
    return out.trim()
}

ScrollDrawPath.defaultProps = {
    path: "M520 400 C700 405 770 470 770 560 L700 980 C560 985 540 1010 560 1080",
    viewBoxWidth: 1200,
    viewBoxHeight: 1400,
    color: "#16211E",
    ghostColor: "rgba(13,15,12,.14)",
    headColor: "#379F62",
    strokeWidth: 3,
    dash: 13,
    gap: 13,
    start: 0.62,
    speed: 0.9,
    showHead: true,
    showGhost: true,
}

addPropertyControls(ScrollDrawPath, {
    path: { type: ControlType.String, title: "SVG path", displayTextArea: true },
    viewBoxWidth: { type: ControlType.Number, title: "Box width", min: 1, max: 4000 },
    viewBoxHeight: { type: ControlType.Number, title: "Box height", min: 1, max: 8000 },
    color: { type: ControlType.Color, title: "Line" },
    ghostColor: { type: ControlType.Color, title: "Ghost" },
    headColor: { type: ControlType.Color, title: "Dot" },
    strokeWidth: { type: ControlType.Number, title: "Stroke", min: 1, max: 12, step: 0.5 },
    dash: { type: ControlType.Number, title: "Dash", min: 1, max: 60 },
    gap: { type: ControlType.Number, title: "Gap", min: 1, max: 60 },
    start: { type: ControlType.Number, title: "Start at", min: 0, max: 1, step: 0.01, description: "Viewport height fraction where drawing begins" },
    speed: { type: ControlType.Number, title: "Length", min: 0.2, max: 2, step: 0.05, description: "Share of the section's height the draw takes" },
    showHead: { type: ControlType.Boolean, title: "Dot" },
    showGhost: { type: ControlType.Boolean, title: "Ghost path" },
})

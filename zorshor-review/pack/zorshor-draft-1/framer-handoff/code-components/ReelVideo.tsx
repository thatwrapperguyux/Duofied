import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { useEffect, useRef, type CSSProperties } from "react"

type Props = {
    video: string
    scene: "forest" | "bokeh"
    tint: "none" | "cool" | "warm"
    seed: number
    label: string
    showTimecode: boolean
    style?: CSSProperties
}

/**
 * Full-bleed video for the hero, film players and "your idea" blocks.
 * Upload an .mp4 and it plays muted, looped and inline. With no file it runs
 * a cinematic placeholder (foggy forest or bokeh, with grain and a green
 * light leak) so the draft still feels like film.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 * @framerIntrinsicWidth 1280
 * @framerIntrinsicHeight 720
 */
export default function ReelVideo(props: Props) {
    const { video, scene, tint, seed, label, showTimecode } = props
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const tcRef = useRef<HTMLSpanElement>(null)
    const onCanvas = RenderTarget.current() === RenderTarget.canvas

    useEffect(() => {
        if (video) return
        const cv = canvasRef.current
        if (!cv) return
        const reel = new Reel(cv, scene, tint, seed)
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        let visible = true
        const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "120px" })
        io.observe(cv)
        const ro = new ResizeObserver(() => reel.resize())
        ro.observe(cv)
        const t0 = performance.now()
        let raf = 0
        let last = 0
        const loop = (t: number) => {
            if (visible && t - last >= 40) {
                last = t
                reel.draw(t)
                if (tcRef.current) tcRef.current.textContent = timecode((t - t0) / 1000)
            }
            if (!onCanvas && !reduce) raf = requestAnimationFrame(loop)
        }
        raf = requestAnimationFrame(loop)
        return () => {
            cancelAnimationFrame(raf)
            io.disconnect()
            ro.disconnect()
        }
    }, [video, scene, tint, seed])

    return (
        <div style={{ ...props.style, position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "#F3F0EA" }}>
            {video ? (
                <video src={video} autoPlay muted loop playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
                <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #F7F5F1, #F0EDE7)" }} />
            )}
            {!video && label && (
                <span style={{ ...chip, left: 16, bottom: 16 }}>{label}</span>
            )}
            {showTimecode && (
                <span style={{ ...chip, left: 16, top: 16, border: "none", background: "transparent", display: "flex", gap: 8, alignItems: "center" }}>
                    <i style={{ width: 9, height: 9, borderRadius: "50%", background: "#ff4b3e", display: "inline-block" }} />
                    REC <span ref={tcRef}>00:00:00:00</span>
                </span>
            )}
        </div>
    )
}

const chip: CSSProperties = {
    position: "absolute",
    font: "500 10.5px/1 ui-monospace, Menlo, monospace",
    letterSpacing: ".08em",
    textTransform: "uppercase",
    color: "#fff",
    border: "1px dashed rgba(255,255,255,.55)",
    padding: "7px 9px",
    borderRadius: 4,
    background: "rgba(13,15,12,.35)",
}

function timecode(s: number) {
    return [Math.floor(s / 3600), Math.floor(s / 60) % 60, Math.floor(s) % 60, Math.floor(s * 25) % 25]
        .map((n) => String(n).padStart(2, "0"))
        .join(":")
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

type Layer = { c: HTMLCanvasElement; W: number; speed: number }
type Orb = { x: number; y: number; rr: number; sp: number; a: number; ph: number; c: number[] }

let NOISE: HTMLCanvasElement | null = null
function noise() {
    if (NOISE) return NOISE
    const c = document.createElement("canvas")
    c.width = c.height = 192
    const x = c.getContext("2d")!
    const im = x.createImageData(192, 192)
    for (let i = 0; i < im.data.length; i += 4) {
        const v = (Math.random() * 255) | 0
        im.data[i] = im.data[i + 1] = im.data[i + 2] = v
        im.data[i + 3] = 34
    }
    x.putImageData(im, 0, 0)
    return (NOISE = c)
}

class Reel {
    ctx: CanvasRenderingContext2D
    w = 0
    h = 0
    layers: Layer[] = []
    orbs: Orb[] = []
    vig: CanvasGradient | null = null
    grain: CanvasPattern | null = null
    constructor(public cv: HTMLCanvasElement, public scene: string, public tint: string, public seed: number) {
        this.ctx = cv.getContext("2d")!
        this.resize()
    }
    resize() {
        const r = this.cv.getBoundingClientRect()
        if (!r.width || !r.height) return
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
        this.w = r.width
        this.h = r.height
        this.cv.width = Math.round(r.width * dpr)
        this.cv.height = Math.round(r.height * dpr)
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        this.build()
        this.draw(performance.now())
    }
    build() {
        const { w, h, ctx } = this
        const r = rng(this.seed * 97 + 3)
        this.vig = ctx.createRadialGradient(w / 2, h * 0.55, Math.min(w, h) * 0.25, w / 2, h / 2, Math.max(w, h) * 0.78)
        this.vig.addColorStop(0, "rgba(0,0,0,0)")
        this.vig.addColorStop(1, "rgba(0,0,0,.62)")
        this.grain = ctx.createPattern(noise(), "repeat")
        if (this.scene === "forest") this.layers = [0, 1, 2].map((i) => this.treeLayer(i, r))
        else {
            const n = Math.round(Math.min(48, Math.max(14, (w * h) / 20000)))
            const pal = this.tint === "warm" ? [[255, 186, 112], [84, 214, 104], [255, 240, 222]] : [[84, 214, 104], [236, 255, 240], [150, 232, 168], [255, 212, 150]]
            this.orbs = Array.from({ length: n }, () => ({ x: r(), y: r(), rr: 0.02 + r() * 0.08, sp: 0.3 + r(), a: 0.1 + r() * 0.32, ph: r() * 6.28, c: pal[(r() * pal.length) | 0] }))
        }
    }
    treeLayer(i: number, r: () => number): Layer {
        const { w, h } = this
        const W = Math.ceil(w)
        const c = document.createElement("canvas")
        c.width = W
        c.height = Math.ceil(h)
        const x = c.getContext("2d")!
        const conf = [
            { n: Math.round(w / 24), tw: [3, 9], col: "rgba(72,88,80,.55)", ground: 0.8 },
            { n: Math.round(w / 70), tw: [10, 22], col: "rgba(24,31,27,.93)", ground: 0.88 },
            { n: Math.max(3, Math.round(w / 260)), tw: [34, 78], col: "#050706", ground: 1.05 },
        ][i]
        x.fillStyle = x.strokeStyle = conf.col
        x.lineCap = "round"
        for (let k = 0; k < conf.n; k++) {
            const cx = r() * W
            const tw = conf.tw[0] + (conf.tw[1] - conf.tw[0]) * r()
            const lean = (r() - 0.5) * tw * 0.8
            const gy = h * conf.ground + (r() - 0.5) * h * 0.04
            const br = i > 0 ? Array.from({ length: 2 + ((r() * 4) | 0) }, () => ({ y: h * (0.08 + r() * 0.5), dir: r() < 0.5 ? -1 : 1, l: tw * (1.5 + r() * 3) })) : []
            const tree = (ox: number) => {
                x.beginPath()
                x.moveTo(ox + cx - tw * 0.35 + lean, -10)
                x.lineTo(ox + cx + tw * 0.35 + lean, -10)
                x.lineTo(ox + cx + tw * 0.55, gy)
                x.lineTo(ox + cx - tw * 0.55, gy)
                x.closePath()
                x.fill()
                x.lineWidth = Math.max(1.2, tw * 0.12)
                for (const b of br) {
                    const bx = ox + cx + lean * (1 - b.y / gy)
                    x.beginPath()
                    x.moveTo(bx, b.y)
                    x.quadraticCurveTo(bx + b.dir * b.l * 0.5, b.y - b.l * 0.25, bx + b.dir * b.l, b.y - b.l * 0.55)
                    x.stroke()
                }
            }
            tree(0)
            if (cx < tw * 4) tree(W)
            if (cx > W - tw * 4) tree(-W)
        }
        return { c, W, speed: [5, 12, 30][i] }
    }
    draw(t: number) {
        const { ctx, w, h } = this
        if (!w) return
        const s = t / 1000
        if (this.scene === "forest") {
            const sky = ctx.createLinearGradient(0, 0, 0, h)
            sky.addColorStop(0, this.tint === "cool" ? "#28343a" : "#2c3630")
            sky.addColorStop(0.6, "#19201c")
            sky.addColorStop(1, "#0b0e0c")
            ctx.fillStyle = sky
            ctx.fillRect(0, 0, w, h)
            const gx = w * (0.63 + Math.sin(s * 0.05) * 0.03)
            const gy = h * 0.3
            const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(w, h) * 0.55)
            g.addColorStop(0, "rgba(228,242,232,.58)")
            g.addColorStop(0.35, "rgba(170,200,182,.18)")
            g.addColorStop(1, "rgba(0,0,0,0)")
            ctx.fillStyle = g
            ctx.fillRect(0, 0, w, h)
            this.layers.forEach((L, i) => {
                const off = (s * L.speed) % L.W
                ctx.drawImage(L.c, -off, 0)
                ctx.drawImage(L.c, L.W - off, 0)
                if (i < 2) {
                    const fy = h * (i ? 0.72 : 0.56) + Math.sin(s * 0.3 + i) * h * 0.02
                    const fg = ctx.createLinearGradient(0, fy - h * 0.25, 0, fy + h * 0.2)
                    fg.addColorStop(0, "rgba(200,216,206,0)")
                    fg.addColorStop(0.5, `rgba(200,216,206,${i ? 0.13 : 0.22})`)
                    fg.addColorStop(1, "rgba(200,216,206,0)")
                    ctx.fillStyle = fg
                    ctx.fillRect(0, fy - h * 0.25, w, h * 0.45)
                }
            })
            const gr = ctx.createLinearGradient(0, h * 0.8, 0, h)
            gr.addColorStop(0, "rgba(8,10,9,0)")
            gr.addColorStop(1, "rgba(8,10,9,.9)")
            ctx.fillStyle = gr
            ctx.fillRect(0, h * 0.8, w, h * 0.2)
            const lk = ctx.createRadialGradient(-w * 0.05, h * 0.2, 0, -w * 0.05, h * 0.2, w * 0.55)
            const a = 0.16 + 0.08 * Math.sin(s * 0.7)
            lk.addColorStop(0, `rgba(84,214,104,${a})`)
            lk.addColorStop(1, "rgba(84,214,104,0)")
            ctx.fillStyle = lk
            ctx.fillRect(0, 0, w, h)
        } else {
            const M = Math.max(w, h)
            const bg = ctx.createLinearGradient(0, 0, w, h)
            bg.addColorStop(0, this.tint === "warm" ? "#211b14" : "#111913")
            bg.addColorStop(1, "#060807")
            ctx.fillStyle = bg
            ctx.fillRect(0, 0, w, h)
            ctx.globalCompositeOperation = "lighter"
            for (const o of this.orbs) {
                const x = (((((o.x + s * 0.012 * o.sp) % 1.2) + 1.2) % 1.2) - 0.1) * w
                const y = (o.y + Math.sin(s * 0.4 * o.sp + o.ph) * 0.04) * h
                const R = o.rr * M
                const al = o.a * (0.75 + 0.25 * Math.sin(s * 1.3 + o.ph))
                const [cr, cg, cb] = o.c
                const g = ctx.createRadialGradient(x, y, R * 0.5, x, y, R)
                g.addColorStop(0, `rgba(${cr},${cg},${cb},${al * 0.7})`)
                g.addColorStop(0.86, `rgba(${cr},${cg},${cb},${al})`)
                g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`)
                ctx.fillStyle = g
                ctx.beginPath()
                ctx.arc(x, y, R, 0, 6.2832)
                ctx.fill()
            }
            ctx.globalCompositeOperation = "source-over"
        }
        if (this.vig) {
            ctx.fillStyle = this.vig
            ctx.fillRect(0, 0, w, h)
        }
        if (this.grain) {
            ctx.save()
            const ox = (Math.random() * 192) | 0
            const oy = (Math.random() * 192) | 0
            ctx.translate(ox, oy)
            ctx.fillStyle = this.grain
            ctx.fillRect(-ox, -oy, w, h)
            ctx.restore()
        }
    }
}

ReelVideo.defaultProps = {
    video: "",
    scene: "forest",
    tint: "none",
    seed: 1,
    label: "",
    showTimecode: false,
}

addPropertyControls(ReelVideo, {
    video: { type: ControlType.File, title: "Video", allowedFileTypes: ["mp4", "webm", "mov"] },
    scene: { type: ControlType.Enum, title: "Placeholder", options: ["forest", "bokeh"], optionTitles: ["Foggy forest", "Bokeh lights"], hidden: (p: Props) => !!p.video },
    tint: { type: ControlType.Enum, title: "Tint", options: ["none", "cool", "warm"], hidden: (p: Props) => !!p.video },
    seed: { type: ControlType.Number, title: "Variation", min: 1, max: 99, step: 1, hidden: (p: Props) => !!p.video },
    label: { type: ControlType.String, title: "Label", hidden: (p: Props) => !!p.video },
    showTimecode: { type: ControlType.Boolean, title: "REC timecode" },
})

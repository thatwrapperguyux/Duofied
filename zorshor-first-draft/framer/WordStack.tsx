import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { useEffect, useRef, useState, type CSSProperties } from "react"

type Props = {
    words: string[]
    scrollLength: number
    accent: string
    ink: string
    paper: string
    idle: string
    font: CSSProperties
    showProgress: boolean
    style?: CSSProperties
}

/**
 * Socials · "Shoot. Edit. Deliver. Repeat." scroll animation.
 * The component is tall (Scroll length × viewport height) and keeps the
 * stack pinned while you scroll; each word takes its turn as the big green
 * sticker. Size it Fill width / Fit height and turn off "Clip content" on the
 * parent so the sticky pin works.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1200
 */
export default function WordStack(props: Props) {
    const { words, scrollLength, accent, ink, paper, idle, font, showProgress } = props
    const onCanvas = RenderTarget.current() === RenderTarget.canvas
    const ref = useRef<HTMLDivElement>(null)
    const [idx, setIdx] = useState(onCanvas ? 1 : 0)

    useEffect(() => {
        if (onCanvas) return
        let raf = 0
        const on = () => {
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(() => {
                const el = ref.current
                if (!el) return
                const r = el.getBoundingClientRect()
                const p = Math.min(0.9999, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)))
                setIdx(Math.floor(p * words.length))
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
    }, [words.length])

    return (
        <div ref={ref} style={{ ...props.style, position: "relative", width: "100%", height: onCanvas ? 720 : `${scrollLength * 100}vh` }}>
            <div style={{ position: onCanvas ? "relative" : "sticky", top: 0, height: onCanvas ? 720 : "100vh", display: "grid", placeItems: "center", overflow: "hidden" }}>
                <div style={{ display: "grid", justifyItems: "center", gap: 10 }}>
                    {words.map((w, i) => {
                        const on = i === idx
                        const done = i < idx
                        return (
                            <span
                                key={i}
                                style={{
                                    fontSize: "clamp(36px, 6.6vw, 96px)",
                                    lineHeight: 1,
                                    letterSpacing: "-.035em",
                                    padding: ".06em .42em .1em",
                                    border: `3px solid ${ink}`,
                                    borderRadius: "255px 14px 225px 16px / 14px 225px 16px 255px",
                                    background: on ? accent : paper,
                                    color: on || done ? ink : idle,
                                    boxShadow: on ? `6px 6px 0 ${ink}` : "none",
                                    marginLeft: i % 2 === 0 ? "6%" : 0,
                                    marginRight: i % 2 === 1 ? "8%" : 0,
                                    transform: on ? "scale(1.14) rotate(-2.5deg)" : done ? "scale(.78) rotate(1deg)" : "scale(.78)",
                                    transition: "transform .6s cubic-bezier(.34,1.56,.64,1), background .35s, color .35s, box-shadow .35s",
                                    ...font,
                                }}
                            >
                                {w}
                            </span>
                        )
                    })}
                    {showProgress && (
                        <div style={{ display: "flex", gap: 6, marginTop: 16 }}>
                            {words.map((_, i) => (
                                <i key={i} style={{ width: 34, height: 5, borderRadius: 5, background: i <= idx ? ink : "#D5DAD1", transition: "background .3s" }} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

WordStack.defaultProps = {
    words: ["Shoot.", "Edit.", "Deliver.", "Repeat."],
    scrollLength: 3.4,
    accent: "#54D668",
    ink: "#0D0F0C",
    paper: "#FFFFFF",
    idle: "#D5DAD1",
    font: { fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 780 },
    showProgress: true,
}

addPropertyControls(WordStack, {
    words: { type: ControlType.Array, title: "Words", control: { type: ControlType.String } },
    scrollLength: { type: ControlType.Number, title: "Scroll length", min: 1.5, max: 8, step: 0.1, unit: "× vh" },
    accent: { type: ControlType.Color, title: "Active" },
    ink: { type: ControlType.Color, title: "Ink" },
    paper: { type: ControlType.Color, title: "Paper" },
    idle: { type: ControlType.Color, title: "Idle text" },
    font: { type: ControlType.Font, title: "Font", controls: "extended", defaultFontType: "sans-serif" },
    showProgress: { type: ControlType.Boolean, title: "Progress" },
})

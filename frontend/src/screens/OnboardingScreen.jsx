import { useState, useEffect, useRef } from 'react'

// ─── inject keyframes + font once ───────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@500;600;700&family=Satoshi:wght@400;500;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

@keyframes floatPin {
  0%,100% { transform: translateY(0px) scale(1); }
  50%      { transform: translateY(-8px) scale(1.05); }
}
@keyframes pulseRing {
  0%   { transform: scale(0.8); opacity: 0.8; }
  100% { transform: scale(2.2); opacity: 0; }
}
@keyframes heatGlow {
  0%,100% { box-shadow: 0 0 12px 3px rgba(251,146,60,0.4); }
  50%      { box-shadow: 0 0 28px 8px rgba(251,146,60,0.7); }
}
@keyframes blockFlicker {
  0%,90%,100% { opacity: 0.65; }
  95%         { opacity: 1; }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(32px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; } to { opacity: 1; }
}
@keyframes popIn {
  0%   { opacity:0; transform: scale(0.5) translateY(10px); }
  70%  { transform: scale(1.1) translateY(-2px); }
  100% { opacity:1; transform: scale(1) translateY(0); }
}
@keyframes orbitSpin {
  from { transform: rotate(0deg) translateX(44px) rotate(0deg); }
  to   { transform: rotate(360deg) translateX(44px) rotate(-360deg); }
}
@keyframes scanLine {
  0%   { top: 8%;  opacity: 0.9; }
  100% { top: 90%; opacity: 0.2; }
}
@keyframes timerShrink {
  from { width: 100%; }
  to   { width: 0%; }
}
@keyframes pinDrop {
  0%  { opacity:0; transform: translateY(-20px) scale(0.5); }
  60% { transform: translateY(4px) scale(1.1); }
  100%{ opacity:1; transform: translateY(0) scale(1); }
}
@keyframes shieldPulse {
  0%,100% { transform: scale(1); filter: drop-shadow(0 0 6px rgba(94,234,212,0.4)); }
  50%     { transform: scale(1.08); filter: drop-shadow(0 0 16px rgba(94,234,212,0.8)); }
}
@keyframes gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes requestPop {
  0% { opacity:0; transform: scale(0.3) rotate(-8deg); }
  60%{ transform: scale(1.08) rotate(2deg); }
  100%{ opacity:1; transform: scale(1) rotate(0deg); }
}
@keyframes dotPulse {
  0%,100%{ transform: scale(1); }
  50%    { transform: scale(1.4); }
}
`

// ─── slide data ──────────────────────────────────────────────────────────────
const SLIDES = [
  {
    id: 'blocks',
    tag: 'Your territory',
    title: 'Verified\nBlocks',
    body: 'Every campus and neighbourhood is a live zone drawn by admins. You always know exactly where you are connecting — no guesswork.',
    accent: '#fb923c',
    accentDim: 'rgba(251,146,60,0.18)',
  },
  {
    id: 'requests',
    tag: 'Be heard',
    title: 'Raise a\nRequest',
    body: 'Help, hangouts, sports, or free stuff — post in seconds. Requests expire automatically, so the feed is always fresh and relevant.',
    accent: '#a78bfa',
    accentDim: 'rgba(167,139,250,0.18)',
  },
  {
    id: 'heat',
    tag: 'Feel the energy',
    title: 'Live Heat\nScore',
    body: 'Every block breathes. A live heat badge shows exactly how active a zone is right now — updated every two minutes.',
    accent: '#f43f5e',
    accentDim: 'rgba(244,63,94,0.18)',
  },
  {
    id: 'privacy',
    tag: 'Stay safe',
    title: 'Privacy\nFirst',
    body: 'Your exact spot stays hidden until someone accepts your request. Student IDs are encrypted. You control who sees what.',
    accent: '#2dd4bf',
    accentDim: 'rgba(45,212,191,0.18)',
  },
]

const HEAT = [
  { label: 'Cold',    color: '#60a5fa', score: 3 },
  { label: 'Mild',    color: '#34d399', score: 12 },
  { label: 'Warm',    color: '#fbbf24', score: 36 },
  { label: 'Hot',     color: '#fb923c', score: 72 },
  { label: 'On Fire', color: '#f43f5e', score: 118 },
]

// ─── illustrations per slide ─────────────────────────────────────────────────

function BlocksIllustration({ accent }) {
  const polys = [
    { x: 60,  y: 90,  w: 90,  h: 70,  color: '#fb923c', delay: 0 },
    { x: 170, y: 70,  w: 70,  h: 55,  color: '#a78bfa', delay: 0.3 },
    { x: 80,  y: 175, w: 60,  h: 50,  color: '#34d399', delay: 0.5 },
    { x: 155, y: 145, w: 85,  h: 65,  color: '#60a5fa', delay: 0.2 },
  ]
  const pins = [
    { cx: 105, cy: 125, delay: 0.1 },
    { cx: 205, cy: 100, delay: 0.6 },
    { cx: 198, cy: 178, delay: 0.9 },
  ]
  return (
    <div style={{ position: 'relative', width: 300, height: 290, margin: '0 auto' }}>
      {/* grid bg */}
      <svg width="300" height="290" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M30 0L0 0 0 30" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="300" height="290" fill="url(#grid)" rx="16" />
        {polys.map((p, i) => (
          <rect
            key={i}
            x={p.x} y={p.y} width={p.w} height={p.h} rx="8"
            fill={p.color} opacity="0.22"
            style={{ animation: `blockFlicker ${2 + i * 0.4}s ease-in-out ${p.delay}s infinite` }}
          />
        ))}
        {polys.map((p, i) => (
          <rect
            key={'b' + i}
            x={p.x} y={p.y} width={p.w} height={p.h} rx="8"
            fill="none" stroke={p.color} strokeWidth="1.5" opacity="0.7"
          />
        ))}
        {pins.map((p, i) => (
          <g key={i} style={{ animation: `floatPin ${2.5 + i * 0.5}s ease-in-out ${p.delay}s infinite` }}>
            <circle cx={p.cx} cy={p.cy} r="10" fill={accent} opacity="0.9" />
            <circle cx={p.cx} cy={p.cy} r="4"  fill="#fff" />
            <circle cx={p.cx} cy={p.cy} r="10" fill="none" stroke={accent} strokeWidth="1.5"
              style={{ animation: `pulseRing 2s ease-out ${p.delay}s infinite` }} />
          </g>
        ))}
      </svg>
      {/* heat badge */}
      <div style={{
        position: 'absolute', top: 14, right: 14,
        background: 'rgba(251,146,60,0.9)', borderRadius: 20,
        padding: '4px 12px', fontSize: 12, fontFamily: "'Satoshi', sans-serif",
        fontWeight: 700, color: '#fff', letterSpacing: '0.04em',
        animation: `heatGlow 2s ease-in-out infinite`,
      }}>🔥 On Fire</div>
    </div>
  )
}

function RequestsIllustration({ accent }) {
  const types = [
    { label: 'Help',  icon: '🤝', color: '#fb923c', delay: 0 },
    { label: 'Talk',  icon: '💬', color: '#a78bfa', delay: 0.25 },
    { label: 'Play',  icon: '⚽', color: '#34d399', delay: 0.5 },
    { label: 'Free',  icon: '🎁', color: '#60a5fa', delay: 0.75 },
  ]
  return (
    <div style={{ position: 'relative', width: 300, height: 270, margin: '0 auto' }}>
      {/* request cards */}
      {types.map((t, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: i % 2 === 0 ? 20 : 160,
          top: i < 2 ? 18 : 148,
          width: 130, padding: '14px 16px',
          background: 'rgba(255,255,255,0.07)',
          border: `1.5px solid ${t.color}55`,
          borderRadius: 14, backdropFilter: 'blur(6px)',
          animation: `requestPop 0.5s cubic-bezier(0.34,1.56,0.64,1) ${t.delay + 0.2}s both`,
        }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>{t.icon}</div>
          <div style={{
            fontFamily: "'Satoshi', sans-serif", fontWeight: 700,
            color: t.color, fontSize: 13,
          }}>{t.label}</div>
          {/* timer bar */}
          <div style={{ marginTop: 8, height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%', background: t.color, borderRadius: 4,
              animation: `timerShrink ${8 + i * 3}s linear ${t.delay}s infinite`,
            }} />
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4, fontFamily: "'Satoshi',sans-serif" }}>
            expires soon
          </div>
        </div>
      ))}
    </div>
  )
}

function HeatIllustration() {
  const [hi, setHi] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setHi(x => (x + 1) % HEAT.length), 1400)
    return () => clearInterval(t)
  }, [])
  const h = HEAT[hi]
  return (
    <div style={{
      width: 280, height: 270, margin: '0 auto',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28,
    }}>
      {/* main badge */}
      <div style={{
        padding: '20px 44px', borderRadius: 24,
        background: h.color + '22', border: `2px solid ${h.color}88`,
        transition: 'all 0.5s ease',
        boxShadow: `0 0 32px 6px ${h.color}44`,
      }}>
        <div style={{
          fontFamily: "'Clash Display', sans-serif",
          fontSize: 32, fontWeight: 700, color: h.color,
          transition: 'color 0.4s ease', textAlign: 'center',
        }}>{h.label}</div>
        <div style={{
          fontFamily: "'Satoshi', sans-serif", fontSize: 13,
          color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 4,
          transition: 'all 0.4s ease',
        }}>score {h.score}</div>
      </div>
      {/* mini row of all states */}
      <div style={{ display: 'flex', gap: 8 }}>
        {HEAT.map((hh, i) => (
          <div key={i} style={{
            width: 38, padding: '6px 0', borderRadius: 10, textAlign: 'center',
            background: i === hi ? hh.color + '33' : 'rgba(255,255,255,0.06)',
            border: `1.5px solid ${i === hi ? hh.color : 'rgba(255,255,255,0.1)'}`,
            transition: 'all 0.4s ease',
          }}>
            <div style={{ fontSize: 8, fontFamily: "'Satoshi',sans-serif", color: i === hi ? hh.color : 'rgba(255,255,255,0.3)', fontWeight: 700 }}>
              {hh.label.split(' ')[0]}
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: "'Satoshi',sans-serif" }}>
        recalculated every 2 minutes
      </div>
    </div>
  )
}

function PrivacyIllustration({ accent }) {
  return (
    <div style={{ position: 'relative', width: 280, height: 270, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* orbit rings */}
      {[70, 100, 130].map((r, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: r * 2, height: r * 2,
          borderRadius: '50%',
          border: `1px solid rgba(45,212,191,${0.12 - i * 0.03})`,
          animation: `pulseRing ${3 + i}s ease-out ${i * 0.5}s infinite`,
        }} />
      ))}
      {/* center shield */}
      <div style={{
        width: 90, height: 90, borderRadius: '50%',
        background: 'rgba(45,212,191,0.12)',
        border: '2px solid rgba(45,212,191,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'shieldPulse 2.5s ease-in-out infinite',
        zIndex: 2,
      }}>
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <path d="M22 4L6 10v12c0 8.3 6.8 16 16 19 9.2-3 16-10.7 16-19V10L22 4z" fill="rgba(45,212,191,0.3)" stroke="#2dd4bf" strokeWidth="1.5"/>
          <rect x="16" y="20" width="12" height="10" rx="2" fill="#2dd4bf" opacity="0.8"/>
          <circle cx="22" cy="18" r="4" fill="none" stroke="#2dd4bf" strokeWidth="1.5"/>
        </svg>
      </div>
      {/* orbiting icons */}
      {[
        { icon: '📍', label: 'Location', delay: 0 },
        { icon: '🪪', label: 'Student ID', delay: '-2s' },
        { icon: '👁️', label: 'Visibility', delay: '-4s' },
      ].map((item, i) => (
        <div key={i} style={{
          position: 'absolute',
          animation: `orbitSpin ${8}s linear ${item.delay} infinite`,
          transformOrigin: 'center center',
        }}>
          <div style={{
            width: 46, height: 46, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(45,212,191,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
            animation: `orbitSpin ${8}s linear ${item.delay} infinite reverse`,
          }}>{item.icon}</div>
        </div>
      ))}
      {/* scan line */}
      <div style={{
        position: 'absolute', left: '15%', right: '15%', height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(45,212,191,0.6), transparent)',
        animation: 'scanLine 2.5s ease-in-out infinite',
      }} />
    </div>
  )
}

// ─── progress dots ────────────────────────────────────────────────────────────
function Dots({ total, active, accent }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          height: 6,
          width: i === active ? 28 : 6,
          borderRadius: 4,
          background: i === active ? accent : 'rgba(255,255,255,0.2)',
          transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
          animation: i === active ? `dotPulse 1.5s ease-in-out infinite` : 'none',
        }} />
      ))}
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────
export function OnboardingScreen({ onFinish }) {
  const [idx, setIdx] = useState(0)
  const [animKey, setAnimKey] = useState(0)
  const [dir, setDir] = useState(1)
  const timeoutRef = useRef(null)

  const slide = SLIDES[idx]

  function go(next) {
    if (next < 0 || next >= SLIDES.length) return
    setDir(next > idx ? 1 : -1)
    setAnimKey(k => k + 1)
    setIdx(next)
  }

  function finish() {
    onFinish?.()
  }

  const illustrationMap = {
    blocks: <BlocksIllustration accent={slide.accent} />,
    requests: <RequestsIllustration accent={slide.accent} />,
    heat: <HeatIllustration />,
    privacy: <PrivacyIllustration accent={slide.accent} />,
  }

  return (
    <>
      <style>{CSS}</style>
      <div style={{
        minHeight: '100dvh', width: '100%',
        background: 'linear-gradient(160deg, #0a0f1c 0%, #0d1324 50%, #080d18 100%)',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Satoshi', sans-serif",
        overflow: 'hidden', position: 'relative',
      }}>

        {/* ambient glow blob */}
        <div style={{
          position: 'absolute', top: '-10%', left: '20%',
          width: 320, height: 320, borderRadius: '50%',
          background: slide.accent + '14',
          filter: 'blur(80px)',
          transition: 'background 0.6s ease',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '5%', right: '-10%',
          width: 240, height: 240, borderRadius: '50%',
          background: slide.accent + '0e',
          filter: 'blur(60px)',
          transition: 'background 0.6s ease',
          pointerEvents: 'none',
        }} />

        {/* skip */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end',
          padding: 'calc(1.2rem + env(safe-area-inset-top)) 1.4rem 0',
          animation: 'fadeIn 0.6s ease both',
        }}>
          <button onClick={finish} style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 20, padding: '6px 16px',
            color: 'rgba(255,255,255,0.55)', fontSize: 13,
            cursor: 'pointer', fontFamily: "'Satoshi',sans-serif", fontWeight: 500,
            transition: 'all 0.2s',
          }}>Skip</button>
        </div>

        {/* illustration zone */}
        <div style={{
          flex: '0 0 auto', paddingTop: 24,
          animation: `slideDown 0.5s cubic-bezier(0.16,1,0.3,1) both`,
        }} key={animKey + 'ill'}>
          {illustrationMap[slide.id]}
        </div>

        {/* text zone */}
        <div
          key={animKey + 'txt'}
          style={{
            flex: 1, padding: '0 28px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            animation: `slideUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.05s both`,
          }}
        >
          <div style={{
            display: 'inline-block', marginBottom: 12,
            padding: '5px 13px', borderRadius: 20,
            background: slide.accentDim,
            border: `1px solid ${slide.accent}55`,
            fontSize: 11, fontWeight: 700,
            color: slide.accent, letterSpacing: '0.08em',
            textTransform: 'uppercase',
            animation: `popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.15s both`,
          }}>
            {slide.tag}
          </div>

          <h1 style={{
            fontFamily: "'Clash Display', sans-serif",
            fontSize: 'clamp(36px, 10vw, 52px)',
            fontWeight: 700, lineHeight: 1.08,
            color: '#fff',
            whiteSpace: 'pre-line',
            marginBottom: 16,
            animation: `slideUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both`,
          }}>
            {slide.title.split('\n').map((line, i) => (
              <span key={i} style={{ display: 'block' }}>
                {i === 1
                  ? <span style={{ color: slide.accent, transition: 'color 0.4s ease' }}>{line}</span>
                  : line}
              </span>
            ))}
          </h1>

          <p style={{
            fontSize: 15, lineHeight: 1.65,
            color: 'rgba(255,255,255,0.55)',
            maxWidth: 340,
            animation: `slideUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.18s both`,
          }}>
            {slide.body}
          </p>
        </div>

        {/* bottom nav */}
        <div style={{
          padding: '20px 28px calc(2rem + env(safe-area-inset-bottom))',
          display: 'flex', flexDirection: 'column', gap: 20,
          animation: 'slideUp 0.5s ease 0.25s both',
        }}>
          <Dots total={SLIDES.length} active={idx} accent={slide.accent} />

          <div style={{ display: 'flex', gap: 12 }}>
            {idx > 0 && (
              <button onClick={() => go(idx - 1)} style={{
                flex: 1, padding: '15px 0',
                borderRadius: 16, border: '1.5px solid rgba(255,255,255,0.14)',
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: 600,
                cursor: 'pointer', fontFamily: "'Satoshi',sans-serif",
                transition: 'all 0.2s',
              }}>Back</button>
            )}

            <button
              onClick={() => idx < SLIDES.length - 1 ? go(idx + 1) : finish()}
              style={{
                flex: idx > 0 ? 2 : 1,
                padding: '15px 0', borderRadius: 16, border: 'none',
                background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent}cc)`,
                backgroundSize: '200% 200%',
                color: '#fff', fontSize: 15, fontWeight: 700,
                cursor: 'pointer', fontFamily: "'Satoshi',sans-serif",
                boxShadow: `0 8px 28px ${slide.accent}55`,
                transition: 'all 0.35s ease',
                letterSpacing: '0.02em',
                animation: 'gradientShift 4s ease infinite',
              }}
            >
              {idx < SLIDES.length - 1 ? 'Continue →' : 'Get Started'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default OnboardingScreen
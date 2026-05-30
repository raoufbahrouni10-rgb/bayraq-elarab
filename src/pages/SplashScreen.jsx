import { useState, useEffect } from 'react'
import { getTheme } from '../lib/themes'

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState(0)
  // 0=logo zoom, 1=text fade, 2=exit
  const t = getTheme()

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800)
    const t2 = setTimeout(() => setPhase(2), 2500)
    const t3 = setTimeout(() => onDone(), 3200)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: `linear-gradient(160deg, ${t.bg||'#060d1a'} 0%, #0a1628 50%, #0d1f3c 100%)`,
        transition: phase===2 ? 'opacity 0.7s ease, transform 0.7s ease' : '',
        opacity: phase===2 ? 0 : 1,
        transform: phase===2 ? 'scale(1.05)' : 'scale(1)',
      }}>

      {/* خلفية ديناميكية */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0"
          style={{background:`radial-gradient(ellipse 80% 60% at 50% 40%, ${t.glow1||'rgba(14,144,224,0.12)'} 0%, transparent 70%)`}}></div>
        <div className="absolute inset-0"
          style={{background:`radial-gradient(ellipse 60% 40% at 80% 80%, ${t.glow2||'rgba(201,162,39,0.08)'} 0%, transparent 60%)`}}></div>
        {/* شبكة خفيفة */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{backgroundImage:'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize:'60px 60px'}}></div>
      </div>

      {/* المحتوى */}
      <div className="relative z-10 flex flex-col items-center gap-8">

        {/* الشعار */}
        <div
          style={{
            transform: phase===0 ? 'scale(0.3) rotate(-10deg)' : 'scale(1) rotate(0deg)',
            opacity: phase===0 ? 0 : 1,
            transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}>
          <div className="relative">
            {/* توهج خلف الشعار */}
            <div className="absolute inset-0 rounded-3xl blur-2xl opacity-40"
              style={{background:t.accent||'#0e90e0', transform:'scale(1.3)'}}></div>
            <div className="relative rounded-3xl p-6 shadow-2xl"
              style={{
                background:'rgba(255,255,255,0.97)',
                border:`3px solid ${t.accent||'#0e90e0'}40`,
                boxShadow:`0 20px 60px rgba(0,0,0,0.4), 0 0 40px ${t.glow1||'rgba(14,144,224,0.2)'}`
              }}>
              <img src="/logo.jpg" alt="بيرق العرب" className="h-28 w-auto object-contain" />
            </div>
          </div>
        </div>

        {/* النصوص */}
        <div className="text-center space-y-3"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s ease 0.2s',
          }}>
          <h1 className="text-4xl font-black text-white tracking-wide"
            style={{textShadow:'0 4px 20px rgba(0,0,0,0.5)'}}>
            بيرق العرب
          </h1>
          <p className="text-lg font-semibold" style={{color: t.accent||'#C9A227', textShadow:'0 2px 8px rgba(0,0,0,0.4)'}}>
            منصة التوظيف بالخارج
          </p>
          <p className="text-sm text-white/50 tracking-widest uppercase">
            BAYRAK ELARAB
          </p>
        </div>

        {/* مؤشر التحميل */}
        <div
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transition: 'opacity 0.5s ease 0.5s',
          }}>
          <div className="flex gap-2">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                style={{
                  background: t.accent||'#C9A227',
                  animationDelay:`${i*200}ms`,
                  opacity:0.8
                }}></div>
            ))}
          </div>
        </div>
      </div>

      {/* شريط ذهبي سفلي */}
      <div className="absolute bottom-0 left-0 right-0 h-1 transition-all duration-1000"
        style={{
          background:`linear-gradient(90deg, transparent, ${t.accent||'#C9A227'}, transparent)`,
          opacity: phase >= 1 ? 1 : 0,
        }}></div>

      {/* حقوق النشر */}
      <div className="absolute bottom-4 text-center text-xs text-white/20"
        style={{opacity: phase >= 1 ? 1 : 0, transition:'opacity 0.5s ease 0.8s'}}>
        © 2025 بيرق العرب للتوظيف بالخارج
      </div>
    </div>
  )
}

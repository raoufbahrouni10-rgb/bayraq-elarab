import { useState } from 'react'
import { getTheme, saveTheme } from '../lib/themes'
import { ALL_THEMES as THEMES } from './ThemesPage'

// صور الخلفية لكل ثيم
const THEME_IMAGES = {
  ocean:   'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=90&auto=format&fit=crop',
  gold:    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=90&auto=format&fit=crop',
  emerald: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1920&q=90&auto=format&fit=crop',
  purple:  'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1920&q=90&auto=format&fit=crop',
  rose:    'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1920&q=90&auto=format&fit=crop',
  silver:  'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=1920&q=90&auto=format&fit=crop',
}

// تدرج كل ثيم
const THEME_OVERLAYS = {
  ocean:   'linear-gradient(160deg, rgba(6,13,26,0.88) 0%, rgba(14,144,224,0.3) 100%)',
  gold:    'linear-gradient(160deg, rgba(13,10,0,0.88) 0%, rgba(201,162,39,0.35) 100%)',
  emerald: 'linear-gradient(160deg, rgba(0,18,10,0.88) 0%, rgba(16,185,129,0.3) 100%)',
  purple:  'linear-gradient(160deg, rgba(13,0,20,0.88) 0%, rgba(139,92,246,0.35) 100%)',
  rose:    'linear-gradient(160deg, rgba(20,0,8,0.88) 0%, rgba(244,63,94,0.3) 100%)',
  silver:  'linear-gradient(160deg, rgba(10,10,15,0.88) 0%, rgba(148,163,184,0.25) 100%)',
}

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showThemes, setShowThemes] = useState(false)
  const [activeTheme, setActiveTheme] = useState(() => getTheme())
  const [designerClicks, setDesignerClicks] = useState(0)
  const [pin, setPin]                       = useState('')
  const [pinError, setPinError]             = useState('')
  const [showDesignerLogin, setShowDesignerLogin] = useState(false)
  const [designerCIN, setDesignerCIN]       = useState('')
  const [designerPass, setDesignerPass]     = useState('')
  const [showDesignerPass, setShowDesignerPass] = useState(false)
  const DESIGNER_CIN                        = '07131984'
  const DESIGNER_PASSWORD                   = 'Aa12345@'

  const handleLogoClick = () => {
    setDesignerClicks(p => {
      const next = p + 1
      if (next >= 5) { setShowDesignerLogin(true); return 0 }
      return next
    })
    setTimeout(() => setDesignerClicks(0), 3000)
  }

  const handleDesignerLogin = () => {
    setPinError('')
    if (designerCIN === DESIGNER_CIN && designerPass === DESIGNER_PASSWORD) {
      setUsername('raouf')
      setPassword('RaoufBayraq2025@')
      setShowDesignerLogin(false)
      setDesignerCIN('')
      setDesignerPass('')
      setTimeout(() => handleLogin(), 150)
    } else {
      setPinError('بيانات غير صحيحة')
    }
  }

  const handlePin = (k) => {
    setPinError('')
    if (k === '⌫') { setPin(p => p.slice(0,-1)); return }
    if (k === '✓') { return }
    if (pin.length < 6) setPin(p => p + k)
  }

  const handleLogin = async () => {
    if (!username || !password) { setError('يرجى إدخال الاسم وكلمة المرور'); return }
    setLoading(true); setError('')
    await new Promise(r => setTimeout(r, 700))
    const result = onLogin(username, password)
    if (!result.success) setError(result.error)
    setLoading(false)
  }

  const applyTheme = (theme) => {
    setActiveTheme(theme)
    saveTheme(theme)
    setShowThemes(false)
  }

  const t = activeTheme
  const bgImage = THEME_IMAGES[t.id] || THEME_IMAGES.ocean
  const overlay = THEME_OVERLAYS[t.id] || THEME_OVERLAYS.ocean
  const btnColor = t.btnFrom || '#1B3A6B'
  const btnColor2 = t.btnTo || '#0D2447'

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden" dir="rtl">

      {/* ===== نافذة دخول المصمم السرية ===== */}
      {showDesignerLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{background:'rgba(0,0,0,0.85)', backdropFilter:'blur(10px)'}}>
          <div className="w-full max-w-sm rounded-3xl p-7 space-y-5"
            style={{background:'rgba(255,255,255,0.98)', boxShadow:'0 25px 60px rgba(0,0,0,0.4)'}}>
            <div className="text-center space-y-1">
              <div className="text-3xl mb-2">⭐</div>
              <div className="text-lg font-black" style={{color:'#1B3A6B'}}>دخول المصمم</div>
              <div className="text-xs" style={{color:'#9CA3AF'}}>بيرق العرب — منطقة خاصة</div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{color:'#374151'}}>
                  🪪 رقم بطاقة التعريف
                </label>
                <input
                  type="text"
                  value={designerCIN}
                  onChange={e => setDesignerCIN(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && handleDesignerLogin()}
                  placeholder="أدخل رقم بطاقة التعريف..."
                  className="w-full px-4 py-3 rounded-2xl text-sm outline-none font-mono"
                  style={{background:'#F8FAFC', border:'2px solid #E2E8F0', color:'#111827'}}
                  onFocus={e => { e.target.style.borderColor='#C9A227'; e.target.style.boxShadow='0 0 0 3px rgba(201,162,39,0.15)' }}
                  onBlur={e => { e.target.style.borderColor='#E2E8F0'; e.target.style.boxShadow='none' }}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{color:'#374151'}}>
                  🔑 كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showDesignerPass ? 'text' : 'password'}
                    value={designerPass}
                    onChange={e => setDesignerPass(e.target.value)}
                    onKeyDown={e => e.key==='Enter' && handleDesignerLogin()}
                    placeholder="أدخل كلمة المرور..."
                    className="w-full px-4 py-3 rounded-2xl text-sm outline-none pl-12"
                    style={{background:'#F8FAFC', border:'2px solid #E2E8F0', color:'#111827'}}
                    onFocus={e => { e.target.style.borderColor='#C9A227'; e.target.style.boxShadow='0 0 0 3px rgba(201,162,39,0.15)' }}
                    onBlur={e => { e.target.style.borderColor='#E2E8F0'; e.target.style.boxShadow='none' }}
                  />
                  <button onClick={() => setShowDesignerPass(!showDesignerPass)}
                    className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'#9CA3AF'}}>
                    {showDesignerPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>
            {pinError && (
              <div className="rounded-xl p-3 text-xs text-center"
                style={{background:'#FEF2F2', border:'1px solid #FECACA', color:'#DC2626'}}>
                ⚠️ {pinError}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={handleDesignerLogin}
                className="flex-1 py-3 rounded-2xl font-bold text-white text-sm transition-all hover:-translate-y-0.5"
                style={{background:'linear-gradient(135deg,#C9A227,#8b6914)', boxShadow:'0 4px 15px rgba(201,162,39,0.3)'}}>
                ⭐ دخول المصمم
              </button>
              <button onClick={() => { setShowDesignerLogin(false); setPinError(''); setDesignerCIN(''); setDesignerPass('') }}
                className="px-4 rounded-2xl text-sm border"
                style={{borderColor:'#E2E8F0', color:'#6B7280'}}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== صورة الخلفية تتغير مع الثيم ===== */}
      <div className="absolute inset-0 z-0 transition-all duration-700">
        <img
          key={t.id}
          src={bgImage}
          alt="خلفية"
          className="w-full h-full object-cover"
          style={{objectPosition:'center 40%'}}
          onError={e => e.target.style.display='none'}
        />
        <div className="absolute inset-0 transition-all duration-700" style={{background:overlay}}></div>
        {/* توهج ملوّن حسب الثيم */}
        <div className="absolute inset-0 transition-all duration-700"
          style={{background:`radial-gradient(ellipse 60% 60% at 70% 50%, ${t.glow1||'rgba(14,144,224,0.15)'} 0%, transparent 70%)`}}></div>
      </div>

      {/* ===== زر تغيير المظهر ===== */}
      <div className="absolute top-5 left-5 z-30">
        <button onClick={() => setShowThemes(!showThemes)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5"
          style={{
            background:'rgba(255,255,255,0.18)',
            border:'1px solid rgba(255,255,255,0.35)',
            color:'white',
            backdropFilter:'blur(12px)',
            boxShadow:'0 4px 15px rgba(0,0,0,0.2)'
          }}>
          🎨 <span>تغيير المظهر</span>
        </button>

        {showThemes && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowThemes(false)}></div>
            <div className="absolute top-13 left-0 w-56 rounded-2xl p-3 space-y-1 z-50 mt-1"
              style={{
                background:'rgba(255,255,255,0.97)',
                border:'1px solid rgba(0,0,0,0.08)',
                backdropFilter:'blur(20px)',
                boxShadow:'0 10px 40px rgba(0,0,0,0.25)'
              }}>
              <div className="text-xs font-semibold px-2 pb-2 border-b mb-1.5" style={{color:'#6B7280'}}>
                🎨 اختر مظهر المنصة
              </div>
              {THEMES.map(theme => (
                <button key={theme.id} onClick={() => applyTheme(theme)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                  style={{
                    background: t.id===theme.id ? `${theme.accent}15` : 'transparent',
                    border: t.id===theme.id ? `1px solid ${theme.accent}40` : '1px solid transparent'
                  }}
                  onMouseEnter={e => { if(t.id!==theme.id) e.currentTarget.style.background='#F9FAFB' }}
                  onMouseLeave={e => { if(t.id!==theme.id) e.currentTarget.style.background='transparent' }}>
                  {/* دوائر الألوان */}
                  <div className="flex gap-1 flex-shrink-0">
                    {theme.preview.map((c,i) => (
                      <div key={i} className="w-4 h-4 rounded-full shadow-sm"
                        style={{background:c, border:'1px solid rgba(0,0,0,0.1)'}}></div>
                    ))}
                  </div>
                  <span className="text-sm flex-1 text-right font-medium" style={{color:'#374151'}}>
                    {theme.name}
                  </span>
                  {t.id===theme.id && (
                    <span className="text-sm font-bold" style={{color:theme.accent}}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ===== المحتوى المركزي ===== */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-lg space-y-5">

          {/* الشعار */}
          <div className="text-center space-y-3">
            <div className="inline-block">
              <div className="rounded-2xl px-12 py-5 shadow-2xl mx-auto transition-all duration-500"
                style={{
                  background:'rgba(255,255,255,0.97)',
                  border:`2px solid ${t.accent}40`,
                  boxShadow:`0 8px 30px rgba(0,0,0,0.2), 0 0 20px ${t.glow1||'rgba(14,144,224,0.15)'}`
                }}>
                <img src="/logo.jpg" alt="بيرق العرب" className="h-20 object-contain mx-auto cursor-pointer select-none" onClick={handleLogoClick} />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white mb-1" style={{textShadow:'0 2px 10px rgba(0,0,0,0.5)'}}>
                بيرق العرب
              </h1>
              <p className="text-base font-semibold transition-colors duration-500" style={{color: t.id==='gold'?'#E8C44A': t.id==='silver'?'#CBD5E1': t.accent, textShadow:'0 1px 4px rgba(0,0,0,0.4)'}}>
                منصة التوظيف بالخارج
              </p>
            </div>
          </div>

          {/* نموذج الدخول */}
          <div className="rounded-3xl p-8 space-y-5 transition-all duration-500"
            style={{
              background:'rgba(255,255,255,0.97)',
              backdropFilter:'blur(20px)',
              boxShadow:`0 25px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.5)`,
              border:`1px solid ${t.accent}20`
            }}>

            <div className="text-center mb-1">
              <h2 className="text-xl font-bold transition-colors duration-500" style={{color: btnColor}}>
                تسجيل الدخول
              </h2>
              <p className="text-sm mt-1" style={{color:'#9CA3AF'}}>أدخل بيانات حسابك للمتابعة</p>
            </div>

            {/* حقل اسم المستخدم */}
            <div className="space-y-2">
              <label className="text-sm font-semibold block" style={{color:'#374151'}}>👤 الاسم</label>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key==='Enter' && handleLogin()}
                placeholder="أدخل اسمك..."
                autoFocus
                className="w-full px-5 py-4 rounded-2xl outline-none transition-all"
                style={{background:'#F8FAFC', border:'2px solid #E2E8F0', color:'#111827', fontSize:'16px'}}
                onFocus={e => { e.target.style.borderColor = t.accent; e.target.style.background='#fff'; e.target.style.boxShadow=`0 0 0 3px ${t.accent}20` }}
                onBlur={e => { e.target.style.borderColor='#E2E8F0'; e.target.style.background='#F8FAFC'; e.target.style.boxShadow='none' }}
              />
            </div>

            {/* حقل كلمة المرور */}
            <div className="space-y-2">
              <label className="text-sm font-semibold block" style={{color:'#374151'}}>🔑 كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && handleLogin()}
                  placeholder="أدخل كلمة المرور..."
                  className="w-full px-5 py-4 rounded-2xl outline-none transition-all pl-14"
                  style={{background:'#F8FAFC', border:'2px solid #E2E8F0', color:'#111827', fontSize:'16px'}}
                  onFocus={e => { e.target.style.borderColor=t.accent; e.target.style.background='#fff'; e.target.style.boxShadow=`0 0 0 3px ${t.accent}20` }}
                  onBlur={e => { e.target.style.borderColor='#E2E8F0'; e.target.style.background='#F8FAFC'; e.target.style.boxShadow='none' }}
                />
                <button onClick={() => setShowPass(!showPass)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-xl" style={{color:'#9CA3AF'}}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl p-4 text-sm flex items-center gap-3"
                style={{background:'#FEF2F2', border:'2px solid #FECACA', color:'#DC2626'}}>
                <span className="text-xl">⚠️</span><span>{error}</span>
              </div>
            )}

            {/* زر الدخول — يتغير لون حسب الثيم */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-4 rounded-2xl font-black text-white text-lg disabled:opacity-50 flex items-center justify-center gap-3 transition-all duration-500 hover:-translate-y-1 active:translate-y-0"
              style={{
                background:`linear-gradient(135deg, ${btnColor} 0%, ${btnColor2} 100%)`,
                boxShadow:`0 8px 25px ${t.accent}50`,
                fontSize:'18px'
              }}>
              {loading
                ? <><span className="animate-spin inline-block text-2xl">⟳</span> جارٍ التحقق...</>
                : <><span className="text-2xl">🔐</span> دخول إلى المنصة</>
              }
            </button>


          </div>

          {/* معلومات الاتصال */}
          <div className="rounded-2xl p-4 text-center space-y-2"
            style={{background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', backdropFilter:'blur(8px)'}}>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <a href="tel:+21652332223" className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white">
                <span>📞</span>
                <span className="font-mono" dir="ltr">(+216) 52 332 223 / 98 656 680 / 54 894 111</span>
              </a>
            </div>
            <div className="flex items-center justify-center gap-4">
              <a href="https://wa.me/21698656680" target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-sm font-mono" style={{color:'#4ADE80'}}>
                <span>💬</span><span dir="ltr">98 656 680</span>
              </a>
              <span className="text-white/20">|</span>
              <a href="mailto:bayrakdirection@gmail.com" className="text-sm text-white/60">
                📧 bayrakdirection@gmail.com
              </a>
            </div>
            <div className="text-xs text-white/40">📍 17 Rue de Marseille, Tunis 1002</div>
          </div>
        </div>
      </div>

      {/* الفوتر */}
      <div className="relative z-10 text-center py-3 text-xs text-white/30">
        © 2025 بيرق العرب للتوظيف بالخارج — تصميم رؤوف بحروني
      </div>
      <div className="h-1 w-full relative z-10 transition-all duration-500"
        style={{background:`linear-gradient(90deg, transparent, ${t.accent}, ${t.btnFrom||t.accent}, ${t.accent}, transparent)`}}></div>
    </div>
  )
}

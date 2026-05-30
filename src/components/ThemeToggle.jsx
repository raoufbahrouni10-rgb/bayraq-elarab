import { useState, useEffect } from 'react'
import { getTheme, saveTheme } from '../lib/themes'
import { ALL_THEMES as THEMES } from '../pages/ThemesPage'

// تطبيق الثيم على كامل المنصة
export function applyThemeToDOM(theme) {
  if (!theme) return
  const root = document.documentElement
  root.style.setProperty('--accent', theme.accent)
  root.style.setProperty('--accent-glow', theme.glow1 || 'rgba(14,144,224,0.15)')
  root.style.setProperty('--bg-primary', theme.bg || '#060d1a')
  root.style.setProperty('--btn-from', theme.btnFrom || theme.accent)
  root.style.setProperty('--btn-to', theme.btnTo || theme.accent)
  // تطبيق على body
  document.body.style.background = `linear-gradient(160deg, ${theme.bg||'#060d1a'} 0%, ${theme.preview?.[2]||'#0a1628'} 100%)`
}

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const t = getTheme()
    return THEMES.find(th => th.id === t.id) || THEMES[0]
  })

  useEffect(() => {
    applyThemeToDOM(currentTheme)
  }, [currentTheme])

  // تطبيق فوري عند التحميل
  useEffect(() => {
    const saved = getTheme()
    const theme = THEMES.find(t => t.id === saved.id) || THEMES[0]
    applyThemeToDOM(theme)
    setCurrentTheme(theme)
  }, [])

  const applyTheme = (theme) => {
    const full = THEMES.find(t => t.id === theme.id) || theme
    setCurrentTheme(full)
    saveTheme(full)
    applyThemeToDOM(full)
  }

  return { currentTheme, applyTheme, themes: THEMES, isDark: true, toggleTheme: () => {} }
}

export default function ThemeToggle({ currentTheme, applyTheme, themes }) {
  const [open, setOpen] = useState(false)
  const t = currentTheme || THEMES[0]

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-gray-400 hover:text-white text-sm"
        title="تغيير المظهر">
        🎨
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>
          <div className="absolute left-0 top-10 w-56 rounded-2xl p-3 space-y-1 z-50 animate-scale-in"
            style={{background:'rgba(10,15,30,0.97)', border:'1px solid rgba(255,255,255,0.1)', backdropFilter:'blur(20px)', boxShadow:'0 10px 40px rgba(0,0,0,0.4)'}}>
            <div className="text-xs text-gray-500 px-2 pb-1.5 border-b border-white/5 mb-1.5 font-semibold">
              🎨 ثيم المنصة
            </div>
            <div className="max-h-64 overflow-y-auto space-y-0.5">
              {(themes||THEMES).map(theme => (
                <button key={theme.id} onClick={() => { applyTheme(theme); setOpen(false) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-right transition-all"
                  style={{
                    background: t.id===theme.id ? `${theme.accent}20` : 'transparent',
                    border: t.id===theme.id ? `1px solid ${theme.accent}30` : '1px solid transparent'
                  }}
                  onMouseEnter={e => { if(t.id!==theme.id) e.currentTarget.style.background='rgba(255,255,255,0.05)' }}
                  onMouseLeave={e => { if(t.id!==theme.id) e.currentTarget.style.background='transparent' }}>
                  <div className="flex gap-0.5 flex-shrink-0">
                    {(theme.preview||[]).map((c,i) => (
                      <div key={i} className="w-3.5 h-3.5 rounded-full" style={{background:c, border:'1px solid rgba(255,255,255,0.15)'}}></div>
                    ))}
                  </div>
                  <span className="text-xs text-gray-300 flex-1">{theme.name}</span>
                  {t.id===theme.id && <span className="text-xs" style={{color:theme.accent}}>✓</span>}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

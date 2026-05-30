import { useState } from 'react'
import { saveTheme, getTheme } from '../lib/themes'
import { applyThemeToDOM } from '../components/ThemeToggle'

// ===== ستايلات إضافية جديدة =====
const EXTRA_THEMES = [
  {
    id:'navy-gold',
    name:'الكحلي الذهبي',
    desc:'ألوان بيرق العرب الرسمية',
    badge:'⭐ رسمي',
    bg:'#0a0f1a',
    accent:'#C9A227',
    glow1:'rgba(201,162,39,0.15)',
    glow2:'rgba(27,58,107,0.2)',
    btnFrom:'#1B3A6B',
    btnTo:'#0D2447',
    preview:['#0a0f1a','#1B3A6B','#C9A227'],
    sidebar:'rgba(6,10,20,0.95)',
    card:'rgba(27,58,107,0.15)',
  },
  {
    id:'ocean',
    name:'المحيط الأزرق',
    desc:'أزرق هادئ واحترافي',
    badge:'🌊 كلاسيكي',
    bg:'#060d1a',
    accent:'#0e90e0',
    glow1:'rgba(14,144,224,0.15)',
    glow2:'rgba(6,182,212,0.1)',
    btnFrom:'#0e90e0',
    btnTo:'#0560a8',
    preview:['#060d1a','#0e90e0','#0a1628'],
    sidebar:'rgba(4,9,18,0.95)',
    card:'rgba(14,144,224,0.08)',
  },
  {
    id:'gold',
    name:'الذهب الملكي',
    desc:'فخامة ورقي',
    badge:'👑 فاخر',
    bg:'#0d0a00',
    accent:'#c9a227',
    glow1:'rgba(201,162,39,0.15)',
    glow2:'rgba(180,140,20,0.1)',
    btnFrom:'#c9a227',
    btnTo:'#8b6914',
    preview:['#0d0a00','#c9a227','#1a1200'],
    sidebar:'rgba(8,6,0,0.95)',
    card:'rgba(201,162,39,0.08)',
  },
  {
    id:'emerald',
    name:'الزمرد الأخضر',
    desc:'نضارة وحيوية',
    badge:'💚 منعش',
    bg:'#00120a',
    accent:'#10b981',
    glow1:'rgba(16,185,129,0.15)',
    glow2:'rgba(5,150,105,0.1)',
    btnFrom:'#10b981',
    btnTo:'#047857',
    preview:['#00120a','#10b981','#001a0f'],
    sidebar:'rgba(0,8,4,0.95)',
    card:'rgba(16,185,129,0.08)',
  },
  {
    id:'purple',
    name:'البنفسجي الملكي',
    desc:'إبداع وتميز',
    badge:'💜 مميز',
    bg:'#0d0014',
    accent:'#8b5cf6',
    glow1:'rgba(139,92,246,0.15)',
    glow2:'rgba(124,58,237,0.1)',
    btnFrom:'#8b5cf6',
    btnTo:'#6d28d9',
    preview:['#0d0014','#8b5cf6','#140020'],
    sidebar:'rgba(8,0,10,0.95)',
    card:'rgba(139,92,246,0.08)',
  },
  {
    id:'rose',
    name:'الوردي الفاخر',
    desc:'أناقة وجمال',
    badge:'🌸 أنيق',
    bg:'#140008',
    accent:'#f43f5e',
    glow1:'rgba(244,63,94,0.15)',
    glow2:'rgba(225,29,72,0.1)',
    btnFrom:'#f43f5e',
    btnTo:'#be123c',
    preview:['#140008','#f43f5e','#1a000f'],
    sidebar:'rgba(10,0,4,0.95)',
    card:'rgba(244,63,94,0.08)',
  },
  {
    id:'silver',
    name:'الفضي الكلاسيكي',
    desc:'بساطة وأناقة',
    badge:'🔘 كلاسيك',
    bg:'#0a0a0f',
    accent:'#94a3b8',
    glow1:'rgba(148,163,184,0.15)',
    glow2:'rgba(100,116,139,0.1)',
    btnFrom:'#475569',
    btnTo:'#1e293b',
    preview:['#0a0a0f','#94a3b8','#12121a'],
    sidebar:'rgba(6,6,10,0.95)',
    card:'rgba(148,163,184,0.06)',
  },
  {
    id:'sunset',
    name:'غروب الشمس',
    desc:'دافئ وجذاب',
    badge:'🌅 دافئ',
    bg:'#0f0800',
    accent:'#f97316',
    glow1:'rgba(249,115,22,0.15)',
    glow2:'rgba(234,88,12,0.1)',
    btnFrom:'#f97316',
    btnTo:'#c2410c',
    preview:['#0f0800','#f97316','#1a0e00'],
    sidebar:'rgba(10,5,0,0.95)',
    card:'rgba(249,115,22,0.08)',
  },
  {
    id:'midnight',
    name:'منتصف الليل',
    desc:'غامق وعميق',
    badge:'🌙 داكن',
    bg:'#020209',
    accent:'#6366f1',
    glow1:'rgba(99,102,241,0.15)',
    glow2:'rgba(79,70,229,0.1)',
    btnFrom:'#6366f1',
    btnTo:'#4338ca',
    preview:['#020209','#6366f1','#05051a'],
    sidebar:'rgba(2,2,8,0.98)',
    card:'rgba(99,102,241,0.08)',
  },
  {
    id:'arctic',
    name:'القطب الشمالي',
    desc:'برودة وصفاء',
    badge:'❄️ بارد',
    bg:'#020c14',
    accent:'#38bdf8',
    glow1:'rgba(56,189,248,0.15)',
    glow2:'rgba(14,165,233,0.1)',
    btnFrom:'#38bdf8',
    btnTo:'#0284c7',
    preview:['#020c14','#38bdf8','#051020'],
    sidebar:'rgba(2,8,12,0.96)',
    card:'rgba(56,189,248,0.08)',
  },
  {
    id:'forest',
    name:'الغابة الخضراء',
    desc:'طبيعة وهدوء',
    badge:'🌲 طبيعي',
    bg:'#040d06',
    accent:'#22c55e',
    glow1:'rgba(34,197,94,0.15)',
    glow2:'rgba(21,128,61,0.1)',
    btnFrom:'#22c55e',
    btnTo:'#15803d',
    preview:['#040d06','#22c55e','#081408'],
    sidebar:'rgba(3,8,4,0.96)',
    card:'rgba(34,197,94,0.08)',
  },
  {
    id:'crimson',
    name:'القرمزي الجريء',
    desc:'قوة وجرأة',
    badge:'🔴 جريء',
    bg:'#0f0205',
    accent:'#dc2626',
    glow1:'rgba(220,38,38,0.15)',
    glow2:'rgba(185,28,28,0.1)',
    btnFrom:'#dc2626',
    btnTo:'#991b1b',
    preview:['#0f0205','#dc2626','#1a0308'],
    sidebar:'rgba(10,1,3,0.96)',
    card:'rgba(220,38,38,0.08)',
  },
]

// دمج الثيمات
const ALL_THEMES = EXTRA_THEMES

export { ALL_THEMES }

export default function ThemesPage({ currentUser }) {
  const [current, setCurrent] = useState(() => getTheme().id || 'ocean')
  const [preview, setPreview] = useState(null)
  const [applied, setApplied] = useState(null)

  const isSuperAdmin = currentUser?.role === 'super_admin'

  const applyTheme = (theme) => {
    saveTheme(theme)
    setCurrent(theme.id)
    setApplied(theme.id)
    applyThemeToDOM(theme)
    setTimeout(() => setApplied(null), 2000)
  }

  const hovered = preview ? ALL_THEMES.find(t=>t.id===preview) : null

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white mb-0.5">🎨 مظهر المنصة</h1>
          <p className="text-gray-400 text-sm">{ALL_THEMES.length} ستايل متاح — اختر ما يناسبك</p>
        </div>
        {/* معاينة الثيم الحالي */}
        <div className="flex items-center gap-2 glass px-3 py-2 rounded-xl border border-white/10">
          <div className="flex gap-1">
            {(ALL_THEMES.find(t=>t.id===current)||ALL_THEMES[0]).preview.map((c,i)=>(
              <div key={i} className="w-4 h-4 rounded-full border border-white/20" style={{background:c}}></div>
            ))}
          </div>
          <span className="text-xs text-gray-300">
            {(ALL_THEMES.find(t=>t.id===current)||ALL_THEMES[0]).name}
          </span>
          <span className="text-xs text-gray-500">— نشط</span>
        </div>
      </div>

      {!isSuperAdmin && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-300 flex items-center gap-2">
          <span>⚠️</span>
          <span>تغيير الثيم يُطبَّق على جهازك فقط — مصمم البرنامج يمكنه تطبيقه على الجميع</span>
        </div>
      )}

      {/* شبكة الثيمات */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {ALL_THEMES.map(theme => (
          <div key={theme.id}
            onMouseEnter={() => setPreview(theme.id)}
            onMouseLeave={() => setPreview(null)}
            className="relative rounded-2xl overflow-hidden cursor-pointer transition-all hover:-translate-y-1"
            style={{
              border: current===theme.id ? `2px solid ${theme.accent}` : '2px solid rgba(255,255,255,0.08)',
              boxShadow: current===theme.id ? `0 8px 25px ${theme.glow1}` : '',
              transform: preview===theme.id && current!==theme.id ? 'translateY(-4px)' : '',
            }}>

            {/* معاينة الثيم */}
            <div className="h-28 relative" style={{background:theme.bg}}>
              {/* خلفية الثيم */}
              <div className="absolute inset-0"
                style={{background:`radial-gradient(ellipse 80% 60% at 50% 50%, ${theme.glow1} 0%, transparent 70%)`}}></div>

              {/* محاكاة الـ Sidebar */}
              <div className="absolute right-0 top-0 bottom-0 w-14"
                style={{background:theme.sidebar||'rgba(0,0,0,0.6)'}}>
                {[1,2,3,4].map(i=>(
                  <div key={i} className="mx-1.5 my-1.5 h-2.5 rounded-md"
                    style={{background: i===1 ? theme.accent : 'rgba(255,255,255,0.1)', opacity:0.8}}></div>
                ))}
              </div>

              {/* محاكاة المحتوى */}
              <div className="absolute left-2 top-2 right-16 space-y-1.5">
                <div className="h-3 rounded-md w-3/4" style={{background:`${theme.accent}40`}}></div>
                <div className="h-2 rounded-md w-1/2" style={{background:'rgba(255,255,255,0.1)'}}></div>
                <div className="grid grid-cols-2 gap-1 mt-2">
                  {[1,2,3,4].map(i=>(
                    <div key={i} className="h-6 rounded-lg"
                      style={{background:theme.card||'rgba(255,255,255,0.05)', border:`1px solid ${theme.accent}20`}}></div>
                  ))}
                </div>
                <div className="h-5 rounded-lg mt-1"
                  style={{background:`linear-gradient(135deg, ${theme.btnFrom}, ${theme.btnTo})`, opacity:0.8}}></div>
              </div>

              {/* شارة الثيم */}
              <div className="absolute top-2 left-2 text-xs px-1.5 py-0.5 rounded-lg font-medium"
                style={{background:'rgba(0,0,0,0.5)', color:theme.accent, fontSize:'9px'}}>
                {theme.badge}
              </div>

              {/* علامة النشط */}
              {current===theme.id && (
                <div className="absolute bottom-2 left-2 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{background:theme.accent}}>
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>

            {/* معلومات الثيم */}
            <div className="p-3 space-y-2"
              style={{background:'rgba(255,255,255,0.04)'}}>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {theme.preview.map((c,i)=>(
                    <div key={i} className="w-3 h-3 rounded-full border border-white/10" style={{background:c}}></div>
                  ))}
                </div>
                <span className="text-xs font-semibold text-white">{theme.name}</span>
              </div>
              <div className="text-xs text-gray-500">{theme.desc}</div>
              <button
                onClick={() => applyTheme(theme)}
                className="w-full py-1.5 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5"
                style={{
                  background: current===theme.id
                    ? `${theme.accent}20`
                    : `linear-gradient(135deg, ${theme.btnFrom}, ${theme.btnTo})`,
                  color: current===theme.id ? theme.accent : 'white',
                  border: current===theme.id ? `1px solid ${theme.accent}40` : 'none',
                  boxShadow: current!==theme.id ? `0 3px 10px ${theme.glow1}` : '',
                }}>
                {applied===theme.id ? '✅ تم التطبيق!' : current===theme.id ? '✓ نشط' : 'تطبيق'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ملاحظة */}
      <div className="glass rounded-xl p-4 border border-white/5 text-xs text-gray-500 text-center">
        الثيم المختار يُحفظ تلقائياً على جهازك ويظهر في كل مرة تفتح المنصة 💾
      </div>
    </div>
  )
}

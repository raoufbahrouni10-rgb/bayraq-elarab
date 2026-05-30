import { useState, useEffect, useCallback } from 'react'

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

export function PWAInstallBanner() {
  const [show, setShow] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); setShow(true) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])
  if (!show) return null
  return (
    <div className="fixed bottom-20 left-3 right-3 z-50 rounded-2xl p-3 flex items-center gap-3 shadow-2xl"
      style={{background:'rgba(27,58,107,0.97)', border:'1px solid rgba(201,162,39,0.4)'}}>
      <img src="/logo.jpg" className="h-9 w-9 rounded-xl object-contain" alt="logo" onError={e=>e.target.style.display='none'} />
      <div className="flex-1 min-w-0">
        <div className="text-white font-bold text-xs">تثبيت بيرق العرب</div>
        <div className="text-xs text-blue-200">أضفه كتطبيق</div>
      </div>
      <button onClick={() => setShow(false)} className="text-white/40 px-2 text-sm">لاحقاً</button>
      <button onClick={async () => { if(deferredPrompt) { deferredPrompt.prompt(); setShow(false) } }}
        className="text-xs px-3 py-1.5 rounded-lg text-white font-semibold"
        style={{background:'linear-gradient(135deg,#C9A227,#8b6914)'}}>تثبيت</button>
    </div>
  )
}

// الأقسام الرئيسية للتنقل السريع
const QUICK_NAV = [
  { key:'dashboard',  icon:'📊', label:'الرئيسية' },
  { key:'database',   icon:'🗂️', label:'السير' },
  { key:'tracking',   icon:'📋', label:'الملفات' },
  { key:'finance',    icon:'💰', label:'المال' },
]

// كل الأقسام مقسّمة بمجموعات
const ALL_GROUPS = [
  {
    label:'📊 لوحة التحكم',
    items:[
      { key:'dashboard',   icon:'📊', label:'الرئيسية' },
      { key:'advdash',     icon:'📈', label:'إحصاءات' },
      { key:'tvmode',      icon:'📺', label:'شاشة مباشرة' },
      { key:'reminders',   icon:'🔔', label:'التذكيرات' },
      { key:'globalsearch',icon:'🔍', label:'البحث الموحد' },
    ]
  },
  {
    label:'👤 المترشحون',
    items:[
      { key:'database',    icon:'🗂️', label:'قاعدة البيانات',  perm:'database' },
      { key:'upload',      icon:'🤖', label:'رفع وتحليل',       perm:'upload' },
      { key:'import',      icon:'📥', label:'استيراد',          perm:'upload' },
      { key:'wareg',       icon:'💬', label:'تسجيل واتساب',    perm:'upload' },
      { key:'cards',       icon:'🪪', label:'البطاقات',         perm:'database' },
      { key:'ratings',     icon:'⭐', label:'التقييم',          perm:'database' },
    ]
  },
  {
    label:'💼 التوظيف',
    items:[
      { key:'tracking',    icon:'📋', label:'متابعة الملفات',  perm:'tracking' },
      { key:'employers',   icon:'🏢', label:'المشغّلون',       perm:'employers' },
      { key:'gulf',        icon:'🌍', label:'عروض الخليج',     perm:'gulf' },
      { key:'smartmatch',  icon:'🎯', label:'المطابقة',        perm:'employers' },
      { key:'visa',        icon:'🛂', label:'التأشيرات',       perm:'tracking' },
      { key:'archive',     icon:'🗄️', label:'الأرشيف',         perm:'tracking' },
      { key:'calendar',    icon:'📅', label:'التقويم',         perm:'tracking' },
    ]
  },
  {
    label:'💰 المالية',
    items:[
      { key:'finance',     icon:'💰', label:'المداخيل',        perm:'finance' },
      { key:'invoices',    icon:'🧾', label:'الفواتير',        perm:'finance' },
      { key:'contracts',   icon:'📄', label:'العقود',          perm:'finance' },
      { key:'fees',        icon:'💳', label:'رسوم الاستقدام',  perm:'finance' },
      { key:'reports',     icon:'📈', label:'التقارير',        perm:'reports' },
    ]
  },
  {
    label:'🔧 الأدوات',
    items:[
      { key:'messages',    icon:'📧', label:'الرسائل',         perm:'tracking' },
      { key:'bulkwa',      icon:'📤', label:'واتساب جماعي',    perm:'tracking' },
      { key:'qrcodes',     icon:'📲', label:'QR Code',         perm:'upload' },
      { key:'backup',      icon:'💾', label:'نسخ احتياطي',    perm:'export' },
      { key:'export',      icon:'📤', label:'تصدير',           perm:'export' },
    ]
  },
  {
    label:'⚙️ الإعدادات',
    items:[
      { key:'themes',      icon:'🎨', label:'المظهر',          perm:'all' },
      { key:'profile',     icon:'👤', label:'حسابي',           perm:'all' },
      { key:'users',       icon:'👥', label:'المستخدمون',      perm:'users' },
      { key:'activity',    icon:'🕐', label:'سجل النشاط',      perm:'all' },
    ]
  },
]

export function MobileNav({ tab, setTab, canAccess, currentUser }) {
  const [showAll, setShowAll] = useState(false)

  const canShow = useCallback((perm) => {
    if (!perm || perm === 'all') return true
    if (perm === 'users') return ['super_admin','admin'].includes(currentUser?.role)
    return canAccess(perm)
  }, [canAccess, currentUser])

  const go = useCallback((key) => {
    setTab(key)
    setShowAll(false)
    // scroll للأعلى عند التنقل
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [setTab])

  return (
    <>
      {/* ===== نافذة كل الأقسام ===== */}
      {showAll && (
        <>
          <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowAll(false)} />
          <div className="fixed inset-x-0 bottom-14 z-50 rounded-t-3xl overflow-hidden"
            style={{
              background:'rgba(6,10,20,0.98)',
              border:'1px solid rgba(255,255,255,0.08)',
              maxHeight:'75vh',
              display:'flex',
              flexDirection:'column',
            }}>
            {/* الرأس */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 flex-shrink-0">
              <div className="text-sm font-bold text-white">📱 جميع الأقسام</div>
              <button onClick={() => setShowAll(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-lg leading-none">
                ×
              </button>
            </div>
            {/* القائمة */}
            <div className="overflow-y-auto flex-1 pb-4">
              {ALL_GROUPS.map(group => {
                const visible = group.items.filter(i => canShow(i.perm))
                if (visible.length === 0) return null
                return (
                  <div key={group.label} className="mb-1">
                    <div className="px-5 py-2 text-xs font-semibold text-gray-500 sticky top-0"
                      style={{background:'rgba(6,10,20,0.98)'}}>
                      {group.label}
                    </div>
                    <div className="grid grid-cols-4 gap-1 px-3">
                      {visible.map(item => (
                        <button key={item.key} onClick={() => go(item.key)}
                          className={`flex flex-col items-center gap-1 py-3 px-1 rounded-2xl transition-all active:scale-95
                            ${tab===item.key
                              ? 'bg-white/15 ring-1 ring-white/25'
                              : 'hover:bg-white/8 active:bg-white/12'}`}>
                          <span className="text-2xl leading-none">{item.icon}</span>
                          <span className={`text-xs text-center leading-tight line-clamp-1
                            ${tab===item.key ? 'text-white font-semibold' : 'text-gray-400'}`}>
                            {item.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* ===== شريط التنقل السفلي ===== */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/8"
        style={{
          background:'rgba(6,10,20,0.97)',
          backdropFilter:'blur(20px)',
          paddingBottom:'env(safe-area-inset-bottom)',
        }}>
        <div className="flex items-stretch h-14">
          {QUICK_NAV.map(item => (
            <button key={item.key} onClick={() => go(item.key)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 relative
                ${tab===item.key ? 'text-white' : 'text-gray-600'}`}>
              {/* مؤشر نشط */}
              {tab===item.key && (
                <div className="absolute top-0 left-1/4 right-1/4 h-0.5 rounded-b-full"
                  style={{background:'var(--accent,#0e90e0)'}}></div>
              )}
              <span className={`text-xl transition-transform ${tab===item.key ? 'scale-110' : ''}`}>
                {item.icon}
              </span>
              <span className={`text-xs leading-none ${tab===item.key ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          ))}

          {/* زر المزيد */}
          <button onClick={() => setShowAll(!showAll)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 relative
              ${showAll ? 'text-white' : 'text-gray-600'}`}>
            {showAll && (
              <div className="absolute top-0 left-1/4 right-1/4 h-0.5 rounded-b-full bg-amber-400"></div>
            )}
            <span className="text-xl">⊞</span>
            <span className="text-xs leading-none">المزيد</span>
          </button>
        </div>
      </nav>
    </>
  )
}

export default MobileNav

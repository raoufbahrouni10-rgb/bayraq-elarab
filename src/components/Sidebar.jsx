import { useState } from 'react'
import { ROLES } from '../hooks/useUsers'

// ===== تقسيم القائمة لمجموعات =====
const NAV_GROUPS = [
  {
    id: 'main', label: 'الرئيسية', icon: '🏠', collapsible: false,
    items: [
      { key:'dashboard',   icon:'📊', label:'لوحة التحكم',        perm:'dashboard' },
      { key:'advdash',     icon:'📈', label:'إحصاءات متقدمة',     perm:'dashboard' },
      { key:'tvmode',      icon:'📺', label:'شاشة المتابعة',       perm:'dashboard' },
      { key:'reminders',   icon:'🔔', label:'التذكيرات',           perm:'all' },
      { key:'globalsearch',icon:'🔍', label:'البحث الموحّد',       perm:'database' },
    ]
  },
  {
    id: 'candidates', label: 'المترشحون', icon: '👤', collapsible: true,
    items: [
      { key:'database',    icon:'🗂️', label:'قاعدة البيانات',     perm:'database' },
      { key:'upload',      icon:'🤖', label:'رفع وتحليل',          perm:'upload' },
      { key:'import',      icon:'📥', label:'استيراد البيانات',    perm:'upload' },
      { key:'wareg',       icon:'💬', label:'تسجيل واتساب',        perm:'upload' },
      { key:'cards',       icon:'🪪', label:'بطاقات المترشحين',    perm:'database' },
      { key:'ratings',     icon:'⭐', label:'تقييم المترشحين',     perm:'database' },
      { key:'cvtools',     icon:'🛠️', label:'أدوات السيرة',        perm:'upload' },
      { key:'status',      icon:'🔍', label:'حالة الملف',           perm:'all' },
  { key:'compare',     icon:'⚖️', label:'مقارنة المترشحين',      perm:'database' },
  { key:'filehistory', icon:'📜', label:'سجل التعديلات',          perm:'tracking' },
  { key:'company',     icon:'🏢', label:'بطاقة الشركة',           perm:'all' },
    ]
  },
  {
    id: 'jobs', label: 'التوظيف', icon: '💼', collapsible: true,
    items: [
      { key:'tracking',    icon:'📋', label:'متابعة الملفات',      perm:'tracking' },
      { key:'employers',   icon:'🏢', label:'المشغّلون',           perm:'employers' },
      { key:'gulf',        icon:'🌍', label:'عروض الخليج',         perm:'gulf' },
      { key:'smartmatch',  icon:'🎯', label:'المطابقة الذكية',     perm:'employers' },
      { key:'visa',        icon:'🛂', label:'التأشيرات',           perm:'tracking' },
      { key:'archive',     icon:'🗄️', label:'الأرشيف',             perm:'tracking' },
  { key:'interviews',  icon:'🎙️', label:'جدول المقابلات',        perm:'tracking' },
      { key:'calendar',    icon:'📅', label:'التقويم',             perm:'tracking' },
    ]
  },
  {
    id: 'finance', label: 'المالية', icon: '💰', collapsible: true,
    items: [
      { key:'finance',     icon:'💰', label:'مسار المداخيل',       perm:'finance' },
      { key:'invoices',    icon:'🧾', label:'الفواتير',             perm:'finance' },
      { key:'contracts',   icon:'📄', label:'العقود',              perm:'finance' },
      { key:'fees',        icon:'💳', label:'رسوم الاستقدام',      perm:'finance' },
      { key:'reports',     icon:'📈', label:'التقارير',            perm:'reports' },
  { key:'incomecomp',  icon:'📊', label:'مقارنة المداخيل',       perm:'finance' },
    ]
  },
  {
    id: 'tools', label: 'الأدوات', icon: '🔧', collapsible: true,
    items: [
      { key:'messages',    icon:'📧', label:'قوالب الرسائل',       perm:'tracking' },
  { key:'intmessages', icon:'💬', label:'رسائل الفريق',          perm:'all' },
      { key:'bulkwa',      icon:'📤', label:'واتساب جماعي',        perm:'tracking' },
      { key:'qrcodes',     icon:'📲', label:'QR Code',             perm:'upload' },
      { key:'search',      icon:'🌐', label:'البحث في تونس',       perm:'search' },
      { key:'export',      icon:'📤', label:'تصدير البيانات',      perm:'export' },
      { key:'backup',      icon:'💾', label:'النسخ الاحتياطي',     perm:'export' },
      { key:'stats',       icon:'📊', label:'إحصاءات الأداء',      perm:'dashboard' },
    ]
  },
  {
    id: 'settings', label: 'الإعدادات', icon: '⚙️', collapsible: true,
    items: [
      { key:'themes',      icon:'🎨', label:'مظهر المنصة',         perm:'all' },
      { key:'profile',     icon:'👤', label:'ملفي الشخصي',         perm:'all' },
      { key:'activity',    icon:'🕐', label:'سجل النشاط',          perm:'all' },
      { key:'users',       icon:'👥', label:'المستخدمون',          perm:'users' },
    ]
  },
]

export default function Sidebar({ tab, setTab, stats, financeStats, currentUser, onLogout, canAccess }) {
  const role = ROLES[currentUser?.role]
  const ROLE_COLOR = {
    super_admin:'text-yellow-400', admin:'text-amber-400',
    finance_manager:'text-teal-400', finance:'text-emerald-400',
    staff:'text-blue-400'
  }

  // حالة الطي/فتح لكل مجموعة
  const [collapsed, setCollapsed] = useState({})
  const [sidebarHidden, setSidebarHidden] = useState(false)

  const toggleGroup = (id) => setCollapsed(p => ({ ...p, [id]: !p[id] }))

  const canShow = (perm) => {
    if (perm === 'users') return ['super_admin','admin'].includes(currentUser?.role)
    if (perm === 'all')   return true
    return canAccess(perm)
  }

  // فلترة العناصر المرئية
  const visibleGroups = NAV_GROUPS.map(g => ({
    ...g,
    items: g.items.filter(i => canShow(i.perm))
  })).filter(g => g.items.length > 0)

  if (sidebarHidden) return (
    <div className="flex flex-col h-screen sticky top-0 z-30 border-l border-white/5"
      style={{width:'48px', background:'rgba(6,10,20,0.97)', backdropFilter:'blur(20px)'}}>
      {/* زر الفتح */}
      <button onClick={() => setSidebarHidden(false)}
        className="flex items-center justify-center w-full h-12 border-b border-white/5 hover:bg-white/5 transition-all text-gray-400 hover:text-white"
        title="فتح القائمة">
        ☰
      </button>
      {/* أيقونات سريعة */}
      <div className="flex-1 overflow-y-auto py-2 space-y-1 px-1">
        {visibleGroups.flatMap(g => g.items.slice(0,2)).slice(0,10).map(item => (
          <button key={item.key} onClick={() => setTab(item.key)}
            className={`w-full h-9 flex items-center justify-center rounded-lg text-sm transition-all
              ${tab===item.key ? 'bg-white/15 text-white' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
            title={item.label}>
            {item.icon}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-screen sticky top-0 z-30 border-l border-white/5 transition-all duration-300"
      style={{width:'220px', background:'rgba(6,10,20,0.97)', backdropFilter:'blur(20px)'}}>

      {/* ===== الرأس ===== */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <img src="/logo.jpg" className="h-7 w-7 rounded-lg object-contain flex-shrink-0"
            alt="logo" onError={e=>e.target.style.display='none'} />
          <div className="min-w-0">
            <div className="text-white font-black text-xs truncate">بيرق العرب</div>
            <div className={`text-xs truncate ${ROLE_COLOR[currentUser?.role]||'text-gray-400'}`}>
              {role?.icon} {currentUser?.name?.split(' ')[0]}
            </div>
          </div>
        </div>
        <button onClick={() => setSidebarHidden(true)}
          className="text-gray-600 hover:text-gray-400 transition-colors flex-shrink-0 text-base p-1 rounded hover:bg-white/5"
          title="إخفاء القائمة">
          ‹
        </button>
      </div>

      {/* ===== القائمة ===== */}
      <div className="flex-1 overflow-y-auto py-2 space-y-0.5">
        {visibleGroups.map(group => (
          <div key={group.id}>
            {/* رأس المجموعة */}
            {group.collapsible ? (
              <button onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-white/[0.03] transition-all group">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">{group.icon}</span>
                  <span className="text-xs font-semibold text-gray-500 group-hover:text-gray-400">{group.label}</span>
                </div>
                <span className="text-gray-600 text-xs transition-transform duration-200"
                  style={{transform: collapsed[group.id] ? 'rotate(-90deg)' : 'rotate(0)'}}>
                  ▾
                </span>
              </button>
            ) : (
              <div className="px-3 py-1 flex items-center gap-1.5">
                <span className="text-xs">{group.icon}</span>
                <span className="text-xs font-semibold text-gray-500">{group.label}</span>
              </div>
            )}

            {/* عناصر المجموعة */}
            {!collapsed[group.id] && (
              <div className="space-y-0.5 px-1.5 pb-1">
                {group.items.map(item => (
                  <button key={item.key} onClick={() => setTab(item.key)}
                    className={`sidebar-link w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-right transition-all text-xs
                      ${tab===item.key
                        ? 'active bg-white/10 text-white font-semibold'
                        : 'text-gray-400 hover:bg-white/[0.06] hover:text-gray-200'}`}>
                    <span className="text-sm flex-shrink-0">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                    {/* شارات البيانات */}
                    {item.key==='database' && stats?.total>0 && (
                      <span className="mr-auto text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded-full flex-shrink-0">{stats.total}</span>
                    )}
                    {item.key==='tracking' && stats?.active>0 && (
                      <span className="mr-auto text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded-full flex-shrink-0">{stats.active}</span>
                    )}
                    {item.key==='finance' && financeStats?.pending>0 && (
                      <span className="mr-auto text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-full flex-shrink-0">{financeStats.pending}</span>
                    )}
                    {item.key==='reminders' && (
                      <span className="mr-auto w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0 animate-pulse"></span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ===== الفوتر ===== */}
      <div className="border-t border-white/5 p-2 flex-shrink-0">
        <button onClick={onLogout}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <span>⏻</span>
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  )
}

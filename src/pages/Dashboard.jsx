export default function Dashboard({ stats, setTab, trackingStats, financeStats }) {

  const statCards = [
    { num:stats.total,              label:'إجمالي السير الذاتية', icon:'👥', color:'from-blue-700 to-blue-900',    glow:'rgba(14,144,224,0.3)' },
    { num:stats.specs,              label:'التخصصات المختلفة',   icon:'🎓', color:'from-purple-700 to-purple-900', glow:'rgba(139,92,246,0.3)' },
    { num:trackingStats?.total||0,  label:'ملفات المتابعة',       icon:'📋', color:'from-cyan-700 to-cyan-900',    glow:'rgba(6,182,212,0.3)' },
    { num:trackingStats?.byStage?.hired||0, label:'تم توظيفهم',  icon:'🎉', color:'from-emerald-700 to-emerald-900', glow:'rgba(16,185,129,0.3)' },
  ]

  const doors = [
    { key:'database',  icon:'🗂️',  label:'قاعدة البيانات',      desc:'تصفح وفلتر السير الذاتية',       gold:false },
    { key:'search',    icon:'🔍',  label:'البحث في تونس',        desc:'ANETI وLinkedIn والمواقع التونسية', gold:false },
    { key:'gulf',      icon:'🌍',  label:'عروض الخليج',           desc:'ابحث عن وظائف الخليج العربي',    gold:true },
    { key:'employers', icon:'🏢',  label:'المشغّلون والعروض',    desc:'إدارة عروض الشغل والمطابقة',      gold:false },
    { key:'tracking',  icon:'📋',  label:'متابعة الملفات',        desc:'من الاختيار حتى السفر',           gold:false },
    { key:'finance',   icon:'💰',  label:'مسار المداخيل',         desc:'إعداد الملف، رسوم، معلم الاستقدام', gold:true },
    { key:'reports',   icon:'📊',  label:'التقارير',              desc:'تقارير شهرية وسنوية قابلة للطباعة', gold:false },
    { key:'upload',    icon:'🤖',  label:'رفع وتحليل بالذكاء',   desc:'استخراج بيانات السير تلقائياً',   gold:false },
  ]

  const fmt = (n) => (n||0).toLocaleString('ar-TN')

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ترحيب */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            مرحباً بك في <span className="gradient-text-gold">بيرق العرب</span> 👋
          </h1>
          <p className="text-gray-400">منصة التوظيف بالخارج — لوحة التحكم الرئيسية</p>
        </div>
        <div className="bg-white rounded-xl px-4 py-2 shadow-lg">
          <img src="/logo.jpg" alt="بيرق العرب" className="h-10 object-contain" />
        </div>
      </div>

      {/* بطاقات الإحصاء */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((c,i) => (
          <div key={i} className={`stat-hero bg-gradient-to-br ${c.color} animate-fade-in delay-${i+1}`}
            style={{boxShadow:`0 8px 32px ${c.glow}`}}>
            <div className="text-3xl mb-2">{c.icon}</div>
            <div className="text-3xl font-black text-white">{fmt(c.num)}</div>
            <div className="text-xs text-white/70 mt-1 font-medium">{c.label}</div>
          </div>
        ))}
      </div>

      {/* الوضع المالي */}
      {financeStats && (financeStats.totalTND > 0 || financeStats.pendingTND > 0) && (
        <div className="glass-gold rounded-2xl p-5 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl">💰</div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">الوضع المالي الإجمالي</div>
              <div className="gradient-text-gold text-lg font-black">{fmt(Math.round(financeStats.totalTND + financeStats.pendingTND))} د.ت</div>
            </div>
          </div>
          <div className="flex gap-6 flex-wrap">
            <div><div className="text-xs text-gray-500">محصّل</div><div className="text-emerald-400 font-bold text-base">{fmt(Math.round(financeStats.totalTND))} د.ت</div></div>
            <div><div className="text-xs text-gray-500">منتظر</div><div className="text-amber-400 font-bold text-base">{fmt(Math.round(financeStats.pendingTND))} د.ت</div></div>
            <div><div className="text-xs text-gray-500">من المشغّلين</div><div className="text-purple-400 font-bold text-base">{fmt(Math.round(financeStats.fromEmployers))} د.ت</div></div>
          </div>
          <button onClick={() => setTab('finance')}
            className="btn-gold mr-auto px-4 py-2 rounded-xl text-sm">
            عرض التفاصيل ←
          </button>
        </div>
      )}

      {/* أبواب التنقل الكبيرة */}
      <div>
        <h2 className="text-base font-bold text-gray-300 mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-blue-500 rounded-full inline-block"></span>
          الأقسام الرئيسية
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {doors.map((d, i) => (
            <button key={d.key} onClick={() => setTab(d.key)}
              className={`nav-door ${d.gold ? 'nav-door-gold' : ''} animate-fade-in`}
              style={{animationDelay:`${i*0.06}s`}}>
              <span className="nav-door-icon">{d.icon}</span>
              <div className={`nav-door-label ${d.gold ? 'gradient-text-gold' : 'gradient-text'}`}>{d.label}</div>
              <div className="nav-door-desc">{d.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* حالة ملفات المتابعة */}
      {trackingStats && trackingStats.total > 0 && (
        <div className="glass rounded-2xl p-5">
          <h2 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-cyan-500 rounded-full"></span>
            حالة ملفات المتابعة
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              {label:'الاختيار', key:'selected',  icon:'✅', color:'text-blue-400',    bg:'bg-blue-500/15',    border:'border-blue-500/30'},
              {label:'المقابلة', key:'interview', icon:'🎙️', color:'text-purple-400',  bg:'bg-purple-500/15',  border:'border-purple-500/30'},
              {label:'العقد',    key:'contract',  icon:'📝', color:'text-amber-400',   bg:'bg-amber-500/15',   border:'border-amber-500/30'},
              {label:'السفر',    key:'travel',    icon:'✈️', color:'text-cyan-400',    bg:'bg-cyan-500/15',    border:'border-cyan-500/30'},
              {label:'توظيف',   key:'hired',     icon:'🎉', color:'text-emerald-400', bg:'bg-emerald-500/15', border:'border-emerald-500/30'},
              {label:'ملغي',    key:'rejected',  icon:'❌', color:'text-red-400',     bg:'bg-red-500/15',     border:'border-red-500/30'},
            ].map(s => (
              <button key={s.key} onClick={() => setTab('tracking')}
                className={`${s.bg} border ${s.border} rounded-2xl p-3 text-center hover:scale-105 transition-transform`}>
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className={`text-xl font-black ${s.color}`}>{trackingStats.byStage[s.key]||0}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* توزيع المصادر */}
      <div className="glass rounded-2xl p-5">
        <h2 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
          توزيع مصادر السير الذاتية
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {label:'محلي',    val:stats.bySource.local,    color:'bg-blue-500',   icon:'📁'},
            {label:'ANETI',   val:stats.bySource.aneti,    color:'bg-purple-500', icon:'🏛️'},
            {label:'LinkedIn',val:stats.bySource.linkedin, color:'bg-cyan-500',   icon:'💼'},
            {label:'ويب',     val:stats.bySource.web,      color:'bg-amber-500',  icon:'🌐'},
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3 bg-white/[0.03] rounded-xl p-3 border border-white/5">
              <div className={`w-2 h-10 ${s.color} rounded-full flex-shrink-0`}></div>
              <div>
                <div className="text-xs text-gray-500">{s.icon} {s.label}</div>
                <div className="text-xl font-black text-white">{s.val}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

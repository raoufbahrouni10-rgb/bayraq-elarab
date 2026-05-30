import { useState, useEffect } from 'react'

function MiniBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value/max)*100) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-300 font-semibold">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5">
        <div className="h-full rounded-full transition-all duration-700" style={{width:`${pct}%`, background:color}}></div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="glass rounded-2xl p-4 border border-white/5 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{background:`${color}20`, color}}>{sub}</span>
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}

export default function AdvancedDashboard({ db, applications, transactions, toTND, jobs, employers }) {
  const [period, setPeriod] = useState('month')

  // إحصاءات المترشحين
  const specCount = db.reduce((acc, c) => { acc[c.spec||'أخرى'] = (acc[c.spec||'أخرى']||0)+1; return acc }, {})
  const topSpecs = Object.entries(specCount).sort((a,b)=>b[1]-a[1]).slice(0,5)

  const cityCount = db.reduce((acc, c) => { acc[c.city||'أخرى'] = (acc[c.city||'أخرى']||0)+1; return acc }, {})
  const topCities = Object.entries(cityCount).sort((a,b)=>b[1]-a[1]).slice(0,5)

  // إحصاءات التوظيف
  const stageCount = applications.reduce((acc, a) => { acc[a.stage] = (acc[a.stage]||0)+1; return acc }, {})
  const countryCount = applications.reduce((acc, a) => { acc[a.country||'غير محدد'] = (acc[a.country||'غير محدد']||0)+1; return acc }, {})
  const topCountries = Object.entries(countryCount).sort((a,b)=>b[1]-a[1]).slice(0,5)

  const hired = applications.filter(a=>a.stage==='hired').length
  const successRate = applications.length > 0 ? Math.round((hired/applications.length)*100) : 0

  // إحصاءات مالية
  const totalTND = transactions.filter(t=>t.paid).reduce((s,t)=>s+toTND(t.amount,t.currency),0)
  const pendingTND = transactions.filter(t=>!t.paid).reduce((s,t)=>s+toTND(t.amount,t.currency),0)

  // المداخيل الشهرية
  const monthlyIncome = () => {
    const months = {}
    transactions.filter(t=>t.paid).forEach(t => {
      const m = t.date?.slice(0,7) || '0000-00'
      months[m] = (months[m]||0) + toTND(t.amount, t.currency)
    })
    return Object.entries(months).sort().slice(-6)
  }
  const monthly = monthlyIncome()
  const maxMonthly = Math.max(...monthly.map(m=>m[1]), 1)

  const STAGE_LABELS = { selected:'اختيار', interview:'مقابلة', contract:'عقد', travel:'سفر', hired:'توظيف', rejected:'رفض' }
  const STAGE_COLORS = { selected:'#3b82f6', interview:'#8b5cf6', contract:'#f59e0b', travel:'#06b6d4', hired:'#10b981', rejected:'#ef4444' }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white mb-0.5">📊 لوحة التحكم المتقدمة</h1>
          <p className="text-gray-400 text-sm">إحصاءات شاملة وتفاعلية</p>
        </div>
      </div>

      {/* بطاقات الإحصاء */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="🗂️" label="إجمالي المترشحين" value={db.length} sub={`+${db.filter(c=>{const d=new Date(c.date),n=new Date();return d.getMonth()===n.getMonth()}).length} هذا الشهر`} color="#3b82f6" />
        <StatCard icon="📋" label="ملفات نشطة" value={applications.filter(a=>!['hired','rejected'].includes(a.stage)).length} sub={`${successRate}% نجاح`} color="#10b981" />
        <StatCard icon="💰" label="محصّل (د.ت)" value={Math.round(totalTND).toLocaleString()} sub={`${Math.round(pendingTND).toLocaleString()} منتظر`} color="#f59e0b" />
        <StatCard icon="🏢" label="مشغّلون" value={employers.length} sub={`${jobs.filter(j=>j.active!==false).length} عرض نشط`} color="#8b5cf6" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* مراحل الملفات */}
        <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
          <div className="text-sm font-semibold text-gray-200">📋 توزيع مراحل الملفات</div>
          <div className="space-y-3">
            {Object.entries(STAGE_LABELS).map(([k,l]) => (
              <MiniBar key={k} label={l} value={stageCount[k]||0} max={applications.length||1} color={STAGE_COLORS[k]} />
            ))}
          </div>
        </div>

        {/* أكثر التخصصات */}
        <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
          <div className="text-sm font-semibold text-gray-200">🎓 أكثر التخصصات طلباً</div>
          <div className="space-y-3">
            {topSpecs.map(([spec, count]) => (
              <MiniBar key={spec} label={spec} value={count} max={db.length||1} color="var(--accent,#0e90e0)" />
            ))}
            {topSpecs.length === 0 && <div className="text-xs text-gray-600 text-center py-4">لا توجد بيانات</div>}
          </div>
        </div>

        {/* المداخيل الشهرية */}
        <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
          <div className="text-sm font-semibold text-gray-200">💰 المداخيل الشهرية (د.ت)</div>
          {monthly.length === 0 ? (
            <div className="text-xs text-gray-600 text-center py-8">لا توجد معاملات بعد</div>
          ) : (
            <div className="flex items-end gap-2 h-32">
              {monthly.map(([month, amount]) => (
                <div key={month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-xs text-gray-400 font-semibold">{Math.round(amount/1000)}K</div>
                  <div className="w-full rounded-t-lg transition-all duration-700"
                    style={{height:`${(amount/maxMonthly)*100}px`, background:'linear-gradient(to top, var(--accent,#0e90e0), var(--btn-from,#0e90e0))', minHeight:'4px'}}></div>
                  <div className="text-xs text-gray-600">{month.slice(5)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* توزيع الدول */}
        <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
          <div className="text-sm font-semibold text-gray-200">🌍 أكثر دول التوظيف</div>
          <div className="space-y-3">
            {topCountries.map(([country, count]) => (
              <MiniBar key={country} label={country} value={count} max={applications.length||1} color="#10b981" />
            ))}
            {topCountries.length === 0 && <div className="text-xs text-gray-600 text-center py-4">لا توجد بيانات</div>}
          </div>
        </div>
      </div>

      {/* نسبة النجاح */}
      <div className="glass rounded-2xl p-5 border border-white/5">
        <div className="text-sm font-semibold text-gray-200 mb-4">📈 مؤشرات الأداء</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label:'نسبة التوظيف', value:`${successRate}%`, icon:'🎯', color:'#10b981' },
            { label:'متوسط الخبرة', value:`${db.length?Math.round(db.reduce((s,c)=>s+c.exp,0)/db.length):0} سنة`, icon:'⏱', color:'#3b82f6' },
            { label:'مترشحون بواتساب', value:db.filter(c=>c.phone).length, icon:'💬', color:'#25d366' },
            { label:'عروض الخليج', value:jobs.filter(j=>j.active!==false).length, icon:'✈️', color:'#f59e0b' },
          ].map(kpi => (
            <div key={kpi.label} className="text-center p-3 rounded-xl border border-white/5 bg-white/[0.02]">
              <div className="text-2xl mb-1">{kpi.icon}</div>
              <div className="text-xl font-black" style={{color:kpi.color}}>{kpi.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{kpi.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

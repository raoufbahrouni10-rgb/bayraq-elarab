import { useState } from 'react'

export default function StatsPage({ db, applications, transactions, toTND, users, currentUser }) {
  const isSuperAdmin = ['super_admin','admin'].includes(currentUser?.role)

  // إحصاءات الموظفين
  const userStats = users.filter(u => !['super_admin','observer','finance'].includes(u.role)).map(u => {
    const added = db.filter(c => c.addedBy === u.username).length
    const tracked = applications.filter(a => a.updatedBy === u.username).length
    const hired = applications.filter(a => a.updatedBy === u.username && a.stage === 'hired').length
    return { ...u, added, tracked, hired, score: added*2 + tracked + hired*5 }
  }).sort((a,b) => b.score - a.score)

  // إحصاءات المترشحين
  const specStats = Object.entries(
    db.reduce((acc,c) => { acc[c.spec||'أخرى']=(acc[c.spec||'أخرى']||0)+1; return acc }, {})
  ).sort((a,b)=>b[1]-a[1]).slice(0,8)

  const cityStats = Object.entries(
    db.reduce((acc,c) => { acc[c.city||'غير محدد']=(acc[c.city||'غير محدد']||0)+1; return acc }, {})
  ).sort((a,b)=>b[1]-a[1]).slice(0,6)

  // إحصاءات التوظيف
  const countryStats = Object.entries(
    applications.reduce((acc,a) => { acc[a.country||'غير محدد']=(acc[a.country||'غير محدد']||0)+1; return acc }, {})
  ).sort((a,b)=>b[1]-a[1]).slice(0,6)

  const hired = applications.filter(a=>a.stage==='hired').length
  const total = applications.length
  const rate = total > 0 ? Math.round((hired/total)*100) : 0

  // المداخيل الشهرية
  const monthlyData = transactions.filter(t=>t.paid).reduce((acc,t) => {
    const m = t.date?.slice(0,7)||'0000-00'
    acc[m] = (acc[m]||0) + toTND(t.amount,t.currency)
    return acc
  }, {})
  const monthly = Object.entries(monthlyData).sort().slice(-6)
  const maxM = Math.max(...monthly.map(m=>m[1]),1)

  const Bar = ({label, value, max, color='var(--accent,#0e90e0)'}) => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400 truncate">{label}</span>
        <span className="text-gray-300 font-semibold ml-2">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-white/5">
        <div className="h-full rounded-full" style={{width:`${Math.round((value/max)*100)}%`, background:color}}></div>
      </div>
    </div>
  )

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white mb-0.5">📊 إحصاءات متقدمة</h1>
        <p className="text-gray-400 text-sm">تحليل شامل لأداء المنصة</p>
      </div>

      {/* مؤشرات رئيسية */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {icon:'🗂️', label:'المترشحون', value:db.length, color:'#3b82f6'},
          {icon:'📋', label:'الملفات', value:applications.length, color:'#8b5cf6'},
          {icon:'🎉', label:'تم توظيفهم', value:hired, color:'#10b981'},
          {icon:'📈', label:'نسبة النجاح', value:`${rate}%`, color:'#C9A227'},
        ].map(k=>(
          <div key={k.label} className="glass rounded-2xl p-4 border border-white/5 text-center space-y-2">
            <div className="text-2xl">{k.icon}</div>
            <div className="text-2xl font-black" style={{color:k.color}}>{k.value}</div>
            <div className="text-xs text-gray-500">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* أكثر التخصصات */}
        <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
          <div className="text-sm font-semibold text-gray-200">🎓 أكثر التخصصات</div>
          <div className="space-y-3">
            {specStats.map(([spec,count])=><Bar key={spec} label={spec} value={count} max={specStats[0]?.[1]||1}/>)}
          </div>
        </div>

        {/* دول التوظيف */}
        <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
          <div className="text-sm font-semibold text-gray-200">🌍 دول التوظيف</div>
          <div className="space-y-3">
            {countryStats.map(([country,count])=><Bar key={country} label={country} value={count} max={countryStats[0]?.[1]||1} color="#10b981"/>)}
          </div>
        </div>

        {/* المداخيل الشهرية */}
        <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
          <div className="text-sm font-semibold text-gray-200">💰 المداخيل الشهرية (د.ت)</div>
          {monthly.length===0 ? (
            <div className="text-center py-8 text-gray-600 text-sm">لا توجد بيانات</div>
          ) : (
            <div className="flex items-end gap-2 h-28">
              {monthly.map(([month,amount])=>(
                <div key={month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-xs text-gray-400">{Math.round(amount/1000)}K</div>
                  <div className="w-full rounded-t-lg"
                    style={{height:`${(amount/maxM)*100}px`, minHeight:'4px', background:'linear-gradient(to top, var(--accent,#0e90e0), var(--btn-from,#0e90e0))'}}></div>
                  <div className="text-xs text-gray-600">{month.slice(5)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* توزيع المدن */}
        <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
          <div className="text-sm font-semibold text-gray-200">📍 توزيع المدن</div>
          <div className="space-y-3">
            {cityStats.map(([city,count])=><Bar key={city} label={city} value={count} max={cityStats[0]?.[1]||1} color="#f59e0b"/>)}
          </div>
        </div>
      </div>

      {/* إحصاءات الموظفين */}
      {isSuperAdmin && (
        <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
          <div className="text-sm font-semibold text-gray-200">👥 أداء الموظفين</div>
          {userStats.length === 0 ? (
            <div className="text-center py-8 text-gray-600 text-sm">لا توجد بيانات أداء بعد</div>
          ) : (
            <div className="space-y-3">
              {userStats.map((u,i) => (
                <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{background: i===0?'#C9A227':i===1?'#94a3b8':i===2?'#cd7f32':'rgba(255,255,255,0.1)', color: i<3?'#000':'#fff'}}>
                    {i+1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">{u.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {u.added} مترشح • {u.tracked} تحديث • {u.hired} توظيف
                    </div>
                  </div>
                  <div className="text-sm font-bold" style={{color:'#C9A227'}}>{u.score} نقطة</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { INCOME_TYPES, CURRENCIES } from '../hooks/useFinance'
import { DonutChart, LineChart } from '../components/Charts'

const MONTHS_AR = ['جانفي','فيفري','مارس','أفريل','ماي','جوان','جويلية','أوت','سبتمبر','أكتوبر','نوفمبر','ديسمبر']

function fmt(n) { return (n||0).toLocaleString('ar-TN', { minimumFractionDigits:0, maximumFractionDigits:0 }) }

export default function ReportsPage({ db, transactions, applications, toTND, users, currentUser }) {
  const [period, setPeriod] = useState('monthly')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [reportTab, setReportTab] = useState('financial')

  const filterByPeriod = (items, dateField='date') => items.filter(item => {
    const d = new Date(item[dateField])
    if (period==='monthly') return d.getMonth()===selectedMonth && d.getFullYear()===selectedYear
    if (period==='annual')  return d.getFullYear()===selectedYear
    return true
  })

  const periodTx   = filterByPeriod(transactions)
  const periodApps = filterByPeriod(applications)

  const totalCollected = periodTx.filter(t=>t.paid).reduce((s,t)=>s+toTND(t.amount,t.currency),0)
  const totalPending   = periodTx.filter(t=>!t.paid).reduce((s,t)=>s+toTND(t.amount,t.currency),0)
  const fromCandidates = periodTx.filter(t=>t.paid&&INCOME_TYPES.find(i=>i.key===t.type)?.from==='candidate').reduce((s,t)=>s+toTND(t.amount,t.currency),0)
  const fromEmployers  = periodTx.filter(t=>t.paid&&INCOME_TYPES.find(i=>i.key===t.type)?.from==='employer').reduce((s,t)=>s+toTND(t.amount,t.currency),0)

  const byCandidate = {}
  periodTx.forEach(t => {
    if (!byCandidate[t.candidateName]) byCandidate[t.candidateName] = { name:t.candidateName, total:0, paid:0, count:0, country:t.country }
    byCandidate[t.candidateName].total += toTND(t.amount, t.currency)
    if (t.paid) byCandidate[t.candidateName].paid += toTND(t.amount, t.currency)
    byCandidate[t.candidateName].count++
  })
  const candidateList = Object.values(byCandidate).sort((a,b)=>b.paid-a.paid)

  const stageCount = { selected:0, interview:0, contract:0, travel:0, hired:0, rejected:0 }
  periodApps.forEach(a => { if(stageCount[a.stage]!==undefined) stageCount[a.stage]++ })

  const monthlyData = Array.from({length:12},(_,m)=>({
    label: MONTHS_AR[m].slice(0,3),
    value: transactions.filter(t=>t.paid&&new Date(t.date).getMonth()===m&&new Date(t.date).getFullYear()===selectedYear).reduce((s,t)=>s+toTND(t.amount,t.currency),0),
  }))

  // بيانات الرسم الدائري للمداخيل
  const donutData = [
    { label:'من المترشحين', value: Math.round(fromCandidates), color:'#3b82f6' },
    { label:'من المشغّلين', value: Math.round(fromEmployers),  color:'#10b981' },
    { label:'منتظر',        value: Math.round(totalPending),   color:'#f59e0b' },
  ].filter(d => d.value > 0)

  const stagesDonut = [
    { label:'الاختيار', value:stageCount.selected,  color:'#3b82f6' },
    { label:'المقابلة', value:stageCount.interview,  color:'#8b5cf6' },
    { label:'العقد',    value:stageCount.contract,   color:'#f59e0b' },
    { label:'السفر',    value:stageCount.travel,     color:'#06b6d4' },
    { label:'تم',       value:stageCount.hired,      color:'#10b981' },
    { label:'ملغي',     value:stageCount.rejected,   color:'#ef4444' },
  ].filter(d => d.value > 0)

  const periodLabel = period==='monthly' ? `${MONTHS_AR[selectedMonth]} ${selectedYear}` : period==='annual' ? `سنة ${selectedYear}` : 'كل الفترات'

  const printReport = () => {
    const today = new Date().toLocaleDateString('ar-TN')
    const content = `<!DOCTYPE html><html lang="ar" dir="rtl">
<head><meta charset="UTF-8"><title>تقرير بيرق العرب — ${periodLabel}</title>
<style>
  body{font-family:'Segoe UI',Arial,sans-serif;direction:rtl;color:#1a1a1a;padding:40px;max-width:900px;margin:0 auto}
  .header{text-align:center;border-bottom:3px solid #0e90e0;padding-bottom:20px;margin-bottom:30px}
  h1{color:#0e4a8a;font-size:20px} h2{color:#0e4a8a;font-size:15px;border-right:4px solid #0e90e0;padding-right:8px;margin-top:25px}
  .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:15px 0}
  .stat{background:#f0f7ff;border-radius:10px;padding:12px;text-align:center}
  .stat-num{font-size:22px;font-weight:bold;color:#0e4a8a}
  .stat-label{font-size:12px;color:#666;margin-top:4px}
  table{width:100%;border-collapse:collapse;margin:10px 0;font-size:13px}
  th{background:#e8f0fe;padding:8px;text-align:right}
  td{padding:7px;border-bottom:1px solid #eee}
  .green{color:#10b981} .amber{color:#f59e0b}
  @media print{body{padding:20px}}
</style></head>
<body>
<div class="header">
  <strong style="font-size:22px;color:#c9a227">بيرق العرب</strong><br>
  <span style="color:#666;font-size:13px">للتوظيف بالخارج — BAYRAK ELARAB</span>
  <h1>تقرير الفترة: ${periodLabel}</h1>
  <p style="color:#999;font-size:12px">أصدره: ${currentUser?.name} — ${today}</p>
</div>
<h2>ملخص المداخيل</h2>
<div class="stats">
  <div class="stat"><div class="stat-num green">${fmt(totalCollected)}</div><div class="stat-label">محصّل (د.ت)</div></div>
  <div class="stat"><div class="stat-num amber">${fmt(totalPending)}</div><div class="stat-label">منتظر (د.ت)</div></div>
  <div class="stat"><div class="stat-num">${fmt(fromCandidates)}</div><div class="stat-label">من المترشحين</div></div>
  <div class="stat"><div class="stat-num">${fmt(fromEmployers)}</div><div class="stat-label">من المشغّلين</div></div>
</div>
<h2>تفاصيل المعاملات (${periodTx.length})</h2>
<table>
  <tr><th>المترشح</th><th>النوع</th><th>المبلغ</th><th>العملة</th><th>بالدينار</th><th>الحالة</th><th>التاريخ</th></tr>
  ${periodTx.map(t=>{const tp=INCOME_TYPES.find(i=>i.key===t.type);return`<tr><td>${t.candidateName||'—'}</td><td>${tp?.label||t.type}</td><td>${t.amount}</td><td>${t.currency}</td><td>${fmt(toTND(t.amount,t.currency))}</td><td class="${t.paid?'green':'amber'}">${t.paid?'✅ مدفوع':'⏳ منتظر'}</td><td>${t.date}</td></tr>`}).join('')}
  <tr style="background:#f9fafb;font-weight:bold"><td colspan="4">الإجمالي</td><td class="green">${fmt(totalCollected)}</td><td class="amber">${fmt(totalPending)}</td><td></td></tr>
</table>
<h2>تقرير المترشحين</h2>
<table>
  <tr><th>المترشح</th><th>الدولة</th><th>المرحلة</th><th>المحصّل</th><th>المنتظر</th></tr>
  ${candidateList.map(c=>`<tr><td>${c.name}</td><td>${c.country||'—'}</td><td>${applications.find(a=>a.candidateName===c.name)?.stage||'—'}</td><td class="green">${fmt(c.paid)}</td><td class="amber">${fmt(c.total-c.paid)}</td></tr>`).join('')}
</table>
<h2>حالة ملفات المتابعة</h2>
<div class="stats">
  <div class="stat"><div class="stat-num">${stageCount.selected}</div><div class="stat-label">✅ الاختيار</div></div>
  <div class="stat"><div class="stat-num">${stageCount.interview}</div><div class="stat-label">🎙️ المقابلة</div></div>
  <div class="stat"><div class="stat-num">${stageCount.contract}</div><div class="stat-label">📝 العقد</div></div>
  <div class="stat"><div class="stat-num">${stageCount.hired}</div><div class="stat-label">🎉 تم التوظيف</div></div>
</div>
<p style="margin-top:40px;font-size:11px;color:#999;border-top:1px solid #eee;padding-top:10px;text-align:center">
  تقرير صادر عن منصة بيرق العرب للتوظيف بالخارج — ${today}
</p></body></html>`
    const w=window.open('','_blank'); w.document.write(content); w.document.close(); setTimeout(()=>w.print(),500)
  }

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white mb-0.5">التقارير 📊</h1>
          <p className="text-gray-400 text-sm">تقارير تفاعلية شاملة مع رسوم بيانية</p>
        </div>
        <button onClick={printReport} className="btn-primary px-4 py-2 rounded-xl text-sm text-white flex items-center gap-2">
          🖨️ طباعة PDF
        </button>
      </div>

      {/* فلتر الفترة */}
      <div className="glass rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {[{key:'monthly',label:'شهري'},{key:'annual',label:'سنوي'},{key:'all',label:'الكل'}].map(p=>(
            <button key={p.key} onClick={()=>setPeriod(p.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all
                ${period===p.key?'btn-primary text-white':'border border-white/10 text-gray-400 hover:bg-white/5'}`}>
              {p.label}
            </button>
          ))}
        </div>
        {period==='monthly' && (
          <select value={selectedMonth} onChange={e=>setSelectedMonth(parseInt(e.target.value))} className="input-dark px-3 py-1.5 rounded-xl text-sm">
            {MONTHS_AR.map((m,i)=><option key={i} value={i}>{m}</option>)}
          </select>
        )}
        {period!=='all' && (
          <select value={selectedYear} onChange={e=>setSelectedYear(parseInt(e.target.value))} className="input-dark px-3 py-1.5 rounded-xl text-sm">
            {[2024,2025,2026].map(y=><option key={y}>{y}</option>)}
          </select>
        )}
        <span className="text-xs text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
          📅 {periodLabel}
        </span>
      </div>

      {/* تبويبات */}
      <div className="flex gap-1 border-b border-white/5">
        {[
          {key:'financial',     label:'💰 مالي'},
          {key:'charts',        label:'📈 رسوم بيانية'},
          {key:'candidates',    label:'👥 المترشحون'},
          {key:'tracking',      label:'📋 المتابعة'},
        ].map(t=>(
          <button key={t.key} onClick={()=>setReportTab(t.key)}
            className={`px-4 py-2.5 text-sm border-b-2 transition-colors -mb-px
              ${reportTab===t.key?'border-blue-400 text-white font-medium':'border-transparent text-gray-400 hover:text-gray-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ===== مالي ===== */}
      {reportTab==='financial' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {label:'إجمالي المحصّل', val:totalCollected, icon:'✅', color:'from-emerald-700 to-emerald-900'},
              {label:'قيد الانتظار',   val:totalPending,   icon:'⏳', color:'from-amber-700 to-amber-900'},
              {label:'من المترشحين',   val:fromCandidates, icon:'👤', color:'from-blue-700 to-blue-900'},
              {label:'من المشغّلين',   val:fromEmployers,  icon:'🏢', color:'from-purple-700 to-purple-900'},
            ].map((c,i)=>(
              <div key={i} className={`rounded-2xl bg-gradient-to-br ${c.color} p-4`}>
                <div className="text-2xl mb-1">{c.icon}</div>
                <div className="text-xl font-bold text-white">{fmt(c.val)} <span className="text-xs opacity-70">د.ت</span></div>
                <div className="text-xs text-white/70 mt-0.5">{c.label}</div>
              </div>
            ))}
          </div>
          <div className="glass rounded-2xl p-5 space-y-3">
            <div className="text-sm font-semibold text-gray-200">تفاصيل المعاملات ({periodTx.length})</div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-white/5">
                  {['المترشح','النوع','المبلغ','بالدينار','الحالة','التاريخ'].map(h=>(
                    <th key={h} className="text-right text-gray-500 pb-2 pr-3 font-medium">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-white/5">
                  {periodTx.map(t=>{
                    const tp=INCOME_TYPES.find(i=>i.key===t.type)
                    const curr=CURRENCIES.find(c=>c.key===t.currency)
                    return (
                      <tr key={t.id} className="hover:bg-white/[0.02]">
                        <td className="py-2 pr-3 text-gray-200">{t.candidateName}</td>
                        <td className="py-2 pr-3 text-gray-400">{tp?.icon} {tp?.label}</td>
                        <td className="py-2 pr-3 text-gray-300">{t.amount} {curr?.label}</td>
                        <td className="py-2 pr-3 text-gray-300">{fmt(toTND(t.amount,t.currency))}</td>
                        <td className="py-2 pr-3"><span className={t.paid?'text-emerald-400':'text-amber-400'}>{t.paid?'✅':'⏳'}</span></td>
                        <td className="py-2 pr-3 text-gray-500">{t.date}</td>
                      </tr>
                    )
                  })}
                  {periodTx.length===0&&<tr><td colSpan="6" className="text-center py-8 text-gray-600">لا توجد معاملات</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== رسوم بيانية ===== */}
      {reportTab==='charts' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass rounded-2xl p-5 space-y-3">
              <div className="text-sm font-semibold text-gray-200">توزيع المداخيل</div>
              <DonutChart segments={donutData} size={130} />
            </div>
            <div className="glass rounded-2xl p-5 space-y-3">
              <div className="text-sm font-semibold text-gray-200">حالة الملفات</div>
              <DonutChart segments={stagesDonut} size={130} />
            </div>
          </div>
          <div className="glass rounded-2xl p-5 space-y-3">
            <div className="text-sm font-semibold text-gray-200">المداخيل الشهرية — {selectedYear}</div>
            <LineChart data={monthlyData} height={120} />
            <div className="flex flex-wrap gap-1 mt-2">
              {monthlyData.map((m,i)=>(
                <div key={i} className={`flex-1 min-w-[40px] text-center ${i===selectedMonth&&period==='monthly'?'text-blue-400 font-bold':'text-gray-600'}`} style={{fontSize:'10px'}}>
                  {m.label}
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-5 space-y-3">
            <div className="text-sm font-semibold text-gray-200">المداخيل حسب نوع الرسوم</div>
            <div className="space-y-2">
              {INCOME_TYPES.map(type=>{
                const typeTx=periodTx.filter(t=>t.type===type.key)
                const paid=typeTx.filter(t=>t.paid).reduce((s,t)=>s+toTND(t.amount,t.currency),0)
                const total=typeTx.reduce((s,t)=>s+toTND(t.amount,t.currency),0)
                if(!typeTx.length) return null
                const pct=totalCollected+totalPending>0?Math.round((total/(totalCollected+totalPending))*100):0
                return (
                  <div key={type.key} className="flex items-center gap-3">
                    <span className="w-6 text-base flex-shrink-0">{type.icon}</span>
                    <span className="text-xs text-gray-400 w-28 flex-shrink-0">{type.label}</span>
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{width:`${pct}%`}}></div>
                    </div>
                    <span className="text-xs text-gray-400 w-20 text-left">{fmt(paid)} د.ت</span>
                    <span className="text-xs text-gray-600 w-8">{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===== المترشحون ===== */}
      {reportTab==='candidates' && (
        <div className="space-y-3">
          {candidateList.length===0&&<div className="text-center py-12 text-gray-500"><div className="text-4xl mb-2">👤</div><div>لا توجد بيانات</div></div>}
          {candidateList.map((c,i)=>{
            const app=applications.find(a=>a.candidateName===c.name)
            const ct=periodTx.filter(t=>t.candidateName===c.name)
            return (
              <div key={i} className="glass rounded-2xl p-4 border border-white/5 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="font-semibold text-white">{c.name}</div>
                    <div className="text-xs text-gray-400">{app?.jobTitle||'—'} • {c.country}</div>
                  </div>
                  <div className="text-left">
                    <div className="text-base font-bold text-emerald-300">{fmt(c.paid)} <span className="text-xs text-gray-500">د.ت محصّل</span></div>
                    {c.total>c.paid&&<div className="text-xs text-amber-400">{fmt(c.total-c.paid)} منتظر</div>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ct.map(t=>{
                    const tp=INCOME_TYPES.find(i=>i.key===t.type)
                    const curr=CURRENCIES.find(cu=>cu.key===t.currency)
                    return (
                      <span key={t.id} className={`text-xs px-2 py-0.5 rounded-full border ${t.paid?'bg-emerald-500/10 text-emerald-400 border-emerald-500/20':'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                        {tp?.icon} {t.amount} {curr?.label}
                      </span>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ===== المتابعة ===== */}
      {reportTab==='tracking' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              {label:'الاختيار',key:'selected',  icon:'✅',color:'text-blue-400',    bg:'bg-blue-500/15',    border:'border-blue-500/30'},
              {label:'المقابلة',key:'interview', icon:'🎙️',color:'text-purple-400',  bg:'bg-purple-500/15',  border:'border-purple-500/30'},
              {label:'العقد',   key:'contract',  icon:'📝',color:'text-amber-400',   bg:'bg-amber-500/15',   border:'border-amber-500/30'},
              {label:'السفر',   key:'travel',    icon:'✈️',color:'text-cyan-400',    bg:'bg-cyan-500/15',    border:'border-cyan-500/30'},
              {label:'تم',      key:'hired',     icon:'🎉',color:'text-emerald-400', bg:'bg-emerald-500/15', border:'border-emerald-500/30'},
              {label:'ملغي',    key:'rejected',  icon:'❌',color:'text-red-400',     bg:'bg-red-500/15',     border:'border-red-500/30'},
            ].map(s=>(
              <div key={s.key} className={`${s.bg} border ${s.border} rounded-xl p-3 text-center`}>
                <div className="text-xl mb-1">{s.icon}</div>
                <div className={`text-xl font-black ${s.color}`}>{stageCount[s.key]||0}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="text-sm font-semibold text-gray-200 mb-3">تفاصيل الملفات ({periodApps.length})</div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-white/5">
                  {['المترشح','المنصب','الشركة','الدولة','المرحلة','التاريخ'].map(h=>(
                    <th key={h} className="text-right text-gray-500 pb-2 pr-3 font-medium">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-white/5">
                  {periodApps.map(a=>(
                    <tr key={a.id} className="hover:bg-white/[0.02]">
                      <td className="py-2 pr-3 text-gray-200">{a.candidateName}</td>
                      <td className="py-2 pr-3 text-gray-400">{a.jobTitle}</td>
                      <td className="py-2 pr-3 text-gray-400">{a.company}</td>
                      <td className="py-2 pr-3 text-gray-400">{a.country}</td>
                      <td className="py-2 pr-3 text-blue-300 text-xs">{a.stage}</td>
                      <td className="py-2 pr-3 text-gray-500">{a.date}</td>
                    </tr>
                  ))}
                  {periodApps.length===0&&<tr><td colSpan="6" className="text-center py-8 text-gray-600">لا توجد بيانات</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

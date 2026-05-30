import { useState } from 'react'

const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']

export default function IncomeComparePage({ transactions, toTND }) {
  const [year1, setYear1] = useState(new Date().getFullYear().toString())
  const [year2, setYear2] = useState((new Date().getFullYear()-1).toString())

  const years = [...new Set(transactions.map(t => t.date?.slice(0,4)).filter(Boolean))].sort().reverse()

  const getMonthlyData = (year) => {
    const data = Array(12).fill(0)
    transactions.filter(t => t.paid && t.date?.startsWith(year)).forEach(t => {
      const m = parseInt(t.date.slice(5,7)) - 1
      if (m >= 0 && m < 12) data[m] += toTND(t.amount, t.currency)
    })
    return data
  }

  const data1 = getMonthlyData(year1)
  const data2 = getMonthlyData(year2)
  const maxVal = Math.max(...data1, ...data2, 1)

  const total1 = data1.reduce((s,v)=>s+v, 0)
  const total2 = data2.reduce((s,v)=>s+v, 0)
  const diff = total1 - total2
  const diffPct = total2 > 0 ? Math.round((diff/total2)*100) : 0

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white mb-0.5">📊 مقارنة المداخيل</h1>
        <p className="text-gray-400 text-sm">مقارنة شهرية وسنوية للمداخيل</p>
      </div>

      {/* اختيار السنوات */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-4 border border-blue-500/20 space-y-2">
          <label className="text-xs text-blue-300 font-semibold block">السنة الأولى</label>
          <select value={year1} onChange={e=>setYear1(e.target.value)}
            className="input-dark w-full px-3 py-2 rounded-xl text-sm">
            {years.map(y=><option key={y} value={y}>{y}</option>)}
            {years.length === 0 && <option value={year1}>{year1}</option>}
          </select>
          <div className="text-xl font-black text-blue-300">{Math.round(total1).toLocaleString()} د.ت</div>
        </div>
        <div className="glass rounded-2xl p-4 border border-purple-500/20 space-y-2">
          <label className="text-xs text-purple-300 font-semibold block">السنة الثانية</label>
          <select value={year2} onChange={e=>setYear2(e.target.value)}
            className="input-dark w-full px-3 py-2 rounded-xl text-sm">
            {years.map(y=><option key={y} value={y}>{y}</option>)}
            {years.length === 0 && <option value={year2}>{year2}</option>}
          </select>
          <div className="text-xl font-black text-purple-300">{Math.round(total2).toLocaleString()} د.ت</div>
        </div>
      </div>

      {/* مؤشر الفرق */}
      <div className={`glass rounded-2xl p-4 border text-center ${diff>=0?'border-emerald-500/20':'border-red-500/20'}`}>
        <div className={`text-3xl font-black ${diff>=0?'text-emerald-400':'text-red-400'}`}>
          {diff>=0?'↑':'↓'} {Math.abs(diffPct)}%
        </div>
        <div className="text-sm text-gray-400 mt-1">
          {diff>=0?'نمو':'انخفاض'} بـ {Math.abs(Math.round(diff)).toLocaleString()} د.ت مقارنة بـ {year2}
        </div>
      </div>

      {/* الرسم البياني */}
      <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
        <div className="text-sm font-semibold text-gray-200">📈 مقارنة شهرية</div>
        <div className="space-y-3">
          {MONTHS_AR.map((month, i) => (
            <div key={month} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{month}</span>
                <span className="flex gap-3">
                  <span className="text-blue-300">{Math.round(data1[i]).toLocaleString()}</span>
                  <span className="text-purple-300">{Math.round(data2[i]).toLocaleString()}</span>
                </span>
              </div>
              <div className="relative h-4 bg-white/5 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 right-0 rounded-full transition-all duration-700"
                  style={{width:`${(data1[i]/maxVal)*100}%`, background:'rgba(59,130,246,0.6)'}}></div>
                <div className="absolute top-1/2 -translate-y-1/2 right-0 h-2 rounded-full transition-all duration-700"
                  style={{width:`${(data2[i]/maxVal)*100}%`, background:'rgba(139,92,246,0.5)'}}></div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 text-xs pt-2 border-t border-white/5">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500/60"></span>{year1}</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-500/50"></span>{year2}</span>
        </div>
      </div>

      {/* جدول المقارنة */}
      <div className="glass rounded-2xl overflow-hidden border border-white/5">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/5">
              <th className="py-3 px-4 text-right text-gray-500">الشهر</th>
              <th className="py-3 px-4 text-center text-blue-300">{year1}</th>
              <th className="py-3 px-4 text-center text-purple-300">{year2}</th>
              <th className="py-3 px-4 text-center text-gray-500">الفرق</th>
            </tr>
          </thead>
          <tbody>
            {MONTHS_AR.map((month, i) => {
              const d = data1[i] - data2[i]
              return (
                <tr key={month} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="py-2.5 px-4 text-gray-300">{month}</td>
                  <td className="py-2.5 px-4 text-center text-blue-300 font-mono">{Math.round(data1[i]).toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-center text-purple-300 font-mono">{Math.round(data2[i]).toLocaleString()}</td>
                  <td className={`py-2.5 px-4 text-center font-mono font-semibold ${d>0?'text-emerald-400':d<0?'text-red-400':'text-gray-600'}`}>
                    {d>0?'+':''}{Math.round(d).toLocaleString()}
                  </td>
                </tr>
              )
            })}
            <tr className="border-t border-white/10 bg-white/[0.02]">
              <td className="py-3 px-4 font-bold text-white">المجموع</td>
              <td className="py-3 px-4 text-center font-black text-blue-300 font-mono">{Math.round(total1).toLocaleString()}</td>
              <td className="py-3 px-4 text-center font-black text-purple-300 font-mono">{Math.round(total2).toLocaleString()}</td>
              <td className={`py-3 px-4 text-center font-black font-mono ${diff>=0?'text-emerald-400':'text-red-400'}`}>
                {diff>=0?'+':''}{Math.round(diff).toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

import { useState } from 'react'

export default function ExportPage({ db }) {
  const [exported, setExported] = useState('')

  const exportCSV = () => {
    const headers = ['الاسم','التخصص','العمر','سنوات الخبرة','المدينة','المهارات','المصدر','التاريخ','ملاحظات']
    const rows = db.map(c => [c.name, c.spec, c.age, c.exp, c.city||'—', c.skills, c.source, c.date, c.notes||''].map(v=>`"${v}"`).join(','))
    const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download='bayraq_cvs.csv'; a.click()
    URL.revokeObjectURL(url)
    setExported('csv')
    setTimeout(()=>setExported(''),3000)
  }

  const exportJSON = () => {
    const json = JSON.stringify(db, null, 2)
    const blob = new Blob([json], { type:'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download='bayraq_cvs.json'; a.click()
    URL.revokeObjectURL(url)
    setExported('json')
    setTimeout(()=>setExported(''),3000)
  }

  const specs = [...new Set(db.map(c=>c.spec))]
  const cities = [...new Set(db.map(c=>c.city||'غير محدد'))]

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-white mb-1">تصدير البيانات 📤</h1>
        <p className="text-gray-400 text-sm">صدّر قاعدة البيانات بالصيغة التي تريدها</p>
      </div>

      {/* Stats */}
      <div className="glass rounded-2xl p-5 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-white">{db.length}</div>
          <div className="text-xs text-gray-500 mt-1">سيرة ذاتية</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{specs.length}</div>
          <div className="text-xs text-gray-500 mt-1">تخصص</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{cities.length}</div>
          <div className="text-xs text-gray-500 mt-1">مدينة</div>
        </div>
      </div>

      {/* Export options */}
      <div className="space-y-3">
        <div className="glass rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-2xl border border-emerald-500/30">📊</div>
            <div>
              <div className="font-semibold text-white text-sm">تصدير CSV</div>
              <div className="text-xs text-gray-400 mt-0.5">متوافق مع Excel وGoogle Sheets</div>
            </div>
          </div>
          <button onClick={exportCSV}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${exported==='csv' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'btn-primary text-white'}`}>
            {exported==='csv' ? '✓ تم التصدير' : 'تصدير CSV'}
          </button>
        </div>

        <div className="glass rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center text-2xl border border-amber-500/30">📋</div>
            <div>
              <div className="font-semibold text-white text-sm">تصدير JSON</div>
              <div className="text-xs text-gray-400 mt-0.5">للاستخدام في التطبيقات والـ API</div>
            </div>
          </div>
          <button onClick={exportJSON}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${exported==='json' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'btn-primary text-white'}`}>
            {exported==='json' ? '✓ تم التصدير' : 'تصدير JSON'}
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="glass rounded-2xl p-5">
        <div className="text-sm font-semibold text-gray-300 mb-3">معاينة البيانات</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                {['الاسم','التخصص','الخبرة','المدينة','المصدر'].map(h=>(
                  <th key={h} className="text-right text-gray-500 pb-2 pr-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {db.slice(0,8).map(c => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2 pr-3 text-gray-200">{c.name}</td>
                  <td className="py-2 pr-3 text-gray-400">{c.spec}</td>
                  <td className="py-2 pr-3 text-gray-400">{c.exp} سنة</td>
                  <td className="py-2 pr-3 text-gray-400">{c.city||'—'}</td>
                  <td className="py-2 pr-3 text-gray-400">{c.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {db.length > 8 && <div className="text-center text-xs text-gray-600 pt-3">و {db.length-8} سيرة أخرى...</div>}
        </div>
      </div>
    </div>
  )
}

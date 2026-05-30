import { useState } from 'react'

export default function AutoBackupPage({ db, applications, transactions, employers, users }) {
  const [loading, setLoading] = useState(false)
  const [lastBackup, setLastBackup] = useState(() => localStorage.getItem('bayraq_last_backup') || null)

  const toCSV = (data, headers) => {
    const h = headers.join(',')
    const rows = data.map(r => headers.map(k => `"${(r[k]||'').toString().replace(/"/g,'""')}"`).join(','))
    return '\uFEFF' + [h, ...rows].join('\n')
  }

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  const backupAll = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    const date = new Date().toISOString().split('T')[0]

    // السير الذاتية
    downloadCSV(toCSV(db, ['name','spec','age','exp','city','phone','skills','source','notes','date']), `cvs_${date}.csv`)
    await new Promise(r => setTimeout(r, 300))

    // الملفات
    downloadCSV(toCSV(applications, ['candidateName','jobTitle','company','country','stage','notes','date']), `applications_${date}.csv`)
    await new Promise(r => setTimeout(r, 300))

    // المداخيل
    downloadCSV(toCSV(transactions, ['type','candidateName','jobTitle','company','country','amount','currency','paid','notes','date']), `transactions_${date}.csv`)
    await new Promise(r => setTimeout(r, 300))

    // المشغّلون
    downloadCSV(toCSV(employers, ['name','sector','city','contact','phone','notes']), `employers_${date}.csv`)

    const now = new Date().toLocaleString('ar-TN')
    setLastBackup(now)
    localStorage.setItem('bayraq_last_backup', now)
    setLoading(false)
  }

  const DATASETS = [
    { label:'السير الذاتية', count:db.length, icon:'🗂️', color:'#3b82f6',
      download: () => downloadCSV(toCSV(db,['name','spec','age','exp','city','phone','skills','source','notes','date']),`cvs_${new Date().toISOString().split('T')[0]}.csv`) },
    { label:'ملفات المتابعة', count:applications.length, icon:'📋', color:'#8b5cf6',
      download: () => downloadCSV(toCSV(applications,['candidateName','jobTitle','company','country','stage','notes','date']),`applications_${new Date().toISOString().split('T')[0]}.csv`) },
    { label:'المداخيل', count:transactions.length, icon:'💰', color:'#C9A227',
      download: () => downloadCSV(toCSV(transactions,['type','candidateName','amount','currency','paid','date','notes']),`transactions_${new Date().toISOString().split('T')[0]}.csv`) },
    { label:'المشغّلون', count:employers.length, icon:'🏢', color:'#10b981',
      download: () => downloadCSV(toCSV(employers,['name','sector','city','contact','phone']),`employers_${new Date().toISOString().split('T')[0]}.csv`) },
  ]

  return (
    <div className="animate-fade-in space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-white mb-0.5">💾 النسخ الاحتياطي</h1>
        <p className="text-gray-400 text-sm">تصدير كل البيانات كملفات CSV</p>
      </div>

      {lastBackup && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-3 text-sm text-emerald-300">
          <span>✅</span>
          <span>آخر نسخ احتياطي: {lastBackup}</span>
        </div>
      )}

      {/* زر النسخ الكامل */}
      <button onClick={backupAll} disabled={loading}
        className="w-full py-4 rounded-2xl font-black text-white text-base disabled:opacity-50 flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5"
        style={{background:'linear-gradient(135deg,#1B3A6B,#0D2447)', boxShadow:'0 8px 25px rgba(27,58,107,0.3)'}}>
        {loading ? <><span className="animate-spin">⟳</span> جارٍ التصدير...</> : <><span className="text-xl">💾</span> تصدير كل البيانات دفعة واحدة</>}
      </button>

      {/* تصدير منفرد */}
      <div className="grid grid-cols-2 gap-4">
        {DATASETS.map(d => (
          <div key={d.label} className="glass rounded-2xl p-4 border border-white/5 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{d.icon}</span>
              <div>
                <div className="font-semibold text-white text-sm">{d.label}</div>
                <div className="text-xs text-gray-400">{d.count} سجل</div>
              </div>
            </div>
            <button onClick={d.download}
              className="w-full py-2 rounded-xl text-xs border border-white/10 text-gray-300 hover:bg-white/5 transition-all flex items-center justify-center gap-1.5">
              <span>⬇️</span> تصدير CSV
            </button>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-4 border border-white/5 text-xs text-gray-500 space-y-1">
        <div>📌 الملفات تُحفظ بصيغة CSV — يمكن فتحها في Excel أو Google Sheets</div>
        <div>📌 يُنصح بالنسخ الاحتياطي الأسبوعي للحفاظ على بياناتك</div>
        <div>📌 البيانات محفوظة في Supabase — هذا النسخ للأرشفة المحلية</div>
      </div>
    </div>
  )
}

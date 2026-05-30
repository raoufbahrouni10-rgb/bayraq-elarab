import { useState, useEffect } from 'react'

export default function GlobalSearchPage({ db, applications, transactions, jobs, employers, setTab }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ cvs:[], apps:[], finances:[], jobs:[] })
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!query.trim() || query.length < 2) { setResults({ cvs:[], apps:[], finances:[], jobs:[] }); setTotal(0); return }
    const q = query.toLowerCase()

    const cvs = db.filter(c =>
      c.name?.toLowerCase().includes(q) || c.spec?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q) || c.skills?.toLowerCase().includes(q)
    ).slice(0, 5)

    const apps = applications.filter(a =>
      a.candidateName?.toLowerCase().includes(q) || a.jobTitle?.toLowerCase().includes(q) ||
      a.company?.toLowerCase().includes(q) || a.country?.toLowerCase().includes(q)
    ).slice(0, 5)

    const finances = transactions.filter(t =>
      t.candidateName?.toLowerCase().includes(q) || t.company?.toLowerCase().includes(q) ||
      t.country?.toLowerCase().includes(q)
    ).slice(0, 5)

    const jobsList = jobs.filter(j =>
      j.title?.toLowerCase().includes(q) || j.spec?.toLowerCase().includes(q) ||
      j.city?.toLowerCase().includes(q)
    ).slice(0, 5)

    setResults({ cvs, apps, finances, jobs: jobsList })
    setTotal(cvs.length + apps.length + finances.length + jobsList.length)
  }, [query])

  const STAGE_LABELS = { selected:'✅ الاختيار', interview:'🎙️ مقابلة', contract:'📝 عقد', travel:'✈️ سفر', hired:'🎉 توظيف', rejected:'❌ ملغي' }

  return (
    <div className="animate-fade-in space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-white mb-0.5">🔍 البحث الموحّد</h1>
        <p className="text-gray-400 text-sm">ابحث في كل البيانات من مكان واحد</p>
      </div>

      <div className="relative">
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
        <input value={query} onChange={e=>setQuery(e.target.value)}
          placeholder="ابحث بالاسم، التخصص، الشركة، الدولة..."
          className="input-dark w-full pr-12 pl-4 py-4 rounded-2xl text-sm" autoFocus />
        {query && <button onClick={()=>setQuery('')} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">✕</button>}
      </div>

      {query.length >= 2 && (
        <div className="text-xs text-gray-500">{total} نتيجة لـ "{query}"</div>
      )}

      {/* السير الذاتية */}
      {results.cvs.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-gray-400">🗂️ قاعدة البيانات ({results.cvs.length})</div>
            <button onClick={()=>setTab('database')} className="text-xs text-blue-400 hover:underline">عرض الكل</button>
          </div>
          {results.cvs.map(c=>(
            <div key={c.id} className="glass rounded-xl p-3 border border-white/5 flex items-center gap-3 cursor-pointer hover:bg-white/5"
              onClick={()=>setTab('database')}>
              <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300 text-xs font-bold flex-shrink-0">
                {c.name?.split(' ').slice(0,2).map(w=>w[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">{c.name}</div>
                <div className="text-xs text-gray-400">{c.spec} • {c.city}</div>
              </div>
              <div className="flex gap-1.5">
                {c.exp>0&&<span className="text-xs tag-exp px-2 py-0.5 rounded-full">{c.exp}س</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ملفات المتابعة */}
      {results.apps.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-gray-400">📋 ملفات المتابعة ({results.apps.length})</div>
            <button onClick={()=>setTab('tracking')} className="text-xs text-blue-400 hover:underline">عرض الكل</button>
          </div>
          {results.apps.map(a=>(
            <div key={a.id} className="glass rounded-xl p-3 border border-white/5 flex items-center gap-3 cursor-pointer hover:bg-white/5"
              onClick={()=>setTab('tracking')}>
              <span className="text-xl flex-shrink-0">{STAGE_LABELS[a.stage]?.split(' ')[0]||'📋'}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">{a.candidateName}</div>
                <div className="text-xs text-gray-400">{a.jobTitle} • {a.company} • {a.country}</div>
              </div>
              <span className="text-xs text-gray-500">{STAGE_LABELS[a.stage]?.split(' ').slice(1).join(' ')}</span>
            </div>
          ))}
        </div>
      )}

      {/* المعاملات المالية */}
      {results.finances.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-gray-400">💰 المداخيل ({results.finances.length})</div>
            <button onClick={()=>setTab('finance')} className="text-xs text-blue-400 hover:underline">عرض الكل</button>
          </div>
          {results.finances.map(t=>(
            <div key={t.id} className="glass rounded-xl p-3 border border-white/5 flex items-center gap-3 cursor-pointer hover:bg-white/5"
              onClick={()=>setTab('finance')}>
              <span className="text-xl flex-shrink-0">{t.paid?'✅':'⏳'}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">{t.candidateName}</div>
                <div className="text-xs text-gray-400">{t.company} • {t.country}</div>
              </div>
              <span className={`text-sm font-bold ${t.paid?'text-emerald-400':'text-amber-400'}`}>
                {t.amount} {t.currency}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* عروض الشغل */}
      {results.jobs.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-gray-400">🏢 عروض الشغل ({results.jobs.length})</div>
            <button onClick={()=>setTab('employers')} className="text-xs text-blue-400 hover:underline">عرض الكل</button>
          </div>
          {results.jobs.map(j=>(
            <div key={j.id} className="glass rounded-xl p-3 border border-white/5 flex items-center gap-3 cursor-pointer hover:bg-white/5"
              onClick={()=>setTab('employers')}>
              <span className="text-xl flex-shrink-0">💼</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">{j.title}</div>
                <div className="text-xs text-gray-400">{j.spec} • {j.city}</div>
              </div>
              {j.salary && <span className="text-xs text-emerald-400">{j.salary}</span>}
            </div>
          ))}
        </div>
      )}

      {query.length >= 2 && total === 0 && (
        <div className="text-center py-12 text-gray-500 space-y-2">
          <div className="text-4xl">🔍</div>
          <div className="font-medium text-gray-400">لا توجد نتائج لـ "{query}"</div>
          <div className="text-sm">جرب كلمات بحث مختلفة</div>
        </div>
      )}

      {!query && (
        <div className="text-center py-12 text-gray-600 space-y-2">
          <div className="text-4xl">🔍</div>
          <div className="text-sm">اكتب للبحث في السير، الملفات، المداخيل، والعروض</div>
        </div>
      )}
    </div>
  )
}

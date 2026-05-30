import { useState } from 'react'
import { waLink } from '../lib/whatsapp'

const STAGE_LABELS = { hired:'🎉 موظّف', rejected:'❌ ملغي' }
const STAGE_COLORS = { hired:'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', rejected:'bg-red-500/20 text-red-300 border-red-500/30' }

export default function ArchivePage({ applications, db, onRestore }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')

  const archived = applications.filter(a => ['hired','rejected'].includes(a.stage))

  const filtered = archived.filter(a => {
    if (filter && a.stage !== filter) return false
    if (search && !a.candidateName.includes(search) && !a.jobTitle?.includes(search) && !a.company?.includes(search)) return false
    return true
  })

  const getCV = (name) => db.find(c => c.name === name)

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white mb-0.5">🗄️ أرشيف الملفات</h1>
        <p className="text-gray-400 text-sm">
          {archived.length} ملف مؤرشف •
          <span className="text-emerald-400 mr-1"> {archived.filter(a=>a.stage==='hired').length} موظّف</span> •
          <span className="text-red-400 mr-1"> {archived.filter(a=>a.stage==='rejected').length} ملغي</span>
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو المنصب..." className="input-dark w-full pr-9 pl-4 py-2.5 rounded-xl text-sm" />
        </div>
        {['','hired','rejected'].map(s => (
          <button key={s} onClick={()=>setFilter(s)}
            className={`text-xs px-3 py-2 rounded-xl border transition-all ${filter===s?'btn-primary text-white border-transparent':'border-white/10 text-gray-400 hover:bg-white/5'}`}>
            {s===''?'الكل':STAGE_LABELS[s]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500 space-y-3">
          <div className="text-5xl">🗄️</div>
          <div>{archived.length===0?'لا توجد ملفات مؤرشفة':'لا توجد نتائج'}</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => {
            const cv = getCV(a.candidateName)
            return (
              <div key={a.id} className="glass rounded-2xl p-4 border border-white/5 flex items-center gap-4 flex-wrap">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg flex-shrink-0">
                  {a.stage==='hired'?'🎉':'❌'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white text-sm">{a.candidateName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${STAGE_COLORS[a.stage]}`}>
                      {STAGE_LABELS[a.stage]}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {a.jobTitle} • {a.company} • {a.country}
                  </div>
                  {cv?.spec && <div className="text-xs text-gray-600 mt-0.5">{cv.spec}</div>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {cv?.phone && (
                    <a href={waLink(cv.phone)} target="_blank" rel="noreferrer"
                      className="text-xs px-2.5 py-1.5 rounded-lg text-white"
                      style={{background:'linear-gradient(135deg,#25d366,#128c7e)'}}>
                      💬
                    </a>
                  )}
                  {onRestore && (
                    <button onClick={()=>onRestore(a.id)}
                      className="text-xs px-2.5 py-1.5 border border-white/10 rounded-lg text-gray-400 hover:bg-white/5">
                      ↩ استعادة
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

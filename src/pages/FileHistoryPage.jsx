import { useState } from 'react'

const STAGE_LABELS = { selected:'اختيار', interview:'مقابلة', contract:'عقد', travel:'سفر', hired:'توظيف', rejected:'ملغي' }
const STAGE_COLORS = { selected:'#3b82f6', interview:'#8b5cf6', contract:'#f59e0b', travel:'#06b6d4', hired:'#10b981', rejected:'#ef4444' }

export default function FileHistoryPage({ applications, db }) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = applications.filter(a =>
    !search || a.candidateName?.includes(search) || a.jobTitle?.includes(search)
  )

  const selectedApp = applications.find(a => a.id === selected)
  const history = selectedApp?.history || []

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white mb-0.5">📜 سجل تعديلات الملفات</h1>
        <p className="text-gray-400 text-sm">تاريخ كامل لكل تعديل على ملفات المترشحين</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* قائمة الملفات */}
        <div className="space-y-3">
          <div className="relative">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="ابحث بالاسم..." className="input-dark w-full pr-9 pl-4 py-2.5 rounded-xl text-sm" />
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filtered.map(app => (
              <div key={app.id} onClick={() => setSelected(app.id)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border
                  ${selected===app.id ? 'bg-blue-500/15 border-blue-500/30' : 'glass border-white/5 hover:bg-white/5'}`}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{background:`${STAGE_COLORS[app.stage]}20`, color:STAGE_COLORS[app.stage]}}>
                  {app.candidateName?.split(' ')[0]?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{app.candidateName}</div>
                  <div className="text-xs text-gray-500 truncate">{app.jobTitle} • {app.country}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{background:`${STAGE_COLORS[app.stage]}20`, color:STAGE_COLORS[app.stage]}}>
                    {STAGE_LABELS[app.stage]}
                  </span>
                  <span className="text-xs text-gray-600">{(app.history||[]).length} تعديل</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* سجل التعديلات */}
        <div className="glass rounded-2xl border border-white/5 overflow-hidden">
          {!selected ? (
            <div className="text-center py-16 text-gray-500 space-y-2">
              <div className="text-4xl">📜</div>
              <div className="text-sm">اختر ملفاً لعرض سجله</div>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
                <span className="text-sm font-bold text-white">{selectedApp?.candidateName}</span>
                <span className="text-xs text-gray-500">— {history.length} تعديل</span>
              </div>
              <div className="overflow-y-auto max-h-80">
                {history.length === 0 ? (
                  <div className="text-center py-10 text-gray-600 text-sm">لا توجد تعديلات مسجّلة</div>
                ) : (
                  <div className="p-4 space-y-3">
                    {[...history].reverse().map((h, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                            style={{background:STAGE_COLORS[h.stage]||'#666'}}></div>
                          {i < history.length-1 && <div className="w-0.5 flex-1 bg-white/5 mt-1"></div>}
                        </div>
                        <div className="flex-1 pb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{background:`${STAGE_COLORS[h.stage]||'#666'}20`, color:STAGE_COLORS[h.stage]||'#aaa'}}>
                              {STAGE_LABELS[h.stage]||h.stage}
                            </span>
                            {h.date && <span className="text-xs text-gray-500">{h.date}</span>}
                            {h.by && <span className="text-xs text-gray-600">— {h.by}</span>}
                          </div>
                          {h.note && <div className="text-xs text-gray-400 mt-1 leading-relaxed">📝 {h.note}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

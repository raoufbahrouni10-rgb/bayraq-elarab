import { useState } from 'react'

const STAGES = [
  { key:'selected',  label:'تم الاختيار',   icon:'✅', color:'blue',    desc:'تم اختيار المرشح للمنصب' },
  { key:'interview', label:'المقابلة',       icon:'🎙️', color:'purple',  desc:'جدولة وإجراء المقابلة' },
  { key:'contract',  label:'توقيع العقد',    icon:'📝', color:'amber',   desc:'إعداد وتوقيع العقد' },
  { key:'travel',    label:'الإجراءات والسفر',icon:'✈️', color:'cyan',   desc:'التأشيرة، التذاكر، السكن' },
  { key:'hired',     label:'تم التوظيف',    icon:'🎉', color:'emerald', desc:'المرشح في مكان العمل' },
  { key:'rejected',  label:'ملغي',          icon:'❌', color:'red',     desc:'تم إلغاء الملف' },
]

const STAGE_COLORS = {
  blue:    { bg:'bg-blue-500/20',    text:'text-blue-300',    border:'border-blue-500/30',    line:'bg-blue-500' },
  purple:  { bg:'bg-purple-500/20',  text:'text-purple-300',  border:'border-purple-500/30',  line:'bg-purple-500' },
  amber:   { bg:'bg-amber-500/20',   text:'text-amber-300',   border:'border-amber-500/30',   line:'bg-amber-500' },
  cyan:    { bg:'bg-cyan-500/20',    text:'text-cyan-300',    border:'border-cyan-500/30',    line:'bg-cyan-500' },
  emerald: { bg:'bg-emerald-500/20', text:'text-emerald-300', border:'border-emerald-500/30', line:'bg-emerald-500' },
  red:     { bg:'bg-red-500/20',     text:'text-red-300',     border:'border-red-500/30',     line:'bg-red-400' },
}

const STAGE_INDEX = { selected:0, interview:1, contract:2, travel:3, hired:4, rejected:-1 }

const TRAVEL_CHECKLIST = [
  { key:'visa',     label:'طلب التأشيرة',        icon:'🛂' },
  { key:'medical',  label:'الكشف الطبي',          icon:'🏥' },
  { key:'ticket',   label:'حجز تذكرة الطيران',   icon:'✈️' },
  { key:'housing',  label:'ترتيب السكن',          icon:'🏠' },
  { key:'contract_copy', label:'نسخة العقد موثقة',icon:'📄' },
  { key:'insurance',label:'التأمين الصحي',        icon:'🛡️' },
  { key:'departure',label:'تأكيد موعد المغادرة', icon:'🗓️' },
]

function StageProgressBar({ stage }) {
  const idx = STAGE_INDEX[stage]
  if (idx === -1) return (
    <div className="flex items-center gap-1 mt-2">
      <div className="h-1.5 flex-1 bg-red-500/30 rounded-full"><div className="h-full bg-red-500 rounded-full w-full"></div></div>
      <span className="text-xs text-red-400">ملغي</span>
    </div>
  )
  return (
    <div className="flex items-center gap-1 mt-2">
      {STAGES.slice(0,5).map((s, i) => {
        const c = STAGE_COLORS[s.color]
        return (
          <div key={s.key} className="flex items-center gap-1 flex-1">
            <div className={`h-1.5 flex-1 rounded-full ${i <= idx ? c.line : 'bg-white/10'} transition-all duration-500`}></div>
            {i < 4 && <div className={`w-2 h-2 rounded-full flex-shrink-0 ${i < idx ? c.line : i === idx ? c.line+' ring-2 ring-offset-1 ring-offset-transparent' : 'bg-white/10'}`}></div>}
          </div>
        )
      })}
    </div>
  )
}

function ApplicationCard({ app, onUpdateStage, onDelete, onSelect }) {
  const stage = STAGES.find(s => s.key === app.stage) || STAGES[0]
  const sc = STAGE_COLORS[stage.color]

  return (
    <div className="glass rounded-2xl p-4 border border-white/5 card-hover cursor-pointer space-y-3" onClick={() => onSelect(app)}>
      <div className="flex items-start gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border ${sc.bg} ${sc.border}`}>
          {stage.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white text-sm">{app.candidateName}</div>
          <div className="text-xs text-gray-400 mt-0.5">{app.jobTitle} — {app.company}</div>
          <div className="text-xs text-gray-500 mt-0.5">📍 {app.country} • {app.date}</div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full border ${sc.bg} ${sc.text} ${sc.border}`}>{stage.icon} {stage.label}</span>
          <button onClick={e=>{e.stopPropagation();onDelete(app.id)}} className="text-gray-600 hover:text-red-400 text-xs transition-colors">🗑</button>
        </div>
      </div>
      <StageProgressBar stage={app.stage} />
      {app.notes && <div className="text-xs text-gray-500 italic border-t border-white/5 pt-2">{app.notes}</div>}
    </div>
  )
}

function ApplicationDetail({ app, onUpdateStage, onClose }) {
  const [note, setNote] = useState('')
  const [nextStage, setNextStage] = useState('')
  const [checklist, setChecklist] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`checklist_${app.id}`) || '{}') } catch { return {} }
  })

  const toggleCheck = (key) => {
    const updated = { ...checklist, [key]: !checklist[key] }
    setChecklist(updated)
    localStorage.setItem(`checklist_${app.id}`, JSON.stringify(updated))
  }

  const currentIdx = STAGE_INDEX[app.stage]
  const availableNext = STAGES.filter((s, i) => s.key !== app.stage && s.key !== 'rejected' && i > 0)

  const handleUpdate = () => {
    if (!nextStage) return
    onUpdateStage(app.id, nextStage, note)
    setNote(''); setNextStage('')
  }

  const stage = STAGES.find(s => s.key === app.stage) || STAGES[0]
  const sc = STAGE_COLORS[stage.color]

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="glass rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10" onClick={e=>e.stopPropagation()}>
        <div className="p-5 border-b border-white/5 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-bold text-white text-base">{app.candidateName}</h2>
            <div className="text-sm text-gray-400 mt-0.5">{app.jobTitle} — {app.company} • {app.country}</div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-2xl leading-none mt-1">×</button>
        </div>

        <div className="p-5 space-y-5">
          {/* مسار التوظيف المرئي */}
          <div>
            <div className="text-xs text-gray-500 mb-3">مسار التوظيف</div>
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {STAGES.slice(0,5).map((s, i) => {
                const c = STAGE_COLORS[s.color]
                const done = STAGE_INDEX[app.stage] >= i && app.stage !== 'rejected'
                const current = app.stage === s.key
                return (
                  <div key={s.key} className="flex items-center gap-1 flex-shrink-0">
                    <div className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all min-w-[80px] text-center
                      ${current ? `${c.bg} ${c.border}` : done ? 'bg-white/5 border-white/10' : 'bg-transparent border-white/5'}`}>
                      <span className="text-lg">{s.icon}</span>
                      <span className={`text-xs ${current ? c.text : done ? 'text-gray-300' : 'text-gray-600'}`}>{s.label}</span>
                    </div>
                    {i < 4 && <div className={`w-4 h-0.5 flex-shrink-0 ${done && STAGE_INDEX[app.stage] > i ? STAGE_COLORS[STAGES[i+1].color].line : 'bg-white/10'}`}></div>}
                  </div>
                )
              })}
            </div>
          </div>

          {/* قائمة السفر */}
          {(app.stage === 'travel' || app.stage === 'contract') && (
            <div className="bg-cyan-500/[0.07] rounded-xl p-4 border border-cyan-500/20 space-y-3">
              <div className="text-sm font-semibold text-cyan-300">✈️ قائمة متابعة السفر والإجراءات</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {TRAVEL_CHECKLIST.map(item => (
                  <button key={item.key} onClick={() => toggleCheck(item.key)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-right transition-all
                      ${checklist[item.key] ? 'bg-emerald-500/15 border-emerald-500/30' : 'bg-white/[0.02] border-white/5 hover:bg-white/5'}`}>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all
                      ${checklist[item.key] ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'}`}>
                      {checklist[item.key] && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span className="text-base">{item.icon}</span>
                    <span className={`text-xs flex-1 ${checklist[item.key] ? 'text-emerald-300 line-through' : 'text-gray-300'}`}>{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="text-xs text-gray-500">
                {Object.values(checklist).filter(Boolean).length} / {TRAVEL_CHECKLIST.length} مكتمل
              </div>
            </div>
          )}

          {/* سجل التاريخ */}
          <div>
            <div className="text-xs text-gray-500 mb-3">سجل المتابعة</div>
            <div className="space-y-2">
              {(app.history||[]).map((h, i) => {
                const hs = STAGES.find(s=>s.key===h.stage) || STAGES[0]
                const hc = STAGE_COLORS[hs.color]
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${hc.bg} border ${hc.border}`}>
                      {hs.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${hc.text}`}>{hs.label}</span>
                        <span className="text-xs text-gray-600">{h.date}</span>
                      </div>
                      {h.note && <div className="text-xs text-gray-400 mt-0.5">{h.note}</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* تحديث المرحلة */}
          {app.stage !== 'hired' && app.stage !== 'rejected' && (
            <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5 space-y-3">
              <div className="text-xs text-gray-500 font-medium">تحديث المرحلة</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {STAGES.filter(s => s.key !== app.stage).map(s => {
                  const c = STAGE_COLORS[s.color]
                  return (
                    <button key={s.key} onClick={() => setNextStage(s.key)}
                      className={`p-2.5 rounded-xl border text-center transition-all
                        ${nextStage===s.key ? `${c.bg} ${c.border}` : 'border-white/8 hover:bg-white/5'}`}>
                      <div className="text-lg mb-1">{s.icon}</div>
                      <div className={`text-xs ${nextStage===s.key ? c.text : 'text-gray-400'}`}>{s.label}</div>
                    </button>
                  )
                })}
              </div>
              <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="ملاحظة (اختياري)..."
                rows={2} className="input-dark w-full px-4 py-2.5 rounded-xl text-sm resize-none" />
              <button onClick={handleUpdate} disabled={!nextStage}
                className="btn-primary w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40">
                ✅ تحديث المرحلة
              </button>
            </div>
          )}

          {app.stage === 'hired' && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">🎉</div>
              <div className="text-emerald-300 font-semibold">تم التوظيف بنجاح!</div>
              <div className="text-xs text-gray-400 mt-1">{app.candidateName} في {app.company}، {app.country}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TrackingPage({ applications, onUpdateStage, onDelete, onAdd, db, jobs }) {
  const [selected, setSelected] = useState(null)
  const [filterStage, setFilterStage] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ candidateName:'', jobTitle:'', company:'', country:'السعودية', notes:'' })

  const GULF = ['السعودية','الإمارات','قطر','الكويت','البحرين','عُمان']

  const filtered = applications.filter(a => !filterStage || a.stage === filterStage)

  const stats = {
    total: applications.length,
    byStage: Object.fromEntries(STAGES.map(s => [s.key, applications.filter(a=>a.stage===s.key).length]))
  }

  const handleAdd = () => {
    if (!addForm.candidateName || !addForm.jobTitle) return
    onAdd(addForm)
    setAddForm({ candidateName:'', jobTitle:'', company:'', country:'السعودية', notes:'' })
    setShowAdd(false)
  }

  return (
    <div className="animate-fade-in space-y-5">
      {selected && (
        <ApplicationDetail
          app={applications.find(a=>a.id===selected.id)||selected}
          onUpdateStage={onUpdateStage}
          onClose={() => setSelected(null)}
        />
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white mb-0.5">متابعة ملفات التوظيف 📋</h1>
          <p className="text-gray-400 text-sm">تتبع كل مرشح من الاختيار حتى السفر</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="btn-primary px-4 py-2 rounded-xl text-sm text-white flex items-center gap-2">
          + ملف جديد
        </button>
      </div>

      {/* إضافة ملف */}
      {showAdd && (
        <div className="glass rounded-2xl p-5 border border-white/10 space-y-3 animate-slide-up">
          <div className="text-sm font-semibold text-gray-200">إضافة ملف متابعة جديد</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">اسم المرشح *</label>
              <input value={addForm.candidateName} onChange={e=>setAddForm(p=>({...p,candidateName:e.target.value}))}
                placeholder="اسم المرشح..." className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">المنصب *</label>
              <input value={addForm.jobTitle} onChange={e=>setAddForm(p=>({...p,jobTitle:e.target.value}))}
                placeholder="المنصب المُعيَّن له..." className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">الشركة</label>
              <input value={addForm.company} onChange={e=>setAddForm(p=>({...p,company:e.target.value}))}
                placeholder="اسم الشركة..." className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">الدولة</label>
              <select value={addForm.country} onChange={e=>setAddForm(p=>({...p,country:e.target.value}))}
                className="input-dark w-full px-3 py-2.5 rounded-xl text-sm">
                {GULF.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 block mb-1">ملاحظات</label>
              <input value={addForm.notes} onChange={e=>setAddForm(p=>({...p,notes:e.target.value}))}
                placeholder="ملاحظة أولية..." className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="btn-primary flex-1 py-2.5 rounded-xl text-sm text-white font-semibold">✅ إنشاء الملف</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2.5 border border-white/10 rounded-xl text-sm text-gray-400 hover:bg-white/5">إلغاء</button>
          </div>
        </div>
      )}

      {/* إحصائيات المراحل */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {STAGES.map(s => {
          const c = STAGE_COLORS[s.color]
          const count = stats.byStage[s.key] || 0
          return (
            <button key={s.key} onClick={() => setFilterStage(filterStage===s.key?'':s.key)}
              className={`p-3 rounded-xl border text-center transition-all
                ${filterStage===s.key ? `${c.bg} ${c.border}` : 'glass border-white/5 hover:bg-white/5'}`}>
              <div className="text-xl mb-1">{s.icon}</div>
              <div className={`text-lg font-bold ${filterStage===s.key ? c.text : 'text-white'}`}>{count}</div>
              <div className={`text-xs mt-0.5 ${filterStage===s.key ? c.text : 'text-gray-500'}`}>{s.label}</div>
            </button>
          )
        })}
      </div>

      {/* Kanban view */}
      <div className="overflow-x-auto">
        <div className="flex gap-4 min-w-max pb-2">
          {STAGES.filter(s=>s.key!=='rejected').map(s => {
            const c = STAGE_COLORS[s.color]
            const stageApps = applications.filter(a => a.stage === s.key)
            return (
              <div key={s.key} className="w-64 flex-shrink-0 space-y-2">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${c.bg} border ${c.border}`}>
                  <span>{s.icon}</span>
                  <span className={`text-xs font-semibold ${c.text}`}>{s.label}</span>
                  <span className={`mr-auto text-xs ${c.text} bg-black/20 px-2 py-0.5 rounded-full`}>{stageApps.length}</span>
                </div>
                {stageApps.length === 0 && (
                  <div className="border-2 border-dashed border-white/5 rounded-xl p-4 text-center text-gray-600 text-xs">
                    لا يوجد
                  </div>
                )}
                {stageApps.map(app => (
                  <div key={app.id} className="glass rounded-xl p-3 border border-white/5 cursor-pointer hover:border-white/15 transition-all space-y-2"
                    onClick={() => setSelected(app)}>
                    <div className="font-medium text-white text-sm leading-tight">{app.candidateName}</div>
                    <div className="text-xs text-gray-400">{app.jobTitle}</div>
                    <div className="text-xs text-gray-500">{app.company} • {app.country}</div>
                    <div className="text-xs text-gray-600">{app.date}</div>
                    {app.stage === 'travel' && (
                      <div className="text-xs text-cyan-400">✈️ قائمة السفر متاحة</div>
                    )}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* قائمة كاملة */}
      {filtered.length > 0 && (
        <div className="space-y-3 mt-2">
          <div className="text-xs text-gray-500">
            {filterStage ? `${STAGES.find(s=>s.key===filterStage)?.label} (${filtered.length})` : `جميع الملفات (${filtered.length})`}
            {filterStage && <button onClick={()=>setFilterStage('')} className="mr-2 text-blue-400 hover:underline">× إلغاء الفلتر</button>}
          </div>
          {filtered.map(app => (
            <ApplicationCard key={app.id} app={app} onUpdateStage={onUpdateStage} onDelete={onDelete} onSelect={setSelected} />
          ))}
        </div>
      )}

      {applications.length === 0 && (
        <div className="text-center py-20 text-gray-500 space-y-3">
          <div className="text-5xl">📋</div>
          <div className="font-medium text-gray-400">لا توجد ملفات متابعة بعد</div>
          <div className="text-sm">أضف ملفاً جديداً لبدء المتابعة</div>
          <button onClick={() => setShowAdd(true)} className="btn-primary px-5 py-2 rounded-xl text-sm text-white">+ ملف جديد</button>
        </div>
      )}
    </div>
  )
}

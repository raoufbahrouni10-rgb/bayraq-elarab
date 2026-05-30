import { useState } from 'react'

const VISA_STAGES = [
  { key:'docs',      label:'جمع الوثائق',    icon:'📋', color:'blue' },
  { key:'submitted', label:'تقديم الطلب',    icon:'📤', color:'amber' },
  { key:'processing',label:'قيد المعالجة',   icon:'⏳', color:'purple' },
  { key:'approved',  label:'موافقة',          icon:'✅', color:'emerald' },
  { key:'rejected',  label:'رفض',             icon:'❌', color:'red' },
  { key:'expired',   label:'منتهية',          icon:'⚠️', color:'gray' },
]

const STAGE_COLORS = {
  docs:'bg-blue-500/20 text-blue-300 border-blue-500/30',
  submitted:'bg-amber-500/20 text-amber-300 border-amber-500/30',
  processing:'bg-purple-500/20 text-purple-300 border-purple-500/30',
  approved:'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  rejected:'bg-red-500/20 text-red-300 border-red-500/30',
  expired:'bg-gray-500/20 text-gray-300 border-gray-500/30',
}

const KEY = 'bayraq_visas'
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)||'[]') } catch { return [] } }
const save = (d) => { try { localStorage.setItem(KEY, JSON.stringify(d)) } catch {} }

export default function VisaTrackingPage({ db, applications }) {
  const [visas, setVisas] = useState(load)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ candidateName:'', country:'', visaType:'عمل', stage:'docs', submitDate:'', expiryDate:'', notes:'' })
  const [filter, setFilter] = useState('')

  const update = (data) => { setVisas(data); save(data) }

  const addVisa = () => {
    if (!form.candidateName) return
    const newV = { ...form, id: Date.now(), createdAt: new Date().toISOString().split('T')[0] }
    update([newV, ...visas])
    setForm({ candidateName:'', country:'', visaType:'عمل', stage:'docs', submitDate:'', expiryDate:'', notes:'' })
    setShowAdd(false)
  }

  const updateStage = (id, stage) => {
    update(visas.map(v => v.id===id ? {...v, stage} : v))
  }

  const deleteVisa = (id) => update(visas.filter(v => v.id!==id))

  const getDaysLeft = (date) => {
    if (!date) return null
    const diff = Math.ceil((new Date(date) - new Date()) / (1000*60*60*24))
    return diff
  }

  const filtered = visas.filter(v =>
    !filter || v.stage===filter || v.candidateName.includes(filter) || v.country.includes(filter)
  )

  const expiringSoon = visas.filter(v => {
    const d = getDaysLeft(v.expiryDate)
    return d !== null && d <= 30 && d > 0
  })

  const candidates = [...new Set([...db.map(c=>c.name), ...applications.map(a=>a.candidateName)])]

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white mb-0.5">متابعة التأشيرات 🛂</h1>
          <p className="text-gray-400 text-sm">{visas.length} تأشيرة • {visas.filter(v=>v.stage==='approved').length} موافق عليها</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="btn-primary px-4 py-2.5 rounded-xl text-sm text-white font-semibold flex items-center gap-2">
          ➕ تأشيرة جديدة
        </button>
      </div>

      {/* تنبيهات انتهاء الصلاحية */}
      {expiringSoon.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-2">
          <div className="text-sm font-semibold text-amber-300">⚠️ تأشيرات تنتهي قريباً</div>
          {expiringSoon.map(v => (
            <div key={v.id} className="flex items-center justify-between text-xs">
              <span className="text-gray-300">{v.candidateName} — {v.country}</span>
              <span className="text-amber-400 font-semibold">تنتهي خلال {getDaysLeft(v.expiryDate)} يوم</span>
            </div>
          ))}
        </div>
      )}

      {/* نموذج الإضافة */}
      {showAdd && (
        <div className="glass rounded-2xl p-5 border border-white/10 space-y-4 animate-slide-up">
          <div className="text-sm font-semibold text-gray-200">➕ إضافة تأشيرة جديدة</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-gray-500 block mb-1">اسم المترشح</label>
              <select value={form.candidateName} onChange={e=>setForm(p=>({...p,candidateName:e.target.value}))}
                className="input-dark w-full px-3 py-2.5 rounded-xl text-sm">
                <option value="">اختر مترشحاً...</option>
                {candidates.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            {[
              {key:'country',  label:'الدولة',      placeholder:'السعودية'},
              {key:'visaType', label:'نوع التأشيرة', placeholder:'عمل'},
              {key:'submitDate',label:'تاريخ التقديم', type:'date'},
              {key:'expiryDate',label:'تاريخ الانتهاء', type:'date'},
            ].map(f=>(
              <div key={f.key}>
                <label className="text-xs text-gray-500 block mb-1">{f.label}</label>
                <input type={f.type||'text'} value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                  placeholder={f.placeholder} className="input-dark w-full px-3 py-2.5 rounded-xl text-sm" />
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-500 block mb-1">المرحلة</label>
              <select value={form.stage} onChange={e=>setForm(p=>({...p,stage:e.target.value}))}
                className="input-dark w-full px-3 py-2.5 rounded-xl text-sm">
                {VISA_STAGES.map(s=><option key={s.key} value={s.key}>{s.icon} {s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">ملاحظات</label>
              <input value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}
                placeholder="..." className="input-dark w-full px-3 py-2.5 rounded-xl text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addVisa} disabled={!form.candidateName}
              className="btn-primary flex-1 py-2.5 rounded-xl text-sm text-white font-semibold disabled:opacity-40">
              💾 حفظ
            </button>
            <button onClick={()=>setShowAdd(false)}
              className="px-4 border border-white/10 rounded-xl text-sm text-gray-400 hover:bg-white/5">
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* فلاتر */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={()=>setFilter('')}
          className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${!filter?'btn-primary text-white border-transparent':'border-white/10 text-gray-400 hover:bg-white/5'}`}>
          الكل ({visas.length})
        </button>
        {VISA_STAGES.map(s=>(
          <button key={s.key} onClick={()=>setFilter(s.key)}
            className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${filter===s.key?'btn-primary text-white border-transparent':'border-white/10 text-gray-400 hover:bg-white/5'}`}>
            {s.icon} {s.label} ({visas.filter(v=>v.stage===s.key).length})
          </button>
        ))}
      </div>

      {/* قائمة التأشيرات */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-4xl mb-3">🛂</div>
          <div>لا توجد تأشيرات</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(v => {
            const daysLeft = getDaysLeft(v.expiryDate)
            const stage = VISA_STAGES.find(s=>s.key===v.stage)
            return (
              <div key={v.id} className="glass rounded-2xl p-4 border border-white/5">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{stage?.icon||'🛂'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white text-sm">{v.candidateName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${STAGE_COLORS[v.stage]||''}`}>
                        {stage?.label}
                      </span>
                      {daysLeft !== null && daysLeft <= 30 && daysLeft > 0 && (
                        <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                          ⚠️ {daysLeft} يوم
                        </span>
                      )}
                      {daysLeft !== null && daysLeft <= 0 && (
                        <span className="text-xs bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full">
                          منتهية
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                      <span>🌍 {v.country}</span>
                      <span>📋 {v.visaType}</span>
                      {v.submitDate && <span>📅 {v.submitDate}</span>}
                      {v.expiryDate && <span>⏰ {v.expiryDate}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <select value={v.stage} onChange={e=>updateStage(v.id,e.target.value)}
                      className="input-dark text-xs px-2 py-1 rounded-lg">
                      {VISA_STAGES.map(s=><option key={s.key} value={s.key}>{s.icon} {s.label}</option>)}
                    </select>
                    <button onClick={()=>deleteVisa(v.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors px-2">🗑</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

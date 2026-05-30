import { useState } from 'react'
import { waLink } from '../lib/whatsapp'

const KEY = 'bayraq_fees'
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)||'[]') } catch { return [] } }
const save = (d) => { try { localStorage.setItem(KEY, JSON.stringify(d)) } catch {} }

const STAGES = [
  { key:'registration', label:'تسجيل',      icon:'📋', amount:100 },
  { key:'docs',         label:'وثائق',       icon:'📄', amount:150 },
  { key:'medical',      label:'طبي',         icon:'🏥', amount:200 },
  { key:'visa',         label:'تأشيرة',      icon:'🛂', amount:300 },
  { key:'ticket',       label:'تذكرة سفر',   icon:'✈️', amount:500 },
  { key:'agency',       label:'رسوم وكالة',  icon:'🏢', amount:1000 },
]

export default function RecruitmentFeesPage({ db, applications }) {
  const [fees, setFees] = useState(load)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ candidateName:'', currency:'TND', notes:'' })
  const [search, setSearch] = useState('')

  const update = (data) => { setFees(data); save(data) }

  const addFee = () => {
    if (!form.candidateName) return
    const newF = {
      ...form, id:Date.now(),
      stages: STAGES.reduce((acc,s) => ({ ...acc, [s.key]:{ paid:false, amount:s.amount, date:'' } }), {}),
      createdAt: new Date().toISOString().split('T')[0]
    }
    update([newF, ...fees])
    setForm({ candidateName:'', currency:'TND', notes:'' })
    setShowAdd(false)
  }

  const toggleStage = (feeId, stageKey) => {
    update(fees.map(f => f.id===feeId ? {
      ...f, stages: { ...f.stages, [stageKey]: {
        ...f.stages[stageKey],
        paid: !f.stages[stageKey].paid,
        date: !f.stages[stageKey].paid ? new Date().toISOString().split('T')[0] : ''
      }}
    } : f))
  }

  const getTotalPaid = (f) => STAGES.filter(s => f.stages?.[s.key]?.paid).reduce((sum,s) => sum + (f.stages[s.key]?.amount||s.amount), 0)
  const getTotalAll  = (f) => STAGES.reduce((sum,s) => sum + (f.stages?.[s.key]?.amount||s.amount), 0)

  const filtered = fees.filter(f => !search || f.candidateName?.includes(search))
  const candidates = [...new Set([...db.map(c=>c.name), ...applications.map(a=>a.candidateName)])]

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white mb-0.5">💳 رسوم الاستقدام</h1>
          <p className="text-gray-400 text-sm">{fees.length} ملف • {fees.filter(f=>getTotalPaid(f)===getTotalAll(f)).length} مكتمل</p>
        </div>
        <button onClick={()=>setShowAdd(!showAdd)}
          className="btn-primary px-4 py-2.5 rounded-xl text-sm text-white font-semibold">➕ ملف رسوم جديد</button>
      </div>

      {showAdd && (
        <div className="glass rounded-2xl p-5 border border-white/10 space-y-4 animate-slide-up">
          <div className="text-sm font-semibold text-gray-200">➕ ملف رسوم جديد</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-gray-500 block mb-1">اسم المترشح</label>
              <input value={form.candidateName} onChange={e=>setForm(p=>({...p,candidateName:e.target.value}))}
                list="cand-fees" placeholder="اسم المترشح"
                className="input-dark w-full px-3 py-2.5 rounded-xl text-sm" />
              <datalist id="cand-fees">{candidates.map(c=><option key={c} value={c}/>)}</datalist>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">العملة</label>
              <select value={form.currency} onChange={e=>setForm(p=>({...p,currency:e.target.value}))}
                className="input-dark w-full px-3 py-2.5 rounded-xl text-sm">
                {['TND','SAR','AED','EUR','USD'].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">ملاحظات</label>
              <input value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}
                placeholder="..." className="input-dark w-full px-3 py-2.5 rounded-xl text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addFee} disabled={!form.candidateName}
              className="btn-primary flex-1 py-2.5 rounded-xl text-sm text-white font-semibold disabled:opacity-40">💾 حفظ</button>
            <button onClick={()=>setShowAdd(false)} className="px-4 border border-white/10 rounded-xl text-sm text-gray-400">إلغاء</button>
          </div>
        </div>
      )}

      <div className="relative">
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="ابحث..." className="input-dark w-full pr-9 pl-4 py-2.5 rounded-xl text-sm" />
      </div>

      <div className="space-y-4">
        {filtered.map(f => {
          const paid = getTotalPaid(f)
          const total = getTotalAll(f)
          const pct = Math.round((paid/total)*100)
          const cv = db.find(c=>c.name===f.candidateName)
          return (
            <div key={f.id} className="glass rounded-2xl p-5 border border-white/5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="font-bold text-white">{f.candidateName}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{f.createdAt}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black" style={{color:'#C9A227'}}>
                    {paid.toLocaleString()} / {total.toLocaleString()} {f.currency}
                  </div>
                  <div className="text-xs text-gray-400">{pct}% مدفوع</div>
                </div>
              </div>

              {/* شريط التقدم */}
              <div className="h-2 rounded-full bg-white/5">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{width:`${pct}%`, background: pct===100?'#10b981':'linear-gradient(90deg,#1B3A6B,#C9A227)'}}></div>
              </div>

              {/* مراحل الدفع */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {STAGES.map(s => {
                  const stage = f.stages?.[s.key] || {}
                  return (
                    <button key={s.key} onClick={()=>toggleStage(f.id, s.key)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs transition-all text-right
                        ${stage.paid ? 'bg-emerald-500/15 border-emerald-500/30' : 'bg-white/[0.03] border-white/8 hover:bg-white/5'}`}>
                      <span className={`w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 text-xs
                        ${stage.paid ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-white/20'}`}>
                        {stage.paid ? '✓' : ''}
                      </span>
                      <div>
                        <div className={stage.paid ? 'text-emerald-300' : 'text-gray-400'}>{s.icon} {s.label}</div>
                        <div className="text-gray-600 font-mono">{(stage.amount||s.amount).toLocaleString()}</div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {cv?.phone && (
                <a href={waLink(cv.phone, `السيد/السيدة ${f.candidateName}،\n\nتذكير بدفع رسوم الاستقدام.\n\nبيرق العرب`)}
                  target="_blank" rel="noreferrer"
                  className="text-xs px-3 py-2 rounded-xl text-white inline-flex items-center gap-2"
                  style={{background:'linear-gradient(135deg,#25d366,#128c7e)'}}>
                  💬 إرسال تذكير
                </a>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <div className="text-4xl mb-3">💳</div>
            <div>لا توجد ملفات رسوم</div>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'

const KEY = 'bayraq_reminders'
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)||'[]') } catch { return [] } }
const save = (d) => { try { localStorage.setItem(KEY, JSON.stringify(d)) } catch {} }

export default function RemindersPage({ db, applications }) {
  const [reminders, setReminders] = useState(load)
  const [showAdd, setShowAdd]     = useState(false)
  const [form, setForm]           = useState({ title:'', date:'', time:'09:00', type:'interview', candidateName:'', notes:'' })

  const update = (data) => { setReminders(data); save(data) }

  const TYPES = [
    { key:'interview', label:'مقابلة عمل',    icon:'🎙️', color:'#8b5cf6' },
    { key:'docs',      label:'استلام مستندات', icon:'📋', color:'#f59e0b' },
    { key:'travel',    label:'موعد سفر',        icon:'✈️', color:'#06b6d4' },
    { key:'payment',   label:'دفع رسوم',        icon:'💰', color:'#10b981' },
    { key:'followup',  label:'متابعة',          icon:'🔄', color:'#3b82f6' },
    { key:'other',     label:'أخرى',            icon:'📌', color:'#94a3b8' },
  ]

  const addReminder = () => {
    if (!form.title || !form.date) return
    update([{ ...form, id:Date.now(), done:false }, ...reminders])
    setForm({ title:'', date:'', time:'09:00', type:'interview', candidateName:'', notes:'' })
    setShowAdd(false)
  }

  const toggleDone = (id) => update(reminders.map(r => r.id===id ? {...r, done:!r.done} : r))
  const deleteR    = (id) => update(reminders.filter(r => r.id!==id))

  const today     = new Date().toISOString().split('T')[0]
  const tomorrow  = new Date(Date.now()+86400000).toISOString().split('T')[0]

  const todayR    = reminders.filter(r => !r.done && r.date===today)
  const tomorrowR = reminders.filter(r => !r.done && r.date===tomorrow)
  const upcomingR = reminders.filter(r => !r.done && r.date>tomorrow).sort((a,b)=>a.date.localeCompare(b.date))
  const doneR     = reminders.filter(r => r.done)

  const candidates = [...new Set([...db.map(c=>c.name), ...applications.map(a=>a.candidateName)])]

  const ReminderCard = ({ r }) => {
    const type = TYPES.find(t=>t.key===r.type) || TYPES[5]
    return (
      <div className={`glass rounded-xl p-3 border transition-all flex items-center gap-3 ${r.done?'opacity-50 border-white/5':'border-white/8'}`}>
        <button onClick={()=>toggleDone(r.id)}
          className="w-6 h-6 rounded-lg border flex items-center justify-center flex-shrink-0 transition-all"
          style={{borderColor: r.done?'transparent':type.color, background: r.done?type.color:'transparent'}}>
          {r.done && <span className="text-white text-xs">✓</span>}
        </button>
        <span className="text-xl flex-shrink-0">{type.icon}</span>
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-medium ${r.done?'line-through text-gray-500':'text-white'}`}>{r.title}</div>
          <div className="flex gap-2 mt-0.5 text-xs text-gray-500 flex-wrap">
            <span>🕐 {r.time}</span>
            {r.candidateName && <span>👤 {r.candidateName}</span>}
            {r.notes && <span>📝 {r.notes}</span>}
          </div>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <span className="text-xs px-2 py-0.5 rounded-full" style={{background:`${type.color}20`, color:type.color}}>
            {type.label}
          </span>
          <button onClick={()=>deleteR(r.id)} className="text-gray-600 hover:text-red-400 transition-colors">🗑</button>
        </div>
      </div>
    )
  }

  const Section = ({ title, items, empty }) => items.length === 0 ? null : (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-gray-400 px-1">{title} ({items.length})</div>
      {items.map(r => <ReminderCard key={r.id} r={r} />)}
    </div>
  )

  return (
    <div className="animate-fade-in space-y-5 max-w-2xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white mb-0.5">🔔 التذكيرات والمواعيد</h1>
          <p className="text-gray-400 text-sm">{reminders.filter(r=>!r.done).length} تذكير نشط</p>
        </div>
        <button onClick={()=>setShowAdd(!showAdd)}
          className="btn-primary px-4 py-2.5 rounded-xl text-sm text-white font-semibold flex items-center gap-2">
          ➕ تذكير جديد
        </button>
      </div>

      {todayR.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center gap-3">
          <span className="text-2xl">⏰</span>
          <div>
            <div className="text-sm font-semibold text-amber-300">{todayR.length} مواعيد اليوم!</div>
            <div className="text-xs text-gray-400">{todayR.map(r=>r.title).join(' • ')}</div>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="glass rounded-2xl p-5 border border-white/10 space-y-4 animate-slide-up">
          <div className="text-sm font-semibold text-gray-200">➕ تذكير جديد</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-gray-500 block mb-1">عنوان التذكير *</label>
              <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))}
                placeholder="مثال: مقابلة أحمد محمد" className="input-dark w-full px-3 py-2.5 rounded-xl text-sm" autoFocus />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">التاريخ *</label>
              <input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}
                className="input-dark w-full px-3 py-2.5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">الوقت</label>
              <input type="time" value={form.time} onChange={e=>setForm(p=>({...p,time:e.target.value}))}
                className="input-dark w-full px-3 py-2.5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">النوع</label>
              <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}
                className="input-dark w-full px-3 py-2.5 rounded-xl text-sm">
                {TYPES.map(t=><option key={t.key} value={t.key}>{t.icon} {t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">المترشح (اختياري)</label>
              <input value={form.candidateName} onChange={e=>setForm(p=>({...p,candidateName:e.target.value}))}
                list="cand-list" placeholder="اختر أو اكتب..." className="input-dark w-full px-3 py-2.5 rounded-xl text-sm" />
              <datalist id="cand-list">{candidates.map(c=><option key={c} value={c}/>)}</datalist>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 block mb-1">ملاحظات</label>
              <input value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}
                placeholder="..." className="input-dark w-full px-3 py-2.5 rounded-xl text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addReminder} disabled={!form.title||!form.date}
              className="btn-primary flex-1 py-2.5 rounded-xl text-sm text-white font-semibold disabled:opacity-40">💾 حفظ</button>
            <button onClick={()=>setShowAdd(false)} className="px-4 border border-white/10 rounded-xl text-sm text-gray-400">إلغاء</button>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <Section title="⏰ اليوم" items={todayR} />
        <Section title="📅 غداً" items={tomorrowR} />
        <Section title="🗓️ قادم" items={upcomingR} />
        {reminders.filter(r=>!r.done).length===0 && reminders.length===0 && (
          <div className="text-center py-16 text-gray-500 space-y-3">
            <div className="text-5xl">🔔</div>
            <div>لا توجد تذكيرات — أضف أول تذكير!</div>
          </div>
        )}
        {doneR.length > 0 && (
          <details className="space-y-2">
            <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-400 transition-colors px-1">
              ✓ المكتملة ({doneR.length})
            </summary>
            <div className="space-y-1.5 mt-2">
              {doneR.map(r=><ReminderCard key={r.id} r={r}/>)}
            </div>
          </details>
        )}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { waLink } from '../lib/whatsapp'

const KEY = 'bayraq_interviews'
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)||'[]') } catch { return [] } }
const save = d => { try { localStorage.setItem(KEY, JSON.stringify(d)) } catch {} }

export default function InterviewsPage({ db, applications }) {
  const [interviews, setInterviews] = useState(load)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ candidateName:'', date:'', time:'09:00', type:'online', location:'', notes:'' })
  const [view, setView] = useState('upcoming')

  const update = d => { setInterviews(d); save(d) }

  const add = () => {
    if (!form.candidateName || !form.date) return
    update([{ ...form, id:Date.now(), status:'pending' }, ...interviews])
    setForm({ candidateName:'', date:'', time:'09:00', type:'online', location:'', notes:'' })
    setShowAdd(false)
  }

  const confirm  = id => update(interviews.map(i => i.id===id ? {...i, status:'confirmed'} : i))
  const complete = id => update(interviews.map(i => i.id===id ? {...i, status:'done'} : i))
  const cancel   = id => update(interviews.map(i => i.id===id ? {...i, status:'cancelled'} : i))
  const remove   = id => update(interviews.filter(i => i.id!==id))

  const today    = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now()+86400000).toISOString().split('T')[0]

  const filtered = interviews.filter(i => {
    if (view === 'upcoming')   return i.status !== 'done' && i.status !== 'cancelled' && i.date >= today
    if (view === 'today')      return i.date === today
    if (view === 'done')       return i.status === 'done'
    if (view === 'cancelled')  return i.status === 'cancelled'
    return true
  }).sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))

  const STATUS_STYLE = {
    pending:   { label:'منتظر',   color:'#f59e0b', bg:'bg-amber-500/20' },
    confirmed: { label:'مؤكّد',   color:'#10b981', bg:'bg-emerald-500/20' },
    done:      { label:'منتهي',   color:'#6b7280', bg:'bg-gray-500/20' },
    cancelled: { label:'ملغي',    color:'#ef4444', bg:'bg-red-500/20' },
  }

  const TYPE_ICONS = { online:'💻', phone:'📞', inperson:'🏢' }

  const candidates = [...new Set([...db.map(c=>c.name), ...applications.map(a=>a.candidateName)])]

  const todayCount = interviews.filter(i=>i.date===today && i.status!=='cancelled').length

  return (
    <div className="animate-fade-in space-y-5 max-w-2xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white mb-0.5">🎙️ جدول المقابلات</h1>
          <p className="text-gray-400 text-sm">{interviews.filter(i=>i.status==='pending'||i.status==='confirmed').length} مقابلة نشطة</p>
        </div>
        <button onClick={()=>setShowAdd(!showAdd)}
          className="btn-primary px-4 py-2.5 rounded-xl text-sm text-white font-semibold">
          ➕ مقابلة جديدة
        </button>
      </div>

      {todayCount > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 flex items-center gap-3">
          <span className="text-2xl">📅</span>
          <div>
            <div className="text-sm font-semibold text-blue-300">{todayCount} مقابلة اليوم!</div>
            <div className="text-xs text-gray-400">{interviews.filter(i=>i.date===today&&i.status!=='cancelled').map(i=>i.candidateName).join(' • ')}</div>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="glass rounded-2xl p-5 border border-white/10 space-y-4 animate-slide-up">
          <div className="text-sm font-semibold text-gray-200">➕ مقابلة جديدة</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-gray-500 block mb-1">اسم المترشح</label>
              <input value={form.candidateName} onChange={e=>setForm(p=>({...p,candidateName:e.target.value}))}
                list="cand-list" placeholder="اسم المترشح" className="input-dark w-full px-3 py-2.5 rounded-xl text-sm" />
              <datalist id="cand-list">{candidates.map(c=><option key={c} value={c}/>)}</datalist>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">التاريخ</label>
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
                <option value="online">💻 أونلاين</option>
                <option value="phone">📞 هاتف</option>
                <option value="inperson">🏢 حضوري</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">المكان / الرابط</label>
              <input value={form.location} onChange={e=>setForm(p=>({...p,location:e.target.value}))}
                placeholder="Zoom / عنوان..." className="input-dark w-full px-3 py-2.5 rounded-xl text-sm" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 block mb-1">ملاحظات</label>
              <input value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}
                placeholder="..." className="input-dark w-full px-3 py-2.5 rounded-xl text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={add} disabled={!form.candidateName||!form.date}
              className="btn-primary flex-1 py-2.5 rounded-xl text-sm text-white font-semibold disabled:opacity-40">💾 حفظ</button>
            <button onClick={()=>setShowAdd(false)} className="px-4 border border-white/10 rounded-xl text-sm text-gray-400">إلغاء</button>
          </div>
        </div>
      )}

      {/* فلاتر */}
      <div className="flex gap-2 flex-wrap">
        {[['upcoming','القادمة'],['today','اليوم'],['done','المنتهية'],['cancelled','الملغية']].map(([k,l]) => (
          <button key={k} onClick={()=>setView(k)}
            className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${view===k?'btn-primary text-white border-transparent':'border-white/10 text-gray-400 hover:bg-white/5'}`}>
            {l} ({interviews.filter(i=> k==='upcoming'?(i.status!=='done'&&i.status!=='cancelled'&&i.date>=today): k==='today'?(i.date===today): i.status===k).length})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500 space-y-2">
            <div className="text-4xl">🎙️</div>
            <div className="text-sm">لا توجد مقابلات</div>
          </div>
        ) : filtered.map(iv => {
          const s = STATUS_STYLE[iv.status] || STATUS_STYLE.pending
          const cv = db.find(c => c.name === iv.candidateName)
          const isToday = iv.date === today
          const isTomorrow = iv.date === tomorrow
          return (
            <div key={iv.id} className={`glass rounded-2xl p-4 border space-y-3 ${isToday?'border-blue-500/30 bg-blue-500/5':'border-white/5'}`}>
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0">{TYPE_ICONS[iv.type]||'🎙️'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white text-sm">{iv.candidateName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.bg}`} style={{color:s.color}}>{s.label}</span>
                    {isToday && <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">اليوم!</span>}
                    {isTomorrow && <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">غداً</span>}
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                    <span>📅 {iv.date}</span>
                    <span>🕐 {iv.time}</span>
                    {iv.location && <span>📍 {iv.location}</span>}
                  </div>
                  {iv.notes && <div className="text-xs text-gray-500 mt-1">📝 {iv.notes}</div>}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {iv.status==='pending' && (
                  <button onClick={()=>confirm(iv.id)} className="text-xs px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-lg">✓ تأكيد</button>
                )}
                {['pending','confirmed'].includes(iv.status) && (
                  <button onClick={()=>complete(iv.id)} className="text-xs px-3 py-1.5 bg-blue-500/15 border border-blue-500/30 text-blue-300 rounded-lg">✅ إنهاء</button>
                )}
                {['pending','confirmed'].includes(iv.status) && cv?.phone && (
                  <a href={waLink(cv.phone, `السيد/السيدة ${iv.candidateName}،\n\nتذكير بموعد المقابلة:\n📅 ${iv.date} — 🕐 ${iv.time}\n${iv.location?'📍 '+iv.location:''}\n\nبيرق العرب`)}
                    target="_blank" rel="noreferrer"
                    className="text-xs px-3 py-1.5 text-white rounded-lg"
                    style={{background:'linear-gradient(135deg,#25d366,#128c7e)'}}>
                    💬 تذكير
                  </a>
                )}
                {['pending','confirmed'].includes(iv.status) && (
                  <button onClick={()=>cancel(iv.id)} className="text-xs px-3 py-1.5 bg-red-500/15 border border-red-500/30 text-red-300 rounded-lg">✕ إلغاء</button>
                )}
                <button onClick={()=>remove(iv.id)} className="text-xs px-3 py-1.5 border border-white/10 text-gray-500 rounded-lg hover:text-red-400">🗑</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

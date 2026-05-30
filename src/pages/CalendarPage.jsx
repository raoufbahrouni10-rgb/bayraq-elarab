import { useState } from 'react'

const KEY = 'bayraq_appointments'

const TYPES = [
  { key:'interview', label:'مقابلة',      icon:'🎙️', color:'purple' },
  { key:'contract',  label:'توقيع عقد',   icon:'📝', color:'amber' },
  { key:'travel',    label:'سفر',          icon:'✈️', color:'cyan' },
  { key:'meeting',   label:'اجتماع',       icon:'👥', color:'blue' },
  { key:'other',     label:'أخرى',         icon:'📌', color:'gray' },
]

const TYPE_COLORS = {
  purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  amber:  'bg-amber-500/20 text-amber-300 border-amber-500/30',
  cyan:   'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  blue:   'bg-blue-500/20 text-blue-300 border-blue-500/30',
  gray:   'bg-gray-500/20 text-gray-300 border-gray-500/30',
}

const MONTHS_AR = ['جانفي','فيفري','مارس','أفريل','ماي','جوان','جويلية','أوت','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
const DAYS_AR = ['أحد','اثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت']

export default function CalendarPage({ applications, db }) {
  const [appointments, setAppointments] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)||'[]') } catch { return [] }
  })
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title:'', candidateName:'', type:'interview', date:'', time:'09:00', notes:'' })
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())
  const [viewYear, setViewYear] = useState(new Date().getFullYear())

  const save = (data) => { localStorage.setItem(KEY, JSON.stringify(data)) }

  const addAppointment = () => {
    if (!form.title || !form.date) return
    const updated = [{ ...form, id: Date.now() }, ...appointments]
    setAppointments(updated); save(updated)
    setForm({ title:'', candidateName:'', type:'interview', date:'', time:'09:00', notes:'' })
    setShowAdd(false)
  }

  const deleteAppointment = (id) => {
    const updated = appointments.filter(a=>a.id!==id)
    setAppointments(updated); save(updated)
  }

  // أيام الشهر
  const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate()
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const today = new Date()

  const getAppointmentsForDay = (day) => {
    const dateStr = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    return appointments.filter(a => a.date === dateStr)
  }

  const upcoming = appointments
    .filter(a => new Date(a.date) >= today)
    .sort((a,b) => new Date(a.date) - new Date(b.date))
    .slice(0, 10)

  const candidates = [...new Set([...db.map(c=>c.name), ...applications.map(a=>a.candidateName)])]

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white mb-0.5">التقويم والمواعيد 📅</h1>
          <p className="text-gray-400 text-sm">جدولة المقابلات وتواريخ السفر والمواعيد</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary px-4 py-2 rounded-xl text-sm text-white flex items-center gap-2">
          + موعد جديد
        </button>
      </div>

      {/* نموذج إضافة موعد */}
      {showAdd && (
        <div className="glass rounded-2xl p-5 border border-white/10 space-y-4 animate-slide-up">
          <div className="text-sm font-semibold text-gray-200">إضافة موعد جديد</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-gray-500 block mb-1">العنوان *</label>
              <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))}
                placeholder="مثال: مقابلة أحمد العلي..." className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">المترشح</label>
              <select value={form.candidateName} onChange={e=>setForm(p=>({...p,candidateName:e.target.value}))}
                className="input-dark w-full px-3 py-2 rounded-xl text-sm">
                <option value="">اختر...</option>
                {candidates.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">النوع</label>
              <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}
                className="input-dark w-full px-3 py-2 rounded-xl text-sm">
                {TYPES.map(t=><option key={t.key} value={t.key}>{t.icon} {t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">التاريخ *</label>
              <input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}
                className="input-dark w-full px-3 py-2 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">الوقت</label>
              <input type="time" value={form.time} onChange={e=>setForm(p=>({...p,time:e.target.value}))}
                className="input-dark w-full px-3 py-2 rounded-xl text-sm" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 block mb-1">ملاحظات</label>
              <input value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}
                placeholder="رابط Zoom، عنوان، ملاحظة..." className="input-dark w-full px-4 py-2 rounded-xl text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addAppointment} className="btn-primary flex-1 py-2.5 rounded-xl text-sm text-white font-semibold">✅ حفظ الموعد</button>
            <button onClick={()=>setShowAdd(false)} className="px-4 py-2.5 border border-white/10 rounded-xl text-sm text-gray-400 hover:bg-white/5">إلغاء</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* تقويم الشهر */}
        <div className="glass rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <button onClick={()=>{ if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1)}else setViewMonth(m=>m-1) }}
              className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-400">←</button>
            <span className="text-sm font-semibold text-white">{MONTHS_AR[viewMonth]} {viewYear}</span>
            <button onClick={()=>{ if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1)}else setViewMonth(m=>m+1) }}
              className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-400">→</button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {DAYS_AR.map(d=><div key={d} className="text-center text-xs text-gray-600 py-1">{d}</div>)}
            {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`}></div>)}
            {Array.from({length:daysInMonth}).map((_,i)=>{
              const day = i+1
              const dayAppts = getAppointmentsForDay(day)
              const isToday = day===today.getDate()&&viewMonth===today.getMonth()&&viewYear===today.getFullYear()
              return (
                <div key={day} className={`relative text-center text-xs py-1.5 rounded-lg cursor-pointer transition-all
                  ${isToday?'bg-blue-500 text-white font-bold':'hover:bg-white/10 text-gray-300'}`}>
                  {day}
                  {dayAppts.length>0&&<div className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${isToday?'bg-white':'bg-amber-400'}`}></div>}
                </div>
              )
            })}
          </div>
        </div>

        {/* المواعيد القادمة */}
        <div className="glass rounded-2xl p-4 space-y-3">
          <div className="text-sm font-semibold text-gray-200">المواعيد القادمة ({upcoming.length})</div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {upcoming.length===0 && <div className="text-center py-8 text-gray-600 text-sm">لا توجد مواعيد قادمة</div>}
            {upcoming.map(a=>{
              const type = TYPES.find(t=>t.key===a.type)||TYPES[4]
              const tc = TYPE_COLORS[type.color]
              return (
                <div key={a.id} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-base flex-shrink-0">{type.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white">{a.title}</div>
                    {a.candidateName&&<div className="text-xs text-gray-500">{a.candidateName}</div>}
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${tc}`}>{type.label}</span>
                      <span className="text-xs text-gray-600">{a.date} {a.time}</span>
                    </div>
                  </div>
                  <button onClick={()=>deleteAppointment(a.id)} className="text-gray-700 hover:text-red-400 text-xs transition-colors flex-shrink-0">✕</button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

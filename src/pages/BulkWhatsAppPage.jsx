import { useState } from 'react'
import { waLink } from '../lib/whatsapp'

const STAGE_LABELS = { selected:'✅ اختيار', interview:'🎙️ مقابلة', contract:'📝 عقد', travel:'✈️ سفر', hired:'🎉 توظيف', rejected:'❌ رفض' }

const TEMPLATES = [
  { key:'reminder',  label:'تذكير موعد',    text:'السيد/السيدة {الاسم}،\n\nنذكّركم بموعدكم غداً. يرجى التأكيد.\n\nبيرق العرب' },
  { key:'docs',      label:'طلب مستندات',   text:'السيد/السيدة {الاسم}،\n\nيرجى تجهيز مستنداتكم في أقرب وقت.\n\nبيرق العرب' },
  { key:'update',    label:'تحديث الملف',   text:'السيد/السيدة {الاسم}،\n\nنتابع معكم بخصوص ملفكم. هل لديكم أي استفسار؟\n\nبيرق العرب' },
  { key:'congrats',  label:'تهانٍ',          text:'تهانينا {الاسم}! 🎉\n\nيسعدنا إبلاغكم بخبر سار. يرجى التواصل معنا.\n\nبيرق العرب' },
  { key:'custom',    label:'رسالة مخصصة',   text:'' },
]

export default function BulkWhatsAppPage({ db, applications }) {
  const [filter, setFilter]     = useState({ stage:'', search:'' })
  const [selected, setSelected] = useState(new Set())
  const [template, setTemplate] = useState(TEMPLATES[0])
  const [customMsg, setCustomMsg] = useState('')
  const [sending, setSending]   = useState(false)
  const [sent, setSent]         = useState(0)

  // دمج المترشحين مع ملفاتهم
  const candidates = db.filter(c => c.phone).map(c => {
    const app = applications.find(a => a.candidateName === c.name)
    return { ...c, stage: app?.stage || '', jobTitle: app?.jobTitle || '', company: app?.company || '' }
  })

  const filtered = candidates.filter(c => {
    if (filter.stage && c.stage !== filter.stage) return false
    if (filter.search && !c.name.includes(filter.search) && !c.spec.includes(filter.search)) return false
    return true
  })

  const toggleSelect = (id) => {
    const s = new Set(selected)
    if (s.has(id)) s.delete(id); else s.add(id)
    setSelected(s)
  }

  const selectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map(c=>c.id)))
  }

  const getMsg = (candidate) => {
    const msg = template.key === 'custom' ? customMsg : template.text
    return msg.replace('{الاسم}', candidate.name).replace('{التخصص}', candidate.spec||'')
  }

  const sendAll = async () => {
    const targets = filtered.filter(c => selected.has(c.id))
    if (!targets.length) return
    setSending(true); setSent(0)
    for (let i = 0; i < targets.length; i++) {
      const c = targets[i]
      const url = waLink(c.phone, getMsg(c))
      if (url) window.open(url, '_blank')
      setSent(i + 1)
      await new Promise(r => setTimeout(r, 2500))
    }
    setSending(false)
  }

  return (
    <div className="animate-fade-in space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-white mb-0.5">📤 إرسال واتساب جماعي</h1>
        <p className="text-gray-400 text-sm">أرسل رسالة واحدة لعدة مترشحين دفعة واحدة</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* اختيار المترشحين */}
        <div className="space-y-3">
          <div className="text-sm font-semibold text-gray-200">👥 اختر المترشحين</div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
              <input value={filter.search} onChange={e=>setFilter(p=>({...p,search:e.target.value}))}
                placeholder="ابحث..." className="input-dark w-full pr-9 pl-3 py-2 rounded-xl text-sm" />
            </div>
            <select value={filter.stage} onChange={e=>setFilter(p=>({...p,stage:e.target.value}))}
              className="input-dark px-3 py-2 rounded-xl text-xs">
              <option value="">كل المراحل</option>
              {Object.entries(STAGE_LABELS).map(([k,l])=><option key={k} value={k}>{l}</option>)}
            </select>
          </div>

          <div className="flex items-center justify-between px-1">
            <button onClick={selectAll}
              className="text-xs text-blue-400 hover:underline">
              {selected.size === filtered.length ? 'إلغاء الكل' : 'اختيار الكل'} ({filtered.length})
            </button>
            <span className="text-xs text-gray-500">{selected.size} محدد</span>
          </div>

          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-gray-600 text-sm">لا يوجد مترشحون بأرقام واتساب</div>
            ) : filtered.map(c => (
              <div key={c.id}
                onClick={() => toggleSelect(c.id)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border
                  ${selected.has(c.id)?'bg-blue-500/15 border-blue-500/30':'glass border-white/5 hover:bg-white/5'}`}>
                <div className={`w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 transition-all
                  ${selected.has(c.id)?'bg-blue-500 border-blue-500':'border-white/20'}`}>
                  {selected.has(c.id) && <span className="text-white text-xs">✓</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{c.name}</div>
                  <div className="text-xs text-gray-500 font-mono" dir="ltr">{c.phone}</div>
                </div>
                {c.stage && (
                  <span className="text-xs text-gray-600">{STAGE_LABELS[c.stage]?.split(' ')[0]}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* الرسالة */}
        <div className="space-y-3">
          <div className="text-sm font-semibold text-gray-200">💬 الرسالة</div>

          <div className="flex flex-wrap gap-1.5">
            {TEMPLATES.map(t => (
              <button key={t.key} onClick={() => setTemplate(t)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all
                  ${template.key===t.key?'bg-green-500/20 border-green-500/40 text-green-300':'border-white/10 text-gray-400 hover:bg-white/5'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {template.key === 'custom' ? (
            <textarea value={customMsg} onChange={e=>setCustomMsg(e.target.value)}
              rows={6} placeholder="اكتب رسالتك... استخدم {الاسم} للاسم تلقائياً"
              className="input-dark w-full px-4 py-3 rounded-xl text-sm resize-none leading-relaxed" />
          ) : (
            <div className="glass rounded-xl p-4 border border-green-500/10 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed min-h-36">
              {template.text.replace('{الاسم}', 'اسم المترشح')}
            </div>
          )}

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300 space-y-1">
            <div>📌 ملاحظات:</div>
            <div>• سيُفتح واتساب لكل رقم بتأخير 2.5 ثانية</div>
            <div>• تأكد من السماح بالنوافذ المنبثقة في متصفحك</div>
            <div>• {'{الاسم}'} يُستبدل تلقائياً باسم كل مترشح</div>
          </div>

          <button onClick={sendAll}
            disabled={selected.size === 0 || sending || (template.key==='custom'&&!customMsg)}
            className="w-full py-3.5 rounded-xl text-sm font-bold text-white disabled:opacity-40 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
            style={{background:'linear-gradient(135deg,#25d366,#128c7e)', boxShadow:'0 4px 15px rgba(37,211,102,0.3)'}}>
            {sending
              ? <><span className="animate-spin">⟳</span> جارٍ الإرسال... ({sent}/{selected.size})</>
              : <>💬 إرسال لـ {selected.size} مترشح</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

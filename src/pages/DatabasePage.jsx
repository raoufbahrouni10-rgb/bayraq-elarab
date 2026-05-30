import { useState, useRef } from 'react'
import { openWhatsApp, candidateMsg, waLink } from '../lib/whatsapp'

const COLORS = ['blue','cyan','purple','amber','emerald','rose']
const COLOR_MAP = {
  blue:    { bg:'bg-blue-500/20',    text:'text-blue-300',    border:'border-blue-500/30' },
  cyan:    { bg:'bg-cyan-500/20',    text:'text-cyan-300',    border:'border-cyan-500/30' },
  purple:  { bg:'bg-purple-500/20',  text:'text-purple-300',  border:'border-purple-500/30' },
  amber:   { bg:'bg-amber-500/20',   text:'text-amber-300',   border:'border-amber-500/30' },
  emerald: { bg:'bg-emerald-500/20', text:'text-emerald-300', border:'border-emerald-500/30' },
  rose:    { bg:'bg-rose-500/20',    text:'text-rose-300',    border:'border-rose-500/30' },
}
const SOURCE_BADGE = {
  local:    { label:'محلي',     style:'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
  aneti:    { label:'ANETI',    style:'bg-purple-500/20 text-purple-300 border border-purple-500/30' },
  linkedin: { label:'LinkedIn', style:'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' },
  web:      { label:'ويب',      style:'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
}
const CITIES = ['تونس العاصمة','صفاقس','سوسة','بنزرت','القيروان','قابس','مدنين','أريانة','بن عروس','منوبة','نابل','المنستير','المهدية','سيدي بوزيد','قفصة','توزر','قبلي','الكاف','سليانة','جندوبة','باجة','زغوان']
const SPECS = [
  'تمريض عام','تمريض طوارئ','تمريض ICU','مساعد طبيب','فني مختبر','فني أشعة',
  'صيدلة','طب أسنان','طب بشري','فيزيوثيرابي','تغذية وحمية',
  'هندسة مدنية','هندسة كهربائية','هندسة ميكانيكية','هندسة برمجيات','هندسة معمارية',
  'مساحة','نجارة','حدادة','بناء وأشغال','دهان وديكور','سباكة','تكييف وتبريد',
  'مطور ويب','مطور تطبيقات','محلل بيانات','أمن معلومات','مدير شبكات','دعم تقني','تصميم جرافيك',
  'محاسبة ومالية','مدقق مالي','محلل مالي','إدارة أعمال','تسويق ومبيعات','موارد بشرية','سكرتارية',
  'سياحة وفندقة','طبخ وتغذية','نادل وخدمة','استقبال','تدبير منزلي',
  'سياقة خاصة','سياقة شاحنة','سياقة حافلة','لوجستيك','مشغّل رافعة',
  'تعليم رياضيات','تعليم علوم','تعليم إنجليزية','تعليم عربية','تدريب مهني',
  'أمن وحراسة','مراقبة كاميرات','حارس VIP',
  'زراعة وبستنة','بيطرة','خياطة وأزياء','تجميل وحلاقة','أخرى',
]

function initials(n) { return (n||'?').split(' ').slice(0,2).map(w=>w[0]||'?').join('') }

// ===== نافذة واتساب =====
function WhatsAppModal({ candidate, onClose }) {
  const [msgType, setMsgType] = useState('welcome')
  const [customMsg, setCustomMsg] = useState('')
  const [useCustom, setUseCustom] = useState(false)

  const MSG_TYPES = [
    { key:'welcome',   label:'ترحيب' },
    { key:'interview', label:'دعوة مقابلة' },
    { key:'docs',      label:'طلب مستندات' },
    { key:'congrats',  label:'تهانٍ بالقبول' },
    { key:'followup',  label:'متابعة' },
  ]

  const currentMsg = useCustom ? customMsg : candidateMsg(candidate, msgType)

  const send = () => {
    if (!candidate.phone) { alert('لا يوجد رقم هاتف لهذا المترشح'); return }
    openWhatsApp(candidate.phone, currentMsg)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="glass rounded-2xl w-full max-w-md border border-white/10 animate-scale-in" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-xl">💬</span>
            <div>
              <div className="text-sm font-bold text-white">إرسال واتساب</div>
              <div className="text-xs text-gray-400">{candidate.name}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl">×</button>
        </div>
        <div className="p-4 space-y-4">
          {!candidate.phone && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-300">
              ⚠️ لا يوجد رقم هاتف — أضف رقم الهاتف في بيانات المترشح أولاً
            </div>
          )}

          {/* نوع الرسالة */}
          <div>
            <div className="text-xs text-gray-500 mb-2">اختر نوع الرسالة</div>
            <div className="flex flex-wrap gap-1.5">
              {MSG_TYPES.map(m => (
                <button key={m.key} onClick={() => { setMsgType(m.key); setUseCustom(false) }}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all
                    ${!useCustom&&msgType===m.key ? 'bg-green-500/20 border-green-500/40 text-green-300' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}>
                  {m.label}
                </button>
              ))}
              <button onClick={() => setUseCustom(true)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all
                  ${useCustom ? 'bg-blue-500/20 border-blue-500/40 text-blue-300' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}>
                ✏️ مخصصة
              </button>
            </div>
          </div>

          {/* معاينة الرسالة */}
          <div>
            <div className="text-xs text-gray-500 mb-1.5">معاينة الرسالة</div>
            {useCustom ? (
              <textarea value={customMsg} onChange={e=>setCustomMsg(e.target.value)}
                rows={5} placeholder="اكتب رسالتك..."
                className="input-dark w-full px-3 py-2 rounded-xl text-sm resize-none leading-relaxed" />
            ) : (
              <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3 text-xs text-gray-300 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                {currentMsg}
              </div>
            )}
          </div>

          {/* رقم الهاتف */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">📱 الهاتف:</span>
            <span className={candidate.phone ? 'text-green-400 font-mono' : 'text-red-400'}>
              {candidate.phone || 'غير مسجّل'}
            </span>
          </div>

          <div className="flex gap-2">
            <button onClick={send} disabled={!candidate.phone}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40 transition-all hover:-translate-y-0.5"
              style={{background:'linear-gradient(135deg, #25d366, #128c7e)'}}>
              💬 إرسال عبر واتساب
            </button>
            <button onClick={onClose}
              className="px-4 py-2.5 border border-white/10 rounded-xl text-sm text-gray-400 hover:bg-white/5">
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ===== نموذج إضافة مترشح =====
function AddCandidateForm({ onSave, onClose }) {
  const [tab, setTab]         = useState('manual')
  const [form, setForm]       = useState({ name:'', spec:'', age:'', exp:'', city:'تونس العاصمة', phone:'', skills:'', source:'local', notes:'' })
  const [file, setFile]       = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzed, setAnalyzed]   = useState(null)
  const [error, setError]     = useState('')
  const [dragOver, setDragOver]   = useState(false)
  const fileRef = useRef()

  const handleManualSave = () => {
    if (!form.name.trim()) { setError('الاسم مطلوب'); return }
    onSave({ name:form.name.trim(), spec:form.spec||'غير محدد', age:parseInt(form.age)||0, exp:parseInt(form.exp)||0, city:form.city, phone:form.phone, skills:form.skills, source:form.source, notes:form.notes }, null)
    onClose()
  }

  const analyzeFile = async (f) => {
    setFile(f); setError(''); setAnalyzed(null); setAnalyzing(true)
    const text = await f.text()
    const key = (import.meta.env.VITE_ANTHROPIC_API_KEY||'').trim()
    if (!key || key==='your_anthropic_key_here') {
      setAnalyzed({ name:f.name.replace(/\.[^.]+$/,''), spec:'غير محدد', age:'', exp:'0', city:'تونس العاصمة', phone:'', skills:'', notes:'' })
      setAnalyzing(false); return
    }
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'x-api-key':key, 'anthropic-version':'2023-06-01' },
        body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1000,
          messages:[{ role:'user', content:`استخرج بيانات هذه السيرة وأجب بـ JSON فقط:
{"name":"الاسم","spec":"التخصص","age":رقم_أو_null,"exp":سنوات,"city":"المدينة","phone":"رقم الهاتف أو فارغ","skills":"مهارات","notes":"ملاحظة"}
النص:\n${text.slice(0,3500)}` }]
        })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      setAnalyzed(JSON.parse(data.content.map(b=>b.text||'').join('').replace(/```json|```/g,'').trim()))
    } catch(err) {
      setError('خطأ في التحليل: '+err.message)
      setAnalyzed({ name:f.name.replace(/\.[^.]+$/,''), spec:'غير محدد', age:'', exp:'0', city:'تونس العاصمة', phone:'', skills:'', notes:'' })
    }
    setAnalyzing(false)
  }

  const handleSaveAnalyzed = () => {
    if (!analyzed) return
    onSave({ name:String(analyzed.name||'مجهول'), spec:String(analyzed.spec||'غير محدد'), age:parseInt(analyzed.age)||0, exp:parseInt(analyzed.exp)||0, city:String(analyzed.city||'تونس العاصمة'), phone:String(analyzed.phone||''), skills:String(analyzed.skills||''), source:'local', notes:String(analyzed.notes||'') }, file)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="glass rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-white/10 animate-scale-in" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="text-base font-bold text-white">➕ إضافة مترشح جديد</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl">×</button>
        </div>
        <div className="flex border-b border-white/5">
          {[{k:'manual',l:'✍️ إدخال يدوي'},{k:'upload',l:'📄 رفع سيرة ذاتية'}].map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${tab===t.k?'text-white border-b-2 border-blue-400':'text-gray-400'}`}>
              {t.l}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">
          {tab==='manual' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 block mb-1.5">الاسم الكامل *</label>
                  <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}
                    placeholder="مثال: أحمد محمد العلي" className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" autoFocus />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">التخصص</label>
                  <select value={form.spec} onChange={e=>setForm(p=>({...p,spec:e.target.value}))} className="input-dark w-full px-3 py-2.5 rounded-xl text-sm">
                    <option value="">اختر...</option>
                    {SPECS.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">المدينة</label>
                  <select value={form.city} onChange={e=>setForm(p=>({...p,city:e.target.value}))} className="input-dark w-full px-3 py-2.5 rounded-xl text-sm">
                    {CITIES.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">العمر</label>
                  <input type="number" min="18" max="70" value={form.age} onChange={e=>setForm(p=>({...p,age:e.target.value}))}
                    placeholder="28" className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">سنوات الخبرة</label>
                  <input type="number" min="0" max="50" value={form.exp} onChange={e=>setForm(p=>({...p,exp:e.target.value}))}
                    placeholder="5" className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" />
                </div>

                {/* حقل الهاتف مع واتساب */}
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 block mb-1.5">📱 رقم الهاتف / واتساب</label>
                  <div className="flex gap-2">
                    <input value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))}
                      placeholder="مثال: 21612345678 أو +21612345678"
                      className="input-dark flex-1 px-4 py-2.5 rounded-xl text-sm font-mono" />
                    {form.phone && (
                      <a href={waLink(form.phone)} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-white font-medium transition-all hover:-translate-y-0.5"
                        style={{background:'linear-gradient(135deg,#25d366,#128c7e)'}}>
                        💬 تحقق
                      </a>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">أدخل الرقم مع كود البلد — مثال: 21612345678 (تونس)</div>
                </div>

                <div className="col-span-2">
                  <label className="text-xs text-gray-500 block mb-1.5">المهارات</label>
                  <input value={form.skills} onChange={e=>setForm(p=>({...p,skills:e.target.value}))}
                    placeholder="Excel، إدارة مشاريع، الفرنسية..." className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">المصدر</label>
                  <select value={form.source} onChange={e=>setForm(p=>({...p,source:e.target.value}))} className="input-dark w-full px-3 py-2.5 rounded-xl text-sm">
                    <option value="local">محلي</option><option value="aneti">ANETI</option>
                    <option value="linkedin">LinkedIn</option><option value="web">ويب</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">ملاحظات</label>
                  <input value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}
                    placeholder="ملاحظة..." className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" />
                </div>

                <div className="col-span-2">
                  <label className="text-xs text-gray-500 block mb-1.5">📎 إرفاق ملف السيرة (اختياري)</label>
                  <div onClick={()=>fileRef.current.click()}
                    className={`rounded-xl border border-dashed p-3 flex items-center gap-3 cursor-pointer transition-all
                      ${file?'border-emerald-500/40 bg-emerald-500/5':'border-white/10 hover:border-white/25'}`}>
                    <span className="text-xl">{file?'📄':'📎'}</span>
                    <span className="text-xs text-gray-400">{file?file.name:'اضغط لاختيار ملف PDF أو Word'}</span>
                    {file&&<button onClick={e=>{e.stopPropagation();setFile(null)}} className="mr-auto text-gray-600 hover:text-red-400 text-xs">✕</button>}
                    <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={e=>{const f=e.target.files[0];if(f)setFile(f)}} />
                  </div>
                </div>
              </div>
              {error&&<div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">⚠️ {error}</div>}
              <button onClick={handleManualSave} className="btn-primary w-full py-3 rounded-xl text-sm font-bold text-white">💾 حفظ في قاعدة البيانات</button>
            </>
          )}

          {tab==='upload' && (
            <>
              {!analyzed && !analyzing && (
                <div onClick={()=>fileRef.current.click()}
                  onDragOver={e=>{e.preventDefault();setDragOver(true)}}
                  onDragLeave={()=>setDragOver(false)}
                  onDrop={e=>{e.preventDefault();setDragOver(false);const f=e.dataTransfer.files[0];if(f)analyzeFile(f)}}
                  className={`rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all
                    ${dragOver?'border-blue-400 bg-blue-500/10':'border-white/10 hover:border-white/25'}`}>
                  <div className="text-5xl mb-3">📄</div>
                  <div className="font-semibold text-gray-200 text-sm mb-1">اسحب ملف السيرة الذاتية</div>
                  <div className="text-xs text-gray-500">PDF أو Word — سيُحلَّل بالذكاء الاصطناعي</div>
                  <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={e=>{const f=e.target.files[0];if(f)analyzeFile(f)}} />
                </div>
              )}
              {analyzing && (
                <div className="text-center py-10 space-y-3">
                  <div className="text-4xl animate-pulse">🤖</div>
                  <div className="text-sm text-blue-300">يحلّل الذكاء الاصطناعي السيرة...</div>
                  <div className="flex justify-center gap-1">
                    {[0,1,2].map(i=><div key={i} className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay:`${i*150}ms`}}></div>)}
                  </div>
                </div>
              )}
              {analyzed && !analyzing && (
                <div className="space-y-4">
                  {file && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-3">
                      <span className="text-2xl">📄</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-emerald-300 truncate">{file.name}</div>
                        <div className="text-xs text-gray-500">{(file.size/1024).toFixed(1)} KB</div>
                      </div>
                      <button onClick={()=>{setAnalyzed(null);setFile(null)}} className="text-gray-500 hover:text-gray-300 text-xs">↩</button>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {key:'name',label:'الاسم الكامل',full:true},
                      {key:'spec',label:'التخصص'},
                      {key:'age',label:'العمر'},
                      {key:'exp',label:'سنوات الخبرة'},
                      {key:'city',label:'المدينة'},
                      {key:'phone',label:'📱 الهاتف / واتساب'},
                      {key:'skills',label:'المهارات',full:true},
                      {key:'notes',label:'ملاحظات',full:true},
                    ].map(f=>(
                      <div key={f.key} className={f.full?'col-span-2':''}>
                        <label className="text-xs text-gray-500 block mb-1">{f.label}</label>
                        <input value={String(analyzed[f.key]||'')} onChange={e=>setAnalyzed(p=>({...p,[f.key]:e.target.value}))}
                          className="input-dark w-full px-3 py-2 rounded-xl text-sm" />
                      </div>
                    ))}
                  </div>
                  {error&&<div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">⚠️ {error}</div>}
                  <button onClick={handleSaveAnalyzed} className="btn-primary w-full py-3 rounded-xl text-sm font-bold text-white">💾 حفظ السيرة والملف</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ===== تفاصيل مترشح =====
function CandidateDetail({ cv, onClose, onDelete }) {
  const [showWA, setShowWA] = useState(false)
  const src = SOURCE_BADGE[cv.source] || SOURCE_BADGE.local

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      {showWA && <WhatsAppModal candidate={cv} onClose={() => setShowWA(false)} />}
      <div className="glass rounded-2xl w-full max-w-lg border border-white/10 animate-scale-in" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="text-base font-bold text-white">ملف المترشح</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl">×</button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300 font-bold text-xl">
              {initials(cv.name)}
            </div>
            <div>
              <div className="text-lg font-bold text-white">{cv.name}</div>
              <div className="text-sm text-gray-400">{cv.spec}</div>
              {cv.city&&<div className="text-xs text-gray-500">📍 {cv.city}</div>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              {label:'العمر',        val:cv.age?`${cv.age} سنة`:'—'},
              {label:'الخبرة',       val:cv.exp?`${cv.exp} سنة`:'—'},
              {label:'المصدر',       val:src.label},
              {label:'تاريخ الإضافة',val:cv.date},
            ].map(f=>(
              <div key={f.label} className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                <div className="text-xs text-gray-500 mb-0.5">{f.label}</div>
                <div className="text-sm font-medium text-gray-200">{f.val}</div>
              </div>
            ))}
            {cv.phone && (
              <div className="col-span-2 bg-green-500/5 rounded-xl p-3 border border-green-500/20 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">📱 رقم الهاتف / واتساب</div>
                  <div className="text-sm font-mono text-green-300">{cv.phone}</div>
                </div>
                <a href={waLink(cv.phone)} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-white font-medium transition-all hover:-translate-y-0.5"
                  style={{background:'linear-gradient(135deg,#25d366,#128c7e)'}}>
                  💬 اتصال مباشر
                </a>
              </div>
            )}
            {cv.skills&&(
              <div className="col-span-2 bg-white/[0.03] rounded-xl p-3 border border-white/5">
                <div className="text-xs text-gray-500 mb-0.5">المهارات</div>
                <div className="text-sm text-gray-200">{cv.skills}</div>
              </div>
            )}
          </div>

          {/* ملف السيرة */}
          {cv.file_url ? (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 space-y-2">
              <div className="text-xs text-blue-300 font-semibold">📄 ملف السيرة الذاتية</div>
              <div className="flex gap-2">
                <a href={cv.file_url} target="_blank" rel="noreferrer" className="flex-1 btn-primary py-2 rounded-xl text-xs text-white text-center">👁️ عرض</a>
                <a href={cv.file_url} download={cv.file_name} className="flex-1 py-2 rounded-xl text-xs border border-white/10 text-gray-300 text-center hover:bg-white/5">⬇️ تحميل</a>
              </div>
            </div>
          ) : cv.file_name ? (
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex items-center gap-2 text-xs text-gray-400">
              <span>📄</span><span>{cv.file_name} (محفوظ محلياً)</span>
            </div>
          ) : null}

          {/* أزرار الإجراءات */}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setShowWA(true)}
              className="py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
              style={{background:'linear-gradient(135deg,#25d366,#128c7e)'}}>
              💬 إرسال واتساب
            </button>
            <button onClick={()=>{onDelete(cv.id);onClose()}}
              className="py-2.5 rounded-xl text-sm border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
              🗑 حذف
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ===== بطاقة مترشح =====
function CandidateCard({ cv, index, onDelete, onView }) {
  const col = COLOR_MAP[COLORS[index % COLORS.length]]
  const src = SOURCE_BADGE[cv.source] || SOURCE_BADGE.local
  return (
    <div className="glass rounded-2xl p-4 card-hover border border-white/5 cursor-pointer" onClick={()=>onView(cv)}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 border ${col.bg} ${col.text} ${col.border}`}>
          {initials(cv.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <div className="font-semibold text-white text-sm truncate">{cv.name}</div>
            {cv.file_url && <span className="text-blue-400 text-xs" title="يوجد ملف">📄</span>}
            {cv.phone && <span className="text-green-400 text-xs" title="واتساب متاح">💬</span>}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">{cv.spec||'غير محدد'}</div>
          {cv.city&&<div className="text-xs text-gray-500 mt-0.5">📍 {cv.city}</div>}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${src.style}`}>{src.label}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {cv.exp>0&&<span className="tag-exp text-xs px-2.5 py-0.5 rounded-full">{cv.exp} سنة خبرة</span>}
        {cv.age>0&&<span className="tag-age text-xs px-2.5 py-0.5 rounded-full">{cv.age} سنة</span>}
      </div>
      {cv.skills&&<div className="text-xs text-gray-500 mb-3 line-clamp-1">{cv.skills}</div>}
      <div className="flex justify-between items-center pt-3 border-t border-white/5">
        <span className="text-xs text-gray-600">{cv.date}</span>
        <div className="flex gap-1.5">
          {cv.phone && (
            <a href={waLink(cv.phone)} target="_blank" rel="noreferrer"
              onClick={e=>e.stopPropagation()}
              className="text-xs px-2.5 py-1 rounded-lg text-white transition-all hover:-translate-y-0.5"
              style={{background:'linear-gradient(135deg,#25d366,#128c7e)'}}>
              💬
            </a>
          )}
          <button onClick={e=>{e.stopPropagation();onDelete(cv.id)}}
            className="text-gray-600 hover:text-red-400 transition-colors text-xs px-2 py-1 rounded-lg hover:bg-red-500/10">
            🗑
          </button>
        </div>
      </div>
    </div>
  )
}

// ===== الصفحة الرئيسية =====
export default function DatabasePage({ db, onDelete, onAdd }) {
  const [search,setSearch]   = useState('')
  const [fSpec,setFSpec]     = useState('')
  const [fExp,setFExp]       = useState('')
  const [fAge,setFAge]       = useState('')
  const [fSrc,setFSrc]       = useState('')
  const [fFile,setFFile]     = useState('')
  const [fWA,setFWA]         = useState('')
  const [showAdd,setShowAdd] = useState(false)
  const [selectedCV,setSelectedCV] = useState(null)
  const [saved,setSaved]     = useState(false)

  const specs = [...new Set(db.map(c=>c.spec).filter(Boolean))].sort()

  const filtered = db.filter(c => {
    if (search && !c.name?.includes(search) && !c.spec?.includes(search) && !(c.city||'').includes(search) && !(c.phone||'').includes(search)) return false
    if (fSpec && c.spec !== fSpec) return false
    if (fSrc  && c.source !== fSrc) return false
    if (fFile==='yes' && !c.file_url && !c.file_name) return false
    if (fFile==='no'  && (c.file_url||c.file_name)) return false
    if (fWA==='yes' && !c.phone) return false
    if (fWA==='no'  && c.phone) return false
    if (fExp) {
      if (fExp==='0-2'  && !(c.exp>=0&&c.exp<=2))  return false
      if (fExp==='3-5'  && !(c.exp>=3&&c.exp<=5))  return false
      if (fExp==='6-10' && !(c.exp>=6&&c.exp<=10)) return false
      if (fExp==='11+'  && c.exp<11)                return false
    }
    if (fAge) {
      if (fAge==='18-25' && !(c.age>=18&&c.age<=25)) return false
      if (fAge==='26-35' && !(c.age>=26&&c.age<=35)) return false
      if (fAge==='36-45' && !(c.age>=36&&c.age<=45)) return false
      if (fAge==='46+'   && c.age<46)                return false
    }
    return true
  })

  const withPhone = db.filter(c=>c.phone).length

  const handleSave = (cv, file) => {
    onAdd(cv, file)
    setSaved(true)
    setTimeout(()=>setSaved(false), 3000)
  }

  return (
    <div className="animate-fade-in space-y-5">
      {showAdd && <AddCandidateForm onSave={handleSave} onClose={()=>setShowAdd(false)} />}
      {selectedCV && <CandidateDetail cv={selectedCV} onClose={()=>setSelectedCV(null)} onDelete={(id)=>{onDelete(id);setSelectedCV(null)}} />}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white mb-0.5">قاعدة البيانات</h1>
          <p className="text-gray-400 text-sm">
            {db.length} مترشح •
            <span className="text-green-400 mr-1">💬 {withPhone} لديهم واتساب</span>•
            <span className="text-blue-400 mr-1">📄 {db.filter(c=>c.file_url||c.file_name).length} لديهم ملفات</span>
          </p>
        </div>
        <button onClick={()=>setShowAdd(true)}
          className="btn-primary px-4 py-2.5 rounded-xl text-sm text-white font-semibold flex items-center gap-2">
          ➕ إضافة مترشح
        </button>
      </div>

      {saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-sm text-emerald-400 flex items-center gap-2 animate-slide-up">
          ✅ تم حفظ المترشح بنجاح!
        </div>
      )}

      <div className="relative">
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="ابحث بالاسم أو التخصص أو المدينة أو الهاتف..."
          className="input-dark w-full pr-11 pl-4 py-3 rounded-xl text-sm" />
      </div>

      <div className="glass rounded-2xl p-4 grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          {label:'التخصص', val:fSpec, set:setFSpec, opts:[['','الكل'],...specs.map(s=>[s,s])]},
          {label:'المصدر', val:fSrc,  set:setFSrc,  opts:[['','الكل'],['local','محلي'],['aneti','ANETI'],['linkedin','LinkedIn'],['web','ويب']]},
          {label:'الخبرة', val:fExp,  set:setFExp,  opts:[['','الكل'],['0-2','0-2 سنة'],['3-5','3-5 سنوات'],['6-10','6-10 سنوات'],['11+','10+']]},
          {label:'العمر',  val:fAge,  set:setFAge,  opts:[['','الكل'],['18-25','18-25'],['26-35','26-35'],['36-45','36-45'],['46+','46+']]},
          {label:'الملف',  val:fFile, set:setFFile, opts:[['','الكل'],['yes','📄 لديه ملف'],['no','بدون ملف']]},
          {label:'واتساب', val:fWA,   set:setFWA,   opts:[['','الكل'],['yes','💬 لديه رقم'],['no','بدون رقم']]},
        ].map(f=>(
          <div key={f.label}>
            <label className="text-xs text-gray-500 block mb-1">{f.label}</label>
            <select value={f.val} onChange={e=>f.set(e.target.value)} className="input-dark w-full px-3 py-2 rounded-xl text-sm">
              {f.opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-500 px-1 flex items-center justify-between">
        <span>{filtered.length} نتيجة</span>
        {filtered.length < db.length && (
          <button onClick={()=>{setSearch('');setFSpec('');setFExp('');setFAge('');setFSrc('');setFFile('');setFWA('')}} className="text-blue-400 hover:underline">إعادة تعيين الفلاتر</button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500 space-y-3">
          <div className="text-5xl">📭</div>
          <div className="font-medium text-gray-400">{db.length===0?'قاعدة البيانات فارغة':'لا توجد نتائج'}</div>
          {db.length===0&&<button onClick={()=>setShowAdd(true)} className="btn-primary px-5 py-2.5 rounded-xl text-sm text-white mx-auto block">➕ أضف أول مترشح</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((cv,i)=><CandidateCard key={cv.id} cv={cv} index={i} onDelete={onDelete} onView={setSelectedCV} />)}
        </div>
      )}
    </div>
  )
}

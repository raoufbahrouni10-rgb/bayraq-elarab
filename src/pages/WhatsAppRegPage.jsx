import { useState, useRef, useEffect } from 'react'
import { waLink } from '../lib/whatsapp'

// ===== رسائل الاستمارة =====
const CANDIDATE_MSG = (phone) => `السلام عليكم! 👋

نشكركم على تواصلكم مع *بيرق العرب للتوظيف بالخارج* ✈️

لإضافة ملفكم في قاعدة بياناتنا، يرجى إرسال المعلومات التالية:

1️⃣ *الاسم الكامل:*
2️⃣ *التخصص / المهنة:*
3️⃣ *سنوات الخبرة:*
4️⃣ *العمر:*
5️⃣ *المدينة:*
6️⃣ *المهارات:*
7️⃣ *ملاحظات إضافية:*

شكراً لتعاونكم 🙏
بيرق العرب — (+216) 52 332 223`

const EMPLOYER_MSG = (phone) => `السلام عليكم! 👋

نشكركم على تواصلكم مع *بيرق العرب للتوظيف بالخارج* ✈️

لإضافة شركتكم في قاعدة بياناتنا، يرجى إرسال المعلومات التالية:

1️⃣ *اسم الشركة:*
2️⃣ *القطاع / المجال:*
3️⃣ *الدولة / المدينة:*
4️⃣ *اسم المسؤول:*
5️⃣ *عدد الموظفين المطلوبين:*
6️⃣ *المناصب المطلوبة:*
7️⃣ *ملاحظات:*

شكراً لتعاونكم 🙏
بيرق العرب — (+216) 52 332 223`

// ===== QR Code Generator =====
function QRCode({ url, size = 200 }) {
  const canvasRef = useRef()

  useEffect(() => {
    if (!url || !canvasRef.current) return
    // نولّد QR بسيط باستخدام API
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const ctx = canvasRef.current.getContext('2d')
      ctx.drawImage(img, 0, 0, size, size)
    }
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&color=1B3A6B&bgcolor=FFFFFF&format=png`
    canvasRef.current._url = url
  }, [url, size])

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas ref={canvasRef} width={size} height={size}
        className="rounded-xl border-2 shadow-lg"
        style={{borderColor:'rgba(27,58,107,0.2)'}} />
      <div className="text-xs text-gray-500">امسح للتسجيل عبر واتساب</div>
    </div>
  )
}

// ===== نافذة إضافة من واتساب =====
function WARegistrationModal({ type, onAdd, onClose }) {
  const [step, setStep]   = useState(1) // 1=phone, 2=qr+link, 3=manual
  const [phone, setPhone] = useState('')
  const [form, setForm]   = useState({})
  const [saved, setSaved] = useState(false)

  const isCandidate = type === 'candidate'

  const cleanPhone = (p) => {
    const c = p.replace(/[\s\-\(\)\+]/g,'')
    return c.startsWith('216') ? c : '216' + c
  }

  const getWALink = () => {
    if (!phone) return ''
    const msg = isCandidate ? CANDIDATE_MSG(phone) : EMPLOYER_MSG(phone)
    return `https://wa.me/${cleanPhone(phone)}?text=${encodeURIComponent(msg)}`
  }

  const handleSendWA = () => {
    if (!phone) return
    window.open(getWALink(), '_blank')
    setStep(3)
  }

  const CANDIDATE_FIELDS = [
    {key:'name',   label:'الاسم الكامل',    required:true,  type:'text',   placeholder:'أحمد محمد العلي'},
    {key:'spec',   label:'التخصص',          required:true,  type:'text',   placeholder:'تمريض، هندسة، محاسبة...'},
    {key:'exp',    label:'سنوات الخبرة',    required:false, type:'number', placeholder:'5'},
    {key:'age',    label:'العمر',            required:false, type:'number', placeholder:'28'},
    {key:'city',   label:'المدينة',          required:false, type:'text',   placeholder:'تونس العاصمة'},
    {key:'phone',  label:'رقم الهاتف',       required:false, type:'tel',    placeholder:'216XXXXXXXX', default: phone},
    {key:'skills', label:'المهارات',         required:false, type:'text',   placeholder:'Excel، فرنسية...'},
    {key:'notes',  label:'ملاحظات',          required:false, type:'text',   placeholder:'...'},
  ]

  const EMPLOYER_FIELDS = [
    {key:'name',    label:'اسم الشركة',       required:true,  type:'text', placeholder:'شركة الأمل للاستقدام'},
    {key:'sector',  label:'القطاع',           required:false, type:'text', placeholder:'صحة، بناء، سياحة...'},
    {key:'city',    label:'الدولة / المدينة', required:false, type:'text', placeholder:'الرياض، دبي...'},
    {key:'contact', label:'اسم المسؤول',      required:false, type:'text', placeholder:'محمد علي'},
    {key:'phone',   label:'رقم الهاتف',       required:false, type:'tel',  placeholder:'966XXXXXXXX', default: phone},
    {key:'size',    label:'حجم الشركة',       required:false, type:'text', placeholder:'50-100 موظف'},
    {key:'notes',   label:'ملاحظات',          required:false, type:'text', placeholder:'...'},
  ]

  const fields = isCandidate ? CANDIDATE_FIELDS : EMPLOYER_FIELDS

  useEffect(() => {
    const defaults = {}
    fields.forEach(f => { if(f.default) defaults[f.key] = f.default })
    setForm(defaults)
  }, [phone])

  const handleSave = () => {
    if (!form.name) return
    onAdd({ ...form, source: 'whatsapp', phone: form.phone || phone })
    setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 1500)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="glass rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/10 animate-scale-in"
        onClick={e => e.stopPropagation()}>

        {/* الرأس */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{background:'linear-gradient(135deg,#25d366,#128c7e)'}}>
              💬
            </div>
            <div>
              <div className="font-bold text-white text-sm">
                {isCandidate ? 'إضافة مترشح عبر واتساب' : 'إضافة مشغّل عبر واتساب'}
              </div>
              <div className="text-xs text-gray-400">أرسل استمارة وأضف البيانات مباشرة</div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl">×</button>
        </div>

        <div className="p-5 space-y-4">

          {/* الخطوة 1 — رقم الهاتف */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-sm text-green-300 space-y-1">
                <div className="font-semibold">كيف يعمل؟</div>
                <div>1. أدخل رقم {isCandidate ? 'المترشح' : 'المشغّل'}</div>
                <div>2. سنرسل له رسالة واتساب بها استمارة التسجيل</div>
                <div>3. بعد رده، أضف بياناته مباشرة للمنصة</div>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">
                  📱 رقم واتساب {isCandidate ? 'المترشح' : 'المشغّل'}
                </label>
                <input value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="216XXXXXXXX أو +216XXXXXXXX"
                  className="input-dark w-full px-4 py-3 rounded-xl text-sm font-mono" autoFocus />
                <div className="text-xs text-gray-600 mt-1">مثال: 21652332223</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={handleSendWA} disabled={!phone}
                  className="py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40 transition-all hover:-translate-y-0.5"
                  style={{background:'linear-gradient(135deg,#25d366,#128c7e)'}}>
                  💬 إرسال الاستمارة
                </button>
                <button onClick={() => setStep(3)}
                  className="py-3 rounded-xl text-sm border border-white/15 text-gray-300 hover:bg-white/5">
                  ✍️ إدخال يدوي
                </button>
              </div>
            </div>
          )}

          {/* الخطوة 2 — QR + رابط */}
          {step === 2 && phone && (
            <div className="space-y-4 text-center">
              <div className="text-sm font-semibold text-gray-200">
                أو شارك QR Code مع {isCandidate ? 'المترشح' : 'المشغّل'}
              </div>
              <div className="flex justify-center">
                <QRCode url={getWALink()} size={180} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(getWALink()); }}
                  className="flex-1 py-2.5 rounded-xl text-xs border border-white/10 text-gray-300 hover:bg-white/5">
                  📋 نسخ الرابط
                </button>
                <button onClick={() => setStep(3)}
                  className="flex-1 py-2.5 rounded-xl text-xs btn-primary text-white">
                  ✍️ إدخال البيانات
                </button>
              </div>
            </div>
          )}

          {/* الخطوة 3 — إدخال البيانات */}
          {step === 3 && (
            <div className="space-y-4">
              {saved ? (
                <div className="text-center py-8 space-y-3">
                  <div className="text-5xl">🎉</div>
                  <div className="text-lg font-bold text-white">
                    تم الحفظ بنجاح!
                  </div>
                  <div className="text-sm text-emerald-400">
                    تمت إضافة {form.name} لقاعدة البيانات
                  </div>
                </div>
              ) : (
                <>
                  {phone && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-3">
                      <span className="text-green-400">💬</span>
                      <div className="text-xs text-gray-300">
                        تم إرسال الاستمارة لـ <span className="font-mono text-green-400" dir="ltr">{phone}</span> — أدخل البيانات بعد رده
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    {fields.map(f => (
                      <div key={f.key} className={f.key==='name'||f.key==='notes'||f.key==='skills'?'col-span-2':''}>
                        <label className="text-xs text-gray-500 block mb-1">
                          {f.label}{f.required&&<span className="text-red-400"> *</span>}
                        </label>
                        <input
                          type={f.type||'text'}
                          value={form[f.key]||''}
                          onChange={e => setForm(p=>({...p,[f.key]:e.target.value}))}
                          placeholder={f.placeholder}
                          className="input-dark w-full px-3 py-2.5 rounded-xl text-sm" />
                      </div>
                    ))}
                  </div>

                  {!form.name && (
                    <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
                      ⚠️ الاسم مطلوب
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={!form.name}
                      className="flex-1 btn-primary py-3 rounded-xl text-sm font-bold text-white disabled:opacity-40">
                      💾 حفظ في قاعدة البيانات
                    </button>
                    <button onClick={() => setStep(1)}
                      className="px-4 py-3 border border-white/10 rounded-xl text-sm text-gray-400 hover:bg-white/5">
                      ↩
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ===== صفحة الربط بواتساب =====
export default function WhatsAppRegPage({ onAddCV, onAddEmployer }) {
  const [showModal, setShowModal] = useState(null) // 'candidate' | 'employer' | null
  const [recentAdded, setRecentAdded] = useState([])

  const handleAdd = (type, data) => {
    if (type === 'candidate') {
      onAddCV({
        name: data.name || '',
        spec: data.spec || 'غير محدد',
        age: parseInt(data.age) || 0,
        exp: parseInt(data.exp) || 0,
        city: data.city || 'تونس العاصمة',
        phone: data.phone || '',
        skills: data.skills || '',
        source: 'whatsapp',
        notes: data.notes || '',
      })
    } else {
      onAddEmployer({
        name: data.name || '',
        sector: data.sector || '',
        city: data.city || '',
        contact: data.contact || '',
        phone: data.phone || '',
        size: data.size || 'صغيرة',
        notes: data.notes || '',
      })
    }
    setRecentAdded(p => [{...data, type, time: new Date().toLocaleTimeString('ar')}, ...p.slice(0,4)])
    setShowModal(null)
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl">
      {showModal && (
        <WARegistrationModal
          type={showModal}
          onAdd={(data) => handleAdd(showModal, data)}
          onClose={() => setShowModal(null)}
        />
      )}

      <div>
        <h1 className="text-xl font-bold text-white mb-0.5">التسجيل عبر واتساب 💬</h1>
        <p className="text-gray-400 text-sm">أضف مترشحين ومشغّلين مباشرة عبر واتساب</p>
      </div>

      {/* بطاقتا الإضافة */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* مترشح جديد */}
        <div className="glass rounded-2xl p-6 border border-white/10 space-y-4 hover:border-green-500/30 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{background:'linear-gradient(135deg,#25d366,#128c7e)'}}>
              👤
            </div>
            <div>
              <div className="font-bold text-white">مترشح جديد</div>
              <div className="text-xs text-gray-400">أرسل استمارة للمترشح وأضف بياناته</div>
            </div>
          </div>
          <div className="space-y-2 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span> إرسال استمارة واتساب تلقائياً
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span> QR Code للتسجيل السريع
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span> إضافة فورية لقاعدة البيانات
            </div>
          </div>
          <button onClick={() => setShowModal('candidate')}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5"
            style={{background:'linear-gradient(135deg,#25d366,#128c7e)', boxShadow:'0 4px 15px rgba(37,211,102,0.3)'}}>
            💬 إضافة مترشح عبر واتساب
          </button>
        </div>

        {/* مشغّل جديد */}
        <div className="glass rounded-2xl p-6 border border-white/10 space-y-4 hover:border-blue-500/30 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{background:'linear-gradient(135deg,#1B3A6B,#0D2447)'}}>
              🏢
            </div>
            <div>
              <div className="font-bold text-white">مشغّل جديد</div>
              <div className="text-xs text-gray-400">أرسل استمارة للشركة وأضف بياناتها</div>
            </div>
          </div>
          <div className="space-y-2 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-blue-400">✓</span> إرسال استمارة واتساب تلقائياً
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400">✓</span> QR Code للتسجيل السريع
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400">✓</span> إضافة فورية لقاعدة المشغّلين
            </div>
          </div>
          <button onClick={() => setShowModal('employer')}
            className="btn-primary w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5">
            💬 إضافة مشغّل عبر واتساب
          </button>
        </div>
      </div>

      {/* آخر المضافين */}
      {recentAdded.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-semibold text-gray-300">✅ آخر المضافين في هذه الجلسة</div>
          <div className="space-y-2">
            {recentAdded.map((r, i) => (
              <div key={i} className="glass rounded-xl p-3 border border-white/5 flex items-center gap-3">
                <span className="text-xl">{r.type==='candidate'?'👤':'🏢'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{r.name}</div>
                  <div className="text-xs text-gray-400">
                    {r.type==='candidate' ? r.spec : r.sector} • {r.time}
                  </div>
                </div>
                <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                  ✓ محفوظ
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* رقم واتساب الشركة */}
      <div className="glass rounded-2xl p-4 border border-white/5">
        <div className="text-xs text-gray-500 mb-3 font-semibold">📱 واتساب الشركة</div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-xl">💬</span>
            <span className="font-mono text-white" dir="ltr">+216 98 656 680</span>
          </div>
          <a href="https://wa.me/21698656680" target="_blank" rel="noreferrer"
            className="text-xs px-3 py-1.5 rounded-lg text-white transition-all hover:-translate-y-0.5"
            style={{background:'linear-gradient(135deg,#25d366,#128c7e)'}}>
            فتح واتساب
          </a>
        </div>
      </div>
    </div>
  )
}

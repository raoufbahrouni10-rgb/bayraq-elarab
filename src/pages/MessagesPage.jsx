import { useState } from 'react'

const TEMPLATES = [
  {
    id:1, category:'مقابلة', icon:'🎙️',
    subject: 'دعوة لمقابلة عمل — {المنصب}',
    whatsapp: `السيد/السيدة {الاسم}،\n\nيسعدنا إعلامكم بأنه تم اختياركم لإجراء مقابلة عمل لشغل منصب {المنصب} لدى {الشركة} في {الدولة}.\n\nموعد المقابلة: {التاريخ} الساعة {الوقت}\n\nيرجى التأكيد في أقرب وقت.\n\nمع فائق التقدير\nبيرق العرب للتوظيف`,
    email: `السيد/السيدة {الاسم}،\n\nنتشرف بإعلامكم أنه بعد مراجعة ملفكم، تم اختياركم لإجراء مقابلة عمل للمنصب التالي:\n\n• المنصب: {المنصب}\n• الشركة: {الشركة}\n• الدولة: {الدولة}\n• موعد المقابلة: {التاريخ} الساعة {الوقت}\n\nيرجى تأكيد حضوركم والتواصل معنا لأي استفسار.\n\nمع فائق الاحترام والتقدير\nفريق بيرق العرب للتوظيف بالخارج`
  },
  {
    id:2, category:'قبول', icon:'✅',
    subject: 'تهانينا — قبول ملفك لمنصب {المنصب}',
    whatsapp: `تهانينا السيد/السيدة {الاسم}! 🎉\n\nيسعدنا إبلاغكم بقبول ملفكم لشغل منصب {المنصب} لدى {الشركة} في {الدولة}.\n\nسيتم التواصل معكم قريباً لإتمام إجراءات العقد والسفر.\n\nبيرق العرب للتوظيف`,
    email: `تهانينا السيد/السيدة {الاسم}،\n\nيسعدنا إبلاغكم بقبول ملفكم وترشيحكم لشغل منصب {المنصب} لدى {الشركة} في {الدولة}.\n\nالخطوات القادمة:\n1. توقيع عقد العمل\n2. استخراج التأشيرة\n3. الكشف الطبي\n4. حجز تذكرة السفر\n\nسيتم التواصل معكم بالتفاصيل الكاملة.\n\nمع التهاني وخالص التمنيات بالتوفيق\nفريق بيرق العرب`
  },
  {
    id:3, category:'مستندات', icon:'📋',
    subject: 'طلب مستندات — {المنصب}',
    whatsapp: `السيد/السيدة {الاسم}،\n\nيرجى تجهيز المستندات التالية لإتمام ملف التوظيف:\n\n📄 نسخة من بطاقة الهوية\n📄 الشهادات الدراسية\n📄 شهادات الخبرة\n📄 صور شخصية\n📄 عقد العمل الموقّع\n\nيرجى الإرسال في أقرب وقت.\nبيرق العرب`,
    email: `السيد/السيدة {الاسم}،\n\nإكمالاً لملف توظيفكم لمنصب {المنصب} في {الشركة}، يرجى تجهيز وإرسال المستندات التالية:\n\n• نسخة من بطاقة الهوية الوطنية (صالحة)\n• نسخة من جواز السفر\n• الشهادات العلمية والمهنية\n• شهادات الخبرة المهنية\n• صور شخصية (خلفية بيضاء)\n• عقد العمل الموقّع\n\nيرجى الإرسال على البريد الإلكتروني أو مباشرة لمكتبنا.\n\nشكراً لتعاونكم\nفريق بيرق العرب`
  },
  {
    id:4, category:'سفر', icon:'✈️',
    subject: 'تفاصيل السفر — {الدولة}',
    whatsapp: `السيد/السيدة {الاسم}،\n\nتفاصيل سفركم إلى {الدولة}:\n\n✈️ تاريخ المغادرة: {التاريخ}\n🕐 الساعة: {الوقت}\n🏨 السكن: سيتم توفيره عند الوصول\n\nيرجى الحضور للمطار قبل 3 ساعات من الموعد.\n\nرحلة موفقة! 🌟\nبيرق العرب`,
    email: `السيد/السيدة {الاسم}،\n\nنود إعلامكم بتفاصيل رحلتكم إلى {الدولة}:\n\n• تاريخ المغادرة: {التاريخ}\n• الساعة: {الوقت}\n• المطار: {المطار}\n• السكن: سيتم توفيره من قِبل جهة العمل\n\nتعليمات مهمة:\n- الحضور للمطار قبل 3 ساعات\n- إحضار جميع المستندات الأصلية\n- التواصل معنا عند الوصول\n\nنتمنى لكم رحلة آمنة وموفقة\nفريق بيرق العرب للتوظيف`
  },
  {
    id:5, category:'رفض', icon:'❌',
    subject: 'بخصوص ملف التوظيف',
    whatsapp: `السيد/السيدة {الاسم}،\n\nشكراً على ثقتكم ببيرق العرب.\n\nنأسف لإبلاغكم أنه لم يتم اختيار ملفكم في هذه المرة لمنصب {المنصب}.\n\nسنتواصل معكم عند توفر فرص مناسبة مستقبلاً.\n\nمع التقدير\nبيرق العرب`,
    email: `السيد/السيدة {الاسم}،\n\nنشكركم على اهتمامكم وثقتكم ببيرق العرب للتوظيف بالخارج.\n\nبعد مراجعة ملفكم بعناية، نأسف لإعلامكم أنه لم يتم اختياركم في الوقت الحالي لمنصب {المنصب}.\n\nنحتفظ بملفكم في قاعدة بياناتنا وسنتواصل معكم عند توفر فرصة مناسبة لمؤهلاتكم.\n\nنتمنى لكم التوفيق\nفريق بيرق العرب`
  },
]

const VARS = ['{الاسم}','{المنصب}','{الشركة}','{الدولة}','{التاريخ}','{الوقت}','{المطار}']

export default function MessagesPage({ db, applications }) {
  const [selected, setSelected] = useState(TEMPLATES[0])
  const [channel, setChannel]   = useState('whatsapp')
  const [vars, setVars]         = useState({ '{الاسم}':'', '{المنصب}':'', '{الشركة}':'', '{الدولة}':'السعودية', '{التاريخ}':'', '{الوقت}':'', '{المطار}':'مطار تونس قرطاج' })
  const [copied, setCopied]     = useState(false)
  const [candidate, setCandidate] = useState('')

  // اختيار مترشح من القاعدة
  const handleSelectCandidate = (name) => {
    setCandidate(name)
    const app = applications.find(a => a.candidateName === name)
    setVars(p => ({
      ...p,
      '{الاسم}': name,
      '{المنصب}': app?.jobTitle || p['{المنصب}'],
      '{الشركة}': app?.company || p['{الشركة}'],
      '{الدولة}': app?.country || p['{الدولة}'],
    }))
  }

  const getContent = () => {
    let text = channel === 'whatsapp' ? selected.whatsapp : selected.email
    Object.entries(vars).forEach(([k,v]) => { text = text.replaceAll(k, v||k) })
    return text
  }

  const getSubject = () => {
    let s = selected.subject
    Object.entries(vars).forEach(([k,v]) => { s = s.replaceAll(k, v||k) })
    return s
  }

  const copy = () => {
    navigator.clipboard.writeText(getContent())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openWhatsapp = () => {
    const text = encodeURIComponent(getContent())
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const openEmail = () => {
    const subject = encodeURIComponent(getSubject())
    const body    = encodeURIComponent(getContent())
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const candidates = [...new Set([...db.map(c=>c.name), ...applications.map(a=>a.candidateName)])]

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white mb-0.5">قوالب الرسائل 📧</h1>
        <p className="text-gray-400 text-sm">رسائل جاهزة للمترشحين عبر البريد أو واتساب</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* القائمة الجانبية */}
        <div className="space-y-3">
          <div className="text-xs text-gray-500 font-medium px-1">القوالب المتاحة</div>
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => setSelected(t)}
              className={`w-full text-right p-3 rounded-xl border transition-all flex items-center gap-3
                ${selected.id===t.id ? 'border-blue-500/40 bg-blue-500/10' : 'glass border-white/5 hover:bg-white/5'}`}>
              <span className="text-xl">{t.icon}</span>
              <div>
                <div className={`text-sm font-medium ${selected.id===t.id?'text-blue-300':'text-gray-200'}`}>{t.category}</div>
                <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{t.subject.slice(0,30)}...</div>
              </div>
            </button>
          ))}
        </div>

        {/* المحرر */}
        <div className="md:col-span-2 space-y-4">

          {/* اختيار القناة */}
          <div className="flex gap-2">
            {[{k:'whatsapp',l:'💬 واتساب'},{k:'email',l:'📧 بريد إلكتروني'}].map(c=>(
              <button key={c.k} onClick={()=>setChannel(c.k)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all border
                  ${channel===c.k?'btn-primary text-white border-transparent':'border-white/10 text-gray-400 hover:bg-white/5'}`}>
                {c.l}
              </button>
            ))}
          </div>

          {/* اختيار مترشح */}
          <div>
            <label className="text-xs text-gray-500 block mb-1.5">اختر مترشحاً (اختياري)</label>
            <select value={candidate} onChange={e=>handleSelectCandidate(e.target.value)}
              className="input-dark w-full px-3 py-2.5 rounded-xl text-sm">
              <option value="">-- اختر من قاعدة البيانات --</option>
              {candidates.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* المتغيرات */}
          <div className="glass rounded-2xl p-4 space-y-3">
            <div className="text-xs text-gray-500 font-medium">تعبئة البيانات</div>
            <div className="grid grid-cols-2 gap-2">
              {VARS.slice(0,6).map(v=>(
                <div key={v}>
                  <label className="text-xs text-gray-600 block mb-1">{v}</label>
                  <input value={vars[v]||''} onChange={e=>setVars(p=>({...p,[v]:e.target.value}))}
                    placeholder={v} className="input-dark w-full px-3 py-1.5 rounded-lg text-xs" />
                </div>
              ))}
            </div>
          </div>

          {/* معاينة الرسالة */}
          <div className="glass rounded-2xl p-4 space-y-2">
            {channel==='email' && (
              <div className="text-xs text-gray-400 border-b border-white/5 pb-2 mb-2">
                <span className="text-gray-600">الموضوع: </span>{getSubject()}
              </div>
            )}
            <div className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed max-h-52 overflow-y-auto">
              {getContent()}
            </div>
          </div>

          {/* أزرار الإرسال */}
          <div className="grid grid-cols-3 gap-2">
            <button onClick={copy}
              className={`py-2.5 rounded-xl text-sm font-medium transition-all border flex items-center justify-center gap-1.5
                ${copied?'bg-emerald-500/20 border-emerald-500/30 text-emerald-400':'border-white/10 text-gray-300 hover:bg-white/5'}`}>
              {copied?'✓ تم النسخ':'📋 نسخ'}
            </button>
            <button onClick={openWhatsapp}
              className="py-2.5 rounded-xl text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center justify-center gap-1.5">
              💬 واتساب
            </button>
            <button onClick={openEmail}
              className="btn-primary py-2.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-1.5">
              📧 بريد
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

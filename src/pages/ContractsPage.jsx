import { useState } from 'react'

const GULF = ['السعودية','الإمارات','قطر','الكويت','البحرين','عُمان']
const CONTRACT_TYPES = ['عقد عمل كامل','عقد لمدة محددة','عقد تجريبي','عقد مناولة']

export default function ContractsPage({ db, applications }) {
  const [form, setForm] = useState({
    candidateName: '',
    candidateId: '',
    jobTitle: '',
    company: '',
    country: 'السعودية',
    salary: '',
    currency: 'SAR',
    startDate: '',
    duration: '12 شهراً',
    contractType: 'عقد عمل كامل',
    workHours: '8 ساعات يومياً، 48 ساعة أسبوعياً',
    vacation: '30 يوم سنوياً',
    benefits: 'تذكرة طيران ذهاب وإياب سنوياً، سكن، تأمين صحي',
    notes: '',
  })
  const [generated, setGenerated] = useState(false)

  const CURRENCIES = { SAR:'ريال سعودي', AED:'درهم إماراتي', QAR:'ريال قطري', KWD:'دينار كويتي', BHD:'دينار بحريني', OMR:'ريال عماني', TND:'دينار تونسي' }

  const generateContract = () => {
    const today = new Date().toLocaleDateString('ar-TN', { year:'numeric', month:'long', day:'numeric' })
    const content = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>عقد عمل — ${form.candidateName}</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; direction: rtl; color: #1a1a1a; padding: 50px; max-width: 800px; margin: 0 auto; line-height: 1.8; }
  .header { text-align: center; border-bottom: 3px solid #0e90e0; padding-bottom: 20px; margin-bottom: 30px; }
  .logo-area { margin-bottom: 15px; }
  h1 { color: #0e4a8a; font-size: 22px; margin: 8px 0; }
  h2 { color: #0e4a8a; font-size: 16px; border-right: 4px solid #0e90e0; padding-right: 10px; margin-top: 25px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f8faff; padding: 15px; border-radius: 8px; margin: 15px 0; }
  .info-item { display: flex; gap: 8px; }
  .info-label { color: #666; font-size: 13px; white-space: nowrap; }
  .info-value { font-weight: bold; font-size: 13px; color: #1a1a1a; }
  .article { background: #fafafa; border: 1px solid #e8edf5; border-radius: 8px; padding: 15px; margin: 12px 0; }
  .article-num { color: #0e90e0; font-weight: bold; }
  .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 60px; }
  .sign-box { border-top: 2px solid #333; padding-top: 10px; text-align: center; font-size: 13px; }
  .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 15px; }
  .stamp { width: 100px; height: 100px; border: 3px solid #0e90e0; border-radius: 50%; margin: 20px auto; display: flex; align-items: center; justify-content: center; color: #0e90e0; font-size: 12px; text-align: center; opacity: 0.3; }
  @media print { body { padding: 20px; } .no-print { display: none; } }
</style>
</head>
<body>
<div class="header">
  <div class="logo-area">
    <strong style="font-size:20px; color:#c9a227">بيرق العرب</strong><br>
    <span style="font-size:13px; color:#666">للتوظيف بالخارج — BAYRAK ELARAB</span>
  </div>
  <h1>عقد ${form.contractType}</h1>
  <p style="color:#666; font-size:13px">تاريخ الإصدار: ${today}</p>
</div>

<h2>أطراف العقد</h2>
<div class="info-grid">
  <div class="info-item"><span class="info-label">اسم العامل:</span><span class="info-value">${form.candidateName}</span></div>
  <div class="info-item"><span class="info-label">رقم الهوية:</span><span class="info-value">${form.candidateId||'—'}</span></div>
  <div class="info-item"><span class="info-label">جهة العمل:</span><span class="info-value">${form.company}</span></div>
  <div class="info-item"><span class="info-label">الدولة:</span><span class="info-value">${form.country}</span></div>
</div>

<h2>المادة الأولى — المنصب والمهام</h2>
<div class="article">
  يُعيَّن السيد/السيدة <strong>${form.candidateName}</strong> في منصب <strong>${form.jobTitle}</strong> لدى <strong>${form.company}</strong> في <strong>${form.country}</strong>، ويلتزم بأداء المهام المنوطة بهذا المنصب وفق التعليمات الصادرة عن جهة العمل.
</div>

<h2>المادة الثانية — مدة العقد</h2>
<div class="article">
  تبدأ مدة هذا العقد اعتباراً من تاريخ <strong>${form.startDate||'___________'}</strong> لمدة <strong>${form.duration}</strong>، قابلة للتجديد باتفاق الطرفين.
</div>

<h2>المادة الثالثة — الراتب والمكافآت</h2>
<div class="article">
  يتقاضى العامل راتباً شهرياً صافياً قدره <strong>${form.salary} ${CURRENCIES[form.currency]||form.currency}</strong>، يُصرف في نهاية كل شهر ميلادي.
</div>

<h2>المادة الرابعة — ساعات العمل</h2>
<div class="article">${form.workHours}</div>

<h2>المادة الخامسة — الإجازات</h2>
<div class="article">${form.vacation}</div>

<h2>المادة السادسة — المزايا والامتيازات</h2>
<div class="article">${form.benefits}</div>

${form.notes ? `<h2>المادة السابعة — ملاحظات إضافية</h2><div class="article">${form.notes}</div>` : ''}

<h2>المادة ${form.notes?'الثامنة':'السابعة'} — القانون المطبّق</h2>
<div class="article">
  يخضع هذا العقد لقوانين العمل المعمول بها في <strong>${form.country}</strong>، وأي نزاع يُحسم وديّاً أو أمام الجهات القضائية المختصة.
</div>

<div class="signatures">
  <div class="sign-box">
    <p><strong>صاحب العمل</strong></p>
    <p style="color:#666; font-size:12px">${form.company}</p>
    <br><br><br>
    <p>التوقيع والختم</p>
  </div>
  <div class="sign-box">
    <p><strong>العامل</strong></p>
    <p style="color:#666; font-size:12px">${form.candidateName}</p>
    <br><br><br>
    <p>التوقيع</p>
  </div>
</div>

<div class="stamp">ختم<br>الشركة</div>

<div class="footer">
  وثّق بواسطة بيرق العرب للتوظيف بالخارج — ${today}<br>
  هذا العقد ملزم قانونياً لكلا الطرفين
</div>
</body></html>`

    const w = window.open('', '_blank')
    w.document.write(content)
    w.document.close()
    setTimeout(() => w.print(), 600)
    setGenerated(true)
    setTimeout(() => setGenerated(false), 3000)
  }

  const candidates = [...new Set([...db.map(c=>c.name), ...applications.map(a=>a.candidateName)])]

  return (
    <div className="animate-fade-in space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-white mb-0.5">توليد العقود 📄</h1>
        <p className="text-gray-400 text-sm">إنشاء عقد عمل احترافي جاهز للطباعة</p>
      </div>

      <div className="glass rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="text-xs text-gray-500 block mb-1.5">اسم العامل *</label>
            <select value={form.candidateName} onChange={e=>setForm(p=>({...p,candidateName:e.target.value}))}
              className="input-dark w-full px-3 py-2.5 rounded-xl text-sm">
              <option value="">اختر أو اكتب...</option>
              {candidates.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1.5">رقم الهوية / الجواز</label>
            <input value={form.candidateId} onChange={e=>setForm(p=>({...p,candidateId:e.target.value}))}
              placeholder="رقم الوثيقة..." className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" />
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1.5">المنصب *</label>
            <input value={form.jobTitle} onChange={e=>setForm(p=>({...p,jobTitle:e.target.value}))}
              placeholder="مثال: ممرضة، مهندس..." className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" />
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1.5">جهة العمل *</label>
            <input value={form.company} onChange={e=>setForm(p=>({...p,company:e.target.value}))}
              placeholder="اسم الشركة..." className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" />
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1.5">الدولة</label>
            <select value={form.country} onChange={e=>setForm(p=>({...p,country:e.target.value}))}
              className="input-dark w-full px-3 py-2.5 rounded-xl text-sm">
              {GULF.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1.5">نوع العقد</label>
            <select value={form.contractType} onChange={e=>setForm(p=>({...p,contractType:e.target.value}))}
              className="input-dark w-full px-3 py-2.5 rounded-xl text-sm">
              {CONTRACT_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1.5">الراتب</label>
            <div className="flex gap-2">
              <input value={form.salary} onChange={e=>setForm(p=>({...p,salary:e.target.value}))}
                placeholder="المبلغ..." className="input-dark flex-1 px-4 py-2.5 rounded-xl text-sm" />
              <select value={form.currency} onChange={e=>setForm(p=>({...p,currency:e.target.value}))}
                className="input-dark px-3 py-2.5 rounded-xl text-sm">
                {Object.keys(CURRENCIES).map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1.5">تاريخ البداية</label>
            <input type="date" value={form.startDate} onChange={e=>setForm(p=>({...p,startDate:e.target.value}))}
              className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" />
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1.5">مدة العقد</label>
            <select value={form.duration} onChange={e=>setForm(p=>({...p,duration:e.target.value}))}
              className="input-dark w-full px-3 py-2.5 rounded-xl text-sm">
              {['6 أشهر','12 شهراً','24 شهراً','36 شهراً','غير محددة'].map(d=><option key={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1.5">ساعات العمل</label>
            <input value={form.workHours} onChange={e=>setForm(p=>({...p,workHours:e.target.value}))}
              className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1.5">الإجازات</label>
          <input value={form.vacation} onChange={e=>setForm(p=>({...p,vacation:e.target.value}))}
            className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" />
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1.5">المزايا والامتيازات</label>
          <textarea value={form.benefits} onChange={e=>setForm(p=>({...p,benefits:e.target.value}))}
            rows={2} className="input-dark w-full px-4 py-2.5 rounded-xl text-sm resize-none" />
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1.5">ملاحظات إضافية</label>
          <textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}
            rows={2} placeholder="شروط خاصة، ملاحظات..." className="input-dark w-full px-4 py-2.5 rounded-xl text-sm resize-none" />
        </div>

        <button onClick={generateContract} disabled={!form.candidateName || !form.jobTitle || !form.company}
          className={`w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40
            ${generated ? 'bg-emerald-600 text-white' : 'btn-primary text-white'}`}>
          {generated ? '✅ تم توليد العقد!' : '📄 توليد العقد وطباعته'}
        </button>
      </div>
    </div>
  )
}

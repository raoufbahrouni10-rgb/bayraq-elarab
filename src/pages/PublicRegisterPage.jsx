import { useState } from 'react'
import { isSupabaseEnabled, supabase } from '../lib/supabase'

const SPECS = ['تمريض وصحة','طب بشري','طب أسنان','صيدلة','هندسة مدنية','هندسة كهربائية','هندسة برمجيات','محاسبة ومالية','سياحة وفندقة','سياقة ونقل','ميكانيكا وصيانة','بناء وأشغال','طبخ وتغذية','تعليم وتدريب','أمن وحراسة','زراعة','أخرى']
const CITIES = ['تونس العاصمة','صفاقس','سوسة','بنزرت','القيروان','قابس','مدنين','أريانة','بن عروس','نابل','المنستير','سيدي بوزيد','قفصة','الكاف','باجة','جندوبة','زغوان','أخرى']

export default function PublicRegisterPage() {
  const [step, setStep]   = useState(1)
  const [form, setForm]   = useState({ name:'', phone:'', email:'', spec:'', exp:'0', age:'', city:'', skills:'', notes:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('يرجى إدخال الاسم الكامل'); return }
    if (!form.phone.trim()) { setError('يرجى إدخال رقم الهاتف'); return }
    if (!form.spec) { setError('يرجى اختيار التخصص'); return }
    setLoading(true); setError('')
    try {
      const record = {
        name: form.name.trim(),
        spec: form.spec,
        age: parseInt(form.age) || 0,
        exp: parseInt(form.exp) || 0,
        city: form.city || 'غير محدد',
        phone: form.phone.trim(),
        skills: form.skills,
        notes: `${form.notes}${form.email ? ' | Email: '+form.email : ''}`.trim(),
        source: 'public',
        date: new Date().toISOString().split('T')[0]
      }
      if (isSupabaseEnabled) {
        const { error: err } = await supabase.from('cvs').insert([record])
        if (err) throw err
      }
      setStep(2)
    } catch(e) {
      setError('حدث خطأ — يرجى المحاولة مجدداً')
    }
    setLoading(false)
  }

  // صفحة النجاح
  if (step === 2) return (
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl"
      style={{background:'linear-gradient(135deg, #EEF4FF 0%, #F0F7FF 60%, #FFF8F0 100%)'}}>
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="rounded-3xl p-8 shadow-2xl space-y-5"
          style={{background:'white', border:'1px solid rgba(27,58,107,0.1)'}}>
          <div className="text-6xl">🎉</div>
          <div>
            <h2 className="text-2xl font-black mb-2" style={{color:'#1B3A6B'}}>تم التسجيل بنجاح!</h2>
            <p className="text-gray-500 text-sm">شكراً <strong>{form.name}</strong>، تم إضافة ملفك في قاعدة بيانات بيرق العرب للتوظيف بالخارج.</p>
          </div>
          <div className="rounded-2xl p-4 text-sm space-y-2" style={{background:'#F0F7FF', border:'1px solid rgba(27,58,107,0.1)'}}>
            <div style={{color:'#1B3A6B'}} className="font-semibold">سنتواصل معك قريباً على:</div>
            <div className="font-mono font-bold text-lg" style={{color:'#1B3A6B'}} dir="ltr">{form.phone}</div>
          </div>
          <div className="text-xs text-gray-400 space-y-1 pt-2 border-t border-gray-100">
            <div dir="ltr">(+216) 52 332 223 / 98 656 680</div>
            <div style={{color:'#25d366'}} dir="ltr">💬 98 656 680</div>
          </div>
        </div>
        <button onClick={() => { setStep(1); setForm({ name:'', phone:'', email:'', spec:'', exp:'0', age:'', city:'', skills:'', notes:'' }) }}
          className="text-sm transition-colors hover:opacity-80" style={{color:'#1B3A6B'}}>
          ← تسجيل شخص آخر
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col" dir="rtl"
      style={{background:'linear-gradient(160deg, #EEF4FF 0%, #F0F7FF 60%, #FFF8F0 100%)'}}>

      {/* شريط علوي */}
      <div className="py-4 px-6 flex items-center justify-center border-b"
        style={{background:'white', borderColor:'rgba(27,58,107,0.08)'}}>
        <img src="/logo.jpg" alt="بيرق العرب" className="h-10 object-contain" />
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">

          {/* العنوان */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black" style={{color:'#1B3A6B'}}>استمارة التوظيف بالخارج</h1>
            <p className="text-sm" style={{color:'#C9A227'}}>بيرق العرب — BAYRAK ELARAB</p>
            <p className="text-xs text-gray-400">أدخل بياناتك وسنتواصل معك في أقرب وقت</p>
          </div>

          {/* النموذج */}
          <div className="rounded-3xl p-6 space-y-4 shadow-lg"
            style={{background:'white', border:'1px solid rgba(27,58,107,0.08)'}}>

            <div className="grid grid-cols-2 gap-3">
              {/* الاسم */}
              <div className="col-span-2">
                <label className="text-xs font-semibold block mb-1.5" style={{color:'#374151'}}>
                  الاسم الكامل <span style={{color:'#DC2626'}}>*</span>
                </label>
                <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}
                  placeholder="أدخل اسمك الكامل" autoFocus
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{background:'#F8FAFC', border:'2px solid #E2E8F0', color:'#111827'}}
                  onFocus={e=>{e.target.style.borderColor='#1B3A6B'; e.target.style.boxShadow='0 0 0 3px rgba(27,58,107,0.08)'}}
                  onBlur={e=>{e.target.style.borderColor='#E2E8F0'; e.target.style.boxShadow='none'}} />
              </div>

              {/* الهاتف */}
              <div className="col-span-2">
                <label className="text-xs font-semibold block mb-1.5" style={{color:'#374151'}}>
                  رقم الهاتف / واتساب <span style={{color:'#DC2626'}}>*</span>
                </label>
                <input value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))}
                  placeholder="مثال: 21652123456" type="tel" dir="ltr"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none font-mono transition-all"
                  style={{background:'#F8FAFC', border:'2px solid #E2E8F0', color:'#111827'}}
                  onFocus={e=>{e.target.style.borderColor='#1B3A6B'; e.target.style.boxShadow='0 0 0 3px rgba(27,58,107,0.08)'}}
                  onBlur={e=>{e.target.style.borderColor='#E2E8F0'; e.target.style.boxShadow='none'}} />
              </div>

              {/* التخصص */}
              <div className="col-span-2">
                <label className="text-xs font-semibold block mb-1.5" style={{color:'#374151'}}>
                  التخصص / المهنة <span style={{color:'#DC2626'}}>*</span>
                </label>
                <select value={form.spec} onChange={e=>setForm(p=>({...p,spec:e.target.value}))}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{background:'#F8FAFC', border:'2px solid #E2E8F0', color: form.spec?'#111827':'#9CA3AF'}}
                  onFocus={e=>{e.target.style.borderColor='#1B3A6B'}}
                  onBlur={e=>{e.target.style.borderColor='#E2E8F0'}}>
                  <option value="">اختر تخصصك...</option>
                  {SPECS.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* المدينة */}
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{color:'#374151'}}>المدينة</label>
                <select value={form.city} onChange={e=>setForm(p=>({...p,city:e.target.value}))}
                  className="w-full px-3 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{background:'#F8FAFC', border:'2px solid #E2E8F0', color: form.city?'#111827':'#9CA3AF'}}
                  onFocus={e=>e.target.style.borderColor='#1B3A6B'}
                  onBlur={e=>e.target.style.borderColor='#E2E8F0'}>
                  <option value="">المدينة...</option>
                  {CITIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* الخبرة */}
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{color:'#374151'}}>سنوات الخبرة</label>
                <select value={form.exp} onChange={e=>setForm(p=>({...p,exp:e.target.value}))}
                  className="w-full px-3 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{background:'#F8FAFC', border:'2px solid #E2E8F0', color:'#111827'}}
                  onFocus={e=>e.target.style.borderColor='#1B3A6B'}
                  onBlur={e=>e.target.style.borderColor='#E2E8F0'}>
                  <option value="0">بدون خبرة</option>
                  <option value="1">سنة</option>
                  <option value="2">سنتان</option>
                  <option value="3">3 سنوات</option>
                  <option value="5">5 سنوات</option>
                  <option value="8">8 سنوات</option>
                  <option value="10">10 سنوات+</option>
                </select>
              </div>

              {/* العمر */}
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{color:'#374151'}}>العمر</label>
                <input type="number" min="18" max="65" value={form.age} onChange={e=>setForm(p=>({...p,age:e.target.value}))}
                  placeholder="25"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{background:'#F8FAFC', border:'2px solid #E2E8F0', color:'#111827'}}
                  onFocus={e=>e.target.style.borderColor='#1B3A6B'}
                  onBlur={e=>e.target.style.borderColor='#E2E8F0'} />
              </div>

              {/* البريد */}
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{color:'#374151'}}>البريد الإلكتروني</label>
                <input value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}
                  placeholder="اختياري" type="email" dir="ltr"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{background:'#F8FAFC', border:'2px solid #E2E8F0', color:'#111827'}}
                  onFocus={e=>e.target.style.borderColor='#1B3A6B'}
                  onBlur={e=>e.target.style.borderColor='#E2E8F0'} />
              </div>

              {/* المهارات */}
              <div className="col-span-2">
                <label className="text-xs font-semibold block mb-1.5" style={{color:'#374151'}}>المهارات</label>
                <input value={form.skills} onChange={e=>setForm(p=>({...p,skills:e.target.value}))}
                  placeholder="مثال: Excel، فرنسية، رخصة قيادة..."
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{background:'#F8FAFC', border:'2px solid #E2E8F0', color:'#111827'}}
                  onFocus={e=>e.target.style.borderColor='#1B3A6B'}
                  onBlur={e=>e.target.style.borderColor='#E2E8F0'} />
              </div>

              {/* ملاحظات */}
              <div className="col-span-2">
                <label className="text-xs font-semibold block mb-1.5" style={{color:'#374151'}}>ملاحظات</label>
                <textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}
                  rows={2} placeholder="أي معلومات إضافية..."
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
                  style={{background:'#F8FAFC', border:'2px solid #E2E8F0', color:'#111827'}}
                  onFocus={e=>e.target.style.borderColor='#1B3A6B'}
                  onBlur={e=>e.target.style.borderColor='#E2E8F0'} />
              </div>
            </div>

            {error && (
              <div className="rounded-xl p-3 text-xs flex items-center gap-2"
                style={{background:'#FEF2F2', border:'1px solid #FECACA', color:'#DC2626'}}>
                ⚠️ {error}
              </div>
            )}

            <button onClick={handleSubmit}
              disabled={loading || !form.name.trim() || !form.phone.trim() || !form.spec}
              className="w-full py-4 rounded-2xl font-black text-white text-base disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
              style={{background:'linear-gradient(135deg, #1B3A6B, #0D2447)', boxShadow:'0 8px 25px rgba(27,58,107,0.3)'}}>
              {loading ? <><span className="animate-spin">⟳</span> جارٍ الإرسال...</> : '✅ إرسال طلب التوظيف'}
            </button>
          </div>

          {/* معلومات الاتصال */}
          <div className="rounded-2xl p-4 text-center space-y-1"
            style={{background:'rgba(255,255,255,0.7)', border:'1px solid rgba(27,58,107,0.08)'}}>
            <div className="text-xs font-semibold" style={{color:'#1B3A6B'}}>تواصل معنا</div>
            <div className="text-sm" style={{color:'#374151'}} dir="ltr">(+216) 52 332 223 / 98 656 680</div>
            <a href="https://wa.me/21698656680" className="text-sm block transition-colors"
              style={{color:'#25d366'}} dir="ltr">💬 واتساب: 98 656 680</a>
            <div className="text-xs text-gray-400">17 Rue de Marseille, Tunis 1002</div>
          </div>
        </div>
      </div>

      <div className="text-center py-3 text-xs text-gray-400">
        © 2025 بيرق العرب للتوظيف بالخارج
      </div>
    </div>
  )
}

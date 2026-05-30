import { useState } from 'react'
import { isSupabaseEnabled, supabase } from '../lib/supabase'

const STAGE_STEPS = [
  { key:'selected',  label:'تم اختيارك',     icon:'✅', desc:'تم إضافة ملفك لقاعدة البيانات' },
  { key:'interview', label:'مقابلة عمل',      icon:'🎙️', desc:'موعد مقابلة مع المشغّل' },
  { key:'contract',  label:'توقيع العقد',     icon:'📝', desc:'مرحلة توقيع العقد' },
  { key:'travel',    label:'السفر',            icon:'✈️', desc:'إجراءات السفر والتأشيرة' },
  { key:'hired',     label:'توظيف ناجح',      icon:'🎉', desc:'تهانينا! تم توظيفك' },
]

export default function CandidateStatusPage() {
  const [phone, setPhone] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const search = async () => {
    if (!phone.trim()) { setError('أدخل رقم هاتفك'); return }
    setLoading(true); setError(''); setResult(null)
    try {
      if (isSupabaseEnabled && supabase) {
        const { data: cvs } = await supabase.from('cvs').select('*').ilike('phone', `%${phone.replace(/\s/g,'')}%`).limit(1)
        const cv = cvs?.[0]
        if (!cv) { setError('لم يُوجد ملف بهذا الرقم'); setLoading(false); return }
        const { data: apps } = await supabase.from('applications').select('*').ilike('candidate_name', `%${cv.name}%`).order('created_at', {ascending:false}).limit(1)
        setResult({ cv, app: apps?.[0] || null })
      } else {
        setError('خدمة غير متاحة حالياً')
      }
    } catch { setError('حدث خطأ — حاول مجدداً') }
    setLoading(false)
  }

  const currentStepIndex = result?.app ? STAGE_STEPS.findIndex(s=>s.key===result.app.stage) : -1

  return (
    <div style={{minHeight:'100vh', fontFamily:"'Cairo',sans-serif", direction:'rtl', background:'linear-gradient(160deg,#EEF4FF,#F0F7FF,#FFF8F0)', display:'flex', flexDirection:'column'}}>

      {/* الرأس */}
      <div style={{padding:'14px 24px', background:'white', borderBottom:'1px solid rgba(27,58,107,0.08)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 10px rgba(27,58,107,0.06)'}}>
        <img src="/logo.jpg" style={{height:'40px', objectFit:'contain'}} alt="بيرق العرب" onError={e=>e.target.style.display='none'} />
      </div>

      <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 16px'}}>
        <div style={{width:'100%', maxWidth:'440px', space:'16px'}}>

          <div style={{textAlign:'center', marginBottom:'24px'}}>
            <h1 style={{fontSize:'22px', fontWeight:900, color:'#1B3A6B', margin:'0 0 6px'}}>متابعة حالة ملفك</h1>
            <p style={{fontSize:'13px', color:'#9CA3AF', margin:0}}>أدخل رقم هاتفك للاطلاع على حالة طلبك</p>
          </div>

          <div style={{background:'white', borderRadius:'24px', padding:'28px', boxShadow:'0 8px 40px rgba(27,58,107,0.1)', border:'1px solid rgba(27,58,107,0.08)', marginBottom:'16px'}}>
            <label style={{display:'block', fontSize:'12px', fontWeight:600, color:'#374151', marginBottom:'6px'}}>📱 رقم الهاتف المسجّل</label>
            <div style={{display:'flex', gap:'8px'}}>
              <input value={phone} onChange={e=>setPhone(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&search()}
                placeholder="21652123456" dir="ltr"
                style={{flex:1, padding:'12px 14px', borderRadius:'12px', border:'2px solid #E2E8F0', background:'#F8FAFC', fontSize:'14px', color:'#111827', outline:'none', fontFamily:"'Cairo',sans-serif"}}
                onFocus={e=>{e.target.style.borderColor='#1B3A6B'}}
                onBlur={e=>{e.target.style.borderColor='#E2E8F0'}} />
              <button onClick={search} disabled={loading}
                style={{padding:'12px 20px', borderRadius:'12px', background:'linear-gradient(135deg,#1B3A6B,#0D2447)', color:'white', border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif", fontWeight:700, fontSize:'14px', whiteSpace:'nowrap'}}>
                {loading ? '⟳' : '🔍 بحث'}
              </button>
            </div>
            {error && <div style={{marginTop:'10px', background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:'10px', padding:'10px 12px', fontSize:'12px', color:'#DC2626'}}>⚠️ {error}</div>}
          </div>

          {result && (
            <div style={{background:'white', borderRadius:'24px', padding:'28px', boxShadow:'0 8px 40px rgba(27,58,107,0.1)', border:'1px solid rgba(27,58,107,0.08)'}}>
              {/* معلومات المترشح */}
              <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px', paddingBottom:'16px', borderBottom:'1px solid #F1F5F9'}}>
                <div style={{width:'48px', height:'48px', borderRadius:'14px', background:'#EEF4FF', border:'2px solid rgba(27,58,107,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, color:'#1B3A6B', fontSize:'16px', flexShrink:0}}>
                  {result.cv.name?.split(' ').slice(0,2).map(w=>w[0]).join('')}
                </div>
                <div>
                  <div style={{fontWeight:700, color:'#111827', fontSize:'16px'}}>{result.cv.name}</div>
                  <div style={{fontSize:'13px', color:'#6B7280', marginTop:'2px'}}>{result.cv.spec} • {result.cv.city}</div>
                </div>
              </div>

              {!result.app ? (
                <div style={{textAlign:'center', padding:'20px 0'}}>
                  <div style={{fontSize:'40px', marginBottom:'8px'}}>📋</div>
                  <div style={{fontSize:'14px', color:'#6B7280'}}>ملفك مسجّل — سنتواصل معك قريباً</div>
                </div>
              ) : (
                <>
                  <div style={{fontSize:'13px', fontWeight:700, color:'#1B3A6B', marginBottom:'16px'}}>مراحل ملفك:</div>
                  {STAGE_STEPS.filter(s=>s.key!=='rejected').map((step, i) => {
                    const isActive = step.key === result.app.stage
                    const isDone = i < currentStepIndex
                    const isFuture = !isActive && !isDone
                    return (
                      <div key={step.key} style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px', opacity: isFuture?0.4:1}}>
                        <div style={{width:'40px', height:'40px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0, background: isDone?'#10b981':isActive?'#1B3A6B':'#F1F5F9', border: isActive?'3px solid #C9A227':'none', boxShadow: isActive?'0 0 15px rgba(27,58,107,0.3)':'none', transition:'all 0.3s'}}>
                          {isDone ? '✅' : step.icon}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight: isActive?700:500, color: isActive?'#1B3A6B':isDone?'#10b981':'#6B7280', fontSize:'14px'}}>{step.label}</div>
                          {isActive && <div style={{fontSize:'11px', color:'#9CA3AF', marginTop:'2px'}}>{step.desc}</div>}
                        </div>
                        {isActive && <span style={{fontSize:'11px', background:'#EEF4FF', color:'#1B3A6B', border:'1px solid rgba(27,58,107,0.2)', borderRadius:'20px', padding:'3px 10px', fontWeight:700}}>الحالة الحالية</span>}
                      </div>
                    )
                  })}

                  {result.app.stage === 'rejected' && (
                    <div style={{background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:'12px', padding:'14px', textAlign:'center', marginTop:'8px'}}>
                      <div style={{fontSize:'20px', marginBottom:'4px'}}>😔</div>
                      <div style={{fontSize:'13px', color:'#DC2626', fontWeight:600}}>عذراً — لم يتم قبول ملفك في هذه المرة</div>
                      <div style={{fontSize:'12px', color:'#9CA3AF', marginTop:'4px'}}>سنتواصل معك عند توفر فرص مناسبة</div>
                    </div>
                  )}

                  {result.app.notes && (
                    <div style={{background:'#F8FAFC', borderRadius:'12px', padding:'12px 14px', marginTop:'12px', fontSize:'12px', color:'#6B7280'}}>
                      📝 {result.app.notes}
                    </div>
                  )}
                </>
              )}

              <div style={{marginTop:'16px', paddingTop:'14px', borderTop:'1px solid #F1F5F9', textAlign:'center'}}>
                <a href="https://wa.me/21698656680" style={{color:'#25d366', textDecoration:'none', fontSize:'13px', fontWeight:600}} dir="ltr">💬 تواصل معنا: 98 656 680</a>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{textAlign:'center', padding:'12px', fontSize:'11px', color:'#9CA3AF'}}>
        © 2025 بيرق العرب للتوظيف بالخارج
      </div>
    </div>
  )
}

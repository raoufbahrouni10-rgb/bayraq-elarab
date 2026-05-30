import { useState } from 'react'

const GULF_SERVICES = [
  {
    id: 'nursing', icon:'🏥', title:'التمريض والرعاية الصحية',
    color:'#ef4444', countries:['🇸🇦','🇦🇪','🇶🇦','🇰🇼'],
    desc:'توفير كوادر تمريض مؤهلة للمستشفيات والمراكز الصحية',
    specs:['ممرض/ة عام','ممرض/ة طوارئ','ممرض/ة ICU','مساعد طبيب','فني مختبر','فني أشعة'],
    salary:'1500-4000 د.أ', demand:'عالي جداً ⭐⭐⭐⭐⭐'
  },
  {
    id: 'construction', icon:'🏗️', title:'البناء والمقاولات',
    color:'#f59e0b', countries:['🇸🇦','🇦🇪','🇶🇦','🇧🇭','🇴🇲'],
    desc:'عمال بناء وتشطيب ومهندسون للمشاريع العملاقة',
    specs:['مهندس مدني','مساح','نجار','حداد','بناء','دهان','كهربائي','سباك'],
    salary:'800-3000 د.أ', demand:'عالي ⭐⭐⭐⭐'
  },
  {
    id: 'hospitality', icon:'🏨', title:'السياحة والفندقة',
    color:'#8b5cf6', countries:['🇦🇪','🇸🇦','🇧🇭','🇶🇦'],
    desc:'طواقم فندقية ومطاعم عالية الجودة لفنادق الخمس نجوم',
    specs:['مدير فندق','طباخ رئيسي','نادل','استقبال','تدبير منزلي','مشرف طوابق'],
    salary:'1000-3500 د.أ', demand:'متوسط ⭐⭐⭐'
  },
  {
    id: 'driving', icon:'🚗', title:'السياقة والنقل',
    color:'#06b6d4', countries:['🇸🇦','🇦🇪','🇰🇼','🇶🇦','🇴🇲'],
    desc:'سائقون محترفون لنقل الأفراد والبضائع والخدمات اللوجستية',
    specs:['سائق خاص','سائق شاحنة','سائق حافلة','مشغّل رافعة','سائق توصيل'],
    salary:'800-2000 د.أ', demand:'عالي جداً ⭐⭐⭐⭐⭐'
  },
  {
    id: 'it', icon:'💻', title:'تقنية المعلومات',
    color:'#3b82f6', countries:['🇦🇪','🇸🇦','🇶🇦','🇧🇭'],
    desc:'مطورون ومحللون ومتخصصون في تقنية المعلومات للشركات الكبرى',
    specs:['مطور ويب','مطور تطبيقات','محلل بيانات','أمن معلومات','مدير شبكات','دعم تقني'],
    salary:'2000-6000 د.أ', demand:'عالي ⭐⭐⭐⭐'
  },
  {
    id: 'education', icon:'📚', title:'التعليم والتدريب',
    color:'#10b981', countries:['🇸🇦','🇦🇪','🇶🇦','🇰🇼','🇧🇭'],
    desc:'معلمون ومدربون لمدارس ومراكز التعليم الخليجية',
    specs:['معلم رياضيات','معلم علوم','معلم لغة إنجليزية','معلم عربية','مدرب مهني','مرشد تربوي'],
    salary:'1500-4000 د.أ', demand:'متوسط ⭐⭐⭐'
  },
  {
    id: 'security', icon:'🛡️', title:'الأمن والحراسة',
    color:'#6b7280', countries:['🇸🇦','🇦🇪','🇶🇦','🇰🇼','🇴🇲','🇧🇭'],
    desc:'حراس أمن مؤهلون للمجمعات التجارية والسكنية والمطارات',
    specs:['حارس أمن','مشرف أمن','مدير أمن','حارس VIP','مراقب كاميرات'],
    salary:'700-1800 د.أ', demand:'عالي ⭐⭐⭐⭐'
  },
  {
    id: 'finance', icon:'💼', title:'المال والأعمال',
    color:'#C9A227', countries:['🇦🇪','🇸🇦','🇶🇦','🇧🇭'],
    desc:'محاسبون وماليون ومديرو أعمال للشركات والمؤسسات المالية',
    specs:['محاسب','مدقق مالي','محلل مالي','مدير حسابات','مستشار مالي','أمين صندوق'],
    salary:'2000-5000 د.أ', demand:'متوسط ⭐⭐⭐'
  },
]

const GULF_COUNTRIES = [
  { flag:'🇸🇦', name:'المملكة العربية السعودية', color:'#16a34a' },
  { flag:'🇦🇪', name:'الإمارات العربية المتحدة', color:'#dc2626' },
  { flag:'🇶🇦', name:'قطر', color:'#7c3aed' },
  { flag:'🇰🇼', name:'الكويت', color:'#d97706' },
  { flag:'🇧🇭', name:'البحرين', color:'#db2777' },
  { flag:'🇴🇲', name:'سلطنة عُمان', color:'#059669' },
]

export default function GulfJobsPage() {
  const [selected, setSelected] = useState(null)
  const [filterCountry, setFilterCountry] = useState('')

  const filtered = GULF_SERVICES.filter(s =>
    !filterCountry || s.countries.includes(filterCountry)
  )

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white mb-0.5">🌍 خدمات التوظيف بالخليج</h1>
        <p className="text-gray-400 text-sm">خدمات متخصصة لكل قطاع في دول الخليج العربي</p>
      </div>

      {/* دول الخليج */}
      <div className="glass rounded-2xl p-5 border border-white/5">
        <div className="text-sm font-semibold text-gray-200 mb-3">🌍 دول الشراكة</div>
        <div className="flex flex-wrap gap-2">
          <button onClick={()=>setFilterCountry('')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition-all ${!filterCountry?'btn-primary text-white border-transparent':'border-white/10 text-gray-400 hover:bg-white/5'}`}>
            الكل
          </button>
          {GULF_COUNTRIES.map(c => (
            <button key={c.name} onClick={()=>setFilterCountry(filterCountry===c.flag?'':c.flag)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition-all ${filterCountry===c.flag?'border-white/30 bg-white/10 text-white':'border-white/10 text-gray-400 hover:bg-white/5'}`}>
              <span>{c.flag}</span>
              <span>{c.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* الخدمات */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(service => (
          <div key={service.id}
            onClick={() => setSelected(selected===service.id ? null : service.id)}
            className="glass rounded-2xl p-5 border border-white/5 cursor-pointer hover:bg-white/[0.03] transition-all space-y-3"
            style={{borderColor: selected===service.id ? service.color+'40' : '', background: selected===service.id ? service.color+'08' : ''}}>

            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{background:`${service.color}20`, border:`1px solid ${service.color}30`}}>
                {service.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-sm">{service.title}</div>
                <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">{service.desc}</div>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {service.countries.map(f => <span key={f} className="text-lg">{f}</span>)}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/5 rounded-xl p-2.5 space-y-0.5">
                <div className="text-gray-500">💰 الراتب</div>
                <div className="text-white font-semibold" dir="ltr">{service.salary}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 space-y-0.5">
                <div className="text-gray-500">📈 الطلب</div>
                <div className="font-semibold" style={{color:service.color, fontSize:'11px'}}>{service.demand}</div>
              </div>
            </div>

            {selected === service.id && (
              <div className="pt-2 border-t border-white/5 space-y-2 animate-fade-in">
                <div className="text-xs text-gray-400 font-semibold">التخصصات المطلوبة:</div>
                <div className="flex flex-wrap gap-1.5">
                  {service.specs.map(sp => (
                    <span key={sp} className="text-xs px-2.5 py-1 rounded-full"
                      style={{background:`${service.color}20`, color:service.color, border:`1px solid ${service.color}30`}}>
                      {sp}
                    </span>
                  ))}
                </div>
                <a href="https://wa.me/21698656680" target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold text-white mt-2"
                  style={{background:'linear-gradient(135deg,#25d366,#128c7e)'}}>
                  💬 تواصل معنا لهذا القطاع
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* إحصاءات */}
      <div className="glass rounded-2xl p-5 border border-white/5">
        <div className="text-sm font-semibold text-gray-200 mb-4">📊 إحصاءات التوظيف بالخليج</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {icon:'✈️', val:'6', label:'دول خليجية'},
            {icon:'🏢', val:'50+', label:'شريك توظيف'},
            {icon:'👤', val:'500+', label:'موظّف ناجح'},
            {icon:'⭐', val:'95%', label:'نسبة رضا'},
          ].map(s => (
            <div key={s.label} className="text-center p-3 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-black" style={{color:'var(--accent,#0e90e0)'}}>{s.val}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl p-6 text-center space-y-3"
        style={{background:'linear-gradient(135deg,rgba(27,58,107,0.4),rgba(201,162,39,0.1))', border:'1px solid rgba(201,162,39,0.2)'}}>
        <div className="text-lg font-black text-white">هل أنت مشغّل من دول الخليج؟</div>
        <div className="text-sm text-gray-400">تواصل معنا للحصول على الكوادر المناسبة لاحتياجاتك</div>
        <div className="flex gap-3 justify-center flex-wrap">
          <a href="https://wa.me/21698656680" target="_blank" rel="noreferrer"
            className="px-6 py-3 rounded-xl text-sm font-bold text-white flex items-center gap-2"
            style={{background:'linear-gradient(135deg,#25d366,#128c7e)'}}>
            💬 واتساب مباشر
          </a>
          <a href="mailto:bayrakdirection@gmail.com"
            className="px-6 py-3 rounded-xl text-sm font-bold text-white flex items-center gap-2 btn-primary">
            📧 راسلنا
          </a>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'

export default function TVModePage({ db, applications, transactions, toTND, employers }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const hired = applications.filter(a=>a.stage==='hired').length
  const active = applications.filter(a=>!['hired','rejected'].includes(a.stage)).length
  const totalTND = transactions.filter(t=>t.paid).reduce((s,t)=>s+toTND(t.amount,t.currency),0)
  const rate = applications.length>0 ? Math.round((hired/applications.length)*100) : 0

  const STAGE_COLORS = {
    selected:'#3b82f6', interview:'#8b5cf6', contract:'#f59e0b',
    travel:'#06b6d4', hired:'#10b981', rejected:'#ef4444'
  }
  const STAGE_LABELS = {
    selected:'اختيار', interview:'مقابلة', contract:'عقد',
    travel:'سفر', hired:'توظيف', rejected:'ملغي'
  }

  const stageStats = Object.entries(
    applications.reduce((acc,a)=>{ acc[a.stage]=(acc[a.stage]||0)+1; return acc },{})
  )

  const recentCVs = [...db].sort((a,b)=>new Date(b.created_at||b.date)-new Date(a.created_at||a.date)).slice(0,6)

  const topSpecs = Object.entries(
    db.reduce((acc,c)=>{ acc[c.spec||'أخرى']=(acc[c.spec||'أخرى']||0)+1; return acc },{})
  ).sort((a,b)=>b[1]-a[1]).slice(0,5)

  return (
    <div className="animate-fade-in" style={{minHeight:'calc(100vh - 60px)', background:'#060d1a'}}>
      {/* الرأس */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-4">
          <img src="/logo.jpg" className="h-10 rounded-xl" alt="logo" onError={e=>e.target.style.display='none'} />
          <div>
            <div className="text-white font-black text-xl">بيرق العرب</div>
            <div className="text-xs" style={{color:'#C9A227'}}>لوحة المتابعة اللحظية</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-white font-mono" dir="ltr">
            {time.toLocaleTimeString('ar-TN', {hour:'2-digit', minute:'2-digit', second:'2-digit'})}
          </div>
          <div className="text-xs text-gray-400">
            {time.toLocaleDateString('ar-TN', {weekday:'long', year:'numeric', month:'long', day:'numeric'})}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* إحصاءات رئيسية */}
        <div className="grid grid-cols-4 gap-4">
          {[
            {icon:'🗂️', label:'إجمالي المترشحين', value:db.length, color:'#3b82f6', bg:'rgba(59,130,246,0.1)'},
            {icon:'📋', label:'ملفات نشطة', value:active, color:'#8b5cf6', bg:'rgba(139,92,246,0.1)'},
            {icon:'🎉', label:'تم توظيفهم', value:hired, color:'#10b981', bg:'rgba(16,185,129,0.1)'},
            {icon:'💰', label:'المداخيل (د.ت)', value:Math.round(totalTND).toLocaleString(), color:'#C9A227', bg:'rgba(201,162,39,0.1)'},
          ].map(k=>(
            <div key={k.label} className="rounded-2xl p-5 text-center border border-white/5"
              style={{background:k.bg}}>
              <div className="text-4xl mb-2">{k.icon}</div>
              <div className="text-4xl font-black mb-1" style={{color:k.color}}>{k.value}</div>
              <div className="text-sm text-gray-400">{k.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* مراحل الملفات */}
          <div className="glass rounded-2xl p-5 border border-white/5 space-y-3">
            <div className="text-sm font-bold text-white mb-3">📊 مراحل الملفات</div>
            {stageStats.map(([stage, count])=>(
              <div key={stage} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{background:STAGE_COLORS[stage]||'#666'}}></div>
                <div className="flex-1 text-sm text-gray-300">{STAGE_LABELS[stage]||stage}</div>
                <div className="text-lg font-black" style={{color:STAGE_COLORS[stage]||'#fff'}}>{count}</div>
                <div className="w-20 h-2 rounded-full bg-white/5">
                  <div className="h-full rounded-full" style={{width:`${(count/applications.length)*100}%`, background:STAGE_COLORS[stage]||'#666'}}></div>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-white/5 text-center">
              <span className="text-2xl font-black" style={{color:'#C9A227'}}>{rate}%</span>
              <span className="text-sm text-gray-400 mr-2">نسبة النجاح</span>
            </div>
          </div>

          {/* أكثر التخصصات */}
          <div className="glass rounded-2xl p-5 border border-white/5 space-y-3">
            <div className="text-sm font-bold text-white mb-3">🎓 أكثر التخصصات</div>
            {topSpecs.map(([spec, count], i)=>(
              <div key={spec} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{background: i===0?'#C9A227':i===1?'#94a3b8':i===2?'#cd7f32':'rgba(255,255,255,0.1)', color: i<3?'#000':'#fff'}}>
                  {i+1}
                </div>
                <div className="flex-1 text-sm text-gray-300 truncate">{spec}</div>
                <div className="text-lg font-bold text-white">{count}</div>
              </div>
            ))}
          </div>

          {/* آخر المترشحين */}
          <div className="glass rounded-2xl p-5 border border-white/5 space-y-2">
            <div className="text-sm font-bold text-white mb-3">🆕 آخر المترشحين</div>
            {recentCVs.map((cv,i)=>(
              <div key={cv.id||i} className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03]">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300 text-xs font-bold flex-shrink-0">
                  {cv.name?.split(' ').slice(0,2).map(w=>w[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white truncate">{cv.name}</div>
                  <div className="text-xs text-gray-500 truncate">{cv.spec}</div>
                </div>
                {cv.source==='public' && <span className="text-xs bg-green-500/20 text-green-300 border border-green-500/30 px-1.5 py-0.5 rounded-full">جديد</span>}
              </div>
            ))}
          </div>
        </div>

        {/* شريط سفلي */}
        <div className="glass rounded-2xl p-4 border border-white/5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-xl font-black text-white">{db.filter(c=>c.phone).length}</div>
              <div className="text-xs text-gray-500">بواتساب</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-black text-white">{employers.length}</div>
              <div className="text-xs text-gray-500">مشغّل</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-black" style={{color:'#C9A227'}}>{db.filter(c=>c.source==='public').length}</div>
              <div className="text-xs text-gray-500">تسجيل عبر الإنترنت</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs text-emerald-400">متصل — بيانات حية</span>
          </div>
          <div className="text-xs text-gray-600">
            (+216) 52 332 223 | bayrakdirection@gmail.com
          </div>
        </div>
      </div>
    </div>
  )
}

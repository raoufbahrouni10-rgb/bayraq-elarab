import { useState } from 'react'

export default function CandidateCardPage({ db, applications }) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = db.filter(c =>
    c.name?.includes(search) || c.spec?.includes(search)
  )

  const getApp = (name) => applications.find(a => a.candidateName === name)

  const STAGE_LABELS = {
    selected:'اختيار', interview:'مقابلة', contract:'عقد',
    travel:'سفر', hired:'توظيف', rejected:'ملغي'
  }

  const printCard = (cv) => {
    const app = getApp(cv.name)
    const win = window.open('', '_blank')
    win.document.write(`
      <!DOCTYPE html><html dir="rtl" lang="ar">
      <head><meta charset="UTF-8"><title>بطاقة ${cv.name}</title>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Cairo',sans-serif; background:#f5f5f5; display:flex; justify-content:center; align-items:center; min-height:100vh; }
        .card { width:400px; background:white; border-radius:16px; overflow:hidden; box-shadow:0 8px 30px rgba(0,0,0,0.15); }
        .header { background:linear-gradient(135deg, #1B3A6B, #0D2447); padding:24px; text-align:center; }
        .logo { color:white; font-size:20px; font-weight:900; margin-bottom:4px; }
        .subtitle { color:rgba(255,255,255,0.7); font-size:11px; }
        .avatar { width:70px; height:70px; border-radius:50%; background:rgba(255,255,255,0.2); border:3px solid #C9A227; display:flex; align-items:center; justify-content:center; margin:16px auto 8px; font-size:24px; color:white; font-weight:900; }
        .name { color:white; font-size:18px; font-weight:700; }
        .spec { color:#C9A227; font-size:13px; margin-top:4px; }
        .body { padding:20px; }
        .row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #f0f0f0; font-size:13px; }
        .row:last-child { border:none; }
        .label { color:#666; }
        .value { color:#111; font-weight:600; }
        .stage { display:inline-block; padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; background:#EEF4FF; color:#1B3A6B; }
        .footer { background:#F8F9FA; padding:12px 20px; text-align:center; border-top:1px solid #eee; }
        .contact { font-size:11px; color:#666; }
        .gold-line { height:3px; background:linear-gradient(90deg, #1B3A6B, #C9A227, #1B3A6B); }
        @media print { body { background:white; } }
      </style></head>
      <body>
      <div class="card">
        <div class="gold-line"></div>
        <div class="header">
          <div class="logo">بيرق العرب</div>
          <div class="subtitle">BAYRAK ELARAB — للتوظيف بالخارج</div>
          <div class="avatar">${cv.name?.split(' ').slice(0,2).map(w=>w[0]).join('')||'؟'}</div>
          <div class="name">${cv.name}</div>
          <div class="spec">${cv.spec||'غير محدد'}</div>
        </div>
        <div class="body">
          ${cv.phone?`<div class="row"><span class="label">📱 الهاتف</span><span class="value">${cv.phone}</span></div>`:''}
          ${cv.city?`<div class="row"><span class="label">📍 المدينة</span><span class="value">${cv.city}</span></div>`:''}
          ${cv.exp?`<div class="row"><span class="label">⏱ الخبرة</span><span class="value">${cv.exp} سنة</span></div>`:''}
          ${cv.age?`<div class="row"><span class="label">🎂 العمر</span><span class="value">${cv.age} سنة</span></div>`:''}
          ${cv.skills?`<div class="row"><span class="label">🎯 المهارات</span><span class="value">${cv.skills}</span></div>`:''}
          ${app?`<div class="row"><span class="label">📋 الحالة</span><span class="value"><span class="stage">${STAGE_LABELS[app.stage]||app.stage}</span></span></div>`:''}
          ${app?.jobTitle?`<div class="row"><span class="label">💼 المنصب</span><span class="value">${app.jobTitle}</span></div>`:''}
          ${app?.country?`<div class="row"><span class="label">🌍 الدولة</span><span class="value">${app.country}</span></div>`:''}
        </div>
        <div class="footer">
          <div class="contact">(+216) 52 332 223 / 98 656 680 • bayrakdirection@gmail.com</div>
          <div class="contact" style="margin-top:4px">17 Rue de Marseille, Tunis 1002</div>
        </div>
        <div class="gold-line"></div>
      </div>
      </body></html>
    `)
    win.document.close()
    setTimeout(() => win.print(), 500)
  }

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white mb-0.5">🪪 بطاقات المترشحين</h1>
        <p className="text-gray-400 text-sm">طباعة بطاقة احترافية لكل مترشح</p>
      </div>

      <div className="relative">
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="ابحث بالاسم أو التخصص..."
          className="input-dark w-full pr-9 pl-4 py-3 rounded-xl text-sm" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(cv => {
          const app = getApp(cv.name)
          return (
            <div key={cv.id} className="glass rounded-2xl p-4 border border-white/5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300 font-bold text-sm flex-shrink-0">
                  {cv.name?.split(' ').slice(0,2).map(w=>w[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm truncate">{cv.name}</div>
                  <div className="text-xs text-gray-400">{cv.spec} • {cv.city}</div>
                </div>
              </div>
              {app && (
                <div className="text-xs text-gray-400">
                  {app.jobTitle} — {app.country}
                </div>
              )}
              <button onClick={() => printCard(cv)}
                className="btn-primary w-full py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2">
                🖨️ طباعة البطاقة
              </button>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 text-gray-500">
            <div className="text-4xl mb-3">🪪</div>
            <div>لا توجد نتائج</div>
          </div>
        )}
      </div>
    </div>
  )
}

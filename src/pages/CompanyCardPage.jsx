import { useState } from 'react'

const SERVICES = [
  { icon:'✈️', title:'التوظيف بالخارج', desc:'فرص عمل في الخليج وأوروبا' },
  { icon:'🗂️', title:'إدارة الملفات', desc:'متابعة كاملة من الاختيار للسفر' },
  { icon:'📄', title:'الوثائق والعقود', desc:'إعداد جميع الوثائق القانونية' },
  { icon:'🛂', title:'إجراءات التأشيرة', desc:'استخراج التأشيرات وإجراءات السفر' },
  { icon:'🤝', title:'التفاوض مع المشغّلين', desc:'أفضل الشروط والمزايا للموظفين' },
  { icon:'📞', title:'المتابعة بعد التوظيف', desc:'دعم مستمر طوال فترة العمل' },
]

const VALUES = [
  { icon:'🌟', title:'الثقة والشفافية', desc:'صدق تام مع مترشحينا ومشغّلينا' },
  { icon:'⚡', title:'السرعة والكفاءة', desc:'معالجة سريعة مع الحفاظ على الجودة' },
  { icon:'🛡️', title:'الأمان والحماية', desc:'نضمن حقوق المترشح في كل مرحلة' },
  { icon:'🌍', title:'الشبكة الواسعة', desc:'شراكات في 10 دول خليجية وأوروبية' },
]

const COUNTRIES = ['🇸🇦','🇦🇪','🇰🇼','🇶🇦','🇧🇭','🇴🇲','🇩🇪','🇫🇷']

const STATS = [
  { value:'500+', label:'مترشح موظَّف' },
  { value:'10+', label:'دول الشراكة' },
  { value:'50+', label:'مشغّل موثوق' },
  { value:'14', label:'سنة خبرة' },
]

export default function CompanyCardPage() {

  const printCard = () => {
    const win = window.open('', '_blank')
    win.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>بيرق العرب — بطاقة الشركة</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; font-family:'Cairo',sans-serif; }
  @page { size: A4; margin: 0; }
  body { width:210mm; height:297mm; background:white; overflow:hidden; }
  .page { width:210mm; height:297mm; display:flex; flex-direction:column; position:relative; overflow:hidden; }

  /* خلفية احترافية */
  .bg { position:absolute; inset:0; z-index:0; }
  .bg-image { position:absolute; top:0; left:0; right:0; height:130mm; background:url('/card-bg.jpg') center top/cover no-repeat; }
  .bg-overlay { position:absolute; top:0; left:0; right:0; height:130mm; background:linear-gradient(to bottom, rgba(13,36,71,0.55) 0%, rgba(13,36,71,0.4) 50%, rgba(13,36,71,0.75) 85%, rgba(240,244,255,1) 100%); }
  .bg-bottom { position:absolute; bottom:0; left:0; right:0; height:167mm; background:#F0F4FF; }
  .gold-line-top { position:absolute; top:130mm; left:0; right:0; height:3px; background:linear-gradient(90deg,transparent,#C9A227 20%,#E8C44A 50%,#C9A227 80%,transparent); z-index:2; }

  .content { position:relative; z-index:2; display:flex; flex-direction:column; height:100%; }

  /* الهيدر */
  .header { padding:7mm 15mm 5mm; display:flex; align-items:center; justify-content:space-between; }
  .logo-box { background:white; border-radius:12px; padding:6px 10px; border:2px solid rgba(201,162,39,0.5); box-shadow:0 4px 15px rgba(0,0,0,0.2); }
  .logo-box img { height:18mm; object-fit:contain; display:block; }
  .company-info { text-align:center; flex:1; padding:0 10mm; }
  .company-name { color:white; font-size:28pt; font-weight:900; line-height:1.1; }
  .company-sub { color:#E8C44A; font-size:13pt; font-weight:600; margin-top:2mm; }
  .company-en { color:rgba(255,255,255,0.45); font-size:9pt; letter-spacing:3px; margin-top:1mm; }
  .badge { background:rgba(201,162,39,0.2); border:1px solid rgba(201,162,39,0.4); border-radius:8px; padding:4mm 6mm; text-align:center; }
  .badge-num { color:#E8C44A; font-size:22pt; font-weight:900; display:block; }
  .badge-text { color:rgba(255,255,255,0.7); font-size:8pt; }

  /* الإحصاءات */
  .stats-row { display:flex; padding:3mm 15mm; gap:4mm; }
  .stat { flex:1; background:white; border-radius:10px; padding:4mm; text-align:center; box-shadow:0 2px 10px rgba(27,58,107,0.12); border:1px solid rgba(27,58,107,0.08); }
  .stat-val { font-size:16pt; font-weight:900; color:#1B3A6B; display:block; line-height:1.3; }
  .stat-lbl { font-size:7pt; color:#6B7280; margin-top:1mm; }

  /* المحتوى الرئيسي */
  .main { display:grid; grid-template-columns:1fr 1fr; gap:5mm; padding:3mm 15mm; }

  .section-title { font-size:10pt; font-weight:700; color:#1B3A6B; border-bottom:2px solid #EEF4FF; padding-bottom:2mm; margin-bottom:3mm; display:flex; align-items:center; gap:2mm; }

  /* الخدمات */
  .services { display:grid; grid-template-columns:1fr 1fr; gap:2.5mm; }
  .service { background:#F8FAFF; border-radius:8px; padding:3mm; border:1px solid rgba(27,58,107,0.08); display:flex; gap:2mm; align-items:flex-start; }
  .service-icon { font-size:14pt; flex-shrink:0; }
  .service-title { font-size:8pt; font-weight:700; color:#1B3A6B; }
  .service-desc { font-size:7pt; color:#6B7280; margin-top:0.5mm; line-height:1.3; }

  /* القيم */
  .values { display:grid; grid-template-columns:1fr 1fr; gap:2.5mm; }
  .value { border-radius:8px; padding:3mm; text-align:center; background:linear-gradient(135deg,rgba(27,58,107,0.05),rgba(201,162,39,0.05)); border:1px solid rgba(201,162,39,0.15); }
  .value-icon { font-size:16pt; display:block; margin-bottom:1mm; }
  .value-title { font-size:8pt; font-weight:700; color:#1B3A6B; }
  .value-desc { font-size:7pt; color:#6B7280; margin-top:0.5mm; line-height:1.3; }

  /* الدول */
  .countries { display:flex; flex-wrap:wrap; gap:2mm; margin-bottom:3mm; }
  .country { font-size:16pt; }

  /* الاتصال */
  .contact-box { background:linear-gradient(135deg,#1B3A6B,#0D2447); border-radius:10px; padding:3mm 6mm; margin:3mm 15mm 5mm; }
  .contact-grid { display:grid; grid-template-columns:1fr 1fr; gap:2mm; flex:1; }
  .contact-row { display:flex; align-items:center; gap:2mm; color:white; font-size:8pt; }
  .contact-icon { font-size:11pt; flex-shrink:0; }
  .contact-val { direction:ltr; }
  .contact-val.green { color:#4ADE80; }

  /* الفوتر */
  .footer { background:#1B3A6B; padding:3mm 15mm; display:flex; justify-content:space-between; align-items:center; }
  .footer-text { color:rgba(255,255,255,0.5); font-size:7pt; }
  .footer-brand { color:#C9A227; font-size:9pt; font-weight:700; }

  .gold-line { height:2px; background:linear-gradient(90deg,transparent,#C9A227,transparent); }

  @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
</style>
</head>
<body>
<div class="page">
  <div class="bg">
    <div class="bg-image"></div>
    <div class="bg-overlay"></div>
    <div class="bg-bottom"></div>
    <div class="gold-line-top"></div>
  </div>

  <div class="content">
    <!-- الهيدر -->
    <div class="header">
      <div class="logo-box">
        <img src="/logo.jpg" alt="بيرق العرب" onerror="this.style.display='none'" />
      </div>
      <div class="company-info">
        <div class="company-name">بيرق العرب</div>
        <div class="company-sub">للتوظيف بالخارج</div>
        <div class="company-en">BAYRAK ELARAB — RECRUITMENT</div>
      </div>
      <div class="badge">
        <span class="badge-num">14</span>
        <span class="badge-text">سنة خبرة</span>
      </div>
    </div>

    <!-- الإحصاءات -->
    <div class="stats-row">
      <div class="stat"><span class="stat-val">500+</span><div class="stat-lbl">مترشح موظَّف</div></div>
      <div class="stat"><span class="stat-val">10+</span><div class="stat-lbl">دول شراكة</div></div>
      <div class="stat"><span class="stat-val">50+</span><div class="stat-lbl">مشغّل موثوق</div></div>
      <div class="stat"><span class="stat-val" style="font-size:10pt;">السعودية • الإمارات • قطر<br/>الكويت • البحرين • عُمان</span><div class="stat-lbl">دول التوظيف</div></div>
    </div>

    <!-- المحتوى -->
    <div class="main">
      <div>
        <div class="section-title">🛠️ خدماتنا</div>
        <div class="services">
          <div class="service"><span class="service-icon">✈️</span><div><div class="service-title">التوظيف بالخارج</div><div class="service-desc">الخليج وأوروبا</div></div></div>
          <div class="service"><span class="service-icon">🗂️</span><div><div class="service-title">إدارة الملفات</div><div class="service-desc">متابعة شاملة</div></div></div>
          <div class="service"><span class="service-icon">📄</span><div><div class="service-title">الوثائق والعقود</div><div class="service-desc">معتمدة قانونياً</div></div></div>
          <div class="service"><span class="service-icon">🛂</span><div><div class="service-title">التأشيرات</div><div class="service-desc">إجراءات السفر</div></div></div>
          <div class="service"><span class="service-icon">🤝</span><div><div class="service-title">التفاوض</div><div class="service-desc">أفضل الشروط</div></div></div>
          <div class="service"><span class="service-icon">📞</span><div><div class="service-title">المتابعة</div><div class="service-desc">دعم مستمر</div></div></div>
        </div>
      </div>
      <div>
        <div class="section-title">🌟 قيمنا</div>
        <div class="values">
          <div class="value"><span class="value-icon">🌟</span><div class="value-title">الثقة</div><div class="value-desc">صدق وشفافية تامة</div></div>
          <div class="value"><span class="value-icon">⚡</span><div class="value-title">السرعة</div><div class="value-desc">معالجة سريعة وفعّالة</div></div>
          <div class="value"><span class="value-icon">🛡️</span><div class="value-title">الأمان</div><div class="value-desc">نحمي حقوق الموظف</div></div>
          <div class="value"><span class="value-icon">🌍</span><div class="value-title">الشبكة</div><div class="value-desc">10 دول شراكة</div></div>
        </div>
      </div>
    </div>

    <!-- الاتصال + QR -->
    <div class="contact-box">
      <div style="display:flex; align-items:center; gap:5mm;">
        <div class="contact-grid" style="flex:1;">
          <div class="contact-row"><span class="contact-icon">📞</span><span class="contact-val">(216+) 52 332 223 / 98 656 680</span></div>
          <div class="contact-row"><span class="contact-icon">💬</span><span class="contact-val green">(216+) 98 656 680</span></div>
          <div class="contact-row"><span class="contact-icon">📧</span><span class="contact-val">bayrakdirection@gmail.com</span></div>
          <div class="contact-row"><span class="contact-icon">📍</span><span>17 Rue de Marseille, Tunis 1002</span></div>
        </div>
        <div style="flex-shrink:0; text-align:center;">
          <div style="background:white; border-radius:8px; padding:3mm; border:2px solid rgba(201,162,39,0.3);">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://bayraq-register.vercel.app&color=1B3A6B&bgcolor=FFFFFF&format=png&qzone=1" width="22mm" height="22mm" alt="QR التسجيل" />
          </div>
          <div style="color:#E8C44A; font-size:6pt; margin-top:1.5mm; font-weight:700;">سجّل هنا</div>
        </div>
      </div>
    </div>

    <div class="gold-line"></div>
    <div class="footer">
      <span class="footer-text">© 2025 جميع الحقوق محفوظة — بيرق العرب</span>
      <span class="footer-brand">BAYRAK ELARAB</span>
    </div>
  </div>
</div>
</body></html>`)
    win.document.close()
    setTimeout(() => win.print(), 800)
  }

  const printQR = (url, title, desc, icon, side) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}&color=1B3A6B&bgcolor=FFFFFF&format=png&qzone=1`
    const win = window.open('', '_blank')
    win.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>بطاقة بيرق العرب</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  @page { size: 90mm 50mm; margin:0; }
  body { width:90mm; background:white; font-family:'Cairo',sans-serif; }

  /* الوجه الأمامي — كحلي */
  .front { width:90mm; height:50mm; background:linear-gradient(135deg,#0D2447 0%,#1B3A6B 100%); position:relative; overflow:hidden; display:flex; flex-direction:column; justify-content:space-between; padding:5mm 6mm; }
  .front-pattern { position:absolute; inset:0; opacity:0.06; background-image:repeating-linear-gradient(45deg,#C9A227 0,#C9A227 1px,transparent 0,transparent 10px),repeating-linear-gradient(-45deg,#C9A227 0,#C9A227 1px,transparent 0,transparent 10px); }
  .front-circle-1 { position:absolute; top:-12mm; right:-8mm; width:35mm; height:35mm; border-radius:50%; border:1.5px solid rgba(201,162,39,0.25); }
  .front-circle-2 { position:absolute; top:-5mm; right:-1mm; width:20mm; height:20mm; border-radius:50%; border:1px solid rgba(201,162,39,0.15); }
  .front-circle-3 { position:absolute; bottom:-10mm; left:-8mm; width:28mm; height:28mm; border-radius:50%; border:1px solid rgba(255,255,255,0.06); }
  .front-line { position:absolute; top:0; left:22mm; width:0.5px; height:50mm; background:linear-gradient(to bottom,transparent,rgba(201,162,39,0.2),transparent); }

  .logo-row { display:flex; align-items:center; gap:3mm; position:relative; z-index:1; }
  .logo-img { height:9mm; object-fit:contain; }
  .logo-divider { width:0.5px; height:8mm; background:rgba(201,162,39,0.4); }
  .logo-text { }
  .logo-ar { color:white; font-size:10pt; font-weight:900; line-height:1.1; }
  .logo-en { color:#C9A227; font-size:7pt; letter-spacing:1px; margin-top:1px; }

  .front-bottom { position:relative; z-index:1; }
  .front-tagline { color:rgba(255,255,255,0.5); font-size:7pt; font-weight:300; letter-spacing:0.5px; }
  .front-gold-line { height:1.5px; background:linear-gradient(90deg,#C9A227,rgba(201,162,39,0.2)); margin-top:1.5mm; width:30mm; }

  /* الوجه الخلفي — أبيض */
  .back { width:90mm; height:50mm; background:white; position:relative; overflow:hidden; display:flex; padding:5mm 5mm 5mm 6mm; }
  .back-pattern { position:absolute; top:0; right:0; bottom:0; width:28mm; opacity:0.04; background-image:repeating-linear-gradient(45deg,#1B3A6B 0,#1B3A6B 1px,transparent 0,transparent 6px),repeating-linear-gradient(-45deg,#1B3A6B 0,#1B3A6B 1px,transparent 0,transparent 6px); }
  .back-accent { position:absolute; top:0; right:0; bottom:0; width:1.5mm; background:linear-gradient(to bottom,#1B3A6B,#C9A227,#1B3A6B); }

  .back-left { flex:1; display:flex; flex-direction:column; justify-content:center; padding-left:2mm; }
  .back-logo { display:flex; align-items:center; gap:2mm; margin-bottom:3mm; }
  .back-logo-img { height:8mm; object-fit:contain; }
  .back-logo-text .ar { color:#1B3A6B; font-size:9pt; font-weight:900; }
  .back-logo-text .en { color:#C9A227; font-size:6pt; letter-spacing:1px; }

  .contacts { display:flex; flex-direction:column; gap:1.5mm; }
  .contact-row { display:flex; align-items:center; gap:2mm; font-size:7.5pt; color:#374151; }
  .contact-icon { color:#1B3A6B; font-size:8pt; width:4mm; text-align:center; flex-shrink:0; }
  .contact-val { direction:ltr; }
  .contact-val.green { color:#16a34a; }

  .back-right { width:28mm; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2mm; }
  .qr-box { background:white; border:1.5px solid rgba(27,58,107,0.12); border-radius:4px; padding:2mm; }
  .qr-label { font-size:6.5pt; color:#1B3A6B; font-weight:700; text-align:center; }

  .page-break { page-break-after: always; }

  @media print {
    body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    @page { size: 90mm 50mm; margin:0; }
  }
</style>
</head>
<body>

<!-- الوجه الأمامي -->
<div class="front">
  <div class="front-pattern"></div>
  <div class="front-circle-1"></div>
  <div class="front-circle-2"></div>
  <div class="front-circle-3"></div>
  <div class="front-line"></div>

  <div class="logo-row">
    <img src="/logo.jpg" class="logo-img" alt="" onerror="this.style.display='none'" />
    <div class="logo-divider"></div>
    <div class="logo-text">
      <div class="logo-ar">بيرق العرب</div>
      <div class="logo-en">BAYRAK ELARAB</div>
    </div>
  </div>

  <div class="front-bottom">
    <div class="front-tagline">للتوظيف بالخارج — Recruitment Agency</div>
    <div class="front-gold-line"></div>
  </div>
</div>

<div class="page-break"></div>

<!-- الوجه الخلفي -->
<div class="back">
  <div class="back-pattern"></div>
  <div class="back-accent"></div>

  <div class="back-left">
    <div class="back-logo">
      <img src="/logo.jpg" class="back-logo-img" alt="" onerror="this.style.display='none'" />
      <div class="back-logo-text">
        <div class="ar">بيرق العرب</div>
        <div class="en">BAYRAK ELARAB</div>
      </div>
    </div>
    <div class="contacts">
      <div class="contact-row">
        <span class="contact-icon">📞</span>
        <span class="contact-val">(216+) 52 332 223</span>
      </div>
      <div class="contact-row">
        <span class="contact-icon">📱</span>
        <span class="contact-val">(216+) 98 656 680</span>
      </div>
      <div class="contact-row">
        <span class="contact-icon">💬</span>
        <span class="contact-val green">(216+) 98 656 680</span>
      </div>
      <div class="contact-row">
        <span class="contact-icon">📧</span>
        <span class="contact-val" style="font-size:6.5pt;">bayrakdirection@gmail.com</span>
      </div>
      <div class="contact-row">
        <span class="contact-icon">📍</span>
        <span style="direction:ltr;font-size:6.5pt;">17 Rue de Marseille, Tunis 1002</span>
      </div>
    </div>
  </div>

  <div class="back-right">
    <div class="qr-box">
      <img src="${qrUrl}" width="80" height="80" alt="QR" />
    </div>
    <div class="qr-label">${title}</div>
  </div>
</div>

</body></html>`)
    win.document.close()
    setTimeout(() => win.print(), 800)
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white mb-0.5">🏢 بطاقة الشركة</h1>
          <p className="text-gray-400 text-sm">بطاقة تعريفية احترافية قابلة للطباعة</p>
        </div>
        <button onClick={printCard}
          className="btn-primary px-5 py-2.5 rounded-xl text-sm text-white font-semibold flex items-center gap-2">
          🖨️ طباعة بطاقة الشركة (A4)
        </button>
      </div>

      {/* معاينة البطاقة */}
      <div className="rounded-3xl overflow-hidden shadow-2xl"
        style={{background:'linear-gradient(135deg,#1B3A6B,#0D2447)', border:'2px solid rgba(201,162,39,0.3)'}}>
        <div className="h-1" style={{background:'linear-gradient(90deg,transparent,#C9A227,transparent)'}}></div>
        <div className="p-8 text-center space-y-4">
          <div className="w-24 h-24 rounded-2xl bg-white p-2 mx-auto shadow-2xl" style={{border:'3px solid rgba(201,162,39,0.4)'}}>
            <img src="/logo.jpg" alt="بيرق العرب" className="w-full h-full object-contain rounded-xl" onError={e=>e.target.style.display='none'} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">بيرق العرب</h2>
            <p className="text-lg font-semibold mt-1" style={{color:'#E8C44A'}}>للتوظيف بالخارج</p>
            <p className="text-sm text-white/40 mt-1 tracking-widest">BAYRAK ELARAB — RECRUITMENT</p>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {STATS.map(s => (
              <div key={s.label} className="text-center p-3 rounded-2xl" style={{background:'rgba(255,255,255,0.08)'}}>
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-xs text-white/50 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="h-1" style={{background:'linear-gradient(90deg,transparent,#C9A227,transparent)'}}></div>
        <div className="p-6 grid grid-cols-2 gap-4" style={{background:'#F8FAFF'}}>
          <div className="space-y-3">
            <div className="text-sm font-bold" style={{color:'#1B3A6B'}}>🛠️ خدماتنا</div>
            {SERVICES.map(s => (
              <div key={s.title} className="flex items-start gap-2 p-2.5 rounded-xl" style={{background:'white', border:'1px solid rgba(27,58,107,0.08)'}}>
                <span className="text-lg flex-shrink-0">{s.icon}</span>
                <div>
                  <div className="text-xs font-bold" style={{color:'#1B3A6B'}}>{s.title}</div>
                  <div className="text-xs" style={{color:'#6B7280'}}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <div className="text-sm font-bold" style={{color:'#1B3A6B'}}>🌟 قيمنا</div>
            {VALUES.map(v => (
              <div key={v.title} className="text-center p-3 rounded-xl" style={{background:'white', border:'1px solid rgba(201,162,39,0.15)'}}>
                <div className="text-2xl">{v.icon}</div>
                <div className="text-xs font-bold mt-1" style={{color:'#1B3A6B'}}>{v.title}</div>
                <div className="text-xs" style={{color:'#6B7280'}}>{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 py-4" style={{background:'#1B3A6B'}}>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              {icon:'📞', val:'(+216) 52 332 223 / 98 656 680'},
              {icon:'💬', val:'98 656 680', color:'#4ADE80'},
              {icon:'📧', val:'bayrakdirection@gmail.com'},
              {icon:'📍', val:'17 Rue de Marseille, Tunis 1002'},
            ].map(c => (
              <div key={c.val} className="flex items-center gap-2">
                <span>{c.icon}</span>
                <span className="font-mono text-xs" style={{color: c.color||'rgba(255,255,255,0.8)', direction:'ltr'}}>{c.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* بطاقات QR */}
      <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
        <div className="text-sm font-bold text-white">📲 بطاقات QR Code للطباعة</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { url:'https://bayraq-register.vercel.app', title:'سجّل للتوظيف', desc:'امسح للتسجيل في قاعدة بيانات بيرق العرب', icon:'📝', color:'#1B3A6B' },
            { url:'https://wa.me/21698656680', title:'تواصل واتساب', desc:'تواصل مباشر مع مكتب بيرق العرب', icon:'💬', color:'#16a34a' },
            { url:'https://bayraq-elarab.vercel.app', title:'منصة الإدارة', desc:'للموظفين والإدارة', icon:'🏢', color:'#7c3aed' },
          ].map(q => (
            <div key={q.title} className="glass rounded-2xl p-4 border border-white/5 space-y-3 text-center">
              <div className="text-3xl">{q.icon}</div>
              <div>
                <div className="font-semibold text-white text-sm">{q.title}</div>
                <div className="text-xs text-gray-400">{q.desc}</div>
              </div>
              <div className="bg-white p-2 rounded-xl inline-block">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(q.url)}&color=1B3A6B&bgcolor=FFFFFF&format=png&qzone=1`}
                  alt="QR" className="w-24 h-24" />
              </div>
              <button onClick={() => printQR(q.url, q.title, q.desc, q.icon, 'back')}
                className="btn-primary w-full py-2 rounded-xl text-xs text-white font-semibold">
                🖨️ طباعة البطاقة
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

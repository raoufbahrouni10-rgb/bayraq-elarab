import { useState } from 'react'

const QR_CARDS = [
  {
    id: 'register',
    url: 'https://bayraq-register.vercel.app',
    title: 'سجّل للتوظيف بالخارج',
    titleEn: 'Register for Recruitment',
    desc: 'امسح الكود وسجّل بياناتك مباشرة',
    icon: '📝',
    color: '#1B3A6B',
    btnColor: 'linear-gradient(135deg,#1B3A6B,#064E3B)',
  },
  {
    id: 'whatsapp',
    url: 'https://wa.me/21698656680',
    title: 'تواصل عبر واتساب',
    titleEn: 'Contact via WhatsApp',
    desc: 'تواصل مباشر مع مكتب بيرق العرب',
    icon: '💬',
    color: '#16a34a',
    btnColor: 'linear-gradient(135deg,#16a34a,#15803d)',
  },
  {
    id: 'platform',
    url: 'https://bayraq-elarab.vercel.app',
    title: 'منصة بيرق العرب',
    titleEn: 'Bayrak Platform',
    desc: 'الدخول لمنصة إدارة التوظيف',
    icon: '🏢',
    color: '#7c3aed',
    btnColor: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
  },
]

function QRCard({ card, size = 180 }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size*2}x${size*2}&data=${encodeURIComponent(card.url)}&color=${card.color.replace('#','')}&bgcolor=FFFFFF&format=png&qzone=1`
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-white/10 shadow-xl"
      style={{boxShadow:'0 8px 32px rgba(0,0,0,0.2)'}}>
      {/* الرأس */}
      <div className="p-5 text-center" style={{background:`linear-gradient(135deg,#064E3B,#1B3A6B)`}}>
        <div className="text-3xl mb-2">{card.icon}</div>
        <div className="text-white font-black text-base">{card.title}</div>
        <div className="text-xs mt-0.5" style={{color:'#D4AF37'}}>{card.titleEn}</div>
      </div>

      {/* QR */}
      <div className="p-5 flex flex-col items-center gap-3">
        <div className="bg-white p-3 rounded-2xl" style={{border:`3px solid ${card.color}20`, boxShadow:'0 4px 20px rgba(0,0,0,0.08)'}}>
          <img src={qrUrl} alt="QR Code" style={{width:size,height:size,display:'block'}} />
        </div>
        <div className="text-center space-y-1">
          <div className="text-xs text-gray-500">{card.desc}</div>
          <div className="text-xs font-mono text-gray-400 break-all" dir="ltr">{card.url}</div>
        </div>
        <div className="flex gap-2 w-full">
          <button onClick={() => navigator.clipboard.writeText(card.url)}
            className="flex-1 py-2 rounded-xl text-xs border border-white/10 text-gray-300 hover:bg-white/5 transition-all">
            📋 نسخ الرابط
          </button>
          <button onClick={() => printQRCard(card)}
            className="flex-1 py-2 rounded-xl text-xs text-white font-semibold transition-all hover:-translate-y-0.5"
            style={{background:card.btnColor}}>
            🖨️ طباعة البطاقة
          </button>
        </div>
      </div>
    </div>
  )
}

function printQRCard(card) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(card.url)}&color=${card.color.replace('#','')}&bgcolor=FFFFFF&format=png&qzone=1`
  const isWA = card.id === 'whatsapp'
  const win = window.open('', '_blank')
  win.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>بطاقة QR — ${card.title}</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; font-family:'Cairo',sans-serif; }
@page { size: 85mm 55mm; margin:0; }
body { width:85mm; background:white; }

.front { width:85mm; height:55mm; background:linear-gradient(135deg,#064E3B,#1B3A6B); position:relative; overflow:hidden; display:flex; flex-direction:column; justify-content:space-between; padding:5mm 6mm; }
.pattern { position:absolute; inset:0; opacity:0.06; background-image:repeating-linear-gradient(45deg,#D4AF37 0,#D4AF37 1px,transparent 0,transparent 10px),repeating-linear-gradient(-45deg,#D4AF37 0,#D4AF37 1px,transparent 0,transparent 10px); }
.circle-1 { position:absolute; top:-15mm; right:-10mm; width:40mm; height:40mm; border-radius:50%; border:1.5px solid rgba(212,175,55,0.25); }
.circle-2 { position:absolute; top:-5mm; right:-1mm; width:22mm; height:22mm; border-radius:50%; border:1px solid rgba(212,175,55,0.15); }
.circle-3 { position:absolute; bottom:-12mm; left:-8mm; width:30mm; height:30mm; border-radius:50%; border:1px solid rgba(255,255,255,0.06); }
.vline { position:absolute; top:0; left:25mm; width:0.5px; height:100%; background:linear-gradient(to bottom,transparent,rgba(212,175,55,0.2),transparent); }

.logo-row { display:flex; align-items:center; gap:3mm; position:relative; z-index:1; }
.logo-img { height:10mm; object-fit:contain; }
.divider { width:0.5px; height:9mm; background:rgba(212,175,55,0.4); }
.logo-ar { color:white; font-size:11pt; font-weight:900; line-height:1.1; }
.logo-en { color:#D4AF37; font-size:7pt; letter-spacing:1px; margin-top:1px; }

.bottom { position:relative; z-index:1; }
.tagline { color:rgba(255,255,255,0.45); font-size:7pt; font-weight:300; }
.gold-line { height:1.5px; background:linear-gradient(90deg,#D4AF37,transparent); margin-top:2mm; width:35mm; }

.back { width:85mm; height:55mm; background:white; position:relative; overflow:hidden; display:flex; }
.back-pattern { position:absolute; top:0; right:0; bottom:0; width:32mm; opacity:0.04; background-image:repeating-linear-gradient(45deg,#1B3A6B 0,#1B3A6B 1px,transparent 0,transparent 6px),repeating-linear-gradient(-45deg,#1B3A6B 0,#1B3A6B 1px,transparent 0,transparent 6px); }
.side-bar { position:absolute; top:0; right:0; bottom:0; width:4px; background:linear-gradient(to bottom,#1B3A6B,${card.color},#1B3A6B); }

.back-left { flex:1; display:flex; flex-direction:column; justify-content:center; padding:5mm 5mm 5mm 6mm; gap:2.5mm; }
.logo-sm { display:flex; align-items:center; gap:2.5mm; margin-bottom:2mm; }
.logo-sm img { height:8mm; }
.logo-sm .ar { color:#064E3B; font-size:9pt; font-weight:900; }
.logo-sm .en { color:#D4AF37; font-size:6pt; letter-spacing:1px; }
.crow { display:flex; align-items:center; gap:2mm; font-size:7.5pt; color:#374151; }
.cicon { width:4mm; text-align:center; font-size:8pt; flex-shrink:0; }
.cval { direction:ltr; }
.green { color:#16a34a; }

.back-right { width:32mm; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2mm; padding-left:3mm; }
.qr-box { background:white; border:2px solid ${card.color}22; border-radius:6px; padding:2mm; }
.qr-lbl { font-size:6pt; font-weight:700; text-align:center; color:${card.color}; }

.pb { page-break-after:always; }
@media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
</style>
</head>
<body>

<div class="front">
  <div class="pattern"></div>
  <div class="circle-1"></div><div class="circle-2"></div><div class="circle-3"></div>
  <div class="vline"></div>
  <div class="logo-row">
    <img src="/logo.jpg" class="logo-img" alt="" onerror="this.style.display='none'" />
    <div class="divider"></div>
    <div>
      <div class="logo-ar">بيرق العرب</div>
      <div class="logo-en">BAYRAK ELARAB</div>
    </div>
  </div>
  <div class="bottom">
    <div class="tagline">للتوظيف بالخارج — Recruitment Agency — 14 ans d'expérience</div>
    <div class="gold-line"></div>
  </div>
</div>

<div class="pb"></div>

<div class="back">
  <div class="back-pattern"></div>
  <div class="side-bar"></div>
  <div class="back-left">
    <div class="logo-sm">
      <img src="/logo.jpg" alt="" onerror="this.style.display='none'" />
      <div>
        <div class="ar">بيرق العرب</div>
        <div class="en">BAYRAK ELARAB</div>
      </div>
    </div>
    <div class="crow"><span class="cicon">📞</span><span class="cval">(216+) 52 332 223</span></div>
    <div class="crow"><span class="cicon">📱</span><span class="cval">(216+) 98 656 680</span></div>
    <div class="crow"><span class="cicon">💬</span><span class="cval green">(216+) 98 656 680</span></div>
    <div class="crow"><span class="cicon">📧</span><span class="cval" style="font-size:6.5pt;">bayrakdirection@gmail.com</span></div>
    <div class="crow"><span class="cicon">📍</span><span style="direction:ltr;font-size:6.5pt;">17 Rue de Marseille, Tunis 1002</span></div>
  </div>
  <div class="back-right">
    <div class="qr-box">
      <img src="${qrUrl}" width="85" height="85" alt="QR" />
    </div>
    <div class="qr-lbl">${card.title}</div>
  </div>
</div>

</body></html>`)
  win.document.close()
  setTimeout(() => win.print(), 800)
}

export default function QRCodePage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white mb-0.5">📲 بطاقات QR Code</h1>
        <p className="text-gray-400 text-sm">اطبع البطاقات ووزّعها — بوجهَين احترافيَّين مثل بطاقة العمل</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {QR_CARDS.map(card => <QRCard key={card.id} card={card} />)}
      </div>

      <div className="glass rounded-2xl p-5 border border-white/5 space-y-3">
        <div className="text-sm font-semibold text-gray-200">💡 كيفية الاستخدام</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-400">
          <div className="flex items-start gap-2">
            <span className="text-lg flex-shrink-0">🖨️</span>
            <div>اطبع البطاقة — تخرج بوجهَين: أمامي كحلي وخلفي أبيض بالـ QR</div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg flex-shrink-0">📱</span>
            <div>المترشح يمسح الكود بهاتفه ويُسجّل بياناته مباشرة</div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg flex-shrink-0">✅</span>
            <div>تظهر البيانات فوراً في منصة بيرق العرب للمراجعة</div>
          </div>
        </div>
      </div>
    </div>
  )
}

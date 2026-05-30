// ===== مساعد واتساب =====

// تنظيف رقم الهاتف
export function cleanPhone(phone) {
  if (!phone) return ''
  return phone.replace(/[\s\-\(\)\.]/g, '')
}

// رابط واتساب مباشر
export function waLink(phone, message = '') {
  const clean = cleanPhone(phone)
  if (!clean) return null
  // إضافة كود تونس إذا لم يكن موجوداً
  const num = clean.startsWith('+') ? clean.replace('+','') :
              clean.startsWith('00') ? clean.replace('00','') :
              clean.startsWith('216') ? clean :
              '216' + clean
  const encoded = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${num}${encoded}`
}

// رسالة ترحيب للمترشح
export function candidateMsg(candidate, type = 'welcome') {
  const name = candidate?.name || 'المترشح'
  const spec = candidate?.spec || ''
  const msgs = {
    welcome: `السلام عليكم ${name}،\n\nنشكركم على تسجيلكم في بيرق العرب للتوظيف بالخارج.\n\nسنتواصل معكم قريباً بخصوص الفرص المتاحة في تخصص ${spec}.\n\nمع التحية\nبيرق العرب`,
    interview: `السيد/السيدة ${name}،\n\nيسعدنا دعوتكم لمقابلة عمل. يرجى التواصل معنا لتحديد الموعد المناسب.\n\nبيرق العرب للتوظيف`,
    docs: `السيد/السيدة ${name}،\n\nيرجى تجهيز المستندات المطلوبة (بطاقة هوية، شهادات، صور) وإرسالها في أقرب وقت.\n\nبيرق العرب`,
    congrats: `تهانينا ${name}! 🎉\n\nيسعدنا إبلاغكم بقبول ملفكم. سنتواصل معكم لاستكمال الإجراءات.\n\nبيرق العرب`,
    followup: `السيد/السيدة ${name}،\n\nنتابع معكم بخصوص ملف التوظيف. هل لديكم أي استفسار؟\n\nبيرق العرب`,
  }
  return msgs[type] || msgs.welcome
}

// رسالة للمشغّل
export function employerMsg(employer, type = 'intro') {
  const name = employer?.name || 'المشغّل'
  const msgs = {
    intro: `السلام عليكم،\n\nنتشرف بالتواصل معكم من بيرق العرب للتوظيف بالخارج.\n\nلدينا مترشحون مؤهلون في عدة تخصصات ونود مناقشة إمكانية التعاون.\n\nمع فائق الاحترام\nبيرق العرب`,
    cv: `السلام عليكم ${name}،\n\nيسعدنا إرسال ملف مترشح مؤهل يناسب متطلباتكم. هل يمكننا ترتيب مقابلة؟\n\nبيرق العرب`,
    followup: `السلام عليكم ${name}،\n\nنتابع معكم بخصوص الملفات المرسلة. هل لديكم أي تحديث؟\n\nبيرق العرب`,
  }
  return msgs[type] || msgs.intro
}

// فتح واتساب
export function openWhatsApp(phone, message = '') {
  const link = waLink(phone, message)
  if (link) window.open(link, '_blank')
  else alert('يرجى إضافة رقم الهاتف أولاً')
}

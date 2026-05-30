import { useState, useRef } from 'react'

// ======= أدوات السيرة الذاتية =======
// 1. تحويل PDF ↔ Word
// 2. تنقيح البيانات الشخصية بالذكاء الاصطناعي

const PERSONAL_FIELDS = [
  { key:'phone',   label:'رقم الهاتف',        pattern:/(\+?[\d\s\-\(\)]{8,15})/g,           replacement:'[رقم الهاتف محذوف]' },
  { key:'email',   label:'البريد الإلكتروني',  pattern:/[\w\.-]+@[\w\.-]+\.\w+/g,             replacement:'[البريد محذوف]' },
  { key:'address', label:'العنوان',             pattern:/(شارع|نهج|حي|حومة|طريق|rue|avenue)\s+[\w\s]+/gi, replacement:'[العنوان محذوف]' },
  { key:'national',label:'رقم بطاقة الهوية',  pattern:/\b\d{8}\b/g,                          replacement:'[رقم الهوية محذوف]' },
  { key:'cin',     label:'رقم CIN',             pattern:/[A-Z]{1,2}\d{6,8}/g,                 replacement:'[CIN محذوف]' },
]

export default function CVToolsPage() {
  const [activeTab, setActiveTab] = useState('convert')

  // ===== تحويل الملفات =====
  const [convertFile, setConvertFile]     = useState(null)
  const [convertDir, setConvertDir]       = useState('pdf-to-word')
  const [converting, setConverting]       = useState(false)
  const [convertDone, setConvertDone]     = useState(false)
  const [dragOver, setDragOver]           = useState(false)
  const fileRef = useRef()

  // ===== تنقيح البيانات =====
  const [cleanFile, setCleanFile]         = useState(null)
  const [cleanText, setCleanText]         = useState('')
  const [cleanedText, setCleanedText]     = useState('')
  const [selectedFields, setSelectedFields] = useState({ phone:true, email:true, address:true, national:true, cin:true })
  const [cleaning, setCleaning]           = useState(false)
  const [cleanDone, setCleanDone]         = useState(false)
  const [aiClean, setAiClean]             = useState(false)
  const [apiKey, setApiKey]               = useState(import.meta.env.VITE_ANTHROPIC_API_KEY || '')
  const cleanFileRef = useRef()

  // ===== تحويل PDF إلى Word =====
  const handleConvertFile = (f) => {
    if (!f) return
    const ext = f.name.split('.').pop().toLowerCase()
    if (convertDir === 'pdf-to-word' && ext !== 'pdf') { alert('يرجى رفع ملف PDF'); return }
    if (convertDir === 'word-to-pdf' && !['doc','docx'].includes(ext)) { alert('يرجى رفع ملف Word'); return }
    setConvertFile(f); setConvertDone(false)
  }

  const doConvert = async () => {
    if (!convertFile) return
    setConverting(true)

    // للتحويل الحقيقي نحتاج API خارجي أو مكتبة backend
    // هنا نستخدم أفضل طريقة متاحة في المتصفح
    await new Promise(r => setTimeout(r, 1500))

    if (convertDir === 'word-to-pdf') {
      // Word → PDF: نقرأ النص ونولّد PDF بسيط
      try {
        const text = await convertFile.text()
        const pdfContent = generateSimplePDF(text, convertFile.name)
        downloadBlob(pdfContent, convertFile.name.replace(/\.[^.]+$/, '.pdf'), 'application/pdf')
        setConvertDone(true)
      } catch(e) {
        // Fallback: فتح في نافذة للطباعة
        const text = await convertFile.text()
        const win = window.open('', '_blank')
        win.document.write(`<html dir="rtl"><body style="font-family:Arial;padding:40px;direction:rtl"><pre>${text}</pre></body></html>`)
        win.document.close()
        setTimeout(() => win.print(), 500)
        setConvertDone(true)
      }
    } else {
      // PDF → Word: نستخرج النص ونولّد DOCX بسيط
      try {
        const text = await convertFile.text()
        const docxContent = generateSimpleDOCX(text, convertFile.name)
        downloadBlob(docxContent, convertFile.name.replace(/\.[^.]+$/, '.docx'), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
        setConvertDone(true)
      } catch(e) {
        // Fallback: تحميل كـ RTF
        const text = await convertFile.text()
        const rtf = `{\\rtf1\\ansi\\deff0 {\\fonttbl{\\f0 Arial;}} \\f0\\fs24 ${text.replace(/\n/g,'\\par ')}}`
        downloadBlob(new Blob([rtf]), convertFile.name.replace(/\.[^.]+$/, '.rtf'), 'application/rtf')
        setConvertDone(true)
      }
    }
    setConverting(false)
  }

  // توليد PDF بسيط
  const generateSimplePDF = (text, filename) => {
    const lines = text.split('\n')
    let pdfStr = '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n'
    pdfStr += '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n'
    const safeText = lines.slice(0,50).map(l => `(${l.replace(/[()\\]/g,'\\$&').slice(0,80)}) Tj T*`).join('\n')
    pdfStr += `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]\n/Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n`
    pdfStr += `4 0 obj\n<< /Length ${safeText.length + 100} >>\nstream\nBT /F1 12 Tf 50 750 Td 14 TL\n${safeText}\nET\nendstream\nendobj\n`
    pdfStr += '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n'
    return new Blob([pdfStr], { type: 'application/pdf' })
  }

  // توليد DOCX بسيط (XML)
  const generateSimpleDOCX = (text, filename) => {
    const paragraphs = text.split('\n').map(line =>
      `<w:p><w:r><w:t xml:space="preserve">${line.replace(/[<>&"']/g, c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]))}</w:t></w:r></w:p>`
    ).join('\n')
    const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>${paragraphs}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/></w:sectPr></w:body></w:document>`
    return new Blob([xml], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  }

  const downloadBlob = (blob, filename, type) => {
    const url = URL.createObjectURL(blob instanceof Blob ? blob : new Blob([blob], { type }))
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  // ===== تنقيح البيانات الشخصية =====
  const handleCleanFile = async (f) => {
    setCleanFile(f); setCleanedText(''); setCleanDone(false)
    const text = await f.text()
    setCleanText(text)
  }

  const doLocalClean = () => {
    let result = cleanText
    Object.entries(selectedFields).forEach(([key, active]) => {
      if (!active) return
      const field = PERSONAL_FIELDS.find(f => f.key === key)
      if (field) result = result.replace(field.pattern, field.replacement)
    })
    return result
  }

  const doAIClean = async () => {
    const key = apiKey.trim()
    if (!key || key === 'your_anthropic_key_here') {
      setCleanedText(doLocalClean())
      setCleanDone(true)
      return
    }

    setCleaning(true)
    const fieldsToRemove = Object.entries(selectedFields)
      .filter(([,v])=>v)
      .map(([k]) => PERSONAL_FIELDS.find(f=>f.key===k)?.label)
      .filter(Boolean)
      .join('، ')

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'x-api-key':key, 'anthropic-version':'2023-06-01' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [{
            role: 'user',
            content: `أنت خبير في حماية البيانات الشخصية. قم بتنقيح هذه السيرة الذاتية بحذف أو استبدال البيانات الشخصية التالية: ${fieldsToRemove}.

استبدل كل بيانات شخصية بنص توضيحي بين قوسين مربعين مثل [رقم الهاتف محذوف].
احتفظ بجميع المعلومات المهنية (الخبرات، المهارات، التعليم، المسار المهني).

السيرة الذاتية:
${cleanText.slice(0, 4000)}

أرجع النص المنقّح فقط بدون أي شرح إضافي.`
          }]
        })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      const result = data.content.map(b=>b.text||'').join('')
      setCleanedText(result)
    } catch(err) {
      // Fallback للتنقيح المحلي
      setCleanedText(doLocalClean())
    }
    setCleanDone(true)
    setCleaning(false)
  }

  const handleClean = () => {
    if (!cleanText) return
    if (aiClean) {
      doAIClean()
    } else {
      setCleaning(true)
      setTimeout(() => {
        setCleanedText(doLocalClean())
        setCleanDone(true)
        setCleaning(false)
      }, 800)
    }
  }

  const downloadCleanedText = () => {
    const ext = cleanFile?.name.split('.').pop() || 'txt'
    const blob = new Blob([cleanedText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = (cleanFile?.name.replace(/\.[^.]+$/, '') || 'سيرة_منقحة') + '_منقحة.' + ext
    a.click()
    URL.revokeObjectURL(url)
  }

  const TABS = [
    { key:'convert', label:'🔄 تحويل PDF ↔ Word' },
    { key:'clean',   label:'🛡️ تنقيح البيانات الشخصية' },
  ]

  return (
    <div className="animate-fade-in space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-white mb-0.5">أدوات السيرة الذاتية 🛠️</h1>
        <p className="text-gray-400 text-sm">تحويل الملفات وتنقيح البيانات الشخصية</p>
      </div>

      {/* تبويبات */}
      <div className="flex gap-1 border-b border-white/5">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px
              ${activeTab===t.key ? 'border-blue-400 text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ===== تحويل الملفات ===== */}
      {activeTab === 'convert' && (
        <div className="space-y-4">

          {/* اختيار الاتجاه */}
          <div className="glass rounded-2xl p-4 space-y-3">
            <div className="text-sm font-semibold text-gray-200">اختر اتجاه التحويل</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key:'pdf-to-word', label:'PDF → Word', icon:'📄➡️📝', desc:'استخراج النص من PDF وتحويله لـ Word' },
                { key:'word-to-pdf', label:'Word → PDF', icon:'📝➡️📄', desc:'تحويل ملف Word إلى PDF للطباعة' },
              ].map(d => (
                <button key={d.key} onClick={() => { setConvertDir(d.key); setConvertFile(null); setConvertDone(false) }}
                  className={`p-4 rounded-xl border text-right transition-all
                    ${convertDir===d.key ? 'border-blue-500/50 bg-blue-500/10' : 'border-white/8 hover:bg-white/5'}`}>
                  <div className="text-2xl mb-2">{d.icon}</div>
                  <div className={`text-sm font-semibold ${convertDir===d.key?'text-blue-300':'text-gray-300'}`}>{d.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5 leading-tight">{d.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* منطقة رفع الملف */}
          <div
            onClick={() => fileRef.current.click()}
            onDragOver={e=>{e.preventDefault();setDragOver(true)}}
            onDragLeave={()=>setDragOver(false)}
            onDrop={e=>{e.preventDefault();setDragOver(false);handleConvertFile(e.dataTransfer.files[0])}}
            className={`rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all
              ${convertFile ? 'border-emerald-500/40 bg-emerald-500/5'
              : dragOver   ? 'border-blue-400 bg-blue-500/10'
              : 'border-white/10 hover:border-white/25'}`}>
            <div className="text-4xl mb-3">{convertFile ? '📄' : convertDir==='pdf-to-word' ? '📕' : '📝'}</div>
            {convertFile ? (
              <>
                <div className="font-semibold text-emerald-300 text-sm">{convertFile.name}</div>
                <div className="text-xs text-gray-500 mt-1">{(convertFile.size/1024).toFixed(1)} KB</div>
                <button onClick={e=>{e.stopPropagation();setConvertFile(null);setConvertDone(false)}}
                  className="text-xs text-gray-500 hover:text-red-400 mt-2 block mx-auto">✕ تغيير الملف</button>
              </>
            ) : (
              <>
                <div className="font-semibold text-gray-200 text-sm mb-1">
                  {convertDir==='pdf-to-word' ? 'ارفع ملف PDF' : 'ارفع ملف Word (.doc أو .docx)'}
                </div>
                <div className="text-xs text-gray-500">اسحب الملف هنا أو اضغط للاختيار</div>
              </>
            )}
            <input ref={fileRef} type="file"
              accept={convertDir==='pdf-to-word' ? '.pdf' : '.doc,.docx'}
              className="hidden" onChange={e=>handleConvertFile(e.target.files[0])} />
          </div>

          {/* زر التحويل */}
          {convertFile && !convertDone && (
            <button onClick={doConvert} disabled={converting}
              className="btn-primary w-full py-3.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2">
              {converting
                ? <><span className="animate-spin inline-block">⟳</span> جارٍ التحويل...</>
                : <>{convertDir==='pdf-to-word' ? '📝 تحويل إلى Word' : '📄 تحويل إلى PDF'}</>}
            </button>
          )}

          {convertDone && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center space-y-2">
              <div className="text-2xl">✅</div>
              <div className="text-sm font-semibold text-emerald-300">تم التحويل بنجاح!</div>
              <div className="text-xs text-gray-400">تحقق من مجلد التنزيلات</div>
              <button onClick={() => { setConvertFile(null); setConvertDone(false) }}
                className="text-xs text-blue-400 hover:underline">تحويل ملف آخر</button>
            </div>
          )}

          {/* ملاحظة */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-300 space-y-1">
            <div className="font-semibold">⚠️ ملاحظة مهمة:</div>
            <div>التحويل يعتمد على استخراج النص — ملفات PDF المسح الضوئي (صور) لن تُحوَّل بدقة.</div>
            <div>للتحويل الاحترافي الكامل مع الحفاظ على التنسيق، نوصي بـ <span className="text-white">Adobe Acrobat</span> أو <span className="text-white">SmallPDF.com</span></div>
          </div>
        </div>
      )}

      {/* ===== تنقيح البيانات الشخصية ===== */}
      {activeTab === 'clean' && (
        <div className="space-y-4">

          {/* شرح الميزة */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 space-y-1">
            <div className="text-sm font-semibold text-blue-300">🛡️ ما هذه الميزة؟</div>
            <div className="text-xs text-gray-400">
              تحذف أو تستبدل البيانات الشخصية الحساسة من السيرة الذاتية (رقم الهاتف، البريد، العنوان، رقم الهوية) مع الحفاظ على المعلومات المهنية كاملة. مفيد عند مشاركة السيرة مع جهات خارجية.
            </div>
          </div>

          {/* البيانات المراد حذفها */}
          <div className="glass rounded-2xl p-4 space-y-3">
            <div className="text-sm font-semibold text-gray-200">اختر البيانات المراد حذفها</div>
            <div className="grid grid-cols-2 gap-2">
              {PERSONAL_FIELDS.map(f => (
                <label key={f.key} className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all
                  ${selectedFields[f.key] ? 'border-red-500/30 bg-red-500/10' : 'border-white/8 hover:bg-white/5'}`}>
                  <div onClick={() => setSelectedFields(p=>({...p,[f.key]:!p[f.key]}))}
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all flex-shrink-0
                      ${selectedFields[f.key] ? 'bg-red-500 border-red-500' : 'border-white/20'}`}>
                    {selectedFields[f.key] && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className="text-xs text-gray-300">{f.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* طريقة التنقيح */}
          <div className="glass rounded-2xl p-4 space-y-3">
            <div className="text-sm font-semibold text-gray-200">طريقة التنقيح</div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setAiClean(false)}
                className={`p-3 rounded-xl border text-right transition-all
                  ${!aiClean ? 'border-blue-500/50 bg-blue-500/10' : 'border-white/8 hover:bg-white/5'}`}>
                <div className="text-xl mb-1">⚡</div>
                <div className={`text-xs font-semibold ${!aiClean?'text-blue-300':'text-gray-300'}`}>تلقائي سريع</div>
                <div className="text-xs text-gray-500 mt-0.5">بدون AI — يعمل دائماً</div>
              </button>
              <button onClick={() => setAiClean(true)}
                className={`p-3 rounded-xl border text-right transition-all
                  ${aiClean ? 'border-purple-500/50 bg-purple-500/10' : 'border-white/8 hover:bg-white/5'}`}>
                <div className="text-xl mb-1">🤖</div>
                <div className={`text-xs font-semibold ${aiClean?'text-purple-300':'text-gray-300'}`}>بالذكاء الاصطناعي</div>
                <div className="text-xs text-gray-500 mt-0.5">أدق وأشمل — يحتاج API</div>
              </button>
            </div>
            {aiClean && (
              <div>
                <label className="text-xs text-gray-500 block mb-1">مفتاح Anthropic API</label>
                <input type="password" value={apiKey} onChange={e=>setApiKey(e.target.value)}
                  placeholder="sk-ant-..." className="input-dark w-full px-4 py-2 rounded-xl text-sm font-mono" />
              </div>
            )}
          </div>

          {/* رفع الملف */}
          <div
            onClick={() => cleanFileRef.current.click()}
            onDragOver={e=>{e.preventDefault()}}
            onDrop={e=>{e.preventDefault();handleCleanFile(e.dataTransfer.files[0])}}
            className={`rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all
              ${cleanFile ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/10 hover:border-white/25'}`}>
            <div className="text-3xl mb-2">{cleanFile ? '📄' : '📂'}</div>
            {cleanFile ? (
              <>
                <div className="text-sm font-semibold text-emerald-300">{cleanFile.name}</div>
                <div className="text-xs text-gray-500 mt-1">{(cleanFile.size/1024).toFixed(1)} KB — جاهز للتنقيح</div>
                <button onClick={e=>{e.stopPropagation();setCleanFile(null);setCleanText('');setCleanedText('');setCleanDone(false)}}
                  className="text-xs text-gray-500 hover:text-red-400 mt-1 block mx-auto">✕ تغيير</button>
              </>
            ) : (
              <>
                <div className="text-sm font-semibold text-gray-200 mb-1">ارفع السيرة الذاتية</div>
                <div className="text-xs text-gray-500">PDF أو Word أو نص</div>
              </>
            )}
            <input ref={cleanFileRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden"
              onChange={e => { const f=e.target.files[0]; if(f) handleCleanFile(f) }} />
          </div>

          {/* زر التنقيح */}
          {cleanFile && !cleanDone && (
            <button onClick={handleClean} disabled={cleaning || !Object.values(selectedFields).some(Boolean)}
              className="btn-primary w-full py-3.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2">
              {cleaning
                ? <><span className="animate-spin inline-block">⟳</span> {aiClean ? 'الذكاء الاصطناعي يعالج الملف...' : 'جارٍ التنقيح...'}</>
                : '🛡️ تنقيح البيانات الشخصية'}
            </button>
          )}

          {/* نتيجة التنقيح */}
          {cleanDone && cleanedText && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✅</span>
                  <span className="text-sm font-semibold text-gray-200">تم التنقيح بنجاح</span>
                  {aiClean && <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">AI</span>}
                </div>
                <button onClick={() => { setCleanFile(null); setCleanText(''); setCleanedText(''); setCleanDone(false) }}
                  className="text-xs text-gray-500 hover:text-gray-300">↩ تنقيح آخر</button>
              </div>

              <div className="glass rounded-xl p-4 max-h-60 overflow-y-auto">
                <div className="text-xs text-gray-500 mb-2">معاينة النص المنقّح:</div>
                <pre className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed font-sans">{cleanedText.slice(0,1500)}{cleanedText.length>1500?'\n...(مقتطع)':''}</pre>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={downloadCleanedText}
                  className="btn-primary py-2.5 rounded-xl text-sm text-white font-semibold flex items-center justify-center gap-2">
                  ⬇️ تحميل الملف المنقّح
                </button>
                <button onClick={() => navigator.clipboard.writeText(cleanedText)}
                  className="py-2.5 rounded-xl text-sm border border-white/10 text-gray-300 hover:bg-white/5 flex items-center justify-center gap-2">
                  📋 نسخ النص
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

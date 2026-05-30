import { useState, useRef } from 'react'

// ===== استيراد من Excel/CSV =====
function ImportExcel({ onImport }) {
  const [data, setData]       = useState([])
  const [headers, setHeaders] = useState([])
  const [mapping, setMapping] = useState({})
  const [step, setStep]       = useState(1) // 1=upload, 2=mapping, 3=preview, 4=done
  const [imported, setImported] = useState(0)
  const fileRef = useRef()

  const FIELDS = [
    { key:'name',   label:'الاسم الكامل',     required:true },
    { key:'spec',   label:'التخصص' },
    { key:'age',    label:'العمر' },
    { key:'exp',    label:'سنوات الخبرة' },
    { key:'city',   label:'المدينة' },
    { key:'phone',  label:'رقم الهاتف' },
    { key:'skills', label:'المهارات' },
    { key:'notes',  label:'ملاحظات' },
    { key:'ignore', label:'تجاهل هذا العمود' },
  ]

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(l => l.trim())
    if (lines.length < 2) return { headers:[], rows:[] }
    const sep = lines[0].includes(';') ? ';' : ','
    const hdrs = lines[0].split(sep).map(h => h.replace(/"/g,'').trim())
    const rows = lines.slice(1).map(line => {
      const cols = line.split(sep).map(c => c.replace(/"/g,'').trim())
      return Object.fromEntries(hdrs.map((h,i) => [h, cols[i]||'']))
    }).filter(r => Object.values(r).some(v => v))
    return { headers: hdrs, rows }
  }

  const handleFile = async (f) => {
    const text = await f.text()
    const { headers: hdrs, rows } = parseCSV(text)
    setHeaders(hdrs)
    setData(rows)
    // تخمين تلقائي للتعيين
    const auto = {}
    hdrs.forEach(h => {
      const hl = h.toLowerCase()
      if (hl.includes('اسم') || hl.includes('name'))   auto[h] = 'name'
      else if (hl.includes('تخصص') || hl.includes('spec') || hl.includes('مهنة')) auto[h] = 'spec'
      else if (hl.includes('عمر') || hl.includes('age') || hl.includes('سن'))    auto[h] = 'age'
      else if (hl.includes('خبرة') || hl.includes('exp'))                          auto[h] = 'exp'
      else if (hl.includes('مدينة') || hl.includes('city') || hl.includes('ولاية')) auto[h] = 'city'
      else if (hl.includes('هاتف') || hl.includes('phone') || hl.includes('gsm') || hl.includes('tel')) auto[h] = 'phone'
      else if (hl.includes('مهارة') || hl.includes('skill'))                       auto[h] = 'skills'
      else if (hl.includes('ملاحظ') || hl.includes('note'))                        auto[h] = 'notes'
      else auto[h] = 'ignore'
    })
    setMapping(auto)
    setStep(2)
  }

  const buildRecord = (row) => {
    const rec = { source:'excel' }
    Object.entries(mapping).forEach(([col, field]) => {
      if (field !== 'ignore' && row[col]) rec[field] = row[col]
    })
    return rec
  }

  const doImport = () => {
    const records = data.map(buildRecord).filter(r => r.name)
    onImport(records)
    setImported(records.length)
    setStep(4)
  }

  const preview = data.slice(0,5).map(buildRecord)

  return (
    <div className="space-y-5">
      {/* الخطوة 1 — رفع الملف */}
      {step === 1 && (
        <div onClick={() => fileRef.current.click()}
          className="rounded-2xl border-2 border-dashed border-white/10 hover:border-white/25 p-12 text-center cursor-pointer transition-all hover:bg-white/[0.02]">
          <div className="text-5xl mb-3">📊</div>
          <div className="font-semibold text-gray-200 text-sm mb-1">ارفع ملف Excel أو CSV</div>
          <div className="text-xs text-gray-500">يدعم .csv و .xls و .xlsx (محوّل لـ CSV)</div>
          <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden"
            onChange={e => { const f=e.target.files[0]; if(f) handleFile(f) }} />
          <div className="mt-4 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-2 inline-block">
            💡 ملف Excel: افتحه واحفظه كـ CSV أولاً
          </div>
        </div>
      )}

      {/* الخطوة 2 — تعيين الأعمدة */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-200">تعيين الأعمدة ({data.length} سجل)</div>
            <button onClick={() => setStep(1)} className="text-xs text-gray-500 hover:text-gray-300">↩ تغيير الملف</button>
          </div>
          <div className="space-y-2">
            {headers.map(h => (
              <div key={h} className="flex items-center gap-3 glass rounded-xl p-3 border border-white/5">
                <span className="text-xs text-gray-400 flex-1 font-mono">{h}</span>
                <span className="text-gray-600">→</span>
                <select value={mapping[h]||'ignore'} onChange={e => setMapping(p=>({...p,[h]:e.target.value}))}
                  className="input-dark px-3 py-1.5 rounded-lg text-xs">
                  {FIELDS.map(f => <option key={f.key} value={f.key}>{f.label}{f.required?' *':''}</option>)}
                </select>
              </div>
            ))}
          </div>
          {!Object.values(mapping).includes('name') && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-300">⚠️ يجب تعيين عمود "الاسم الكامل" على الأقل</div>
          )}
          <button onClick={() => setStep(3)} disabled={!Object.values(mapping).includes('name')}
            className="btn-primary w-full py-3 rounded-xl text-sm text-white font-bold disabled:opacity-40">
            معاينة البيانات ←
          </button>
        </div>
      )}

      {/* الخطوة 3 — معاينة */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-200">معاينة (أول 5 سجلات من {data.length})</div>
            <button onClick={() => setStep(2)} className="text-xs text-gray-500 hover:text-gray-300">↩ تعديل</button>
          </div>
          <div className="space-y-2">
            {preview.map((r, i) => (
              <div key={i} className="glass rounded-xl p-3 border border-white/5 text-xs space-y-1">
                <div className="font-semibold text-white">{r.name || '—'}</div>
                <div className="text-gray-400 flex flex-wrap gap-2">
                  {r.spec && <span>🎓 {r.spec}</span>}
                  {r.city && <span>📍 {r.city}</span>}
                  {r.phone && <span>📱 {r.phone}</span>}
                  {r.exp && <span>⏱ {r.exp} سنة</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300">
            سيتم استيراد <strong>{data.filter(r => buildRecord(r).name).length}</strong> سجل إلى قاعدة البيانات
          </div>
          <button onClick={doImport} className="btn-primary w-full py-3 rounded-xl text-sm text-white font-bold">
            ✅ استيراد {data.length} مترشح
          </button>
        </div>
      )}

      {/* الخطوة 4 — نجاح */}
      {step === 4 && (
        <div className="text-center py-8 space-y-3">
          <div className="text-5xl">🎉</div>
          <div className="text-lg font-bold text-white">تم الاستيراد بنجاح!</div>
          <div className="text-sm text-emerald-400">تمت إضافة {imported} مترشح إلى قاعدة البيانات</div>
          <button onClick={() => { setStep(1); setData([]); setHeaders([]); setMapping({}) }}
            className="btn-primary px-6 py-2.5 rounded-xl text-sm text-white">
            استيراد ملف آخر
          </button>
        </div>
      )}
    </div>
  )
}

// ===== استيراد مجلد PDF/Word =====
function ImportFolder({ onImport }) {
  const [files, setFiles]     = useState([])
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState([])
  const [done, setDone]       = useState(false)
  const folderRef = useRef()

  const handleFolder = (e) => {
    const fs = Array.from(e.target.files).filter(f =>
      f.name.match(/\.(pdf|doc|docx|txt)$/i)
    )
    setFiles(fs)
    setResults([])
    setDone(false)
  }

  const analyzeAll = async () => {
    setProcessing(true)
    const key = (import.meta.env.VITE_ANTHROPIC_API_KEY||'').trim()
    const analyzed = []

    for (const file of files) {
      try {
        const text = await file.text()
        if (!key || key === 'your_anthropic_key_here') {
          analyzed.push({
            name: file.name.replace(/\.[^.]+$/,'').replace(/[-_]/g,' '),
            spec: 'غير محدد', age: 0, exp: 0,
            city: 'تونس العاصمة', phone: '', skills: '',
            notes: '', source: 'local', file_name: file.name,
            _file: file
          })
        } else {
          const res = await fetch('https://api.anthropic.com/v1/messages', {
            method:'POST',
            headers:{ 'Content-Type':'application/json', 'x-api-key':key, 'anthropic-version':'2023-06-01' },
            body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:600,
              messages:[{ role:'user', content:`استخرج بيانات هذه السيرة وأجب بـ JSON فقط بدون أي نص آخر:
{"name":"الاسم","spec":"التخصص","age":رقم_أو_0,"exp":سنوات_أو_0,"city":"المدينة","phone":"الهاتف_أو_فارغ","skills":"مهارات"}
النص:\n${text.slice(0,2000)}` }]
            })
          })
          const data = await res.json()
          const raw = data.content?.map(b=>b.text||'').join('') || '{}'
          const parsed = JSON.parse(raw.replace(/```json|```/g,'').trim())
          analyzed.push({ ...parsed, source:'local', notes:'', file_name:file.name, _file:file })
        }
      } catch {
        analyzed.push({
          name: file.name.replace(/\.[^.]+$/,'').replace(/[-_]/g,' '),
          spec:'غير محدد', age:0, exp:0, city:'تونس العاصمة',
          phone:'', skills:'', notes:'', source:'local', file_name:file.name, _file:file
        })
      }
    }

    setResults(analyzed)
    setProcessing(false)
  }

  const doImport = () => {
    onImport(results.map(r => {
      const { _file, ...rest } = r
      return rest
    }))
    setDone(true)
  }

  return (
    <div className="space-y-4">
      {!done ? (
        <>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300 space-y-1">
            <div className="font-semibold">📁 كيف يعمل؟</div>
            <div>1. اختر مجلداً يحتوي على ملفات PDF أو Word للسير الذاتية</div>
            <div>2. سيحلّل الذكاء الاصطناعي كل ملف تلقائياً</div>
            <div>3. تُضاف جميع البيانات دفعة واحدة لقاعدة البيانات</div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => folderRef.current.click()}
              className="flex-1 glass rounded-2xl border border-white/10 hover:border-white/25 p-8 text-center cursor-pointer transition-all hover:bg-white/[0.02]">
              <div className="text-4xl mb-2">📂</div>
              <div className="text-sm font-semibold text-gray-200">اختر مجلداً</div>
              <div className="text-xs text-gray-500 mt-1">PDF, Word, TXT</div>
            </button>
            <input ref={folderRef} type="file" className="hidden"
              multiple accept=".pdf,.doc,.docx,.txt"
              onChange={handleFolder} />
          </div>

          {files.length > 0 && !processing && results.length === 0 && (
            <div className="space-y-3">
              <div className="text-sm font-semibold text-gray-200">
                وجدنا {files.length} ملف سيرة ذاتية:
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {files.map((f,i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-400 glass rounded-lg px-3 py-2 border border-white/5">
                    <span>📄</span>
                    <span className="flex-1 truncate">{f.name}</span>
                    <span className="text-gray-600">{(f.size/1024).toFixed(0)} KB</span>
                  </div>
                ))}
              </div>
              <button onClick={analyzeAll}
                className="btn-primary w-full py-3 rounded-xl text-sm text-white font-bold flex items-center justify-center gap-2">
                🤖 تحليل {files.length} ملف بالذكاء الاصطناعي
              </button>
            </div>
          )}

          {processing && (
            <div className="text-center py-8 space-y-3">
              <div className="text-4xl animate-pulse">🤖</div>
              <div className="text-sm font-medium text-blue-300">يحلّل الذكاء الاصطناعي الملفات...</div>
              <div className="text-xs text-gray-500">قد يستغرق بضع دقائق حسب عدد الملفات</div>
              <div className="flex justify-center gap-1">
                {[0,1,2].map(i=><div key={i} className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay:`${i*150}ms`}}></div>)}
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-semibold text-gray-200">نتائج التحليل ({results.length} سيرة):</div>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {results.map((r,i) => (
                  <div key={i} className="glass rounded-xl p-3 border border-white/5 text-xs">
                    <div className="font-semibold text-white">{r.name}</div>
                    <div className="text-gray-400 flex flex-wrap gap-2 mt-1">
                      {r.spec && <span>🎓 {r.spec}</span>}
                      {r.city && <span>📍 {r.city}</span>}
                      {r.phone && <span>📱 {r.phone}</span>}
                      <span className="text-gray-600">📄 {r.file_name}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={doImport}
                className="btn-primary w-full py-3 rounded-xl text-sm text-white font-bold">
                ✅ إضافة {results.length} مترشح لقاعدة البيانات
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 space-y-3">
          <div className="text-5xl">🎉</div>
          <div className="text-lg font-bold text-white">تم الاستيراد بنجاح!</div>
          <div className="text-sm text-emerald-400">تمت إضافة {results.length} مترشح من الملفات</div>
          <button onClick={() => { setFiles([]); setResults([]); setDone(false) }}
            className="btn-primary px-6 py-2.5 rounded-xl text-sm text-white">
            استيراد مجلد آخر
          </button>
        </div>
      )}
    </div>
  )
}

// ===== واتساب Web =====
function WhatsAppWebSection() {
  const [phone, setPhone]   = useState('')
  const [msg, setMsg]       = useState('')
  const [bulk, setBulk]     = useState(false)
  const [phones, setPhones] = useState('')

  const cleanNum = (p) => {
    const c = p.replace(/[\s\-\(\)\+]/g,'')
    return c.startsWith('216') ? c : '216' + c
  }

  const sendSingle = () => {
    if (!phone) return
    const url = `https://wa.me/${cleanNum(phone)}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`
    window.open(url, '_blank')
  }

  const sendBulk = () => {
    const nums = phones.split('\n').map(p=>p.trim()).filter(Boolean)
    if (!nums.length) return
    // فتح أول رقم مباشرة
    nums.forEach((p, i) => {
      setTimeout(() => {
        const url = `https://wa.me/${cleanNum(p)}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`
        window.open(url, '_blank')
      }, i * 2000) // تأخير 2 ثانية بين كل رسالة
    })
  }

  const MSG_TEMPLATES = [
    { label:'ترحيب',    text:'السلام عليكم،\n\nشكراً على تسجيلكم في بيرق العرب للتوظيف بالخارج. سنتواصل معكم قريباً.\n\nبيرق العرب' },
    { label:'مقابلة',   text:'السيد/السيدة،\n\nندعوكم لمقابلة عمل. يرجى التواصل معنا لتأكيد الموعد.\n\nبيرق العرب' },
    { label:'مستندات', text:'السيد/السيدة،\n\nيرجى تجهيز المستندات المطلوبة وإرسالها في أقرب وقت.\n\nبيرق العرب' },
    { label:'متابعة',  text:'السيد/السيدة،\n\nنتابع معكم بخصوص ملف التوظيف. هل لديكم استفسار؟\n\nبيرق العرب' },
  ]

  return (
    <div className="space-y-5">
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-xs text-green-300 space-y-2">
        <div className="font-semibold text-sm flex items-center gap-2">
          <span className="text-xl">💬</span> واتساب Web
        </div>
        <div>• يفتح محادثة واتساب مباشرة في المتصفح</div>
        <div>• يعمل مع رقمك الشخصي أو رقم الشركة</div>
        <div>• لا يحتاج تطبيق — يعمل من المتصفح مباشرة</div>
      </div>

      {/* إرسال فردي / جماعي */}
      <div className="flex gap-2">
        <button onClick={()=>setBulk(false)}
          className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all
            ${!bulk?'btn-primary text-white border-transparent':'border-white/10 text-gray-400 hover:bg-white/5'}`}>
          👤 رسالة فردية
        </button>
        <button onClick={()=>setBulk(true)}
          className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all
            ${bulk?'btn-primary text-white border-transparent':'border-white/10 text-gray-400 hover:bg-white/5'}`}>
          👥 إرسال جماعي
        </button>
      </div>

      {/* الأرقام */}
      {!bulk ? (
        <div>
          <label className="text-xs text-gray-500 block mb-1.5">📱 رقم الهاتف</label>
          <input value={phone} onChange={e=>setPhone(e.target.value)}
            placeholder="21612345678 أو 0021612345678"
            className="input-dark w-full px-4 py-2.5 rounded-xl text-sm font-mono" />
        </div>
      ) : (
        <div>
          <label className="text-xs text-gray-500 block mb-1.5">📱 الأرقام (رقم في كل سطر)</label>
          <textarea value={phones} onChange={e=>setPhones(e.target.value)}
            rows={4} placeholder={'21612345678\n21698765432\n21655443322'}
            className="input-dark w-full px-4 py-2.5 rounded-xl text-sm font-mono resize-none" />
          <div className="text-xs text-gray-600 mt-1">{phones.split('\n').filter(p=>p.trim()).length} رقم</div>
        </div>
      )}

      {/* قوالب الرسائل */}
      <div>
        <label className="text-xs text-gray-500 block mb-2">قالب الرسالة</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {MSG_TEMPLATES.map(t => (
            <button key={t.label} onClick={() => setMsg(t.text)}
              className="text-xs px-3 py-1.5 border border-white/10 rounded-lg text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-all">
              {t.label}
            </button>
          ))}
        </div>
        <textarea value={msg} onChange={e=>setMsg(e.target.value)}
          rows={4} placeholder="اكتب رسالتك أو اختر قالباً..."
          className="input-dark w-full px-4 py-2.5 rounded-xl text-sm resize-none leading-relaxed" />
      </div>

      <button onClick={bulk ? sendBulk : sendSingle}
        disabled={bulk ? !phones.trim() : !phone.trim()}
        className="w-full py-3.5 rounded-xl text-sm font-bold text-white disabled:opacity-40 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
        style={{background:'linear-gradient(135deg,#25d366,#128c7e)'}}>
        💬 {bulk ? `إرسال لـ ${phones.split('\n').filter(p=>p.trim()).length} رقم` : 'فتح واتساب وإرسال'}
      </button>

      {bulk && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-300">
          ⚠️ الإرسال الجماعي يفتح نافذة واتساب لكل رقم بتأخير 2 ثانية — تأكد من السماح بالنوافذ المنبثقة في المتصفح
        </div>
      )}
    </div>
  )
}

// ===== الصفحة الرئيسية =====
export default function ImportPage({ onAddCVs }) {
  const [tab, setTab] = useState('excel')
  const [totalImported, setTotalImported] = useState(0)

  const handleImport = (records) => {
    onAddCVs(records)
    setTotalImported(p => p + records.length)
  }

  const TABS = [
    { key:'excel',  label:'📊 استيراد Excel/CSV' },
    { key:'folder', label:'📂 رفع مجلد PDF/Word' },
    { key:'wa',     label:'💬 واتساب Web' },
  ]

  return (
    <div className="animate-fade-in space-y-5 max-w-2xl">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white mb-0.5">الاستيراد والتواصل 📥</h1>
          <p className="text-gray-400 text-sm">استيراد البيانات من الملفات + إرسال واتساب جماعي</p>
        </div>
        {totalImported > 0 && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-1.5 text-xs text-emerald-400">
            ✅ تم استيراد {totalImported} مترشح
          </div>
        )}
      </div>

      {/* التبويبات */}
      <div className="flex gap-1 border-b border-white/5">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px
              ${tab===t.key?'border-blue-400 text-white':'border-transparent text-gray-400 hover:text-gray-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'excel'  && <ImportExcel  onImport={handleImport} />}
      {tab === 'folder' && <ImportFolder onImport={handleImport} />}
      {tab === 'wa'     && <WhatsAppWebSection />}
    </div>
  )
}

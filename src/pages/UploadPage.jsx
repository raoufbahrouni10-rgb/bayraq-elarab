import { useState, useRef } from 'react'

const FIELDS = [
  { key:'name',   label:'الاسم الكامل' },
  { key:'spec',   label:'التخصص / المجال' },
  { key:'age',    label:'العمر' },
  { key:'exp',    label:'سنوات الخبرة' },
  { key:'city',   label:'المدينة' },
  { key:'skills', label:'المهارات الرئيسية', full:true },
  { key:'notes',  label:'ملاحظات إضافية',   full:true },
]

export default function UploadPage({ onSave }) {
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_ANTHROPIC_API_KEY || '')
  const [analysed, setAnalysed] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const fileRef = useRef()

  const processFile = async (file) => {
    setError(''); setAnalysed(null); setSaved(false)
    setFileName(file.name); setLoading(true)
    const text = await file.text()
    await analyzeWithAI(text, file.name)
  }

  const analyzeWithAI = async (text, filename) => {
    const key = apiKey.trim()
    if (!key || key === 'your_api_key_here') {
      setAnalysed({ name: filename.replace(/\.[^.]+$/,''), spec:'غير محدد', age:'—', exp:'0', city:'—', skills:'—', notes:'أضف مفتاح API للتحليل التلقائي' })
      setLoading(false); return
    }
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'x-api-key':key, 'anthropic-version':'2023-06-01' },
        body: JSON.stringify({
          model:'claude-sonnet-4-20250514', max_tokens:1000,
          messages:[{ role:'user', content:`أنت محلل سير ذاتية خبير. استخرج المعلومات التالية من النص بدقة. أجب بـ JSON فقط بدون أي نص آخر أو backticks:
{
  "name": "الاسم الكامل",
  "spec": "التخصص أو المجال المهني",
  "age": رقم العمر أو null,
  "exp": رقم سنوات الخبرة الإجمالية,
  "city": "المدينة أو المنطقة إن وجدت",
  "skills": "المهارات الرئيسية مفصولة بفاصلة",
  "notes": "ملاحظة مختصرة مفيدة عن المرشح"
}

النص:
${text.slice(0,3500)}` }]
        })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      const raw = data.content.map(b=>b.text||'').join('')
      const clean = raw.replace(/```json|```/g,'').trim()
      setAnalysed(JSON.parse(clean))
    } catch(err) {
      setError('خطأ في التحليل: ' + err.message)
      setAnalysed({ name:'—', spec:'—', age:'—', exp:'—', city:'—', skills:'—', notes:'—' })
    }
    setLoading(false)
  }

  const handleSave = () => {
    if (!analysed) return
    onSave({
      name: String(analysed.name||'—'),
      spec: String(analysed.spec||'—'),
      age:  parseInt(analysed.age)||0,
      exp:  parseInt(analysed.exp)||0,
      city: String(analysed.city||'—'),
      skills: String(analysed.skills||'—'),
      notes: String(analysed.notes||''),
      source: 'local',
    })
    setSaved(true); setAnalysed(null); setFileName('')
    if (fileRef.current) fileRef.current.value=''
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-white mb-1">رفع وتحليل سيرة ذاتية</h1>
        <p className="text-gray-400 text-sm">ارفع ملف السيرة الذاتية ليقوم الذكاء الاصطناعي باستخراج بياناتها تلقائياً</p>
      </div>

      {/* API Key */}
      <div className="glass rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <span>🔑</span>
          <span className="text-sm font-semibold text-gray-200">مفتاح Anthropic API</span>
        </div>
        <input type="password" placeholder="sk-ant-..." value={apiKey} onChange={e=>setApiKey(e.target.value)}
          className="input-dark w-full px-4 py-2.5 rounded-xl text-sm font-mono" />
        <p className="text-xs text-gray-500">
          احصل على مفتاحك من{' '}
          <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
            console.anthropic.com
          </a>
          {' '}أو ضعه في ملف <code className="text-amber-400">.env</code>
        </p>
      </div>

      {/* Drop zone */}
      <div onClick={() => fileRef.current.click()}
        onDragOver={e=>{e.preventDefault();setDragOver(true)}}
        onDragLeave={()=>setDragOver(false)}
        onDrop={e=>{e.preventDefault();setDragOver(false);const f=e.dataTransfer.files[0];if(f)processFile(f)}}
        className={`rounded-2xl border-2 border-dashed p-14 text-center cursor-pointer transition-all
          ${dragOver ? 'border-blue-400 bg-blue-500/10' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'}`}>
        <div className="text-5xl mb-4">{fileName ? '📄' : '⬆️'}</div>
        <div className="font-semibold text-gray-200 mb-1">{fileName || 'اسحب ملف السيرة الذاتية هنا'}</div>
        <div className="text-sm text-gray-500">{fileName ? 'اضغط لاختيار ملف آخر' : 'أو اضغط للاختيار — PDF أو Word أو نص'}</div>
        <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.txt"
          onChange={e=>{const f=e.target.files[0];if(f)processFile(f)}} />
      </div>

      {/* Loading */}
      {loading && (
        <div className="glass rounded-2xl p-6 text-center space-y-3">
          <div className="text-4xl animate-pulse-slow">🤖</div>
          <div className="text-sm font-medium text-blue-300">الذكاء الاصطناعي يحلّل السيرة الذاتية...</div>
          <div className="flex justify-center gap-1">
            {[0,1,2].map(i=><div key={i} className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay:`${i*150}ms`}}></div>)}
          </div>
        </div>
      )}

      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400">{error}</div>}

      {/* Results */}
      {analysed && !loading && (
        <div className="glass rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="bg-blue-500/20 text-blue-300 text-xs px-2.5 py-0.5 rounded-full border border-blue-500/30">AI</span>
            <span className="font-semibold text-white text-sm">نتائج التحليل</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {FIELDS.map(f => (
              <div key={f.key} className={`bg-white/[0.03] rounded-xl p-3 border border-white/5 ${f.full?'col-span-2':''}`}>
                <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{f.label}</div>
                <div className="text-sm font-medium text-gray-100">{String(analysed[f.key]??'—')}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={()=>setAnalysed(null)}
              className="px-4 py-2 text-sm text-gray-400 border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
              إلغاء
            </button>
            <button onClick={handleSave}
              className="btn-primary px-5 py-2 text-sm text-white rounded-xl flex items-center gap-2">
              💾 حفظ في قاعدة البيانات
            </button>
          </div>
        </div>
      )}

      {saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-sm text-emerald-400 flex items-center gap-2">
          ✅ تم حفظ السيرة الذاتية بنجاح!
        </div>
      )}
    </div>
  )
}

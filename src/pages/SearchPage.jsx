import { useState } from 'react'

const SOURCES = [
  { key:'all',      label:'كل المصادر',   icon:'🌐', desc:'ANETI + LinkedIn + مواقع' },
  { key:'aneti',    label:'ANETI',         icon:'🏛️', desc:'وكالة التشغيل الرسمية' },
  { key:'linkedin', label:'LinkedIn',      icon:'💼', desc:'محترفون يبحثون عن عمل' },
  { key:'web',      label:'مواقع تونسية', icon:'🇹🇳', desc:'keejob, tunisietravail...' },
]

const SPEC_SUGGESTIONS = [
  'مدرب', 'ممرضة', 'طبيب أسنان', 'مهندس برمجيات', 'محاسب', 'معلم',
  'كاهية تمريض', 'مهندس مدني', 'صيدلاني', 'مساعد طبيب', 'مدير مشاريع',
  'مصمم جرافيك', 'محامي', 'أخصائي تغذية', 'مترجم', 'سائق',
]

const CITIES = [
  'تونس العاصمة', 'صفاقس', 'سوسة', 'بنزرت', 'القيروان',
  'قابس', 'مدنين', 'أريانة', 'بن عروس', 'منوبة',
  'نابل', 'زغوان', 'سيدي بوزيد', 'قفصة', 'توزر', 'قبلي',
  'الكاف', 'سليانة', 'جندوبة', 'باجة', 'المهدية', 'المنستير',
]

const SOURCE_STYLE = {
  aneti:    'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  linkedin: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
  web:      'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  local:    'bg-blue-500/20 text-blue-300 border border-blue-500/30',
}

function initials(name) {
  return (name||'؟').split(' ').slice(0,2).map(w=>w[0]||'؟').join('')
}

export default function SearchPage({ onAddToDb }) {
  const [apiKey, setApiKey]   = useState(import.meta.env.VITE_ANTHROPIC_API_KEY || '')
  const [query, setQuery]     = useState('')
  const [city, setCity]       = useState('')
  const [source, setSource]   = useState('all')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [addedIds, setAddedIds] = useState(new Set())
  const [error, setError]     = useState('')
  const [backendOk, setBackendOk] = useState(null)
  const [searchLog, setSearchLog] = useState('')

  const checkBackend = async () => {
    try {
      const r = await fetch('http://localhost:3001/api/health')
      const d = await r.json()
      setBackendOk(d.status === 'ok')
    } catch { setBackendOk(false) }
  }

  const handleSearch = async (q = query) => {
    if (!q.trim()) return
    if (q !== query) setQuery(q)
    setLoading(true); setSearched(true); setResults([]); setError('')
    setSearchLog('جارٍ الاتصال بالخادم...')

    try {
      setSearchLog(`يبحث Claude عن "${q}" في تونس...`)
      const res = await fetch('http://localhost:3001/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, city, source, apiKey: apiKey.trim() }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'خطأ في الخادم') }
      setSearchLog('جارٍ تحليل نتائج الويب...')
      const data = await res.json()
      setResults(data.results || [])
      setBackendOk(true)
    } catch (err) {
      if (err.message.includes('fetch') || err.message.includes('Failed') || err.message.includes('Network')) {
        setBackendOk(false)
        setError('الخادم غير متصل — شغّل bayraq-backend أولاً')
      } else {
        setError('خطأ: ' + err.message)
      }
    }
    setSearchLog(''); setLoading(false)
  }

  const addToDb = (r, idx) => {
    onAddToDb({ name:r.name, spec:r.spec, age:r.age||0, exp:r.exp||0, city:r.city, skills:r.skills, notes:r.notes, source:r.source })
    setAddedIds(prev => new Set([...prev, idx]))
  }

  const addAll = () => {
    results.forEach((r, i) => { if (!addedIds.has(i)) addToDb(r, i) })
  }

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white mb-1">البحث عن الباحثين عن شغل 🔍</h1>
        <p className="text-gray-400 text-sm">ابحث عن باحثين عن عمل حسب الاختصاص من ANETI وLinkedIn والمواقع التونسية</p>
      </div>

      {/* Backend status */}
      <div className="glass rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${backendOk===true?'bg-emerald-400 animate-pulse':backendOk===false?'bg-red-400':'bg-gray-500'}`}></div>
          <span className="text-sm text-gray-300">
            {backendOk===true ? '✅ الخادم متصل وجاهز' : backendOk===false ? '❌ الخادم غير متصل' : 'حالة الخادم غير معروفة'}
          </span>
        </div>
        <button onClick={checkBackend} className="text-xs px-3 py-1.5 border border-white/10 rounded-lg text-gray-400 hover:bg-white/5 transition-colors">
          فحص الاتصال
        </button>
      </div>

      {/* تعليمات Backend */}
      {backendOk === false && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 space-y-3">
          <div className="text-amber-300 font-semibold text-sm">⚠️ افتح PowerShell جديد وشغّل:</div>
          {['cd bayraq-backend', 'npm install', 'node server.js'].map((cmd,i)=>(
            <div key={i} className="bg-black/30 rounded-lg px-4 py-2.5 font-mono text-sm text-emerald-300 flex items-center gap-3">
              <span className="text-gray-600 text-xs">{i+1}</span>
              <span>{cmd}</span>
            </div>
          ))}
          <p className="text-xs text-amber-200/50">ثم اضغط "فحص الاتصال" أعلاه وحاول البحث مجدداً</p>
        </div>
      )}

      {/* API Key */}
      <div className="glass rounded-2xl p-4">
        <label className="text-xs text-gray-500 block mb-1.5">🔑 مفتاح Anthropic API</label>
        <input type="password" placeholder="sk-ant-..." value={apiKey} onChange={e=>setApiKey(e.target.value)}
          className="input-dark w-full px-4 py-2.5 rounded-xl text-sm font-mono" />
        <p className="text-xs text-gray-600 mt-1.5">من <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">console.anthropic.com</a></p>
      </div>

      {/* Search form */}
      <div className="glass rounded-2xl p-5 space-y-4">

        {/* اقتراحات التخصصات */}
        <div>
          <label className="text-xs text-gray-500 block mb-2">تخصصات شائعة — اضغط للاختيار السريع:</label>
          <div className="flex flex-wrap gap-2">
            {SPEC_SUGGESTIONS.map(s => (
              <button key={s} onClick={() => setQuery(s)}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all
                  ${query===s ? 'btn-primary text-white border-transparent' : 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* حقل الاختصاص */}
        <div>
          <label className="text-xs text-gray-500 block mb-1.5">الاختصاص المطلوب *</label>
          <input value={query} onChange={e=>setQuery(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&handleSearch()}
            placeholder="مثال: مدرب، ممرضة، طبيب أسنان، محاسب..."
            className="input-dark w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-500" />
        </div>

        {/* المدينة */}
        <div>
          <label className="text-xs text-gray-500 block mb-1.5">الولاية / المدينة (اختياري)</label>
          <select value={city} onChange={e=>setCity(e.target.value)}
            className="input-dark w-full px-4 py-2.5 rounded-xl text-sm">
            <option value="">كل تونس</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* المصدر */}
        <div>
          <label className="text-xs text-gray-500 block mb-2">مصدر البحث</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {SOURCES.map(s => (
              <button key={s.key} onClick={()=>setSource(s.key)}
                className={`p-3 rounded-xl border text-right transition-all
                  ${source===s.key
                    ? 'border-blue-500/50 bg-blue-500/10 text-white'
                    : 'border-white/8 text-gray-400 hover:bg-white/5'}`}>
                <div className="text-lg mb-1">{s.icon}</div>
                <div className="text-xs font-medium">{s.label}</div>
                <div className="text-xs text-gray-500 mt-0.5 leading-tight">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => handleSearch()} disabled={!query.trim() || loading}
          className="btn-primary w-full py-3.5 rounded-xl font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
          {loading
            ? <><span className="animate-spin inline-block text-base">⟳</span> {searchLog}</>
            : <><span>🔍</span> بحث عن باحثين عن شغل</>}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400 flex items-start gap-2">
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      {/* Skeleton loading */}
      {loading && (
        <div className="space-y-3">
          {[...Array(5)].map((_,i)=>(
            <div key={i} className="glass rounded-2xl p-4 flex gap-3" style={{animationDelay:`${i*80}ms`}}>
              <div className="skeleton w-12 h-12 rounded-xl flex-shrink-0"></div>
              <div className="flex-1 space-y-2 pt-1">
                <div className="skeleton h-4 w-2/3 rounded"></div>
                <div className="skeleton h-3 w-1/2 rounded"></div>
                <div className="flex gap-2 mt-2">
                  <div className="skeleton h-5 w-20 rounded-full"></div>
                  <div className="skeleton h-5 w-16 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && searched && results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-gray-200">
                {results.length} باحث عن شغل بتخصص "{query}"
                {city && ` في ${city}`}
              </h2>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                🌐 بحث حقيقي
              </span>
            </div>
            <button onClick={addAll}
              className="text-xs px-3 py-1.5 border border-blue-500/30 text-blue-400 rounded-xl hover:bg-blue-500/10 transition-colors">
              + إضافة الكل للقاعدة
            </button>
          </div>

          {results.map((r, i) => (
            <div key={i} className="search-result-card rounded-2xl p-4 flex items-start gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/25 flex items-center justify-center text-blue-300 font-bold text-sm flex-shrink-0">
                {initials(r.name)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{r.name}</span>
                      {r.profileUrl && (
                        <a href={r.profileUrl} target="_blank" rel="noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300">🔗</a>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {r.spec}
                      {r.city && <span className="text-gray-500"> • 📍 {r.city}</span>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.available?'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30':'bg-gray-500/10 text-gray-500 border border-gray-500/20'}`}>
                      {r.available ? '✓ متاح' : '○ غير متاح'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${SOURCE_STYLE[r.source]||SOURCE_STYLE.local}`}>
                      {r.platform}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {r.exp > 0 && <span className="tag-exp text-xs px-2.5 py-0.5 rounded-full">{r.exp} سنة خبرة</span>}
                  {r.age > 0 && <span className="tag-age text-xs px-2.5 py-0.5 rounded-full">{r.age} سنة</span>}
                  {r.registrationStatus && (
                    <span className="tag-src text-xs px-2.5 py-0.5 rounded-full">{r.registrationStatus}</span>
                  )}
                </div>

                {r.skills && <div className="text-xs text-gray-500 line-clamp-1">{r.skills}</div>}
                {r.notes && <div className="text-xs text-gray-600 italic">{r.notes}</div>}
              </div>

              {/* Add button */}
              <button onClick={() => addToDb(r, i)} disabled={addedIds.has(i)}
                className={`flex-shrink-0 text-xs px-3 py-2 rounded-xl transition-all font-medium min-w-[70px] text-center
                  ${addedIds.has(i)
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 cursor-default'
                    : 'btn-primary text-white'}`}>
                {addedIds.has(i) ? '✓ أضيف' : '+ إضافة'}
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && searched && results.length === 0 && !error && (
        <div className="text-center py-16 text-gray-500 space-y-3">
          <div className="text-5xl">🔍</div>
          <div className="font-medium text-gray-400">لا توجد نتائج لـ "{query}"</div>
          <div className="text-sm">جرّب تخصصاً آخر أو غيّر المنطقة</div>
        </div>
      )}
    </div>
  )
}

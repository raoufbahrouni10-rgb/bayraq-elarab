import { useState } from 'react'
import { waLink } from '../lib/whatsapp'

const KEY = 'bayraq_ratings'
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)||'{}') } catch { return {} } }
const save = (d) => { try { localStorage.setItem(KEY, JSON.stringify(d)) } catch {} }

export default function RatingsPage({ db, applications }) {
  const [ratings, setRatings] = useState(load)
  const [filter, setFilter]   = useState(0)
  const [search, setSearch]   = useState('')
  const [notes, setNotes]     = useState({})

  const setRating = (id, stars) => {
    const updated = { ...ratings, [id]: { ...ratings[id], stars, date: new Date().toISOString().split('T')[0] } }
    setRatings(updated); save(updated)
  }

  const setNote = (id, note) => {
    const updated = { ...ratings, [id]: { ...ratings[id], note } }
    setRatings(updated); save(updated)
  }

  const Stars = ({ id, value }) => (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(s => (
        <button key={s} onClick={() => setRating(id, s)}
          className="text-xl transition-transform hover:scale-110">
          <span style={{color: s <= (value||0) ? '#C9A227' : 'rgba(255,255,255,0.15)'}}>★</span>
        </button>
      ))}
    </div>
  )

  const filtered = db.filter(c => {
    if (filter > 0 && (ratings[c.id]?.stars||0) !== filter) return false
    if (search && !c.name?.includes(search) && !c.spec?.includes(search)) return false
    return true
  })

  const avgRating = db.filter(c => ratings[c.id]?.stars).length > 0
    ? (db.reduce((s,c) => s + (ratings[c.id]?.stars||0), 0) / db.filter(c => ratings[c.id]?.stars).length).toFixed(1)
    : 0

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white mb-0.5">⭐ تقييم المترشحين</h1>
          <p className="text-gray-400 text-sm">
            {db.filter(c=>ratings[c.id]?.stars).length} مقيّم •
            متوسط التقييم: <span style={{color:'#C9A227'}}>{avgRating} ⭐</span>
          </p>
        </div>
      </div>

      {/* فلاتر النجوم */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter(0)}
          className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${filter===0?'btn-primary text-white border-transparent':'border-white/10 text-gray-400 hover:bg-white/5'}`}>
          الكل ({db.length})
        </button>
        {[5,4,3,2,1].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${filter===s?'btn-primary text-white border-transparent':'border-white/10 text-gray-400 hover:bg-white/5'}`}>
            {'★'.repeat(s)} ({db.filter(c=>(ratings[c.id]?.stars||0)===s).length})
          </button>
        ))}
      </div>

      <div className="relative">
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="ابحث..." className="input-dark w-full pr-9 pl-4 py-2.5 rounded-xl text-sm" />
      </div>

      <div className="space-y-3">
        {filtered.map(cv => {
          const r = ratings[cv.id] || {}
          const app = applications.find(a => a.candidateName === cv.name)
          return (
            <div key={cv.id} className="glass rounded-2xl p-4 border border-white/5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300 font-bold text-sm flex-shrink-0">
                  {cv.name?.split(' ').slice(0,2).map(w=>w[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white text-sm">{cv.name}</span>
                    {app && <span className="text-xs text-gray-500">{app.jobTitle} • {app.country}</span>}
                  </div>
                  <div className="text-xs text-gray-400">{cv.spec} • {cv.city}</div>
                </div>
                {cv.phone && (
                  <a href={waLink(cv.phone)} target="_blank" rel="noreferrer"
                    className="text-xs px-2.5 py-1.5 rounded-lg text-white flex-shrink-0"
                    style={{background:'linear-gradient(135deg,#25d366,#128c7e)'}}>💬</a>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Stars id={cv.id} value={r.stars} />
                {r.stars > 0 && (
                  <span className="text-xs text-gray-500">
                    {r.stars === 5 ? 'ممتاز' : r.stars === 4 ? 'جيد جداً' : r.stars === 3 ? 'جيد' : r.stars === 2 ? 'مقبول' : 'ضعيف'}
                  </span>
                )}
              </div>

              <input
                value={r.note || ''}
                onChange={e => setNote(cv.id, e.target.value)}
                placeholder="ملاحظة التقييم..."
                className="input-dark w-full px-3 py-2 rounded-xl text-xs"
              />
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <div className="text-4xl mb-3">⭐</div>
            <div>لا توجد نتائج</div>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { waLink, candidateMsg } from '../lib/whatsapp'

export default function SmartMatchPage({ db, jobs, applications, onAddApplication }) {
  const [selectedJob, setSelectedJob]   = useState(null)
  const [matches, setMatches]           = useState([])
  const [minScore, setMinScore]         = useState(50)
  const [adding, setAdding]             = useState(null)

  const calcScore = (candidate, job) => {
    let score = 0
    // تطابق التخصص
    if (job.spec && candidate.spec) {
      const jSpec = job.spec.toLowerCase()
      const cSpec = candidate.spec.toLowerCase()
      if (cSpec.includes(jSpec) || jSpec.includes(cSpec)) score += 40
      else if (cSpec.split('').some(c => jSpec.includes(c))) score += 15
    }
    // الخبرة
    if (job.exp_min !== undefined && candidate.exp >= (job.exp_min||0)) score += 20
    if (job.exp_max !== undefined && candidate.exp <= (job.exp_max||99)) score += 10
    // العمر
    if (job.age_min !== undefined && candidate.age >= (job.age_min||18)) score += 10
    if (job.age_max !== undefined && candidate.age <= (job.age_max||60)) score += 10
    // المهارات
    if (job.skills && candidate.skills) {
      const jSkills = job.skills.toLowerCase().split(/[,،\s]+/)
      const cSkills = candidate.skills.toLowerCase()
      const matched = jSkills.filter(s => s && cSkills.includes(s)).length
      score += Math.min(matched * 5, 20)
    }
    // لم يتقدم من قبل
    const alreadyApplied = applications.some(a =>
      a.candidateName === candidate.name && a.jobTitle === job.title
    )
    if (alreadyApplied) score -= 30
    return Math.min(Math.max(score, 0), 100)
  }

  const findMatches = (job) => {
    setSelectedJob(job)
    const scored = db.map(c => ({
      ...c,
      score: calcScore(c, job),
      alreadyApplied: applications.some(a => a.candidateName===c.name && a.jobTitle===job.title)
    })).sort((a,b)=>b.score-a.score)
    setMatches(scored)
  }

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-emerald-400'
    if (score >= 50) return 'text-amber-400'
    return 'text-red-400'
  }

  const getScoreBg = (score) => {
    if (score >= 70) return 'bg-emerald-500/20 border-emerald-500/30'
    if (score >= 50) return 'bg-amber-500/20 border-amber-500/30'
    return 'bg-red-500/20 border-red-500/30'
  }

  const handleAdd = (candidate, job) => {
    onAddApplication({
      candidateName: candidate.name,
      jobTitle: job.title,
      company: job.employer || '',
      country: job.city || '',
    })
    setAdding(candidate.id)
    setTimeout(() => setAdding(null), 2000)
    setMatches(p => p.map(m => m.id===candidate.id ? {...m, alreadyApplied:true} : m))
  }

  const filtered = matches.filter(m => m.score >= minScore)

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white mb-0.5">المطابقة الذكية 🎯</h1>
        <p className="text-gray-400 text-sm">ربط المترشحين بعروض الشغل تلقائياً حسب التخصص والخبرة</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* قائمة عروض الشغل */}
        <div className="space-y-2">
          <div className="text-xs text-gray-500 font-medium px-1">عروض الشغل ({jobs.length})</div>
          <div className="space-y-1.5 max-h-[calc(100vh-250px)] overflow-y-auto">
            {jobs.length === 0 ? (
              <div className="text-center py-8 text-gray-600 text-sm">لا توجد عروض</div>
            ) : jobs.map(j => (
              <button key={j.id} onClick={() => findMatches(j)}
                className={`w-full text-right p-3 rounded-xl border transition-all
                  ${selectedJob?.id===j.id?'border-blue-500/40 bg-blue-500/10':'glass border-white/5 hover:bg-white/5'}`}>
                <div className={`text-sm font-medium ${selectedJob?.id===j.id?'text-blue-300':'text-gray-200'}`}>
                  {j.title}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{j.spec} • {j.city}</div>
                {j.salary && <div className="text-xs text-emerald-400 mt-0.5">{j.salary}</div>}
              </button>
            ))}
          </div>
        </div>

        {/* نتائج المطابقة */}
        <div className="md:col-span-2 space-y-4">
          {!selectedJob ? (
            <div className="text-center py-16 text-gray-500 space-y-3">
              <div className="text-5xl">🎯</div>
              <div>اختر عرض شغل لعرض المترشحين المناسبين</div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="text-sm font-bold text-white">{selectedJob.title}</div>
                  <div className="text-xs text-gray-400">{filtered.length} مترشح مناسب من {db.length}</div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500">حد أدنى:</label>
                  <select value={minScore} onChange={e=>setMinScore(+e.target.value)}
                    className="input-dark px-2 py-1.5 rounded-lg text-xs">
                    {[30,40,50,60,70,80].map(v=><option key={v} value={v}>{v}%</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">لا يوجد مترشحون بهذا الحد</div>
                ) : filtered.map(c => (
                  <div key={c.id}
                    className={`glass rounded-xl p-3 border transition-all ${c.alreadyApplied?'border-emerald-500/20 opacity-70':'border-white/5'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center flex-shrink-0 ${getScoreBg(c.score)}`}>
                        <span className={`text-sm font-black ${getScoreColor(c.score)}`}>{c.score}%</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white text-sm">{c.name}</span>
                          {c.alreadyApplied && (
                            <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                              ✓ مضاف
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {c.spec} • {c.exp} سنة خبرة • {c.city}
                        </div>
                        {c.skills && <div className="text-xs text-gray-600 mt-0.5 truncate">{c.skills}</div>}
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        {c.phone && (
                          <a href={waLink(c.phone, candidateMsg(c,'interview'))} target="_blank" rel="noreferrer"
                            className="text-xs px-2.5 py-1.5 rounded-lg text-white"
                            style={{background:'linear-gradient(135deg,#25d366,#128c7e)'}}>
                            💬
                          </a>
                        )}
                        {!c.alreadyApplied && (
                          <button onClick={()=>handleAdd(c, selectedJob)}
                            className={`text-xs px-2.5 py-1.5 rounded-lg text-white transition-all
                              ${adding===c.id?'bg-emerald-500':'btn-primary'}`}>
                            {adding===c.id?'✓':'إضافة'}
                          </button>
                        )}
                      </div>
                    </div>
                    {/* شريط النسبة */}
                    <div className="mt-2 h-1 rounded-full bg-white/5">
                      <div className={`h-full rounded-full transition-all ${c.score>=70?'bg-emerald-500':c.score>=50?'bg-amber-500':'bg-red-500'}`}
                        style={{width:`${c.score}%`}}></div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

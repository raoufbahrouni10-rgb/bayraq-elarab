import { useState } from 'react'
import { waLink, openWhatsApp, employerMsg } from '../lib/whatsapp'

const SECTORS = ['صحة','تعليم','تكنولوجيا','بناء وهندسة','تجارة','صناعة','سياحة وفندقة','نقل ولوجستيك','خدمات','زراعة','إدارة عامة','أخرى']
const JOB_TYPES = ['دوام كامل','دوام جزئي','عمل عن بعد','عقد محدد المدة','تربص','مناولة']
const CITIES = ['تونس العاصمة','صفاقس','سوسة','بنزرت','القيروان','قابس','مدنين','أريانة','بن عروس','منوبة','نابل','المنستير','المهدية','سيدي بوزيد','قفصة','توزر','قبلي','الكاف','سليانة','جندوبة','باجة','زغوان']

const SECTOR_ICON = { صحة:'🏥', تعليم:'🎓', تكنولوجيا:'💻', 'بناء وهندسة':'🏗️', تجارة:'🛍️', صناعة:'🏭', 'سياحة وفندقة':'🏨', 'نقل ولوجستيك':'🚛', خدمات:'⚙️', زراعة:'🌱', 'إدارة عامة':'🏛️', أخرى:'📋' }

function MatchScore({ score }) {
  const color = score >= 80 ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
    : score >= 60 ? 'text-amber-400 bg-amber-500/15 border-amber-500/30'
    : 'text-gray-400 bg-gray-500/15 border-gray-500/30'
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${color}`}>
      {score}% تطابق
    </span>
  )
}

export default function EmployersPage({ employers, jobs, db, apiKey: savedKey, onAddEmployer, onDeleteEmployer, onAddJob, onUpdateJob, onDeleteJob, getEmployer }) {
  const [view, setView] = useState('jobs') // jobs | employers | add-employer | add-job | job-detail
  const [selectedJob, setSelectedJob] = useState(null)
  const [selectedEmployer, setSelectedEmployer] = useState(null)
  const [matching, setMatching] = useState(false)
  const [matchResults, setMatchResults] = useState([])
  const [apiKey, setApiKey] = useState(savedKey || import.meta.env.VITE_ANTHROPIC_API_KEY || '')
  const [filterSector, setFilterSector] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterType, setFilterType] = useState('')

  // نموذج مشغّل جديد
  const [empForm, setEmpForm] = useState({ name:'', sector:'صحة', city:'تونس العاصمة', contact:'', phone:'', size:'صغيرة', notes:'' })
  // نموذج عرض شغل جديد
  const [jobForm, setJobForm] = useState({ employerId:'', title:'', spec:'', city:'تونس العاصمة', type:'دوام كامل', salary:'', expMin:0, expMax:20, ageMin:18, ageMax:55, skills:'', description:'', requirements:'', deadline:'', active:true })

  // ======= مطابقة الذكاء الاصطناعي =======
  const matchCandidates = async (job) => {
    setSelectedJob(job)
    setView('job-detail')
    setMatching(true)
    setMatchResults([])

    const key = apiKey.trim()
    if (!key || key === 'your_api_key_here') {
      // مطابقة محلية بدون AI
      const local = localMatch(job)
      setMatchResults(local)
      setMatching(false)
      return
    }

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: `أنت خبير توظيف. لديك عرض شغل وقائمة مرشحين. قيّم كل مرشح وأعطه نسبة تطابق.

عرض الشغل:
- المنصب: ${job.title}
- التخصص: ${job.spec}
- المدينة: ${job.city}
- الخبرة المطلوبة: ${job.expMin}-${job.expMax} سنة
- العمر: ${job.ageMin}-${job.ageMax} سنة
- المهارات: ${job.skills}
- الشروط: ${job.requirements}

المرشحون:
${db.slice(0,20).map((c,i) => `${i+1}. ${c.name} | ${c.spec} | ${c.age} سنة | ${c.exp} سنة خبرة | ${c.city||'غير محدد'} | مهارات: ${c.skills}`).join('\n')}

أجب بـ JSON فقط — مصفوفة المرشحين المناسبين مرتبة تنازلياً حسب نسبة التطابق (فقط من نسبتهم 40% فأكثر):
[{"candidateIndex": رقم المرشح (0-based), "score": نسبة التطابق 0-100, "reasons": "سبب التطابق مختصر", "gaps": "نقاط الضعف إن وجدت"}]`
          }]
        })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      const raw = data.content.map(b => b.text || '').join('')
      const clean = raw.replace(/```json|```/g, '').trim()
      const aiResults = JSON.parse(clean.match(/\[[\s\S]*\]/)?.[0] || '[]')

      const enriched = aiResults.map(r => ({
        ...db[r.candidateIndex],
        score: r.score,
        reasons: r.reasons,
        gaps: r.gaps,
      })).filter(r => r && r.name)

      setMatchResults(enriched)
      onUpdateJob(job.id, { matches: enriched.map(r => ({ id: r.id, score: r.score })) })
    } catch {
      setMatchResults(localMatch(job))
    }
    setMatching(false)
  }

  // مطابقة محلية بدون AI
  const localMatch = (job) => {
    return db.map(c => {
      let score = 0
      if (c.spec?.toLowerCase().includes(job.spec?.toLowerCase()) || job.spec?.toLowerCase().includes(c.spec?.toLowerCase())) score += 40
      if (c.exp >= job.expMin && c.exp <= job.expMax) score += 25
      if (c.age >= job.ageMin && c.age <= job.ageMax) score += 15
      if (c.city === job.city) score += 10
      const jobSkills = (job.skills || '').split(/[,،]/).map(s => s.trim().toLowerCase())
      const cvSkills = (c.skills || '').toLowerCase()
      const matched = jobSkills.filter(s => s && cvSkills.includes(s)).length
      score += Math.min(10, matched * 3)
      return { ...c, score: Math.min(100, score), reasons: 'مطابقة محلية حسب التخصص والخبرة والعمر', gaps: '' }
    }).filter(c => c.score >= 40).sort((a,b) => b.score - a.score).slice(0,8)
  }

  const filteredJobs = jobs.filter(j => {
    if (filterSector) { const emp = getEmployer(j.employerId); if (!emp || emp.sector !== filterSector) return false }
    if (filterCity && j.city !== filterCity) return false
    if (filterType && j.type !== filterType) return false
    return true
  })

  // ======= VIEWS =======

  if (view === 'add-employer') return (
    <div className="animate-fade-in space-y-5 max-w-xl">
      <button onClick={() => setView('employers')} className="text-sm text-gray-400 hover:text-gray-200 flex items-center gap-1">← رجوع</button>
      <h2 className="text-lg font-bold text-white">إضافة مشغّل جديد</h2>
      <div className="glass rounded-2xl p-5 space-y-4">
        {[
          { label:'اسم المؤسسة *', key:'name', placeholder:'مثال: شركة الأمل للخدمات' },
          { label:'البريد الإلكتروني', key:'contact', placeholder:'contact@company.tn' },
          { label:'رقم الهاتف', key:'phone', placeholder:'71 000 000' },
          { label:'ملاحظات', key:'notes', placeholder:'معلومات إضافية...' },
        ].map(f => (
          <div key={f.key}>
            <label className="text-xs text-gray-500 block mb-1.5">{f.label}</label>
            <input value={empForm[f.key]} onChange={e => setEmpForm(p => ({...p, [f.key]: e.target.value}))}
              placeholder={f.placeholder} className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" />
          </div>
        ))}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1.5">القطاع</label>
            <select value={empForm.sector} onChange={e => setEmpForm(p=>({...p,sector:e.target.value}))} className="input-dark w-full px-3 py-2 rounded-xl text-sm">
              {SECTORS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1.5">المدينة</label>
            <select value={empForm.city} onChange={e => setEmpForm(p=>({...p,city:e.target.value}))} className="input-dark w-full px-3 py-2 rounded-xl text-sm">
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1.5">الحجم</label>
            <select value={empForm.size} onChange={e => setEmpForm(p=>({...p,size:e.target.value}))} className="input-dark w-full px-3 py-2 rounded-xl text-sm">
              {['صغيرة','متوسطة','كبيرة'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <button onClick={() => { if(!empForm.name.trim()) return; onAddEmployer(empForm); setEmpForm({name:'',sector:'صحة',city:'تونس العاصمة',contact:'',phone:'',size:'صغيرة',notes:''}); setView('employers') }}
          className="btn-primary w-full py-3 rounded-xl text-sm font-semibold text-white">
          ✅ حفظ المشغّل
        </button>
      </div>
    </div>
  )

  if (view === 'add-job') return (
    <div className="animate-fade-in space-y-5 max-w-2xl">
      <button onClick={() => setView('jobs')} className="text-sm text-gray-400 hover:text-gray-200 flex items-center gap-1">← رجوع</button>
      <h2 className="text-lg font-bold text-white">إضافة عرض شغل جديد</h2>
      <div className="glass rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1.5">المشغّل *</label>
            <select value={jobForm.employerId} onChange={e => setJobForm(p=>({...p,employerId:parseInt(e.target.value)}))} className="input-dark w-full px-3 py-2.5 rounded-xl text-sm">
              <option value="">اختر مشغّلاً</option>
              {employers.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1.5">عنوان المنصب *</label>
            <input value={jobForm.title} onChange={e => setJobForm(p=>({...p,title:e.target.value}))} placeholder="مثال: ممرضة، مدرب، طبيب أسنان" className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1.5">التخصص المطلوب</label>
            <input value={jobForm.spec} onChange={e => setJobForm(p=>({...p,spec:e.target.value}))} placeholder="للمطابقة مع قاعدة البيانات" className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1.5">المدينة</label>
            <select value={jobForm.city} onChange={e => setJobForm(p=>({...p,city:e.target.value}))} className="input-dark w-full px-3 py-2.5 rounded-xl text-sm">
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1.5">نوع العقد</label>
            <select value={jobForm.type} onChange={e => setJobForm(p=>({...p,type:e.target.value}))} className="input-dark w-full px-3 py-2.5 rounded-xl text-sm">
              {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1.5">الراتب (د.ت)</label>
            <input value={jobForm.salary} onChange={e => setJobForm(p=>({...p,salary:e.target.value}))} placeholder="مثال: 1200-1500 د.ت" className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {label:'الخبرة الدنيا (سنة)', key:'expMin', min:0, max:30},
            {label:'الخبرة القصوى (سنة)', key:'expMax', min:0, max:40},
            {label:'الحد الأدنى للعمر', key:'ageMin', min:18, max:60},
            {label:'الحد الأقصى للعمر', key:'ageMax', min:18, max:65},
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-gray-500 block mb-1.5">{f.label}</label>
              <input type="number" min={f.min} max={f.max} value={jobForm[f.key]}
                onChange={e => setJobForm(p=>({...p,[f.key]:parseInt(e.target.value)||0}))}
                className="input-dark w-full px-3 py-2 rounded-xl text-sm text-center" />
            </div>
          ))}
        </div>

        {[
          {label:'المهارات المطلوبة', key:'skills', placeholder:'React، Excel، إجادة الفرنسية...'},
          {label:'وصف المنصب', key:'description', placeholder:'وصف مختصر للوظيفة والمهام...'},
          {label:'الشروط والمتطلبات', key:'requirements', placeholder:'الشهادات المطلوبة، الخبرة، الكفاءات...'},
        ].map(f => (
          <div key={f.key}>
            <label className="text-xs text-gray-500 block mb-1.5">{f.label}</label>
            <textarea value={jobForm[f.key]} onChange={e => setJobForm(p=>({...p,[f.key]:e.target.value}))}
              placeholder={f.placeholder} rows={2}
              className="input-dark w-full px-4 py-2.5 rounded-xl text-sm resize-none" />
          </div>
        ))}

        <div>
          <label className="text-xs text-gray-500 block mb-1.5">آخر أجل للتقديم</label>
          <input type="date" value={jobForm.deadline} onChange={e => setJobForm(p=>({...p,deadline:e.target.value}))}
            className="input-dark px-4 py-2.5 rounded-xl text-sm" />
        </div>

        <button onClick={() => {
          if (!jobForm.title.trim() || !jobForm.employerId) return
          onAddJob(jobForm)
          setJobForm({employerId:'',title:'',spec:'',city:'تونس العاصمة',type:'دوام كامل',salary:'',expMin:0,expMax:20,ageMin:18,ageMax:55,skills:'',description:'',requirements:'',deadline:'',active:true})
          setView('jobs')
        }} className="btn-primary w-full py-3 rounded-xl text-sm font-semibold text-white">
          ✅ نشر عرض الشغل
        </button>
      </div>
    </div>
  )

  if (view === 'job-detail' && selectedJob) {
    const emp = getEmployer(selectedJob.employerId)
    return (
      <div className="animate-fade-in space-y-5">
        <button onClick={() => setView('jobs')} className="text-sm text-gray-400 hover:text-gray-200 flex items-center gap-1">← رجوع للعروض</button>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-lg font-bold text-white">{selectedJob.title}</h2>
              <div className="text-sm text-gray-400 mt-1">{emp?.name} • 📍 {selectedJob.city}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">{selectedJob.type}</span>
              {selectedJob.salary && <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">💰 {selectedJob.salary}</span>}
              {selectedJob.deadline && <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">⏰ {selectedJob.deadline}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {[
              {label:'التخصص', val:selectedJob.spec},
              {label:'الخبرة', val:`${selectedJob.expMin}-${selectedJob.expMax} سنة`},
              {label:'العمر', val:`${selectedJob.ageMin}-${selectedJob.ageMax} سنة`},
              {label:'المدينة', val:selectedJob.city},
            ].map(f => (
              <div key={f.label} className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                <div className="text-xs text-gray-500 mb-0.5">{f.label}</div>
                <div className="text-sm text-white font-medium">{f.val}</div>
              </div>
            ))}
          </div>

          {selectedJob.skills && (
            <div className="mt-3 bg-white/[0.03] rounded-xl p-3 border border-white/5">
              <div className="text-xs text-gray-500 mb-1">المهارات المطلوبة</div>
              <div className="text-sm text-gray-200">{selectedJob.skills}</div>
            </div>
          )}
          {selectedJob.requirements && (
            <div className="mt-3 bg-white/[0.03] rounded-xl p-3 border border-white/5">
              <div className="text-xs text-gray-500 mb-1">الشروط والمتطلبات</div>
              <div className="text-sm text-gray-200">{selectedJob.requirements}</div>
            </div>
          )}
          {selectedJob.description && (
            <div className="mt-3 bg-white/[0.03] rounded-xl p-3 border border-white/5">
              <div className="text-xs text-gray-500 mb-1">وصف المنصب</div>
              <div className="text-sm text-gray-200">{selectedJob.description}</div>
            </div>
          )}
        </div>

        {/* API Key للمطابقة */}
        <div className="glass rounded-2xl p-4">
          <label className="text-xs text-gray-500 block mb-1.5">🔑 مفتاح API للمطابقة الذكية</label>
          <input type="password" placeholder="sk-ant-..." value={apiKey} onChange={e=>setApiKey(e.target.value)}
            className="input-dark w-full px-4 py-2 rounded-xl text-sm font-mono" />
        </div>

        <button onClick={() => matchCandidates(selectedJob)} disabled={matching || db.length === 0}
          className="btn-primary w-full py-3.5 rounded-xl font-semibold text-white disabled:opacity-40 flex items-center justify-center gap-2 text-sm">
          {matching ? <><span className="animate-spin inline-block">⟳</span> الذكاء الاصطناعي يحلل المرشحين...</>
            : <><span>🤖</span> مطابقة تلقائية مع {db.length} مرشح</>}
        </button>

        {/* نتائج المطابقة */}
        {matchResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">
              أفضل {matchResults.length} مرشح مناسب
            </h3>
            {matchResults.sort((a,b)=>b.score-a.score).map((c, i) => (
              <div key={i} className="search-result-card rounded-2xl p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-300 font-bold text-xs flex-shrink-0">
                  {(c.name||'').split(' ').slice(0,2).map(w=>w[0]).join('')}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white text-sm">{c.name}</span>
                    <MatchScore score={c.score} />
                  </div>
                  <div className="text-xs text-gray-400">{c.spec} • {c.exp} سنة خبرة • {c.age} سنة{c.city ? ` • 📍 ${c.city}` : ''}</div>
                  {c.reasons && <div className="text-xs text-emerald-400">✓ {c.reasons}</div>}
                  {c.gaps && <div className="text-xs text-amber-400">△ {c.gaps}</div>}
                </div>
                <div className="flex-shrink-0 text-center">
                  <div className="text-2xl font-bold text-white">{c.score}</div>
                  <div className="text-xs text-gray-500">%</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {matching && (
          <div className="space-y-3">
            {[...Array(4)].map((_,i)=>(
              <div key={i} className="glass rounded-2xl p-4 flex gap-3">
                <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0"></div>
                <div className="flex-1 space-y-2 pt-1">
                  <div className="skeleton h-4 w-1/2 rounded"></div>
                  <div className="skeleton h-3 w-2/3 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (view === 'employers') return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-white">المشغّلون ({employers.length})</h1>
        <button onClick={() => setView('add-employer')} className="btn-primary px-4 py-2 rounded-xl text-sm text-white flex items-center gap-2">
          + إضافة مشغّل
        </button>
      </div>
      {employers.length === 0 ? (
        <div className="text-center py-16 text-gray-500"><div className="text-4xl mb-3">🏢</div><div>لا يوجد مشغّلون بعد</div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {employers.map(emp => {
            const empJobs = jobs.filter(j => j.employerId === emp.id)
            return (
              <div key={emp.id} className="glass rounded-2xl p-4 card-hover border border-white/5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xl">
                      {SECTOR_ICON[emp.sector] || '🏢'}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">{emp.name}</div>
                      <div className="text-xs text-gray-400">{emp.sector} • {emp.city}</div>
                    </div>
                  </div>
                  <button onClick={() => onDeleteEmployer(emp.id)} className="text-gray-600 hover:text-red-400 transition-colors text-sm p-1">🗑</button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs tag-spec px-2.5 py-0.5 rounded-full">{emp.size}</span>
                  <span className="text-xs tag-exp px-2.5 py-0.5 rounded-full">{empJobs.length} عرض شغل</span>
                  {emp.contact && <span className="text-xs text-gray-500">{emp.contact}</span>}
                  {emp.phone && (
                    <a href={waLink(emp.phone, employerMsg(emp, 'intro'))} target="_blank" rel="noreferrer"
                      onClick={e=>e.stopPropagation()}
                      className="text-xs px-2.5 py-1 rounded-lg text-white font-medium transition-all hover:-translate-y-0.5 flex items-center gap-1"
                      style={{background:'linear-gradient(135deg,#25d366,#128c7e)'}}>
                      💬 واتساب
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  // default: jobs list
  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">عروض الشغل</h1>
          <p className="text-gray-400 text-sm mt-0.5">{filteredJobs.length} عرض متوفر — اضغط على عرض لمطابقة المرشحين تلقائياً</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setView('employers')} className="px-3 py-2 text-sm border border-white/10 rounded-xl text-gray-400 hover:bg-white/5 transition-colors flex items-center gap-1.5">
            🏢 المشغّلون ({employers.length})
          </button>
          <button onClick={() => setView('add-job')} className="btn-primary px-4 py-2 rounded-xl text-sm text-white flex items-center gap-2">
            + عرض جديد
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 grid grid-cols-3 gap-3">
        {[
          {label:'القطاع', val:filterSector, set:setFilterSector, opts:[['','الكل'],...SECTORS.map(s=>[s,s])]},
          {label:'المدينة', val:filterCity, set:setFilterCity, opts:[['','الكل'],...CITIES.map(c=>[c,c])]},
          {label:'نوع العقد', val:filterType, set:setFilterType, opts:[['','الكل'],...JOB_TYPES.map(t=>[t,t])]},
        ].map(f => (
          <div key={f.label}>
            <label className="text-xs text-gray-500 block mb-1">{f.label}</label>
            <select value={f.val} onChange={e=>f.set(e.target.value)} className="input-dark w-full px-3 py-2 rounded-xl text-sm">
              {f.opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-4xl mb-3">📋</div>
          <div>لا توجد عروض شغل بعد</div>
          <button onClick={() => setView('add-job')} className="mt-4 btn-primary px-5 py-2 rounded-xl text-sm text-white">+ أضف أول عرض</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map(job => {
            const emp = getEmployer(job.employerId)
            return (
              <div key={job.id} className="search-result-card rounded-2xl p-4 cursor-pointer" onClick={() => matchCandidates(job)}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-2xl flex-shrink-0">
                    {SECTOR_ICON[emp?.sector] || '💼'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <div className="font-semibold text-white text-sm">{job.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{emp?.name || 'مشغّل'} • 📍 {job.city}</div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">{job.type}</span>
                        {job.salary && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">{job.salary}</span>}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="tag-exp text-xs px-2.5 py-0.5 rounded-full">خبرة {job.expMin}-{job.expMax} سنة</span>
                      <span className="tag-age text-xs px-2.5 py-0.5 rounded-full">عمر {job.ageMin}-{job.ageMax} سنة</span>
                      {job.spec && <span className="tag-spec text-xs px-2.5 py-0.5 rounded-full">{job.spec}</span>}
                    </div>
                    {job.requirements && <div className="text-xs text-gray-500 mt-1.5 line-clamp-1">📋 {job.requirements}</div>}
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
                    <div className="text-xs text-gray-500 bg-white/5 px-2.5 py-1 rounded-lg">
                      🤖 مطابقة تلقائية
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onDeleteJob(job.id) }}
                      className="text-gray-600 hover:text-red-400 transition-colors text-xs p-1">🗑</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

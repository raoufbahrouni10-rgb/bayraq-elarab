import { useState } from 'react'
import { waLink } from '../lib/whatsapp'

export default function CandidateComparePage({ db, applications }) {
  const [a, setA] = useState('')
  const [b, setB] = useState('')

  const cvA = db.find(c => c.id == a)
  const cvB = db.find(c => c.id == b)
  const appA = applications.find(ap => ap.candidateName === cvA?.name)
  const appB = applications.find(ap => ap.candidateName === cvB?.name)

  const STAGE_LABELS = { selected:'اختيار', interview:'مقابلة', contract:'عقد', travel:'سفر', hired:'توظيف', rejected:'ملغي' }

  const Row = ({ label, valA, valB, better }) => {
    const aWins = better === 'higher' ? (parseFloat(valA) > parseFloat(valB)) : false
    return (
      <tr className="border-b border-white/5">
        <td className="py-3 px-4 text-xs text-gray-400 text-center">{label}</td>
        <td className={`py-3 px-4 text-sm text-center font-medium ${aWins ? 'text-emerald-400' : 'text-white'}`}>{valA || '—'}</td>
        <td className={`py-3 px-4 text-sm text-center font-medium ${!aWins && valB && better === 'higher' ? 'text-emerald-400' : 'text-white'}`}>{valB || '—'}</td>
      </tr>
    )
  }

  return (
    <div className="animate-fade-in space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-white mb-0.5">⚖️ مقارنة المترشحين</h1>
        <p className="text-gray-400 text-sm">قارن بين مترشحَين جنباً إلى جنب</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1.5">المترشح الأول</label>
          <select value={a} onChange={e=>setA(e.target.value)} className="input-dark w-full px-3 py-2.5 rounded-xl text-sm">
            <option value="">اختر مترشحاً...</option>
            {db.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1.5">المترشح الثاني</label>
          <select value={b} onChange={e=>setB(e.target.value)} className="input-dark w-full px-3 py-2.5 rounded-xl text-sm">
            <option value="">اختر مترشحاً...</option>
            {db.filter(c=>c.id!=a).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {cvA && cvB && (
        <div className="glass rounded-2xl overflow-hidden border border-white/5">
          {/* رأس المقارنة */}
          <div className="grid grid-cols-3 border-b border-white/5">
            <div className="py-4 px-4 text-center text-xs text-gray-500">المعيار</div>
            {[{cv:cvA, app:appA}, {cv:cvB, app:appB}].map((item, i) => (
              <div key={i} className="py-4 px-4 text-center border-r border-white/5 first:border-r-0 space-y-2">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300 font-bold text-sm mx-auto">
                  {item.cv.name?.split(' ').slice(0,2).map(w=>w[0]).join('')}
                </div>
                <div className="text-sm font-bold text-white">{item.cv.name}</div>
                {item.cv.phone && (
                  <a href={waLink(item.cv.phone)} target="_blank" rel="noreferrer"
                    className="text-xs px-2 py-1 rounded-lg text-white inline-block"
                    style={{background:'linear-gradient(135deg,#25d366,#128c7e)'}}>💬</a>
                )}
              </div>
            ))}
          </div>

          <table className="w-full">
            <tbody>
              <Row label="التخصص" valA={cvA.spec} valB={cvB.spec} />
              <Row label="الخبرة (سنة)" valA={cvA.exp} valB={cvB.exp} better="higher" />
              <Row label="العمر" valA={cvA.age} valB={cvB.age} />
              <Row label="المدينة" valA={cvA.city} valB={cvB.city} />
              <Row label="المهارات" valA={cvA.skills} valB={cvB.skills} />
              <Row label="المصدر" valA={cvA.source} valB={cvB.source} />
              <Row label="تاريخ التسجيل" valA={cvA.date} valB={cvB.date} />
              <Row label="مرحلة الملف" valA={appA ? STAGE_LABELS[appA.stage] : 'لا يوجد ملف'} valB={appB ? STAGE_LABELS[appB.stage] : 'لا يوجد ملف'} />
              <Row label="المنصب" valA={appA?.jobTitle} valB={appB?.jobTitle} />
              <Row label="الدولة" valA={appA?.country} valB={appB?.country} />
            </tbody>
          </table>
        </div>
      )}

      {(!cvA || !cvB) && (
        <div className="text-center py-16 text-gray-500 space-y-3">
          <div className="text-5xl">⚖️</div>
          <div>اختر مترشحَين للمقارنة</div>
        </div>
      )}
    </div>
  )
}

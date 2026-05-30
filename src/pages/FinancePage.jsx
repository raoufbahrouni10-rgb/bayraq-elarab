import { useState } from 'react'
import { INCOME_TYPES, CURRENCIES } from '../hooks/useFinance'

const TYPE_COLORS = {
  blue:    { bg:'bg-blue-500/20',    text:'text-blue-300',    border:'border-blue-500/30' },
  purple:  { bg:'bg-purple-500/20',  text:'text-purple-300',  border:'border-purple-500/30' },
  cyan:    { bg:'bg-cyan-500/20',    text:'text-cyan-300',    border:'border-cyan-500/30' },
  amber:   { bg:'bg-amber-500/20',   text:'text-amber-300',   border:'border-amber-500/30' },
  emerald: { bg:'bg-emerald-500/20', text:'text-emerald-300', border:'border-emerald-500/30' },
  gray:    { bg:'bg-gray-500/20',    text:'text-gray-300',    border:'border-gray-500/30' },
}

const GULF = ['السعودية','الإمارات','قطر','الكويت','البحرين','عُمان']

function fmt(n) { return n.toLocaleString('ar-TN', { minimumFractionDigits:0, maximumFractionDigits:0 }) }

export default function FinancePage({ transactions, stats, onAdd, onTogglePaid, onDelete, toTND }) {
  const [showAdd, setShowAdd] = useState(false)
  const [filterType, setFilterType] = useState('')
  const [filterPaid, setFilterPaid] = useState('')
  const [filterCandidate, setFilterCandidate] = useState('')
  const [activeTab, setActiveTab] = useState('overview') // overview | transactions | add
  const [form, setForm] = useState({
    type:'file_prep', candidateName:'', jobTitle:'', company:'',
    country:'السعودية', amount:'', currency:'TND', paid:false, date:'', notes:''
  })

  const candidates = [...new Set(transactions.map(t=>t.candidateName).filter(Boolean))]

  const filtered = transactions.filter(t => {
    if (filterType && t.type !== filterType) return false
    if (filterPaid === 'paid' && !t.paid) return false
    if (filterPaid === 'pending' && t.paid) return false
    if (filterCandidate && t.candidateName !== filterCandidate) return false
    return true
  })

  const handleAdd = () => {
    if (!form.candidateName || !form.amount) return
    onAdd({ ...form, amount: parseFloat(form.amount) || 0 })
    setForm({ type:'file_prep', candidateName:'', jobTitle:'', company:'', country:'السعودية', amount:'', currency:'TND', paid:false, date:'', notes:'' })
    setActiveTab('transactions')
  }

  const exportCSV = () => {
    const headers = ['النوع','المرشح','المنصب','الشركة','الدولة','المبلغ','العملة','بالدينار','مدفوع','التاريخ','ملاحظات']
    const rows = transactions.map(t => {
      const type = INCOME_TYPES.find(i=>i.key===t.type)
      return [type?.label||t.type, t.candidateName, t.jobTitle, t.company, t.country, t.amount, t.currency, toTND(t.amount,t.currency).toFixed(2), t.paid?'نعم':'لا', t.date, t.notes||''].map(v=>`"${v}"`).join(',')
    })
    const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'})); a.download='bayraq_finance.csv'; a.click()
  }

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white mb-0.5">مسار المداخيل 💰</h1>
          <p className="text-gray-400 text-sm">تتبع جميع المداخيل من المترشحين والمشغّلين</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="px-3 py-2 border border-white/10 rounded-xl text-xs text-gray-400 hover:bg-white/5 flex items-center gap-1.5">
            📤 تصدير
          </button>
          <button onClick={() => setActiveTab('add')} className="btn-primary px-4 py-2 rounded-xl text-sm text-white flex items-center gap-2">
            + إضافة معاملة
          </button>
        </div>
      </div>

      {/* بطاقات الإجمالي */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label:'إجمالي المحصّل',     val:stats.totalTND,       icon:'✅', color:'from-emerald-600 to-emerald-800' },
          { label:'قيد الانتظار',        val:stats.pendingTND,     icon:'⏳', color:'from-amber-600 to-amber-800' },
          { label:'من المترشحين',        val:stats.fromCandidates, icon:'👤', color:'from-blue-600 to-blue-800' },
          { label:'من المشغّلين',        val:stats.fromEmployers,  icon:'🏢', color:'from-purple-600 to-purple-800' },
        ].map((c,i) => (
          <div key={i} className={`rounded-2xl bg-gradient-to-br ${c.color} p-4 relative overflow-hidden`}>
            <div className="text-2xl mb-1">{c.icon}</div>
            <div className="text-xl font-bold text-white">{fmt(c.val)} <span className="text-sm font-normal opacity-80">د.ت</span></div>
            <div className="text-xs text-white/70 mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>

      {/* تبويبات */}
      <div className="flex gap-1 border-b border-white/5">
        {[
          { key:'overview',      label:'نظرة عامة' },
          { key:'transactions',  label:`المعاملات (${transactions.length})` },
          { key:'by_candidate',  label:'حسب المترشح' },
          { key:'add',           label:'+ إضافة' },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 text-sm border-b-2 transition-colors -mb-px
              ${activeTab===t.key ? 'border-blue-400 text-white font-medium' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ===== نظرة عامة ===== */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* توزيع حسب النوع */}
          <div className="glass rounded-2xl p-5 space-y-4">
            <div className="text-sm font-semibold text-gray-200">توزيع المداخيل حسب النوع</div>
            {INCOME_TYPES.map(type => {
              const d = stats.byType[type.key]
              const c = TYPE_COLORS[type.color]
              const pct = stats.totalTND > 0 ? (d.paid / (stats.totalTND + stats.pendingTND)) * 100 : 0
              if (d.count === 0) return null
              return (
                <div key={type.key} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${c.bg} ${c.text} ${c.border}`}>
                        {type.icon} {type.label}
                      </span>
                      <span className="text-xs text-gray-500">{d.count} معاملة</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-white">{fmt(d.paid)} د.ت</span>
                      {d.total > d.paid && <span className="text-xs text-amber-400 mr-2">+ {fmt(d.total - d.paid)} منتظر</span>}
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${c.bg.replace('/20','')}`}
                      style={{ width: `${Math.min(100, pct)}%`, background: type.color === 'emerald' ? '#10b981' : type.color === 'blue' ? '#3b82f6' : type.color === 'purple' ? '#8b5cf6' : type.color === 'amber' ? '#f59e0b' : type.color === 'cyan' ? '#06b6d4' : '#6b7280' }}></div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* مصدر المداخيل */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-2xl p-4 space-y-2">
              <div className="text-xs text-gray-500">👤 من المترشحين</div>
              {INCOME_TYPES.filter(t=>t.from==='candidate').map(type => {
                const d = stats.byType[type.key]
                if (d.count === 0) return null
                const c = TYPE_COLORS[type.color]
                return (
                  <div key={type.key} className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{type.icon} {type.label}</span>
                    <span className={`text-xs font-medium ${c.text}`}>{fmt(d.paid)} د.ت</span>
                  </div>
                )
              })}
              <div className="border-t border-white/5 pt-2 flex justify-between">
                <span className="text-xs text-gray-500">المجموع</span>
                <span className="text-sm font-bold text-blue-300">{fmt(stats.fromCandidates)} د.ت</span>
              </div>
            </div>

            <div className="glass rounded-2xl p-4 space-y-2">
              <div className="text-xs text-gray-500">🏢 من المشغّلين</div>
              {INCOME_TYPES.filter(t=>t.from==='employer').map(type => {
                const d = stats.byType[type.key]
                if (d.count === 0) return null
                const c = TYPE_COLORS[type.color]
                return (
                  <div key={type.key} className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{type.icon} {type.label}</span>
                    <span className={`text-xs font-medium ${c.text}`}>{fmt(d.paid)} د.ت</span>
                  </div>
                )
              })}
              <div className="border-t border-white/5 pt-2 flex justify-between">
                <span className="text-xs text-gray-500">المجموع</span>
                <span className="text-sm font-bold text-emerald-300">{fmt(stats.fromEmployers)} د.ت</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== المعاملات ===== */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          {/* فلاتر */}
          <div className="glass rounded-2xl p-4 grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">النوع</label>
              <select value={filterType} onChange={e=>setFilterType(e.target.value)} className="input-dark w-full px-3 py-2 rounded-xl text-sm">
                <option value="">الكل</option>
                {INCOME_TYPES.map(t=><option key={t.key} value={t.key}>{t.icon} {t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">الحالة</label>
              <select value={filterPaid} onChange={e=>setFilterPaid(e.target.value)} className="input-dark w-full px-3 py-2 rounded-xl text-sm">
                <option value="">الكل</option>
                <option value="paid">مدفوع ✅</option>
                <option value="pending">منتظر ⏳</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">المترشح</label>
              <select value={filterCandidate} onChange={e=>setFilterCandidate(e.target.value)} className="input-dark w-full px-3 py-2 rounded-xl text-sm">
                <option value="">الكل</option>
                {candidates.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="text-xs text-gray-500 flex justify-between px-1">
            <span>{filtered.length} معاملة</span>
            <span>المجموع المحصّل: <span className="text-emerald-400 font-semibold">{fmt(filtered.filter(t=>t.paid).reduce((s,t)=>s+toTND(t.amount,t.currency),0))} د.ت</span></span>
          </div>

          {/* قائمة المعاملات */}
          <div className="space-y-2">
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-2">💸</div>
                <div>لا توجد معاملات</div>
              </div>
            )}
            {filtered.map(t => {
              const type = INCOME_TYPES.find(i=>i.key===t.type) || INCOME_TYPES[5]
              const c = TYPE_COLORS[type.color]
              const curr = CURRENCIES.find(cu=>cu.key===t.currency) || CURRENCIES[0]
              const tnd = toTND(t.amount, t.currency)
              return (
                <div key={t.id} className={`glass rounded-2xl p-4 border transition-all ${t.paid ? 'border-white/5' : 'border-amber-500/20'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 border ${c.bg} ${c.border}`}>
                      {type.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-white text-sm">{t.candidateName}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${c.bg} ${c.text} ${c.border}`}>{type.label}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${t.paid ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                              {t.paid ? '✅ مدفوع' : '⏳ منتظر'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">{t.jobTitle} — {t.company} • {t.country}</div>
                          {t.notes && <div className="text-xs text-gray-500 mt-0.5 italic">{t.notes}</div>}
                        </div>
                        <div className="text-left flex-shrink-0">
                          <div className="text-lg font-bold text-white">{t.amount} <span className="text-sm text-gray-400">{curr.label}</span></div>
                          {t.currency !== 'TND' && <div className="text-xs text-gray-500">≈ {fmt(tnd)} د.ت</div>}
                          <div className="text-xs text-gray-600 mt-0.5">{t.date}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                    <button onClick={() => onTogglePaid(t.id)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-all border
                        ${t.paid ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10' : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'}`}>
                      {t.paid ? '↩ تحديد كمنتظر' : '✅ تحديد كمدفوع'}
                    </button>
                    <button onClick={() => onDelete(t.id)} className="px-3 py-1.5 border border-white/10 rounded-xl text-xs text-gray-500 hover:text-red-400 hover:border-red-500/30 transition-all">
                      🗑
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ===== حسب المترشح ===== */}
      {activeTab === 'by_candidate' && (
        <div className="space-y-3">
          {candidates.length === 0 && (
            <div className="text-center py-12 text-gray-500"><div className="text-4xl mb-2">👤</div><div>لا توجد بيانات</div></div>
          )}
          {candidates.map(cand => {
            const ct = transactions.filter(t=>t.candidateName===cand)
            const totalPaid = ct.filter(t=>t.paid).reduce((s,t)=>s+toTND(t.amount,t.currency),0)
            const totalPending = ct.filter(t=>!t.paid).reduce((s,t)=>s+toTND(t.amount,t.currency),0)
            const job = ct[0]
            return (
              <div key={cand} className="glass rounded-2xl p-4 border border-white/5 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="font-semibold text-white">{cand}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{job?.jobTitle} — {job?.company} • {job?.country}</div>
                  </div>
                  <div className="text-left">
                    <div className="text-base font-bold text-emerald-300">{fmt(totalPaid)} د.ت <span className="text-xs font-normal text-gray-500">محصّل</span></div>
                    {totalPending > 0 && <div className="text-xs text-amber-400">{fmt(totalPending)} د.ت منتظر</div>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  {ct.map(t => {
                    const type = INCOME_TYPES.find(i=>i.key===t.type) || INCOME_TYPES[5]
                    const c = TYPE_COLORS[type.color]
                    const curr = CURRENCIES.find(cu=>cu.key===t.currency)||CURRENCIES[0]
                    return (
                      <div key={t.id} className="flex items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded-full border ${c.bg} ${c.text} ${c.border}`}>{type.icon} {type.label}</span>
                        <span className="text-gray-300 flex-1">{t.amount} {curr.label}</span>
                        <span className={t.paid ? 'text-emerald-400' : 'text-amber-400'}>{t.paid ? '✅' : '⏳'}</span>
                        <button onClick={() => onTogglePaid(t.id)} className="text-gray-600 hover:text-white transition-colors">⇄</button>
                      </div>
                    )
                  })}
                </div>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-gray-500">{ct.length} معاملة</span>
                  <span className="text-white font-semibold">{fmt(totalPaid + totalPending)} د.ت إجمالي</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ===== إضافة معاملة ===== */}
      {activeTab === 'add' && (
        <div className="glass rounded-2xl p-5 space-y-4 max-w-2xl animate-slide-up">
          <div className="text-sm font-semibold text-gray-200 mb-1">إضافة معاملة مالية جديدة</div>

          {/* نوع المعاملة */}
          <div>
            <label className="text-xs text-gray-500 block mb-2">نوع المداخيل *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {INCOME_TYPES.map(type => {
                const c = TYPE_COLORS[type.color]
                return (
                  <button key={type.key} onClick={() => setForm(p=>({...p,type:type.key}))}
                    className={`p-3 rounded-xl border text-right transition-all
                      ${form.type===type.key ? `${c.bg} ${c.border}` : 'border-white/8 hover:bg-white/5'}`}>
                    <div className="text-xl mb-1">{type.icon}</div>
                    <div className={`text-xs font-medium ${form.type===type.key ? c.text : 'text-gray-300'}`}>{type.label}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{type.from === 'candidate' ? 'من المترشح' : type.from === 'employer' ? 'من المشغّل' : 'من الطرفين'}</div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">اسم المترشح *</label>
              <input value={form.candidateName} onChange={e=>setForm(p=>({...p,candidateName:e.target.value}))}
                placeholder="اسم المترشح..." className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">المنصب</label>
              <input value={form.jobTitle} onChange={e=>setForm(p=>({...p,jobTitle:e.target.value}))}
                placeholder="المنصب..." className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">الشركة / المشغّل</label>
              <input value={form.company} onChange={e=>setForm(p=>({...p,company:e.target.value}))}
                placeholder="اسم الشركة..." className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">الدولة</label>
              <select value={form.country} onChange={e=>setForm(p=>({...p,country:e.target.value}))} className="input-dark w-full px-3 py-2.5 rounded-xl text-sm">
                {['تونس',...GULF].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>

            {/* المبلغ والعملة */}
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">المبلغ *</label>
              <input type="number" value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))}
                placeholder="0" className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">العملة</label>
              <select value={form.currency} onChange={e=>setForm(p=>({...p,currency:e.target.value}))} className="input-dark w-full px-3 py-2.5 rounded-xl text-sm">
                {CURRENCIES.map(c=><option key={c.key} value={c.key}>{c.label} — {c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1.5">التاريخ</label>
              <input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}
                className="input-dark w-full px-4 py-2 rounded-xl text-sm" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer w-full p-3 rounded-xl border border-white/8 hover:bg-white/5">
                <div className={`w-10 h-6 rounded-full transition-all ${form.paid ? 'bg-emerald-500' : 'bg-white/10'} relative`}
                  onClick={() => setForm(p=>({...p,paid:!p.paid}))}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.paid ? 'left-4' : 'left-0.5'}`}></div>
                </div>
                <span className="text-sm text-gray-300">{form.paid ? '✅ مدفوع' : '⏳ لم يُدفع بعد'}</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1.5">ملاحظات</label>
            <input value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}
              placeholder="ملاحظة اختيارية..." className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" />
          </div>

          {/* معاينة التحويل */}
          {form.amount && form.currency !== 'TND' && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-sm text-blue-300">
              💱 {form.amount} {CURRENCIES.find(c=>c.key===form.currency)?.label} ≈ {fmt(toTND(parseFloat(form.amount)||0, form.currency))} د.ت
            </div>
          )}

          <button onClick={handleAdd} disabled={!form.candidateName || !form.amount}
            className="btn-primary w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-40">
            ✅ حفظ المعاملة
          </button>
        </div>
      )}
    </div>
  )
}

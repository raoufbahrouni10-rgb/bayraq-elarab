import { useState } from 'react'

const KEY = 'bayraq_invoices'
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)||'[]') } catch { return [] } }
const save = (d) => { try { localStorage.setItem(KEY, JSON.stringify(d)) } catch {} }

const COMPANY_INFO = {
  name: 'بيرق العرب للتوظيف بالخارج',
  nameEn: 'BAYRAK ELARAB',
  address: '17 Rue de Marseille, Tunis 1002',
  phone: '(+216) 52 332 223 / 98 656 680',
  email: 'bayrakdirection@gmail.com',
}

export default function InvoicesPage({ employers, transactions }) {
  const [invoices, setInvoices] = useState(load)
  const [showAdd, setShowAdd]   = useState(false)
  const [form, setForm]         = useState({ employerName:'', services:[{desc:'خدمة استقدام موظفين', amount:'', currency:'TND'}], notes:'', date: new Date().toISOString().split('T')[0] })
  const [preview, setPreview]   = useState(null)

  const update = (data) => { setInvoices(data); save(data) }

  const nextInvoiceNum = () => `INV-${new Date().getFullYear()}-${String(invoices.length+1).padStart(3,'0')}`

  const addService = () => setForm(p=>({...p, services:[...p.services, {desc:'', amount:'', currency:'TND'}]}))
  const removeService = (i) => setForm(p=>({...p, services:p.services.filter((_,idx)=>idx!==i)}))
  const updateService = (i, key, val) => setForm(p=>({...p, services:p.services.map((s,idx)=>idx===i?{...s,[key]:val}:s)}))

  const total = (services) => services.reduce((s,sv)=>s+parseFloat(sv.amount||0),0)

  const createInvoice = () => {
    if (!form.employerName || !form.services[0]?.amount) return
    const inv = { ...form, id:Date.now(), number:nextInvoiceNum(), createdAt:new Date().toISOString().split('T')[0], status:'unpaid' }
    update([inv, ...invoices])
    setShowAdd(false)
    setPreview(inv)
  }

  const printInvoice = (inv) => {
    const win = window.open('', '_blank')
    const totalAmt = total(inv.services)
    win.document.write(`
      <!DOCTYPE html><html dir="rtl" lang="ar">
      <head><meta charset="UTF-8"><title>فاتورة ${inv.number}</title>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Cairo',sans-serif; color:#111; background:#fff; padding:40px; }
        .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #1B3A6B; padding-bottom:20px; margin-bottom:25px; }
        .logo-section h1 { font-size:22px; font-weight:900; color:#1B3A6B; }
        .logo-section p { font-size:11px; color:#666; margin-top:3px; }
        .inv-info { text-align:left; }
        .inv-info .num { font-size:18px; font-weight:700; color:#C9A227; }
        .inv-info .date { font-size:12px; color:#666; margin-top:4px; }
        .section { margin-bottom:20px; }
        .section h3 { font-size:13px; font-weight:700; color:#1B3A6B; border-bottom:1px solid #eee; padding-bottom:6px; margin-bottom:10px; }
        .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
        .info-item { font-size:12px; }
        .info-item span { color:#666; }
        table { width:100%; border-collapse:collapse; margin-top:10px; }
        th { background:#1B3A6B; color:white; padding:10px; font-size:12px; text-align:right; }
        td { padding:10px; font-size:12px; border-bottom:1px solid #f0f0f0; }
        tr:nth-child(even) td { background:#f9f9f9; }
        .total-row td { font-weight:700; font-size:14px; background:#f0f4ff; border-top:2px solid #1B3A6B; }
        .gold { color:#C9A227; }
        .footer { margin-top:30px; padding-top:15px; border-top:2px solid #C9A227; text-align:center; font-size:11px; color:#666; }
        .stamp { width:100px; height:100px; border:3px solid #1B3A6B; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:20px auto; color:#1B3A6B; font-size:11px; font-weight:700; text-align:center; }
        @media print { body { padding:20px; } }
      </style></head><body>
      <div class="header">
        <div class="logo-section">
          <h1>بيرق العرب</h1>
          <p>BAYRAK ELARAB — للتوظيف بالخارج</p>
          <p style="margin-top:8px;font-size:11px;color:#555">${COMPANY_INFO.address}</p>
          <p style="font-size:11px;color:#555">${COMPANY_INFO.phone}</p>
          <p style="font-size:11px;color:#555">${COMPANY_INFO.email}</p>
        </div>
        <div class="inv-info">
          <div class="num">${inv.number}</div>
          <div class="date">تاريخ: ${inv.date}</div>
        </div>
      </div>
      <div class="section">
        <h3>معلومات العميل</h3>
        <div style="font-size:14px;font-weight:600">${inv.employerName}</div>
      </div>
      <div class="section">
        <h3>تفاصيل الخدمات</h3>
        <table>
          <tr><th>الخدمة</th><th style="width:120px;text-align:center">المبلغ</th></tr>
          ${inv.services.map(s=>`<tr><td>${s.desc}</td><td style="text-align:center">${parseFloat(s.amount||0).toLocaleString()} ${s.currency}</td></tr>`).join('')}
          <tr class="total-row"><td>المجموع الإجمالي</td><td style="text-align:center" class="gold">${totalAmt.toLocaleString()} ${inv.services[0]?.currency||'TND'}</td></tr>
        </table>
      </div>
      ${inv.notes?`<div class="section"><h3>ملاحظات</h3><p style="font-size:12px;color:#555">${inv.notes}</p></div>`:''}
      <div class="stamp">بيرق<br>العرب<br>✓</div>
      <div class="footer">
        <p>شكراً لتعاملكم مع بيرق العرب للتوظيف بالخارج</p>
        <p style="margin-top:4px">${COMPANY_INFO.phone} — ${COMPANY_INFO.email}</p>
      </div>
      </body></html>
    `)
    win.document.close()
    setTimeout(() => win.print(), 500)
  }

  const empNames = [...new Set(employers.map(e=>e.name))]

  return (
    <div className="animate-fade-in space-y-5 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white mb-0.5">الفواتير 🧾</h1>
          <p className="text-gray-400 text-sm">{invoices.length} فاتورة • {invoices.filter(i=>i.status==='paid').length} مدفوعة</p>
        </div>
        <button onClick={()=>setShowAdd(!showAdd)}
          className="btn-primary px-4 py-2.5 rounded-xl text-sm text-white font-semibold flex items-center gap-2">
          ➕ فاتورة جديدة
        </button>
      </div>

      {/* نموذج الإضافة */}
      {showAdd && (
        <div className="glass rounded-2xl p-5 border border-white/10 space-y-4 animate-slide-up">
          <div className="text-sm font-semibold text-gray-200">➕ فاتورة جديدة — {nextInvoiceNum()}</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-gray-500 block mb-1">اسم العميل / الشركة</label>
              <input value={form.employerName} onChange={e=>setForm(p=>({...p,employerName:e.target.value}))}
                list="emp-list" placeholder="اسم الشركة أو المشغّل"
                className="input-dark w-full px-3 py-2.5 rounded-xl text-sm" />
              <datalist id="emp-list">{empNames.map(n=><option key={n} value={n}/>)}</datalist>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">التاريخ</label>
              <input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}
                className="input-dark w-full px-3 py-2.5 rounded-xl text-sm" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-500">الخدمات</label>
              <button onClick={addService} className="text-xs text-blue-400 hover:underline">+ إضافة خدمة</button>
            </div>
            {form.services.map((s,i)=>(
              <div key={i} className="flex gap-2">
                <input value={s.desc} onChange={e=>updateService(i,'desc',e.target.value)}
                  placeholder="وصف الخدمة" className="input-dark flex-1 px-3 py-2 rounded-xl text-sm" />
                <input type="number" value={s.amount} onChange={e=>updateService(i,'amount',e.target.value)}
                  placeholder="المبلغ" className="input-dark w-28 px-3 py-2 rounded-xl text-sm" />
                <select value={s.currency} onChange={e=>updateService(i,'currency',e.target.value)}
                  className="input-dark w-20 px-2 py-2 rounded-xl text-xs">
                  {['TND','SAR','AED','EUR','USD'].map(c=><option key={c}>{c}</option>)}
                </select>
                {form.services.length>1&&<button onClick={()=>removeService(i)} className="text-red-400 hover:text-red-300 px-1">✕</button>}
              </div>
            ))}
            <div className="text-sm font-bold text-amber-400 text-left">
              المجموع: {total(form.services).toLocaleString()} {form.services[0]?.currency}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">ملاحظات</label>
            <input value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}
              placeholder="..." className="input-dark w-full px-3 py-2.5 rounded-xl text-sm" />
          </div>

          <div className="flex gap-2">
            <button onClick={createInvoice} disabled={!form.employerName||!form.services[0]?.amount}
              className="btn-primary flex-1 py-2.5 rounded-xl text-sm text-white font-semibold disabled:opacity-40">
              💾 إنشاء الفاتورة
            </button>
            <button onClick={()=>setShowAdd(false)}
              className="px-4 border border-white/10 rounded-xl text-sm text-gray-400">إلغاء</button>
          </div>
        </div>
      )}

      {/* قائمة الفواتير */}
      <div className="space-y-3">
        {invoices.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-4xl mb-3">🧾</div>
            <div>لا توجد فواتير بعد</div>
          </div>
        ) : invoices.map(inv => (
          <div key={inv.id} className="glass rounded-2xl p-4 border border-white/5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold text-xs flex-shrink-0">
                  🧾
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{inv.number}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${inv.status==='paid'?'bg-emerald-500/20 text-emerald-300 border-emerald-500/30':'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
                      {inv.status==='paid'?'✅ مدفوعة':'⏳ غير مدفوعة'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{inv.employerName} • {inv.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-amber-400">
                  {total(inv.services).toLocaleString()} {inv.services[0]?.currency}
                </span>
                <div className="flex gap-1.5">
                  <button onClick={()=>update(invoices.map(i=>i.id===inv.id?{...i,status:i.status==='paid'?'unpaid':'paid'}:i))}
                    className="text-xs px-2.5 py-1.5 border border-white/10 rounded-lg text-gray-400 hover:bg-white/5">
                    {inv.status==='paid'?'↩ إلغاء':'✅ دفع'}
                  </button>
                  <button onClick={()=>printInvoice(inv)}
                    className="text-xs px-2.5 py-1.5 btn-primary rounded-lg text-white">
                    🖨️ طباعة
                  </button>
                  <button onClick={()=>update(invoices.filter(i=>i.id!==inv.id))}
                    className="text-gray-600 hover:text-red-400 px-2">🗑</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

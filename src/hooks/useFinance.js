import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseEnabled } from '../lib/supabase'

const KEY = 'bayraq_finance'

export const INCOME_TYPES = [
  { key:'file_prep',   label:'إعداد الملف',      icon:'📁', from:'candidate', color:'blue' },
  { key:'admin_fees',  label:'رسوم إدارية',       icon:'🏛️', from:'candidate', color:'purple' },
  { key:'visa_fees',   label:'رسوم التأشيرة',     icon:'🛂', from:'candidate', color:'cyan' },
  { key:'travel_fees', label:'عمولة السفر',        icon:'✈️', from:'candidate', color:'amber' },
  { key:'recruitment', label:'معلم الاستقدام',    icon:'💼', from:'employer',  color:'emerald' },
  { key:'other',       label:'أخرى',              icon:'➕', from:'both',      color:'gray' },
]

export const CURRENCIES = [
  { key:'TND', label:'د.ت', name:'دينار تونسي', rate:1 },
  { key:'SAR', label:'ر.س', name:'ريال سعودي',  rate:0.84 },
  { key:'AED', label:'د.إ', name:'درهم إماراتي',rate:0.83 },
  { key:'QAR', label:'ر.ق', name:'ريال قطري',   rate:0.83 },
  { key:'KWD', label:'د.ك', name:'دينار كويتي', rate:9.9 },
  { key:'EUR', label:'€',   name:'يورو',         rate:3.35 },
  { key:'USD', label:'$',   name:'دولار',        rate:3.10 },
]

const mapRow = (r) => ({ id:r.id, type:r.type, candidateName:r.candidate_name, jobTitle:r.job_title, company:r.company, country:r.country, amount:r.amount, currency:r.currency, paid:r.paid, notes:r.notes, date:r.date })

const sample = [
  { id:1, type:'file_prep', candidateName:'أحمد محمد العلي', jobTitle:'مهندس', company:'ديجيتك', country:'الإمارات', amount:150, currency:'TND', paid:true, date:'2025-05-10', notes:'' },
  { id:2, type:'recruitment', candidateName:'أحمد محمد العلي', jobTitle:'مهندس', company:'ديجيتك', country:'الإمارات', amount:1500, currency:'AED', paid:false, date:'2025-05-22', notes:'' },
]

export function useFinance() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const loadFromLocal = () => {
    try { const s = localStorage.getItem(KEY); setTransactions(s ? JSON.parse(s) : sample) } catch { setTransactions(sample) }
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    if (isSupabaseEnabled) {
      try {
        const { data, error } = await supabase.from('transactions').select('*').order('created_at', { ascending: false })
        if (error) throw error
        setTransactions(data.map(mapRow))
      } catch { loadFromLocal() }
    } else { loadFromLocal() }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
    if (!isSupabaseEnabled) return

    const channel = supabase
      .channel('transactions-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' },
        (payload) => setTransactions(prev => prev.find(t=>t.id===payload.new.id) ? prev : [mapRow(payload.new), ...prev])
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'transactions' },
        (payload) => setTransactions(prev => prev.map(t => t.id===payload.new.id ? mapRow(payload.new) : t))
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'transactions' },
        (payload) => setTransactions(prev => prev.filter(t => t.id!==payload.old.id))
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [loadData])

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(transactions)) } catch {} }, [transactions])

  const addTransaction = async (t) => {
    const newT = { ...t, date: t.date || new Date().toISOString().split('T')[0] }
    if (isSupabaseEnabled) {
      try {
        const { data, error } = await supabase.from('transactions').insert([{ type:newT.type, candidate_name:newT.candidateName, job_title:newT.jobTitle, company:newT.company, country:newT.country, amount:newT.amount, currency:newT.currency, paid:newT.paid||false, notes:newT.notes||'', date:newT.date }]).select().single()
        if (error) throw error
        return data
      } catch(err) { console.error(err) }
    }
    const local = { ...newT, id:Date.now() }; setTransactions(p=>[local,...p]); return local
  }

  const togglePaid = async (id) => {
    const t = transactions.find(t=>t.id===id); if (!t) return
    if (isSupabaseEnabled) try { await supabase.from('transactions').update({ paid:!t.paid }).eq('id',id) } catch(err) { console.error(err) }
    else setTransactions(p=>p.map(t=>t.id===id?{...t,paid:!t.paid}:t))
  }

  const deleteTransaction = async (id) => {
    if (isSupabaseEnabled) try { await supabase.from('transactions').delete().eq('id',id) } catch(err) { console.error(err) }
    else setTransactions(p=>p.filter(t=>t.id!==id))
  }

  const toTND = (amount, currency) => { const c = CURRENCIES.find(c=>c.key===currency); return amount*(c?.rate||1) }

  const stats = {
    totalTND: transactions.filter(t=>t.paid).reduce((s,t)=>s+toTND(t.amount,t.currency),0),
    pendingTND: transactions.filter(t=>!t.paid).reduce((s,t)=>s+toTND(t.amount,t.currency),0),
    fromCandidates: transactions.filter(t=>t.paid&&INCOME_TYPES.find(i=>i.key===t.type)?.from==='candidate').reduce((s,t)=>s+toTND(t.amount,t.currency),0),
    fromEmployers: transactions.filter(t=>t.paid&&INCOME_TYPES.find(i=>i.key===t.type)?.from==='employer').reduce((s,t)=>s+toTND(t.amount,t.currency),0),
    count: transactions.length,
    paidCount: transactions.filter(t=>t.paid).length,
    byType: Object.fromEntries(INCOME_TYPES.map(i=>[i.key,{ total:transactions.filter(t=>t.type===i.key).reduce((s,t)=>s+toTND(t.amount,t.currency),0), paid:transactions.filter(t=>t.type===i.key&&t.paid).reduce((s,t)=>s+toTND(t.amount,t.currency),0), count:transactions.filter(t=>t.type===i.key).length }]))
  }

  return { transactions, loading, addTransaction, togglePaid, deleteTransaction, stats, toTND, reload:loadData }
}

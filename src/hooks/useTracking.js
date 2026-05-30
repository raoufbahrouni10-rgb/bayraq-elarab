import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseEnabled } from '../lib/supabase'

const KEY = 'bayraq_tracking'
const sample = [
  { id:1, candidateName:'أحمد محمد العلي', jobTitle:'مهندس برمجيات', company:'ديجيتك', country:'الإمارات', stage:'interview', date:'2025-05-20', notes:'مقابلة ناجحة', history:[{stage:'selected',date:'2025-05-10',note:''}] },
  { id:2, candidateName:'فاطمة الزهراء', jobTitle:'ممرضة', company:'مستشفى الأمل', country:'السعودية', stage:'contract', date:'2025-05-22', notes:'توقيع العقد', history:[{stage:'selected',date:'2025-05-05',note:''}] },
]

const mapRow = (r) => ({ id:r.id, candidateName:r.candidate_name, jobTitle:r.job_title, company:r.company, country:r.country, stage:r.stage, notes:r.notes, history:r.history||[], date:r.date })

export function useTracking() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  const loadFromLocal = () => {
    try { const s = localStorage.getItem(KEY); setApplications(s ? JSON.parse(s) : sample) } catch { setApplications(sample) }
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    if (isSupabaseEnabled) {
      try {
        const { data, error } = await supabase.from('applications').select('*').order('created_at', { ascending: false })
        if (error) throw error
        setApplications(data.map(mapRow))
      } catch { loadFromLocal() }
    } else { loadFromLocal() }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
    if (!isSupabaseEnabled) return

    const channel = supabase
      .channel('applications-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'applications' },
        (payload) => setApplications(prev => prev.find(a=>a.id===payload.new.id) ? prev : [mapRow(payload.new), ...prev])
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'applications' },
        (payload) => setApplications(prev => prev.map(a => a.id===payload.new.id ? mapRow(payload.new) : a))
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'applications' },
        (payload) => setApplications(prev => prev.filter(a => a.id!==payload.old.id))
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [loadData])

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(applications)) } catch {} }, [applications])

  const addApplication = async (app) => {
    const newApp = { ...app, date:new Date().toISOString().split('T')[0], stage:'selected', history:[{stage:'selected',date:new Date().toISOString().split('T')[0],note:''}] }
    if (isSupabaseEnabled) {
      try {
        const { data, error } = await supabase.from('applications').insert([{ candidate_name:newApp.candidateName, job_title:newApp.jobTitle, company:newApp.company, country:newApp.country, stage:newApp.stage, notes:newApp.notes||'', history:newApp.history, date:newApp.date }]).select().single()
        if (error) throw error
        return data
      } catch(err) { console.error(err) }
    }
    const local = { ...newApp, id:Date.now() }; setApplications(p=>[local,...p]); return local
  }

  const updateStage = async (id, stage, note='') => {
    const app = applications.find(a=>a.id===id); if (!app) return
    const newHistory = [...(app.history||[]), { stage, date:new Date().toISOString().split('T')[0], note }]
    if (isSupabaseEnabled) {
      try { await supabase.from('applications').update({ stage, notes:note||app.notes, history:newHistory }).eq('id',id) } catch(err) { console.error(err) }
    } else {
      setApplications(p => p.map(a => a.id===id ? {...a, stage, history:newHistory} : a))
    }
  }

  const deleteApplication = async (id) => {
    if (isSupabaseEnabled) try { await supabase.from('applications').delete().eq('id',id) } catch(err) { console.error(err) }
    else setApplications(p=>p.filter(a=>a.id!==id))
  }

  const stats = {
    total: applications.length,
    byStage: { selected:applications.filter(a=>a.stage==='selected').length, interview:applications.filter(a=>a.stage==='interview').length, contract:applications.filter(a=>a.stage==='contract').length, travel:applications.filter(a=>a.stage==='travel').length, hired:applications.filter(a=>a.stage==='hired').length, rejected:applications.filter(a=>a.stage==='rejected').length }
  }

  return { applications, loading, addApplication, updateStage, deleteApplication, stats, reload:loadData }
}

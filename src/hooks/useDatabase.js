import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseEnabled } from '../lib/supabase'

const KEY = 'bayraq_v2_db'

const sample = [
  { id:1, name:'أحمد محمد العلي', spec:'هندسة برمجيات', age:28, exp:5, skills:'React, Node.js', date:'2025-03-10', source:'local', city:'تونس العاصمة', notes:'', file_url:null, file_name:null },
  { id:2, name:'فاطمة الزهراء', spec:'تصميم جرافيك', age:24, exp:2, skills:'Figma', date:'2025-04-02', source:'local', city:'صفاقس', notes:'', file_url:null, file_name:null },
  { id:3, name:'محمد خالد سعد', spec:'محاسبة', age:35, exp:10, skills:'Excel, SAP', date:'2025-04-15', source:'aneti', city:'سوسة', notes:'', file_url:null, file_name:null },
]

const mapRow = (r) => ({ id:r.id, name:r.name, spec:r.spec, age:r.age, exp:r.exp, city:r.city, skills:r.skills, source:r.source, notes:r.notes, date:r.date, file_url:r.file_url||null, file_name:r.file_name||null })

export function useDatabase() {
  const [db, setDb] = useState([])
  const [loading, setLoading] = useState(true)
  const [synced, setSynced] = useState(false)

  const loadFromLocal = () => {
    try { const s = localStorage.getItem(KEY); setDb(s ? JSON.parse(s) : sample) } catch { setDb(sample) }
    setSynced(false)
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    if (isSupabaseEnabled) {
      try {
        const { data, error } = await supabase.from('cvs').select('*').order('created_at', { ascending: false })
        if (error) throw error
        setDb(data.map(mapRow))
        setSynced(true)
      } catch { loadFromLocal() }
    } else { loadFromLocal() }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()

    // ===== Real-time: مراقبة التغييرات الفورية =====
    if (!isSupabaseEnabled) return

    const channel = supabase
      .channel('cvs-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'cvs' },
        (payload) => {
          setDb(prev => {
            if (prev.find(c => c.id === payload.new.id)) return prev
            return [mapRow(payload.new), ...prev]
          })
        }
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'cvs' },
        (payload) => {
          setDb(prev => prev.filter(c => c.id !== payload.old.id))
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'cvs' },
        (payload) => {
          setDb(prev => prev.map(c => c.id === payload.new.id ? mapRow(payload.new) : c))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [loadData])

  useEffect(() => { if (db.length > 0) try { localStorage.setItem(KEY, JSON.stringify(db)) } catch {} }, [db])

  const uploadFile = async (file, candidateName) => {
    if (!isSupabaseEnabled) return { url: null, name: file.name }
    try {
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}_${candidateName.replace(/\s+/g,'_')}.${ext}`
      const { error } = await supabase.storage.from('cvs-files').upload(fileName, file, { cacheControl:'3600', upsert:false })
      if (error) throw error
      const { data: urlData } = supabase.storage.from('cvs-files').getPublicUrl(fileName)
      return { url: urlData.publicUrl, name: file.name }
    } catch(err) { console.warn('File upload error:', err.message); return { url:null, name:file.name } }
  }

  const addCV = async (cv, file = null) => {
    const newCV = { ...cv, date: new Date().toISOString().split('T')[0], file_url:null, file_name:null }
    if (file && isSupabaseEnabled) {
      const { url, name } = await uploadFile(file, cv.name)
      newCV.file_url = url; newCV.file_name = name
    } else if (file) { newCV.file_name = file.name }

    if (isSupabaseEnabled) {
      try {
        const { data, error } = await supabase.from('cvs').insert([{
          name:newCV.name, spec:newCV.spec, age:newCV.age||null, exp:newCV.exp||0,
          city:newCV.city, skills:newCV.skills, source:newCV.source||'local',
          notes:newCV.notes||'', date:newCV.date, file_url:newCV.file_url, file_name:newCV.file_name
        }]).select().single()
        if (error) throw error
        // Real-time سيضيفها تلقائياً
        return data
      } catch(err) { console.error(err) }
    }
    const local = { ...newCV, id: Date.now() }
    setDb(p => [local, ...p])
    return local
  }

  const deleteCV = async (id) => {
    const cv = db.find(c => c.id === id)
    if (cv?.file_url && isSupabaseEnabled) {
      try { const fn = cv.file_url.split('/').pop(); await supabase.storage.from('cvs-files').remove([fn]) } catch {}
    }
    if (isSupabaseEnabled) try { await supabase.from('cvs').delete().eq('id', id) } catch {}
    else setDb(p => p.filter(c => c.id !== id))
  }

  const stats = {
    total: db.length,
    specs: new Set(db.map(c=>c.spec)).size,
    avgExp: db.length ? Math.round(db.reduce((s,c)=>s+c.exp,0)/db.length) : 0,
    thisMonth: db.filter(c=>{ const d=new Date(c.date),n=new Date(); return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear() }).length,
    bySource: { local:db.filter(c=>c.source==='local').length, aneti:db.filter(c=>c.source==='aneti').length, linkedin:db.filter(c=>c.source==='linkedin').length, web:db.filter(c=>c.source==='web').length }
  }

  return { db, loading, synced, addCV, deleteCV, stats, reload: loadData }
}

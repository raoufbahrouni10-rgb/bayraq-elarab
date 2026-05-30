import { useState, useEffect } from 'react'

const KEY_EMPLOYERS = 'bayraq_employers'
const KEY_JOBS = 'bayraq_jobs'

const sampleEmployers = [
  { id:1, name:'مجموعة صيدال الطبية', sector:'صحة', city:'تونس العاصمة', contact:'contact@saidal.tn', phone:'71 000 001', size:'كبيرة', notes:'' },
  { id:2, name:'مدرسة المستقبل الخاصة', sector:'تعليم', city:'صفاقس', contact:'info@moustakbal.tn', phone:'74 000 002', size:'متوسطة', notes:'' },
  { id:3, name:'شركة ديجيتك للبرمجيات', sector:'تكنولوجيا', city:'تونس العاصمة', contact:'rh@digitech.tn', phone:'71 000 003', size:'صغيرة', notes:'' },
]

const sampleJobs = [
  {
    id:1, employerId:1, title:'ممرضة معتمدة', spec:'تمريض',
    city:'تونس العاصمة', type:'دوام كامل', salary:'1200-1500 د.ت',
    expMin:2, expMax:10, ageMin:22, ageMax:40,
    skills:'تمريض، إسعافات أولية، رعاية مرضى',
    description:'نبحث عن ممرضة معتمدة للعمل في عيادة متخصصة.',
    requirements:'شهادة تمريض، خبرة لا تقل عن سنتين، إجادة اللغة الفرنسية',
    deadline:'2025-08-01', active:true, date:'2025-05-20', matches:[]
  },
  {
    id:2, employerId:2, title:'مدرب تكوين مهني', spec:'تدريب',
    city:'صفاقس', type:'دوام كامل', salary:'900-1200 د.ت',
    expMin:3, expMax:15, ageMin:25, ageMax:50,
    skills:'تدريب، تواصل، إعداد محتوى تعليمي',
    description:'نبحث عن مدرب متخصص في التكوين المهني.',
    requirements:'شهادة عليا في مجال التخصص، خبرة في التدريس أو التدريب',
    deadline:'2025-07-15', active:true, date:'2025-05-18', matches:[]
  },
  {
    id:3, employerId:3, title:'مطور واجهات أمامية', spec:'هندسة برمجيات',
    city:'تونس العاصمة', type:'عمل عن بعد', salary:'1500-2500 د.ت',
    expMin:2, expMax:8, ageMin:20, ageMax:35,
    skills:'React, JavaScript, CSS, Git',
    description:'نبحث عن مطور Frontend لتطوير تطبيقات ويب حديثة.',
    requirements:'إتقان React وJavaScript، portfolio متميز',
    deadline:'2025-06-30', active:true, date:'2025-05-22', matches:[]
  },
]

export function useEmployers() {
  const [employers, setEmployers] = useState(() => {
    try { const s = localStorage.getItem(KEY_EMPLOYERS); return s ? JSON.parse(s) : sampleEmployers } catch { return sampleEmployers }
  })
  const [jobs, setJobs] = useState(() => {
    try { const s = localStorage.getItem(KEY_JOBS); return s ? JSON.parse(s) : sampleJobs } catch { return sampleJobs }
  })

  useEffect(() => { try { localStorage.setItem(KEY_EMPLOYERS, JSON.stringify(employers)) } catch {} }, [employers])
  useEffect(() => { try { localStorage.setItem(KEY_JOBS, JSON.stringify(jobs)) } catch {} }, [jobs])

  const addEmployer = (e) => {
    const n = { ...e, id: Date.now() }
    setEmployers(p => [...p, n]); return n
  }
  const deleteEmployer = (id) => {
    setEmployers(p => p.filter(e => e.id !== id))
    setJobs(p => p.filter(j => j.employerId !== id))
  }

  const addJob = (j) => {
    const n = { ...j, id: Date.now(), date: new Date().toISOString().split('T')[0], matches: [] }
    setJobs(p => [...p, n]); return n
  }
  const updateJob = (id, data) => setJobs(p => p.map(j => j.id === id ? { ...j, ...data } : j))
  const deleteJob = (id) => setJobs(p => p.filter(j => j.id !== id))

  const getEmployer = (id) => employers.find(e => e.id === id)
  const getJobsByEmployer = (id) => jobs.filter(j => j.employerId === id)

  return { employers, jobs, addEmployer, deleteEmployer, addJob, updateJob, deleteJob, getEmployer, getJobsByEmployer }
}

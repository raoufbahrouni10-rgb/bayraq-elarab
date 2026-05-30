import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseEnabled } from '../lib/supabase'

const KEY_USERS   = 'bayraq_users'
const KEY_SESSION = 'bayraq_session'

export const SUPER_ADMIN = {
  id: 0, name: 'رؤوف بحروني', username: 'raouf',
  password: 'RaoufBayraq2025@', role: 'super_admin',
  active: true, createdAt: '2025-01-01', locked: true,
}

export const ROLES = {
  super_admin: {
    label:'مصمم البرنامج', icon:'⭐', color:'yellow',
    permissions:['all','super','dashboard','database','employers','gulf',
      'tracking','calendar','messages','finance','contracts','reports',
      'cvtools','upload','import','wareg','smartmatch','visa','invoices',
      'search','export','activity','users','globalsearch','themes',
      'advdash','bulkwa','reminders','archive'],
    canEdit: true, canDelete: true, canChangeUsers: true,
  },
  admin: {
    label:'مدير عام', icon:'👑', color:'amber',
    permissions:['all','dashboard','database','employers','gulf','tracking',
      'calendar','messages','finance','contracts','reports','cvtools',
      'upload','import','wareg','smartmatch','visa','invoices','search',
      'export','activity','globalsearch','themes','advdash','bulkwa',
      'reminders','archive'],
    canEdit: true, canDelete: false, canChangeUsers: false,
  },
staff: {
    label:'موظف', icon:'👤', color:'blue',
    permissions:[
      'dashboard','advdash','stats','tvmode','globalsearch','themes','reminders',
      'database','employers','gulf','tracking','calendar','messages','wareg',
      'smartmatch','search','upload','import','bulkwa','cvtools',
      'visa','archive','export','activity','status','compare','filehistory',
      'interviews','cards','ratings','company','qrcodes','backup','intmessages',
      'finance','contracts','invoices','reports','fees','incomecomp',
      'profile',
    ],
    canEdit: true, canDelete: false, canChangeUsers: false,
    isObserver: false,
    noDeleteFinance: true,
  },
  finance_manager: {
    label:'مدير مالي ✦', icon:'💳', color:'teal',
    permissions:[
      'dashboard','advdash','stats','tvmode','globalsearch','themes','reminders',
      'finance','contracts','invoices','reports','fees','incomecomp',
      'profile','intmessages','activity','company','qrcodes',
    ],
    canEdit: true, canDelete: false, canChangeUsers: false,
    isObserver: false,
  },
  staff: {
    label:'موظف', icon:'👤', color:'blue',
    permissions:[
      'dashboard','advdash','stats','tvmode','globalsearch','themes','reminders',
      'database','employers','gulf','tracking','calendar','messages','wareg',
      'smartmatch','search','upload','import','bulkwa','cvtools',
      'visa','archive','export','activity','status','compare','filehistory',
      'interviews','cards','ratings','company','qrcodes','backup','intmessages',
      'finance','contracts','invoices','reports','fees','incomecomp',
      'profile',
    ],
    canEdit: true, canDelete: false, canChangeUsers: false,
    isObserver: false,
  },
}

const DEFAULT_USERS = [
  SUPER_ADMIN,
  { id:1, name:'Aymen Rachdi',  username:'admin',   password:'admin123',   role:'admin',   active:true, createdAt:'2025-01-01' },
  { id:2, name:'Akrem Rachdi',  username:'finance', password:'finance123', role:'finance_manager', active:true, createdAt:'2025-01-01' },
  { id:3, name:'Chyma Zitouni', username:'staff',   password:'staff123',   role:'staff',   active:true, createdAt:'2025-01-01' },
]

function ensureDefaultUsers() {
  try {
    const stored = localStorage.getItem(KEY_USERS)
    if (!stored) { localStorage.setItem(KEY_USERS, JSON.stringify(DEFAULT_USERS)); return DEFAULT_USERS }
    const parsed = JSON.parse(stored)
    if (!parsed || parsed.length === 0) { localStorage.setItem(KEY_USERS, JSON.stringify(DEFAULT_USERS)); return DEFAULT_USERS }
    if (!parsed.find(u => u.username === 'raouf')) {
      const withSuper = [SUPER_ADMIN, ...parsed]
      localStorage.setItem(KEY_USERS, JSON.stringify(withSuper))
      return withSuper
    }
    return parsed
  } catch { return DEFAULT_USERS }
}

export function useUsers() {
  const [users, setUsers] = useState(() => ensureDefaultUsers())
  const [currentUser, setCurrentUser] = useState(() => {
    try { const s = localStorage.getItem(KEY_SESSION); return s ? JSON.parse(s) : null } catch { return null }
  })

  const loadUsers = useCallback(async () => {
    if (!isSupabaseEnabled) return
    try {
      const { data, error } = await supabase.from('users').select('*').order('id')
      if (error) throw error
      if (data && data.length > 0) {
        const mapped = data.map(r => ({ id:r.id, name:r.name, username:r.username, password:r.password, role:r.role, active:r.active, createdAt:r.created_at }))
        if (!mapped.find(u => u.username === 'raouf')) mapped.unshift(SUPER_ADMIN)
        setUsers(mapped)
        localStorage.setItem(KEY_USERS, JSON.stringify(mapped))
      }
    } catch(err) { console.warn('useUsers load error:', err.message) }
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])
  useEffect(() => {
    if (users.length > 0) try { localStorage.setItem(KEY_USERS, JSON.stringify(users)) } catch {}
  }, [users])

  const login = async (username, password) => {
    if (username === SUPER_ADMIN.username && password === SUPER_ADMIN.password) {
      const session = { id:0, name:SUPER_ADMIN.name, username:SUPER_ADMIN.username, role:'super_admin', loginAt:new Date().toISOString() }
      setCurrentUser(session); localStorage.setItem(KEY_SESSION, JSON.stringify(session))
      return { success:true, user:session }
    }
    const localUsers = ensureDefaultUsers()
    // يقبل الاسم الكامل أو اسم المستخدم
    const localUser = localUsers.find(u => 
      (u.username===username || u.name===username || u.name.toLowerCase()===username.toLowerCase()) 
      && u.password===password && u.active!==false && u.role!=='super_admin')
    if (localUser) {
      const session = { id:localUser.id, name:localUser.name, username:localUser.username, role:localUser.role, loginAt:new Date().toISOString() }
      setCurrentUser(session); localStorage.setItem(KEY_SESSION, JSON.stringify(session))
      return { success:true, user:session }
    }
    if (isSupabaseEnabled) {
      try {
        const { data, error } = await supabase.from('users').select('*').eq('username',username).eq('active',true).single()
        if (!error && data && data.password===password) {
          const session = { id:data.id, name:data.name, username:data.username, role:data.role, loginAt:new Date().toISOString() }
          setCurrentUser(session); localStorage.setItem(KEY_SESSION, JSON.stringify(session))
          return { success:true, user:session }
        }
      } catch {}
    }
    return { success:false, error:'اسم المستخدم أو كلمة المرور غير صحيحة' }
  }

  const logout = () => { setCurrentUser(null); localStorage.removeItem(KEY_SESSION) }

  // تغيير كلمة المرور أو اسم المستخدم لحسابه الشخصي
  // تغيير كلمة المرور من داخل المنصة
  const changePassword = async (oldPassword, newPassword) => {
    if (!currentUser) return { success:false, error:'غير مسجّل' }
    if (currentUser.username === 'raouf') return { success:false, error:'لا يمكن تغيير كلمة مرور المصمم' }
    const stored = ensureDefaultUsers()
    const user = stored.find(u => u.id === currentUser.id)
    if (!user || user.password !== oldPassword) return { success:false, error:'كلمة المرور الحالية غير صحيحة' }
    if (newPassword.length < 6) return { success:false, error:'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }
    if (isSupabaseEnabled) {
      try { await supabase.from('users').update({password: newPassword}).eq('id', currentUser.id) } catch {}
    }
    setUsers(p => p.map(u => u.id===currentUser.id ? {...u, password:newPassword} : u))
    return { success:true }
  }

  const updateOwnProfile = async (newUsername, newPassword) => {
    if (!currentUser) return { success:false, error:'غير مسجّل' }
    if (currentUser.username === 'raouf') return { success:false, error:'لا يمكن تغيير بيانات المصمم' }
    const updated = { username: newUsername || currentUser.username, password: newPassword }
    if (isSupabaseEnabled) {
      try { await supabase.from('users').update(updated).eq('id', currentUser.id) } catch {}
    }
    setUsers(p => p.map(u => u.id===currentUser.id ? {...u, ...updated} : u))
    const newSession = { ...currentUser, username: updated.username }
    setCurrentUser(newSession)
    localStorage.setItem(KEY_SESSION, JSON.stringify(newSession))
    return { success:true }
  }

  // إضافة مستخدم — حصري للمصمم فقط
  const addUser = async (u) => {
    if (currentUser?.role !== 'super_admin') return null
    const newU = { ...u, id:Date.now(), createdAt:new Date().toISOString().split('T')[0], active:true }
    if (isSupabaseEnabled) {
      try {
        const { data, error } = await supabase.from('users').insert([{ name:u.name, username:u.username, password:u.password, role:u.role, active:true }]).select().single()
        if (!error && data) newU.id = data.id
      } catch(err) { console.warn(err.message) }
    }
    setUsers(p => [...p, newU]); return newU
  }

  // تعديل مستخدم — المصمم فقط يعدّل الكل، الباقي يعدّل نفسه فقط
  const updateUser = async (id, data) => {
    const target = users.find(u=>u.id===id)
    if (target?.username === 'raouf' && currentUser?.username !== 'raouf') return
    if (currentUser?.role !== 'super_admin' && id !== currentUser?.id) return
    if (isSupabaseEnabled) try { await supabase.from('users').update(data).eq('id',id) } catch {}
    setUsers(p => p.map(u => u.id===id ? {...u,...data} : u))
  }

  // حذف مستخدم — حصري للمصمم فقط
  const deleteUser = async (id) => {
    if (currentUser?.role !== 'super_admin') return
    const target = users.find(u=>u.id===id)
    if (target?.username === 'raouf') return
    if (isSupabaseEnabled) try { await supabase.from('users').delete().eq('id',id) } catch {}
    setUsers(p => p.filter(u => u.id!==id))
  }

  const canAccess = (tab) => {
    if (!currentUser) return false
    const role = ROLES[currentUser.role]
    if (!role) return false
    return role.permissions.includes('all') || role.permissions.includes(tab)
  }

  const canEdit    = () => ROLES[currentUser?.role]?.canEdit ?? false
  const canDelete  = () => ROLES[currentUser?.role]?.canDelete ?? false
  const isObserver = () => ROLES[currentUser?.role]?.isObserver ?? false
  const isSuperAdmin = currentUser?.role === 'super_admin'
  const isAdmin      = ['super_admin','admin'].includes(currentUser?.role)

  return { users, currentUser, login, logout, addUser, updateUser, deleteUser, changePassword,
    canAccess, canEdit, canDelete, isObserver, isSuperAdmin, isAdmin,
    updateOwnProfile, reload:loadUsers }
}

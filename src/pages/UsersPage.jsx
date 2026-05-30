import { useState } from 'react'
import { ROLES } from '../hooks/useUsers'

const ROLE_COLORS = {
  super_admin: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  admin:       'bg-amber-500/20 text-amber-300 border-amber-500/30',
  finance:     'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  staff:       'bg-blue-500/20 text-blue-300 border-blue-500/30',

  finance_manager: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
}

export default function UsersPage({ users, currentUser, onAdd, onUpdate, onDelete }) {
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState({ name:'', username:'', password:'', role:'staff' })
  const [error, setError]     = useState('')
  const [saved, setSaved]     = useState(false)

  const isSuperAdmin = currentUser?.role === 'super_admin'

  // فقط المصمم يمكنه إضافة/حذف المستخدمين
  const availableRoles = isSuperAdmin
    ? ['super_admin','admin','finance_manager','staff']
    : []

  const handleSave = () => {
    if (!isSuperAdmin) return
    if (!form.name || !form.username || !form.password) { setError('جميع الحقول مطلوبة'); return }
    if (editing) onUpdate(editing, { name:form.name, username:form.username, password:form.password, role:form.role })
    else onAdd({ name:form.name, username:form.username, password:form.password, role:form.role })
    setForm({ name:'', username:'', password:'', role:'staff' })
    setShowAdd(false); setEditing(null); setError('')
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const startEdit = (u) => {
    if (!isSuperAdmin) return
    if (u.username === 'raouf') return
    setEditing(u.id)
    setForm({ name:u.name, username:u.username, password:u.password, role:u.role })
    setShowAdd(true)
  }

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white mb-0.5">إدارة المستخدمين 👥</h1>
          <p className="text-gray-400 text-sm">{users.length} مستخدم مسجّل</p>
        </div>
        {isSuperAdmin && (
          <button onClick={() => { setShowAdd(!showAdd); setEditing(null); setForm({name:'',username:'',password:'',role:'staff'}) }}
            className="btn-primary px-4 py-2.5 rounded-xl text-sm text-white font-semibold flex items-center gap-2">
            ➕ مستخدم جديد
          </button>
        )}
      </div>

      {!isSuperAdmin && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300 flex items-center gap-2">
          <span>ℹ️</span>
          <span>إدارة المستخدمين حصرية لمصمم البرنامج — يمكنك تغيير بياناتك من <strong>ملفي الشخصي</strong></span>
        </div>
      )}

      {isSuperAdmin && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex items-center gap-3">
          <span className="text-2xl">⭐</span>
          <div>
            <div className="text-sm font-semibold text-yellow-300">صلاحية مصمم البرنامج الحصرية</div>
            <div className="text-xs text-gray-400">أضف وعدّل واحذف أي مستخدم — وحدك تملك هذه الصلاحية</div>
          </div>
        </div>
      )}

      {saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-sm text-emerald-400">✅ تم الحفظ</div>
      )}

      {/* نموذج الإضافة/التعديل */}
      {showAdd && isSuperAdmin && (
        <div className="glass rounded-2xl p-5 border border-white/10 space-y-4 animate-slide-up">
          <div className="text-sm font-semibold text-gray-200">{editing ? '✏️ تعديل مستخدم' : '➕ مستخدم جديد'}</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">الاسم الكامل</label>
              <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}
                placeholder="مثال: محمد علي" className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">اسم الدخول</label>
              <input value={form.username} onChange={e=>setForm(p=>({...p,username:e.target.value}))}
                placeholder="مثال: mohamed" className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">كلمة المرور</label>
              <input value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))}
                placeholder="كلمة مرور قوية" className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">الدور</label>
              <select value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))}
                className="input-dark w-full px-3 py-2.5 rounded-xl text-sm">
                {availableRoles.map(r => (
                  <option key={r} value={r}>{ROLES[r]?.icon} {ROLES[r]?.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* وصف الدور */}
          <div className="text-xs text-gray-500 bg-white/[0.03] rounded-xl p-3 border border-white/5">
            {form.role === 'staff' && '👤 الموظف: يضيف ويعدّل المترشحين والملفات — لا يرى المعلومات المالية'}
        
            {form.role === 'finance_manager' && '💳 مدير مالي: صلاحيات مالية كاملة + إضافة وتعديل فقط'}
            {form.role === 'admin' && '👑 المدير العام: صلاحيات كاملة عدا إدارة المستخدمين'}
            {form.role === 'super_admin' && '⭐ مصمم البرنامج: صلاحيات كاملة وحصرية'}
          </div>

          {error && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">⚠️ {error}</div>}
          <div className="flex gap-2">
            <button onClick={handleSave} className="btn-primary flex-1 py-2.5 rounded-xl text-sm text-white font-semibold">
              💾 {editing ? 'حفظ التعديلات' : 'إضافة المستخدم'}
            </button>
            <button onClick={() => { setShowAdd(false); setEditing(null) }}
              className="px-4 py-2.5 border border-white/10 rounded-xl text-sm text-gray-400 hover:bg-white/5">
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* قائمة المستخدمين */}
      <div className="space-y-3">
        {users.map(u => {
          const role = ROLES[u.role] || ROLES.staff
          const isMe = u.username === currentUser?.username
          const isSuperUser = u.username === 'raouf'
          return (
            <div key={u.id || u.username}
              className={`glass rounded-2xl p-4 border flex items-center gap-4 flex-wrap
                ${isSuperUser ? 'border-yellow-500/20 bg-yellow-500/5' : 'border-white/5'}`}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border ${ROLE_COLORS[u.role]||ROLE_COLORS.staff}`}>
                {role.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white text-sm">{u.name}</span>
                  {isMe && <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">أنت</span>}
                  {isSuperUser && <span className="text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-2 py-0.5 rounded-full">⭐ مصمم</span>}
                  {!u.active && <span className="text-xs bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full">موقوف</span>}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500 font-mono">@{u.username}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${ROLE_COLORS[u.role]||ROLE_COLORS.staff}`}>{role.label}</span>
                </div>
              </div>

              {isSuperAdmin && !isSuperUser && (
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => startEdit(u)}
                    className="text-xs px-3 py-1.5 border border-white/10 text-gray-400 rounded-lg hover:bg-white/5">
                    ✏️ تعديل
                  </button>
                  {u.active !== false ? (
                    <button onClick={() => onUpdate(u.id, { active:false })}
                      className="text-xs px-3 py-1.5 border border-amber-500/30 text-amber-400 rounded-lg hover:bg-amber-500/10">
                      ⏸ إيقاف
                    </button>
                  ) : (
                    <button onClick={() => onUpdate(u.id, { active:true })}
                      className="text-xs px-3 py-1.5 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-500/10">
                      ▶ تفعيل
                    </button>
                  )}
                  {!isMe && (
                    <button onClick={() => onDelete(u.id)}
                      className="text-xs px-3 py-1.5 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10">
                      🗑 حذف
                    </button>
                  )}
                </div>
              )}
              {isSuperUser && <span className="text-xs text-gray-600 px-3 py-1.5">🔒 محمي</span>}
            </div>
          )
        })}
      </div>

      {/* جدول الصلاحيات */}
      <div className="glass rounded-2xl p-5 border border-white/5 space-y-3">
        <div className="text-sm font-semibold text-gray-200">📋 جدول الصلاحيات</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-right py-2 pr-2 text-gray-400 font-medium">الصلاحية</th>
                <th className="text-center py-2 px-1 text-yellow-300 text-xs">⭐<br/>مصمم</th>
                <th className="text-center py-2 px-1 text-amber-300 text-xs">👑<br/>م.عام</th>
                <th className="text-center py-2 px-1 text-teal-300 text-xs">💳<br/>م.مالي</th>
                <th className="text-center py-2 px-1 text-blue-300 text-xs">👤<br/>موظف</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label:'إضافة بيانات',       roles:['super_admin','admin','finance_manager','staff'] },
                { label:'تعديل بيانات',       roles:['super_admin','admin','finance_manager','staff'] },
                { label:'حذف بيانات',         roles:['super_admin'] },
                { label:'الصلاحيات المالية',  roles:['super_admin','admin','finance_manager','staff'] },
                { label:'إدارة المستخدمين',   roles:['super_admin'] },
              ].map(row => (
                <tr key={row.label} className="border-b border-white/[0.03]">
                  <td className="py-2 pr-2 text-gray-400">{row.label}</td>
                  {['super_admin','admin','finance_manager','staff'].map(r => (
                    <td key={r} className="text-center py-2 px-2">
                      {row.roles.includes(r) ? '✅' : '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { getActivityLog, clearActivityLog } from '../lib/security'

const ROLE_COLOR = { admin:'text-amber-400', finance:'text-emerald-400', staff:'text-blue-400' }
const ACTION_ICONS = {
  'تسجيل دخول': '🔐', 'تسجيل خروج': '🚪', 'إضافة سيرة': '📁', 'حذف سيرة': '🗑️',
  'إضافة معاملة': '💰', 'إضافة ملف': '📋', 'تحديث مرحلة': '🔄', 'توليد عقد': '📄',
  'بحث': '🔍', 'تصدير': '📤', 'إضافة مستخدم': '👤', 'تعديل مستخدم': '✏️',
}

export default function ActivityLogPage({ currentUser }) {
  const [logs, setLogs] = useState(() => getActivityLog())
  const [filterUser, setFilterUser] = useState('')
  const [filterDate, setFilterDate] = useState('')

  const users = [...new Set(logs.map(l=>l.username).filter(Boolean))]

  const filtered = logs.filter(l => {
    if (filterUser && l.username !== filterUser) return false
    if (filterDate && !l.date.includes(filterDate)) return false
    return true
  })

  const handleClear = () => {
    clearActivityLog()
    setLogs([])
  }

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white mb-0.5">سجل النشاط 📋</h1>
          <p className="text-gray-400 text-sm">تتبع كل العمليات التي يقوم بها الموظفون</p>
        </div>
        {currentUser?.role === 'admin' && logs.length > 0 && (
          <button onClick={handleClear} className="text-xs px-3 py-1.5 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/10">
            🗑 مسح السجل
          </button>
        )}
      </div>

      <div className="glass rounded-2xl p-4 grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">المستخدم</label>
          <select value={filterUser} onChange={e=>setFilterUser(e.target.value)} className="input-dark w-full px-3 py-2 rounded-xl text-sm">
            <option value="">الكل</option>
            {users.map(u=><option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">التاريخ</label>
          <input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)} className="input-dark w-full px-3 py-2 rounded-xl text-sm" />
        </div>
      </div>

      <div className="text-xs text-gray-500 px-1">{filtered.length} سجل</div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-4xl mb-3">📋</div>
          <div>لا توجد سجلات نشاط بعد</div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(log => (
            <div key={log.id} className="glass rounded-xl p-3 border border-white/5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-base flex-shrink-0">
                {ACTION_ICONS[log.action] || '📌'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-semibold ${ROLE_COLOR[log.role]||'text-gray-300'}`}>{log.user}</span>
                  <span className="text-xs text-gray-400">{log.action}</span>
                  {log.details && <span className="text-xs text-gray-600">— {log.details}</span>}
                </div>
                <div className="text-xs text-gray-600 mt-0.5">{log.time} • {log.date}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

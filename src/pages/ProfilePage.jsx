import { useState } from 'react'
import { ROLES } from '../hooks/useUsers'

export default function ProfilePage({ currentUser, onChangePassword, onLogout }) {
  const [oldPass,  setOldPass]  = useState('')
  const [newPass,  setNewPass]  = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [msg,      setMsg]      = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showOld,  setShowOld]  = useState(false)
  const [showNew,  setShowNew]  = useState(false)

  const isDesigner = currentUser?.username === 'raouf'
  const role = ROLES[currentUser?.role]

  const ROLE_COLORS = {
    super_admin:'#C9A227', admin:'#f59e0b',
    finance_manager:'#14b8a6', finance:'#10b981',
    staff:'#3b82f6', observer:'#94a3b8'
  }
  const color = ROLE_COLORS[currentUser?.role] || '#94a3b8'

  const handleSave = async () => {
    setMsg(''); setError('')
    if (!oldPass) { setError('أدخل كلمة المرور الحالية'); return }
    if (!newPass) { setError('أدخل كلمة المرور الجديدة'); return }
    if (newPass !== confirm) { setError('كلمة المرور الجديدة غير متطابقة'); return }
    if (newPass.length < 6) { setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return }
    if (newPass === oldPass) { setError('كلمة المرور الجديدة مطابقة للقديمة'); return }
    setLoading(true)
    const result = await onChangePassword(oldPass, newPass)
    if (result?.success) {
      setMsg('✅ تم تغيير كلمة المرور بنجاح!')
      setOldPass(''); setNewPass(''); setConfirm('')
    } else {
      setError(result?.error || 'حدث خطأ')
    }
    setLoading(false)
  }

  const strength = (p) => {
    if (!p) return 0
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  }
  const strengthColors = ['#ef4444','#f59e0b','#10b981','#10b981']
  const strengthLabels = ['ضعيفة','متوسطة','قوية','قوية جداً']
  const s = strength(newPass)

  return (
    <div className="animate-fade-in space-y-5 max-w-lg">
      <div>
        <h1 className="text-xl font-bold text-white mb-0.5">👤 ملفي الشخصي</h1>
        <p className="text-gray-400 text-sm">معلوماتك وتغيير كلمة المرور</p>
      </div>

      {/* معلومات الحساب */}
      <div className="glass rounded-2xl p-5 border border-white/10 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black flex-shrink-0"
            style={{background:`${color}20`, border:`2px solid ${color}40`, color}}>
            {currentUser?.name?.split(' ').slice(0,2).map(w=>w[0]).join('') || '؟'}
          </div>
          <div>
            <div className="text-lg font-bold text-white">{currentUser?.name}</div>
            <div className="text-sm font-medium mt-0.5" style={{color}}>{role?.icon} {role?.label}</div>
            <div className="text-xs text-gray-500 font-mono mt-0.5">@{currentUser?.username}</div>
          </div>
        </div>

        {/* الصلاحيات */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
          {[
            { label:'إضافة بيانات',    ok: !['observer','finance'].includes(currentUser?.role) },
            { label:'تعديل البيانات',  ok: ['super_admin','admin','staff','finance_manager'].includes(currentUser?.role) },
            { label:'حذف البيانات',    ok: ['super_admin','admin'].includes(currentUser?.role) },
            { label:'التقارير المالية',ok: ['super_admin','admin','finance','finance_manager'].includes(currentUser?.role) },
          ].map(p => (
            <div key={p.label} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
              style={{background: p.ok ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)'}}>
              <span>{p.ok ? '✅' : '❌'}</span>
              <span style={{color: p.ok ? '#6ee7b7' : '#6b7280'}}>{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* تغيير كلمة المرور */}
      {isDesigner ? (
        <div className="glass rounded-2xl p-5 border border-yellow-500/20 bg-yellow-500/5 flex items-center gap-3">
          <span className="text-2xl">⭐</span>
          <div>
            <div className="text-sm font-semibold text-yellow-300">حساب المصمم محمي</div>
            <div className="text-xs text-gray-400 mt-0.5">لا يمكن تغيير كلمة مرور حساب المصمم</div>
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="text-sm font-semibold text-gray-200 flex items-center gap-2">
            <span>🔐</span> تغيير كلمة المرور
          </div>

          {/* كلمة المرور الحالية */}
          <div>
            <label className="text-xs text-gray-500 block mb-1.5">كلمة المرور الحالية</label>
            <div className="relative">
              <input type={showOld?'text':'password'} value={oldPass}
                onChange={e=>setOldPass(e.target.value)}
                placeholder="••••••••"
                className="input-dark w-full px-4 py-3 rounded-xl text-sm pr-12" />
              <button onClick={()=>setShowOld(!showOld)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-sm">
                {showOld?'🙈':'👁️'}
              </button>
            </div>
          </div>

          {/* كلمة المرور الجديدة */}
          <div>
            <label className="text-xs text-gray-500 block mb-1.5">كلمة المرور الجديدة</label>
            <div className="relative">
              <input type={showNew?'text':'password'} value={newPass}
                onChange={e=>setNewPass(e.target.value)}
                placeholder="••••••••"
                className="input-dark w-full px-4 py-3 rounded-xl text-sm pr-12" />
              <button onClick={()=>setShowNew(!showNew)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-sm">
                {showNew?'🙈':'👁️'}
              </button>
            </div>
            {newPass && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[0,1,2,3].map(i => (
                    <div key={i} className="flex-1 h-1 rounded-full transition-all"
                      style={{background: i < s ? strengthColors[s-1] : 'rgba(255,255,255,0.1)'}}></div>
                  ))}
                </div>
                <div className="text-xs" style={{color: s > 0 ? strengthColors[s-1] : '#6b7280'}}>
                  قوة كلمة المرور: {s > 0 ? strengthLabels[s-1] : '—'}
                </div>
              </div>
            )}
          </div>

          {/* تأكيد كلمة المرور */}
          <div>
            <label className="text-xs text-gray-500 block mb-1.5">تأكيد كلمة المرور الجديدة</label>
            <input type="password" value={confirm}
              onChange={e=>setConfirm(e.target.value)}
              placeholder="••••••••"
              className="input-dark w-full px-4 py-3 rounded-xl text-sm" />
            {confirm && newPass && (
              <div className="text-xs mt-1" style={{color: confirm===newPass?'#10b981':'#ef4444'}}>
                {confirm===newPass ? '✅ كلمتا المرور متطابقتان' : '❌ كلمتا المرور غير متطابقتين'}
              </div>
            )}
          </div>

          {error && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">⚠️ {error}</div>}
          {msg   && <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">{msg}</div>}

          <button onClick={handleSave}
            disabled={loading || !oldPass || !newPass || !confirm}
            className="btn-primary w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-40 flex items-center justify-center gap-2">
            {loading ? <><span className="animate-spin">⟳</span> جارٍ الحفظ...</> : '🔐 حفظ كلمة المرور الجديدة'}
          </button>
        </div>
      )}

      {/* تسجيل الخروج */}
      <button onClick={onLogout}
        className="w-full py-3 rounded-xl text-sm font-semibold border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2">
        <span>⏻</span> تسجيل الخروج
      </button>
    </div>
  )
}

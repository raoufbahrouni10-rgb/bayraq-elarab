import { useState } from 'react'
import { useDatabase } from './hooks/useDatabase'
import { useEmployers } from './hooks/useEmployers'
import { useTracking } from './hooks/useTracking'
import { useFinance } from './hooks/useFinance'
import { useUsers } from './hooks/useUsers'
import { useNotifications } from './hooks/useNotifications'
import { useTheme } from './components/ThemeToggle'
import { logActivity } from './lib/security'
import { isSupabaseEnabled } from './lib/supabase'
import { MobileNav, PWAInstallBanner, useIsMobile } from './components/MobileNav'
import ThemeToggle from './components/ThemeToggle'
import NotificationsPanel from './components/NotificationsPanel'
import Sidebar from './components/Sidebar'
import LoginPage from './pages/LoginPage'
import SplashScreen from './pages/SplashScreen'
import ThemesPage from './pages/ThemesPage'
import AdvancedDashboard from './pages/AdvancedDashboard'
import BulkWhatsAppPage from './pages/BulkWhatsAppPage'
import RemindersPage from './pages/RemindersPage'
import ArchivePage from './pages/ArchivePage'
import ProfilePage from './pages/ProfilePage'
import PublicRegisterPage from './pages/PublicRegisterPage'
import CandidateCardPage from './pages/CandidateCardPage'
import RatingsPage from './pages/RatingsPage'
import RecruitmentFeesPage from './pages/RecruitmentFeesPage'
import StatsPage from './pages/StatsPage'
import TVModePage from './pages/TVModePage'
import QRCodePage from './pages/QRCodePage'
import AutoBackupPage from './pages/AutoBackupPage'
import CandidateStatusPage from './pages/CandidateStatusPage'
import CompanyCardPage from './pages/CompanyCardPage'
import CandidateComparePage from './pages/CandidateComparePage'
import FileHistoryPage from './pages/FileHistoryPage'
import InterviewsPage from './pages/InterviewsPage'
import IncomeComparePage from './pages/IncomeComparePage'
import InternalMessagesPage from './pages/InternalMessagesPage'
import Dashboard from './pages/Dashboard'
import DatabasePage from './pages/DatabasePage'
import UploadPage from './pages/UploadPage'
import SearchPage from './pages/SearchPage'
import ExportPage from './pages/ExportPage'
import EmployersPage from './pages/EmployersPage'
import GulfJobsPage from './pages/GulfJobsPage'
import TrackingPage from './pages/TrackingPage'
import FinancePage from './pages/FinancePage'
import ReportsPage from './pages/ReportsPage'
import UsersPage from './pages/UsersPage'
import SupabaseSetup from './pages/SupabaseSetup'
import ContractsPage from './pages/ContractsPage'
import CalendarPage from './pages/CalendarPage'
import ActivityLogPage from './pages/ActivityLogPage'
import CVToolsPage from './pages/CVToolsPage'
import ImportPage from './pages/ImportPage'
import WhatsAppRegPage from './pages/WhatsAppRegPage'
import VisaTrackingPage from './pages/VisaTrackingPage'
import InvoicesPage from './pages/InvoicesPage'
import SmartMatchPage from './pages/SmartMatchPage'
import MessagesPage from './pages/MessagesPage'
import GlobalSearchPage from './pages/GlobalSearchPage'

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [tab, setTab] = useState('dashboard')
  const [showSetup, setShowSetup] = useState(false)
  const { currentTheme, applyTheme, themes } = useTheme()

  // تطبيق الثيم على الواجهة الداخلية فوراً
  const themeStyle = {
    '--accent': currentTheme?.accent || '#0e90e0',
    '--btn-from': currentTheme?.btnFrom || '#0e90e0',
    '--btn-to': currentTheme?.btnTo || '#0560a8',
    '--bg-primary': currentTheme?.bg || '#060d1a',
  }
  const isMobile = useIsMobile()
  const { db, loading: dbLoading, addCV, deleteCV, stats } = useDatabase()
  const { employers, jobs, addEmployer, deleteEmployer, addJob, updateJob, deleteJob, getEmployer } = useEmployers()
  const { applications, addApplication, updateStage, deleteApplication, stats: trackingStats } = useTracking()
  const { transactions, addTransaction, togglePaid, deleteTransaction, stats: financeStats, toTND } = useFinance()
  const { users, currentUser, login, logout, addUser, updateUser, deleteUser, canAccess, updateOwnProfile, isSuperAdmin, isAdmin, changePassword } = useUsers()
  
  // منع المدير المالي من حذف أي بيانات
  const canDelete = () => {
    if (!currentUser) return false
    if (currentUser.role === 'finance_manager') return false
    return ['super_admin','admin'].includes(currentUser.role)
  }
  const { notifications, unreadCount, addNotification, markRead, markAllRead, deleteNotif, clearAll } = useNotifications()

  if (showSplash) return <SplashScreen onDone={() => setShowSplash(false)} />
  if (!currentUser) return <LoginPage onLogin={(u,p) => {
    const result = login(u,p)
    if (result.success) logActivity(result.user, 'تسجيل دخول', '')
    return result
  }} />

  const handleSetTab = (t) => {
    if (canAccess(t) || ['users','activity','globalsearch'].includes(t)) setTab(t)
  }

  const handleAddCV = (cv, file = null) => {
    addCV(cv, file)
    addNotification('success', 'مترشح جديد', `تمت إضافة ${cv.name}`, 'database')
    logActivity(currentUser, 'إضافة سيرة', cv.name)
  }

  const handleAddTransaction = (t) => {
    addTransaction(t)
    addNotification('info', 'معاملة مالية', `${t.amount} ${t.currency} — ${t.candidateName}`, 'finance')
    logActivity(currentUser, 'إضافة معاملة', `${t.amount} ${t.currency}`)
  }

  const STAGE_WA_MSG = {
    interview: (name) => `السيد/السيدة ${name}،\n\nيسعدنا دعوتكم لمقابلة عمل. يرجى التواصل معنا لتأكيد الموعد.\n\nبيرق العرب — (+216) 52 332 223`,
    contract:  (name) => `تهانينا ${name}! 🎉\n\nيسعدنا إبلاغكم بقبول ملفكم. يرجى التواصل معنا لإتمام إجراءات العقد.\n\nبيرق العرب`,
    travel:    (name) => `السيد/السيدة ${name}،\n\nملفكم جاهز للسفر ✈️ يرجى التواصل معنا لتأكيد تفاصيل الرحلة.\n\nبيرق العرب`,
    hired:     (name) => `تهانينا ${name}! 🎉\n\nتم توظيفكم بنجاح. نتمنى لكم التوفيق في مسيرتكم المهنية.\n\nبيرق العرب`,
    rejected:  (name) => `السيد/السيدة ${name}،\n\nشكراً على ثقتكم بنا. نأسف لإبلاغكم بعدم القبول في هذه المرة. سنتواصل معكم عند توفر فرص مناسبة.\n\nبيرق العرب`,
  }

  const handleUpdateStage = (id, stage, note) => {
    updateStage(id, stage, note)
    const app = applications.find(a=>a.id===id)
    if (app) {
      addNotification('success', 'تحديث ملف', `${app.candidateName} → ${stage}`, 'tracking')
      logActivity(currentUser, 'تحديث مرحلة', `${app.candidateName}: ${stage}`)
      // إشعار واتساب تلقائي
      const candidate = db.find(c => c.name === app.candidateName)
      const phone = candidate?.phone
      const msgFn = STAGE_WA_MSG[stage]
      if (phone && msgFn) {
        const msg = encodeURIComponent(msgFn(app.candidateName))
        const num = phone.replace(/[\s\-\(\)\+]/g,'')
        const waNum = num.startsWith('216') ? num : '216' + num
        if (window.confirm(`إرسال إشعار واتساب تلقائي لـ ${app.candidateName}؟`)) {
          window.open(`https://wa.me/${waNum}?text=${msg}`, '_blank')
        }
      }
    }
  }

  const PAGES = {
    dashboard:    <Dashboard stats={stats} setTab={handleSetTab} trackingStats={trackingStats} financeStats={financeStats} />,
    database:     <DatabasePage db={db} onDelete={deleteCV} onAdd={handleAddCV} />,
    upload:       <UploadPage onSave={(cv) => { handleAddCV(cv); handleSetTab('database') }} />,
    search:       <SearchPage onAddToDb={(cv) => handleAddCV({...cv, source:cv.source||'web'})} />,
    export:       <ExportPage db={db} />,
    gulf:         <GulfJobsPage />,
    tracking:     <TrackingPage applications={applications} onUpdateStage={handleUpdateStage} onDelete={deleteApplication} onAdd={addApplication} db={db} jobs={jobs} />,
    calendar:     <CalendarPage applications={applications} db={db} />,
    finance:      <FinancePage transactions={transactions} stats={financeStats} onAdd={handleAddTransaction} onTogglePaid={togglePaid} onDelete={deleteTransaction} toTND={toTND} />,
    contracts:    <ContractsPage db={db} applications={applications} />,
    reports:      <ReportsPage db={db} transactions={transactions} applications={applications} toTND={toTND} users={users} currentUser={currentUser} />,
    employers:    <EmployersPage employers={employers} jobs={jobs} db={db} onAddEmployer={addEmployer} onDeleteEmployer={deleteEmployer} onAddJob={addJob} onUpdateJob={updateJob} onDeleteJob={deleteJob} getEmployer={getEmployer} />,
    users:        <UsersPage users={users} currentUser={currentUser} onAdd={addUser} onUpdate={updateUser} onDelete={deleteUser} />,
    activity:     <ActivityLogPage currentUser={currentUser} />,
    cvtools:      <CVToolsPage />,
    import:      <ImportPage onAddCVs={(records) => records.forEach(cv => handleAddCV(cv, null))} />,
    themes:       <ThemesPage currentUser={currentUser} />,
    advdash:      <AdvancedDashboard db={db} applications={applications} transactions={transactions} toTND={toTND} jobs={jobs} employers={employers} />,
    bulkwa:       <BulkWhatsAppPage db={db} applications={applications} />,
    reminders:    <RemindersPage db={db} applications={applications} />,
    cards:        <CandidateCardPage db={db} applications={applications} />,
    ratings:      <RatingsPage db={db} applications={applications} />,
    fees:         <RecruitmentFeesPage db={db} applications={applications} />,
    tvmode:       <TVModePage db={db} applications={applications} transactions={transactions} toTND={toTND} employers={employers} />,
    qrcodes:      <QRCodePage />,
    backup:       <AutoBackupPage db={db} applications={applications} transactions={transactions} employers={employers} users={users} />,
    status:       <CandidateStatusPage />,
    company:      <CompanyCardPage />,
    compare:      <CandidateComparePage db={db} applications={applications} />,
    filehistory:  <FileHistoryPage applications={applications} db={db} />,
    interviews:   <InterviewsPage db={db} applications={applications} />,
    incomecomp:   <IncomeComparePage transactions={transactions} toTND={toTND} />,
    intmessages:  <InternalMessagesPage currentUser={currentUser} users={users} />,
    stats:        <StatsPage db={db} applications={applications} transactions={transactions} toTND={toTND} users={users} currentUser={currentUser} />,
    profile:      <ProfilePage currentUser={currentUser}
        onChangePassword={changePassword}
        onLogout={() => { logActivity(currentUser,'تسجيل خروج',''); logout() }}
      />,
    archive:      <ArchivePage applications={applications} db={db} onRestore={(id) => handleUpdateStage(id,'selected','')} />,
    wareg:       <WhatsAppRegPage onAddCV={(cv) => handleAddCV(cv, null)} onAddEmployer={addEmployer} />,
    visa:        <VisaTrackingPage db={db} applications={applications} />,
    invoices:    <InvoicesPage employers={employers} transactions={transactions} />,
    smartmatch:  <SmartMatchPage db={db} jobs={jobs} applications={applications} onAddApplication={addApplication} />,
    messages:     <MessagesPage db={db} applications={applications} />,
    globalsearch: <GlobalSearchPage db={db} applications={applications} transactions={transactions} jobs={jobs} employers={employers} setTab={handleSetTab} />,
  }

  const currentPage = (canAccess(tab) || ['users','activity','globalsearch'].includes(tab))
    ? (PAGES[tab] || PAGES.dashboard)
    : (
      <div className="text-center py-20 text-gray-500 space-y-3">
        <div className="text-5xl">🔒</div>
        <div className="font-medium text-gray-400">ليس لديك صلاحية لهذه الصفحة</div>
      </div>
    )

  return (
    <div className="flex min-h-screen" style={themeStyle}>
      {showSetup && <SupabaseSetup onClose={() => setShowSetup(false)} />}

      {!isMobile && (
        <Sidebar tab={tab} setTab={handleSetTab} stats={stats} financeStats={financeStats} className="sidebar-desktop"
          currentUser={currentUser}
          onLogout={() => { logActivity(currentUser,'تسجيل خروج',''); logout() }}
          canAccess={canAccess} />
      )}

      <main className="flex-1 overflow-auto flex flex-col">
        {/* شريط علوي */}
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-white/5 flex-shrink-0"
          style={{background:'rgba(6,13,26,0.85)', backdropFilter:'blur(10px)'}}>
          {isMobile && (
            <div className="flex items-center gap-2">
              <img src="/logo.jpg" alt="بيرق" className="w-7 h-7 rounded-lg object-contain bg-white p-0.5" />
              <span className="text-sm font-bold text-white">بيرق العرب</span>
            </div>
          )}
          <div className="flex items-center gap-2 mr-auto">
            {dbLoading && <span className="text-xs text-gray-600 animate-pulse">⟳</span>}
            <button onClick={() => setShowSetup(true)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors
                ${isSupabaseEnabled?'bg-emerald-500/10 border-emerald-500/30 text-emerald-400':'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseEnabled?'bg-emerald-400 animate-pulse':'bg-amber-400'}`}></span>
              {isMobile?(isSupabaseEnabled?'☁️':'⚙️'):(isSupabaseEnabled?'☁️ متصل':'⚙️ إعداد DB')}
            </button>
            <NotificationsPanel notifications={notifications} unreadCount={unreadCount}
              onMarkRead={markRead} onMarkAllRead={markAllRead} onDelete={deleteNotif} onClear={clearAll} setTab={handleSetTab} />
            <ThemeToggle currentTheme={currentTheme} applyTheme={applyTheme} themes={themes} />
            {isMobile && (
              <button onClick={() => { logActivity(currentUser,'تسجيل خروج',''); logout() }}
                className="text-gray-500 hover:text-red-400 text-sm transition-colors px-2">⏻</button>
            )}
          </div>
        </div>

        <div style={{
            flex:1,
            overflowY:'scroll',
            overflowX:'hidden',
            WebkitOverflowScrolling:'touch',
            overscrollBehavior:'contain',
          }}>
          <div key={tab} className={`max-w-5xl mx-auto ${isMobile?'p-3':'p-6'} page-transition`}
            style={{paddingBottom: isMobile ? '90px' : '32px', minHeight: isMobile ? 'calc(100dvh - 104px)' : 'auto'}}>
            {currentPage}
          </div>
        </div>
      </main>

      {isMobile && <MobileNav tab={tab} setTab={handleSetTab} canAccess={canAccess} currentUser={currentUser} />}
      <PWAInstallBanner />
    </div>
  )
}

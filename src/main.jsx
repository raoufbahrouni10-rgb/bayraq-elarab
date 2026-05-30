import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import PublicRegisterPage from './pages/PublicRegisterPage.jsx'
import './index.css'

// فحص إذا كان الرابط هو صفحة التسجيل العامة
const path = window.location.pathname
const search = window.location.search
const isPublicRegister = path === '/register' || 
                          search.includes('register=1') ||
                          path.startsWith('/register')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isPublicRegister ? <PublicRegisterPage /> : <App />}
  </React.StrictMode>,
)

export const THEMES = [
  { id:'ocean',   name:'المحيط الأزرق',    bg:'#060d1a', accent:'#0e90e0', glow1:'rgba(14,144,224,0.15)', glow2:'rgba(6,182,212,0.1)',    btnFrom:'#0e90e0', btnTo:'#0560a8', preview:['#060d1a','#0e90e0','#0a1628'] },
  { id:'gold',    name:'الذهب الملكي',     bg:'#0d0a00', accent:'#c9a227', glow1:'rgba(201,162,39,0.15)', glow2:'rgba(180,140,20,0.1)',   btnFrom:'#c9a227', btnTo:'#8b6914', preview:['#0d0a00','#c9a227','#1a1200'] },
  { id:'emerald', name:'الزمرد الأخضر',    bg:'#00120a', accent:'#10b981', glow1:'rgba(16,185,129,0.15)', glow2:'rgba(5,150,105,0.1)',    btnFrom:'#10b981', btnTo:'#047857', preview:['#00120a','#10b981','#001a0f'] },
  { id:'purple',  name:'البنفسجي الملكي',  bg:'#0d0014', accent:'#8b5cf6', glow1:'rgba(139,92,246,0.15)', glow2:'rgba(124,58,237,0.1)',   btnFrom:'#8b5cf6', btnTo:'#6d28d9', preview:['#0d0014','#8b5cf6','#140020'] },
  { id:'rose',    name:'الوردي الفاخر',    bg:'#140008', accent:'#f43f5e', glow1:'rgba(244,63,94,0.15)',  glow2:'rgba(225,29,72,0.1)',    btnFrom:'#f43f5e', btnTo:'#be123c', preview:['#140008','#f43f5e','#1a000f'] },
  { id:'silver',  name:'الفضي الكلاسيكي', bg:'#0a0a0f', accent:'#94a3b8', glow1:'rgba(148,163,184,0.15)',glow2:'rgba(100,116,139,0.1)',  btnFrom:'#475569', btnTo:'#1e293b', preview:['#0a0a0f','#94a3b8','#12121a'] },
]

const THEME_KEY = 'bayraq_theme_id'

export function getTheme() {
  const id = localStorage.getItem(THEME_KEY) || 'ocean'
  return THEMES.find(t => t.id === id) || THEMES[0]
}

export function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme.id)
  document.documentElement.style.setProperty('--accent', theme.accent)
}

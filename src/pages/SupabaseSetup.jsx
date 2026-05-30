import { useState } from 'react'
import { isSupabaseEnabled } from '../lib/supabase'

export default function SupabaseSetup({ onClose }) {
  const [copied, setCopied] = useState('')

  const copy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key); setTimeout(() => setCopied(''), 2000)
  }

  const envContent = `VITE_ANTHROPIC_API_KEY=your_anthropic_key_here
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="glass rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10 p-6 space-y-5" onClick={e=>e.stopPropagation()}>

        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">إعداد Supabase 🗄️</h2>
            <p className="text-sm text-gray-400 mt-0.5">ربط المشروع بقاعدة بيانات سحابية</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-2xl">×</button>
        </div>

        {/* حالة الاتصال */}
        <div className={`rounded-xl p-3 border flex items-center gap-3 ${isSupabaseEnabled ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
          <span className="text-2xl">{isSupabaseEnabled ? '✅' : '⚠️'}</span>
          <div>
            <div className={`text-sm font-medium ${isSupabaseEnabled ? 'text-emerald-300' : 'text-amber-300'}`}>
              {isSupabaseEnabled ? 'Supabase متصل — البيانات تُحفظ سحابياً' : 'Supabase غير مضبوط — يعمل بـ localStorage'}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {isSupabaseEnabled ? 'جميع البيانات تُزامن تلقائياً' : 'اتبع الخطوات أدناه للتفعيل'}
            </div>
          </div>
        </div>

        {/* الخطوات */}
        <div className="space-y-4">
          {[
            {
              num:'1', title:'إنشاء مشروع Supabase مجاني',
              content: <div className="space-y-2">
                <p className="text-xs text-gray-400">اذهب إلى supabase.com وسجّل حساباً مجانياً</p>
                <a href="https://supabase.com" target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 btn-primary px-4 py-2 rounded-xl text-sm text-white">
                  🔗 فتح Supabase ↗
                </a>
              </div>
            },
            {
              num:'2', title:'إنشاء الجداول — SQL Editor',
              content: <div className="space-y-2">
                <p className="text-xs text-gray-400">في لوحة Supabase → SQL Editor → انسخ والصق الكود:</p>
                <div className="bg-black/40 rounded-xl p-3 border border-white/5 relative">
                  <pre className="text-xs text-green-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">{`-- شغّل هذا في Supabase SQL Editor
create table if not exists cvs (
  id bigint primary key generated always as identity,
  name text not null, spec text, age integer,
  exp integer default 0, city text, skills text,
  source text default 'local', notes text,
  date date default current_date,
  created_at timestamptz default now()
);
create table if not exists applications (
  id bigint primary key generated always as identity,
  candidate_name text, job_title text, company text,
  country text, stage text default 'selected',
  notes text, history jsonb default '[]',
  date date default current_date,
  created_at timestamptz default now()
);
create table if not exists transactions (
  id bigint primary key generated always as identity,
  type text, candidate_name text, job_title text,
  company text, country text, amount numeric,
  currency text default 'TND', paid boolean default false,
  notes text, date date default current_date,
  created_at timestamptz default now()
);
create table if not exists users (
  id bigint primary key generated always as identity,
  name text, username text unique, password text,
  role text default 'staff', active boolean default true,
  created_at date default current_date
);
insert into users (name,username,password,role) values
  ('المدير العام','admin','admin123','admin'),
  ('المدير المالي','finance','finance123','finance'),
  ('موظف التوظيف','staff','staff123','staff')
on conflict (username) do nothing;`}</pre>
                  <button onClick={() => copy(`create table if not exists cvs (id bigint primary key generated always as identity, name text not null, spec text, age integer, exp integer default 0, city text, skills text, source text default 'local', notes text, date date default current_date, created_at timestamptz default now());`, 'sql')}
                    className="absolute top-2 left-2 text-xs px-2 py-1 bg-white/10 rounded-lg text-gray-300 hover:bg-white/20">
                    {copied==='sql' ? '✓ تم' : 'نسخ'}
                  </button>
                </div>
                <p className="text-xs text-gray-500">الملف الكامل موجود في: <code className="text-amber-400">supabase-schema.sql</code></p>
              </div>
            },
            {
              num:'3', title:'الحصول على مفاتيح API',
              content: <div className="space-y-2">
                <p className="text-xs text-gray-400">Project Settings → API → انسخ:</p>
                <div className="space-y-1.5">
                  <div className="bg-black/30 rounded-lg px-3 py-2 flex items-center justify-between">
                    <div><span className="text-xs text-gray-500">Project URL:</span><span className="text-xs text-blue-300 mr-2 font-mono">https://xxxx.supabase.co</span></div>
                  </div>
                  <div className="bg-black/30 rounded-lg px-3 py-2 flex items-center justify-between">
                    <div><span className="text-xs text-gray-500">anon key:</span><span className="text-xs text-green-300 mr-2 font-mono">eyJhbGci...</span></div>
                  </div>
                </div>
              </div>
            },
            {
              num:'4', title:'تحديث ملف .env',
              content: <div className="space-y-2">
                <p className="text-xs text-gray-400">افتح ملف <code className="text-amber-400">.env</code> في مجلد bayraq-v2 وضع المفاتيح:</p>
                <div className="bg-black/40 rounded-xl p-3 border border-white/5 relative">
                  <pre className="text-xs text-green-300 font-mono leading-relaxed">{envContent}</pre>
                  <button onClick={() => copy(envContent, 'env')}
                    className="absolute top-2 left-2 text-xs px-2 py-1 bg-white/10 rounded-lg text-gray-300 hover:bg-white/20">
                    {copied==='env' ? '✓ تم' : 'نسخ'}
                  </button>
                </div>
              </div>
            },
            {
              num:'5', title:'إعادة تشغيل المشروع',
              content: <div className="space-y-2">
                <p className="text-xs text-gray-400">بعد تعديل .env أوقف السيرفر وأعد تشغيله:</p>
                <div className="bg-black/30 rounded-lg px-4 py-2 font-mono text-sm text-emerald-300">
                  Ctrl+C ثم: npm run dev
                </div>
              </div>
            },
          ].map(step => (
            <div key={step.num} className="flex gap-3">
              <div className="w-7 h-7 rounded-full btn-primary flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">{step.num}</div>
              <div className="flex-1 space-y-2">
                <div className="text-sm font-semibold text-gray-200">{step.title}</div>
                {step.content}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300">
          💡 Supabase مجاني حتى 500MB بيانات و50,000 طلب/شهر — كافٍ لإدارة مئات الملفات
        </div>

        <button onClick={onClose} className="btn-primary w-full py-3 rounded-xl text-sm font-semibold text-white">
          فهمت ✅
        </button>
      </div>
    </div>
  )
}

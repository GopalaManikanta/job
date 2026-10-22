import { useAuth } from '../context/AuthContext'
import { LogOut, User, Building2, ShieldCheck, Mail, Sparkles } from 'lucide-react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.info('Logged out successfully.')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient glow orbs */}
      <div
        className={`absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none ${
          user?.role === 'candidate' ? 'bg-cyan-500/15' : 'bg-purple-500/15'
        }`}
      />
      <div
        className={`absolute bottom-1/4 right-1/3 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none ${
          user?.role === 'candidate' ? 'bg-blue-600/15' : 'bg-pink-600/15'
        }`}
      />

      <div className="w-full max-w-xl bg-[#0e1629]/90 backdrop-blur-2xl border border-white/10 ring-1 ring-white/5 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        {/* Header Status */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center gap-2 text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Protected Route Verified
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-xs font-bold text-slate-300 hover:text-rose-300 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
            alt={user?.name}
            className={`w-16 h-16 rounded-2xl object-cover border-2 shadow-xl ${
              user?.role === 'candidate' ? 'border-cyan-400/50 shadow-cyan-500/20' : 'border-purple-400/50 shadow-purple-500/20'
            }`}
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">{user?.name}</h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 ${
                  user?.role === 'candidate'
                    ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                    : 'bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-500/20'
                }`}
              >
                {user?.role === 'candidate' ? (
                  <>
                    <User className="w-3 h-3" />
                    <span>Candidate</span>
                  </>
                ) : (
                  <>
                    <Building2 className="w-3 h-3" />
                    <span>Recruiter</span>
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>{user?.email}</span>
            </p>
          </div>
        </div>

        {/* Stored Local Storage Information Table */}
        <div className="space-y-2 pt-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            User Information In Local Storage
          </p>
          <div className="bg-[#070b17] rounded-2xl border border-white/5 p-4 divide-y divide-white/5 text-xs space-y-2">
            <div className="flex items-center justify-between pb-2">
              <span className="text-slate-400">User ID</span>
              <span className="font-mono text-slate-200">{user?.id}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-400">Role</span>
              <span
                className={`font-bold capitalize ${
                  user?.role === 'candidate' ? 'text-cyan-400' : 'text-purple-400'
                }`}
              >
                {user?.role}
              </span>
            </div>
            {user?.company && (
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-400">Company</span>
                <span className="text-slate-200">{user.company}</span>
              </div>
            )}
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-400">Headline</span>
              <span className="text-slate-200">{user?.headline || 'Standard User'}</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-400">Session Status</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Active Authenticated Session
              </span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 pt-2">
          Protected routes, role state, and local storage persistence are functioning in real-time.
        </p>
      </div>
    </div>
  )
}

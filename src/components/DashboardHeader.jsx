import { useState, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Briefcase,
  Search,
  Bell,
  LogOut,
  CheckCircle2,
  Sparkles,
  X,
  Inbox,
  LayoutDashboard,
  Building2,
  User,
  Send,
  BarChart3
} from 'lucide-react'
import { toast } from 'react-toastify'
import { useDashboard } from '../context/DashboardContext'

export default function DashboardHeader({ user, onLogout }) {
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const isCandidate = user?.role === 'candidate'

  const { applications = [] } = useDashboard()
  const candidateApplications = useMemo(() => {
    if (isCandidate) {
      const email = user?.email || 'candidate@jobportal.com'
      const id = user?.id || 'usr_cand_01'
      return applications.filter(
        (a) => a.candidateEmail === email || a.candidateId === id
      )
    }
    return applications
  }, [applications, isCandidate, user])

  const [notifications, setNotifications] = useState([])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      toast.info(`Searching for: "${searchQuery}" in live database.`)
    }
  }

  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/90 px-4 sm:px-6 lg:px-10 py-3 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className={`w-10 h-10 rounded-2xl p-0.5 shadow-sm transition-transform hover:scale-105 ${
              isCandidate
                ? 'bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600'
                : 'bg-gradient-to-tr from-purple-500 via-pink-600 to-rose-600'
            }`}
          >
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Briefcase className={`w-5 h-5 ${isCandidate ? 'text-cyan-600' : 'text-purple-600'}`} />
            </div>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link to="/dashboard" className="text-xl font-black tracking-tight text-slate-900">
                CAREER<span className={isCandidate ? 'text-cyan-600' : 'text-purple-600'}>X</span>
              </Link>
              <span
                className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  isCandidate
                    ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                    : 'bg-purple-50 text-purple-700 border-purple-200'
                }`}
              >
                <Sparkles className="w-2.5 h-2.5" />
                {isCandidate ? 'Candidate' : 'Employer'}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold">
          <Link
            to="/dashboard"
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              location.pathname === '/dashboard'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-cyan-600" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/jobs"
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              location.pathname.startsWith('/jobs')
                ? 'bg-white text-cyan-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-cyan-600" />
            <span>Jobs</span>
          </Link>

          <Link
            to="/companies"
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              location.pathname.startsWith('/companies')
                ? 'bg-white text-cyan-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-cyan-600" />
            <span>Companies</span>
          </Link>

          <Link
            to="/applications"
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              location.pathname.startsWith('/applications') || location.pathname.startsWith('/saved-jobs')
                ? 'bg-white text-cyan-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-cyan-600" />
            <span>Applications</span>
            {candidateApplications.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 text-[10px] rounded-full bg-cyan-100 text-cyan-800 font-extrabold">
                {candidateApplications.length}
              </span>
            )}
          </Link>

          <Link
            to="/reports"
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              location.pathname.startsWith('/reports')
                ? 'bg-white text-cyan-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-cyan-600" />
            <span>Reports</span>
          </Link>

          <Link
            to="/profile"
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              location.pathname.startsWith('/profile')
                ? 'bg-white text-cyan-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-cyan-600" />
            <span>Profile</span>
          </Link>
        </nav>

        <form
          onSubmit={handleSearchSubmit}
          className="hidden lg:flex flex-1 max-w-xs relative items-center"
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isCandidate
                ? 'Search jobs or tech stacks...'
                : 'Search talent or requisitions...'
            }
            className="w-full pl-9 pr-8 py-1.5 bg-slate-100 hover:bg-slate-100/90 focus:bg-white border border-slate-200/90 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </form>

        <div className="flex items-center gap-3">

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-xs"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500 shadow-xs" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Notifications ({unreadCount})
                  </span>
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setNotifications([])
                        toast.success('All notifications cleared.')
                        setShowNotifications(false)
                      }}
                      className="text-[11px] font-semibold text-cyan-600 hover:underline cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    <Inbox className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-700">No Notifications (Initial Stage)</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Alerts will appear here as activity occurs</p>
                  </div>
                ) : (
                  <div className="mt-2 divide-y divide-slate-100 space-y-2">
                    {notifications.map((n) => (
                      <div key={n.id} className="pt-2 flex items-start gap-2.5">
                        <span className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${n.unread ? 'bg-cyan-500' : 'bg-slate-300'}`} />
                        <div className="flex-1">
                          <p className="text-xs text-slate-700 font-medium leading-snug">{n.title}</p>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <Link
              to="/profile"
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors group cursor-pointer"
              title="View & Edit Profile"
            >
              <img
                src={
                  user?.avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`
                }
                alt={user?.name}
                className={`w-8 h-8 rounded-xl object-cover border-2 shadow-xs transition-transform group-hover:scale-105 ${
                  isCandidate ? 'border-cyan-400' : 'border-purple-400'
                }`}
              />
              <div className="hidden xl:block text-left">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-900 leading-tight group-hover:text-cyan-700 transition-colors">
                    {user?.name}
                  </span>
                  <CheckCircle2 className="w-3 h-3 text-cyan-600" />
                </div>
                <span className="text-[10px] text-slate-500 block truncate max-w-[120px]">
                  {user?.headline || (isCandidate ? 'Full Stack Developer' : 'Senior Recruiter')}
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-600 transition-all cursor-pointer shadow-xs"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

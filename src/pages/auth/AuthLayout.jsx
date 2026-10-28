import { Briefcase, Building2, User, Sparkles } from 'lucide-react'
import authHeroImg from '../../assets/auth-hero.jpg'

export default function AuthLayout({
  children,
  title,
  subtitle,
  activeRole = 'candidate',
  onRoleChange,
  showRoleToggle = true
}) {
  const isCandidate = activeRole === 'candidate'

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden text-slate-100 selection:bg-cyan-500 selection:text-black">

      <img
        src={authHeroImg}
        alt="Career Workplace"
        className="fixed inset-0 w-full h-full object-cover object-center -z-30 transition-transform duration-1000"
      />

      <div className="fixed inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40 -z-20 pointer-events-none" />

      <header className="relative z-20 w-full px-6 lg:px-12 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl p-0.5 shadow-xl transition-all duration-300 ${
              isCandidate
                ? 'bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 shadow-cyan-500/25'
                : 'bg-gradient-to-tr from-purple-400 via-pink-500 to-rose-600 shadow-purple-500/25'
            }`}
          >
            <div className="w-full h-full bg-black/60 backdrop-blur-md rounded-[14px] flex items-center justify-center">
              <Briefcase
                className={`w-5 h-5 ${isCandidate ? 'text-cyan-400' : 'text-purple-400'}`}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                CAREER<span
                  className={
                    isCandidate
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400'
                      : 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400'
                  }
                >
                  X
                </span>
              </span>
              <span
                className={`hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border shadow-sm backdrop-blur-md ${
                  isCandidate
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                    : 'bg-purple-500/20 text-purple-300 border-purple-400/40'
                }`}
              >
                {isCandidate ? 'Job Seeker Mode' : 'Recruiter Mode'}
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
          <span>Talent Network &bull; Initial Launch Phase</span>
        </div>
      </header>

      <main className="relative z-20 flex-1 w-full px-4 sm:px-8 lg:px-12 py-4 flex flex-col lg:flex-row items-center justify-between gap-8">

        <div className="hidden lg:flex lg:flex-1 flex-col justify-end space-y-4 max-w-xl pb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/25 text-xs font-bold text-white w-fit shadow-xl">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI-Driven Career Ecosystem</span>
          </div>
          <h2 className="text-4xl xl:text-5xl font-black text-white leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
            Your Next Dream Career <br />
            <span
              className={`text-transparent bg-clip-text ${
                isCandidate
                  ? 'bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-300'
                  : 'bg-gradient-to-r from-purple-300 via-pink-400 to-rose-300'
              }`}
            >
              Starts Right Here
            </span>
          </h2>
          <p className="text-sm font-semibold text-slate-100 max-w-md drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] leading-relaxed">
            Connect with top-tier product teams, verify salary benchmarks, and interview seamlessly.
          </p>
        </div>

        <div className="w-full lg:w-[32%] xl:w-[30%] min-w-[340px] max-w-[430px] my-auto">
          <div className="bg-slate-950/30 backdrop-blur-xl border border-white/30 rounded-3xl p-6 sm:p-7 shadow-[0_16px_48px_rgba(0,0,0,0.6)] ring-1 ring-white/20 transition-all duration-300">

            <div className="mb-5">
              <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl drop-shadow-md">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 text-xs font-medium text-slate-200 drop-shadow">
                  {subtitle}
                </p>
              )}
            </div>

            {showRoleToggle && onRoleChange && (
              <div className="mb-5 p-1 bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl flex items-center gap-1 shadow-inner">
                <button
                  type="button"
                  onClick={() => onRoleChange('candidate')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                    isCandidate
                      ? 'bg-gradient-to-r from-cyan-500/90 to-blue-600/90 text-white shadow-lg shadow-cyan-500/30 ring-1 ring-white/30 backdrop-blur-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Job Seeker</span>
                </button>

                <button
                  type="button"
                  onClick={() => onRoleChange('recruiter')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                    !isCandidate
                      ? 'bg-gradient-to-r from-purple-500/90 to-rose-600/90 text-white shadow-lg shadow-purple-500/30 ring-1 ring-white/30 backdrop-blur-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Employer</span>
                </button>
              </div>
            )}

            <div>{children}</div>
          </div>
        </div>
      </main>

      <footer className="relative z-20 w-full px-6 lg:px-12 py-3 text-center text-xs text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
        Secured with 256-bit TLS encryption &bull; CareerX &copy; 2026
      </footer>
    </div>
  )
}

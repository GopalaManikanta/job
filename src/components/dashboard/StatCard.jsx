import { ArrowUpRight } from 'lucide-react'

const STAT_COLORS = {
  cyan: {
    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
    iconBg: 'from-cyan-500 to-blue-600',
    borderHover: 'hover:border-cyan-300 hover:shadow-cyan-100/60',
    glow: 'hover:shadow-[0_8px_30px_rgba(6,182,212,0.12)]'
  },
  purple: {
    badge: 'bg-purple-50 text-purple-700 border-purple-200/80',
    iconBg: 'from-purple-500 to-pink-600',
    borderHover: 'hover:border-purple-300 hover:shadow-purple-100/60',
    glow: 'hover:shadow-[0_8px_30px_rgba(168,85,247,0.12)]'
  },
  emerald: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    iconBg: 'from-emerald-500 to-teal-600',
    borderHover: 'hover:border-emerald-300 hover:shadow-emerald-100/60',
    glow: 'hover:shadow-[0_8px_30px_rgba(16,185,129,0.12)]'
  },
  amber: {
    badge: 'bg-amber-50 text-amber-700 border-amber-200/80',
    iconBg: 'from-amber-500 to-orange-600',
    borderHover: 'hover:border-amber-300 hover:shadow-amber-100/60',
    glow: 'hover:shadow-[0_8px_30px_rgba(245,158,11,0.12)]'
  },
  blue: {
    badge: 'bg-blue-50 text-blue-700 border-blue-200/80',
    iconBg: 'from-blue-500 to-indigo-600',
    borderHover: 'hover:border-blue-300 hover:shadow-blue-100/60',
    glow: 'hover:shadow-[0_8px_30px_rgba(59,130,246,0.12)]'
  },
  rose: {
    badge: 'bg-rose-50 text-rose-700 border-rose-200/80',
    iconBg: 'from-rose-500 to-pink-600',
    borderHover: 'hover:border-rose-300 hover:shadow-rose-100/60',
    glow: 'hover:shadow-[0_8px_30px_rgba(244,63,94,0.12)]'
  }
}

export default function StatCard({
  title,
  value = '0',
  subtitle,
  icon: Icon,
  trend = null,
  theme = 'cyan',
  isLive = false,
  onClick
}) {
  const styles = STAT_COLORS[theme] || STAT_COLORS.cyan

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white border border-slate-200/90 rounded-2xl p-5 transition-all duration-300 transform hover:-translate-y-1 shadow-xs hover:shadow-md ${styles.borderHover} ${styles.glow} flex flex-col justify-between ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Top Row: Icon + Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${styles.iconBg} p-0.5 shadow-sm`}>
          <div className="w-full h-full bg-white/20 backdrop-blur-xs rounded-[10px] flex items-center justify-center">
            {Icon && <Icon className="w-5 h-5 text-white" />}
          </div>
        </div>

        {isLive ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Live Active
          </span>
        ) : trend ? (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${styles.badge}`}
          >
            {trend}
          </span>
        ) : null}
      </div>

      {/* Middle: Number Value */}
      <div>
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
          {value}
        </h3>
        <p className="text-xs font-semibold text-slate-500 mt-1.5">{title}</p>
      </div>

      {/* Bottom Subtext */}
      {subtitle && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>{subtitle}</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 transition-colors" />
        </div>
      )}
    </div>
  )
}

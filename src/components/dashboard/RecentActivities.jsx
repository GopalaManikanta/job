import { useState } from 'react'
import { useDashboard } from '../../context/DashboardContext'
import { Activity, Clock, Inbox, ShieldCheck } from 'lucide-react'

const LIGHT_STATUS_COLORS = {
  'In Review': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Scheduled': 'bg-purple-50 text-purple-700 border-purple-200',
  'Shortlisted': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Submitted': 'bg-blue-50 text-blue-700 border-blue-200'
}

export default function RecentActivities() {
  const { activities } = useDashboard()
  const [activeFilter, setActiveFilter] = useState('all')

  const filtered =
    activeFilter === 'all'
      ? activities
      : activities.filter((a) => a.type === activeFilter)

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-600">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Recent Activities & Updates
            </h2>
            <p className="text-xs text-slate-500">
              Live updates recorded as you apply for jobs or interact with companies
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        {activities.length > 0 && (
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
            {[
              { id: 'all', label: 'All' },
              { id: 'applications', label: 'Applications' },
              { id: 'interviews', label: 'Interviews' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-white text-blue-700 border border-slate-200 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content: Clean Initial Stage Empty State vs Real Activities */}
      {filtered.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center px-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-3 shadow-xs">
            <Inbox className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            No Recent Activities (Initial Stage)
          </h3>
          <p className="text-xs text-slate-500 max-w-md mt-1 leading-relaxed">
            Your portal workspace is fresh at the initial stage. There is no fake data. When you submit applications or companies contact you, your real timeline events will appear here automatically.
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Clean Baseline &bull; 0 Activities</span>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 mt-2">
          {filtered.map((act) => {
            const badgeClass = LIGHT_STATUS_COLORS[act.status] || 'bg-slate-100 text-slate-700 border-slate-200'

            return (
              <div
                key={act.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
              >
                {/* Left: Details */}
                <div className="flex items-start sm:items-center gap-3.5">
                  <img
                    src={act.logo}
                    alt={act.company}
                    className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{act.title || act.role}</h4>
                      {act.company && act.role && (
                        <>
                          <span className="text-xs text-slate-300">&bull;</span>
                          <span className="text-xs font-semibold text-cyan-700">{act.company}</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{act.subtitle || act.detail}</p>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 sm:hidden mt-1">
                      <Clock className="w-3 h-3" />
                      {act.time}
                    </span>
                  </div>
                </div>

                {/* Right: Badge */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {act.time}
                    </span>
                  </div>
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full border shadow-xs ${badgeClass}`}>
                    {act.status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

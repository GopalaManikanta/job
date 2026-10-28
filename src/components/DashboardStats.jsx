import { useAuth } from '../context/AuthContext'
import { useDashboard } from '../context/DashboardContext'
import { BarChart3, PieChart, ShieldCheck, CheckCircle, Info } from 'lucide-react'

export default function DashboardStats() {
  const { user } = useAuth()
  const { pipelineStages, categories, applications } = useDashboard()

  const isCandidate = user?.role === 'candidate'
  const totalSubmissions = isCandidate
    ? applications.filter((a) => a.candidateEmail === user?.email || a.candidateId === user?.id).length
    : applications.filter((a) => a.company?.toLowerCase() === user?.company?.toLowerCase()).length

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-600">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {isCandidate ? 'My Application Pipeline Funnel' : 'Candidate Screening & Hiring Funnel'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isCandidate
                  ? 'Real-time progress tracking across active job applications'
                  : 'Total active candidates moving across recruitment stages'}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-600 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">
            {totalSubmissions === 0 ? 'Initial Stage (0 Active)' : `${totalSubmissions} Active Applications`}
          </span>
        </div>

        <div className="space-y-4 my-5">
          {pipelineStages.map((stage) => (
            <div key={stage.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-2">
                  <CheckCircle className={`w-3.5 h-3.5 ${stage.count > 0 ? 'text-emerald-500' : 'text-slate-300'}`} />
                  {stage.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-600 font-bold">
                    {stage.count} {isCandidate ? 'Jobs' : 'Candidates'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                    {stage.percentage}%
                  </span>
                </div>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${stage.color} transition-all duration-700 ease-out`}
                  style={{ width: `${stage.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 text-xs text-slate-600 mb-2">
          <Info className="w-4 h-4 text-cyan-600 shrink-0" />
          <span>
            {isCandidate
              ? totalSubmissions === 0
                ? 'Your application pipeline is ready. Apply to jobs to start advancing through screening stages.'
                : 'Application pipeline is live! Status updates from recruiters will advance your progress bars.'
              : totalSubmissions === 0
              ? 'Your recruitment funnel is ready. Post job requisitions to begin receiving candidate submissions.'
              : 'Candidate screening funnel is active with incoming applications.'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-center">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-500 block font-medium">Target Response</span>
            <span className="text-sm font-black text-cyan-700">&lt; 24h</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-500 block font-medium">Submissions</span>
            <span className="text-sm font-black text-purple-700">{totalSubmissions} Active</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-500 block font-medium">Status</span>
            <span className="text-sm font-black text-emerald-700">Live Active</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 border border-purple-100 text-purple-600">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Industry Sectors
              </h3>
              <p className="text-[11px] text-slate-500">Categories open for listings</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-purple-700 px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200">
            {categories.length} Sectors
          </span>
        </div>

        <div className="space-y-4 my-4">
          {categories.map((cat) => (
            <div key={cat.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 truncate max-w-[190px]">{cat.name}</span>
                <span className="font-mono font-medium text-slate-500">{cat.openings} Openings</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden flex">
                <div
                  className={`h-full rounded-full ${cat.color} transition-all duration-500`}
                  style={{ width: cat.share }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2 p-3.5 rounded-xl bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-100 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">Real-Time Sync Active</span>
            <span className="text-[10px] text-slate-500 leading-none">
              Updates automatically as recruiters post and candidates apply.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useDashboard } from '../../context/DashboardContext'
import { toast } from 'react-toastify'
import {
  Search,
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  Trash2,
  Eye,
  Bookmark,
  X,
  Sparkles,
  Send,
  FileText,
  DollarSign,
  AlertCircle,
  User
} from 'lucide-react'
import DashboardHeader from '../../components/DashboardHeader'

const PIPELINE_STEPS = [
  { id: 'Applied', label: 'Submitted' },
  { id: 'Under Review', label: 'Under Review' },
  { id: 'Interview Scheduled', label: 'Interview' },
  { id: 'Decision', label: 'Decision' }
]

export default function ApplicationsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const {
    jobs: liveJobs,
    applications: liveApplications,
    savedJobs: liveSavedJobs,
    applyToJob,
    withdrawApplication,
    removeSavedJob,
    updateApplicationStatus
  } = useDashboard()

  const isCandidate = user?.role === 'candidate'

  const activeTab = searchParams.get('tab') === 'saved' ? 'saved' : 'applied'

  const handleTabChange = (tab) => {
    setSearchParams({ tab })
  }

  const handleLogout = () => {
    logout()
    toast.info('Logged out successfully.')
    navigate('/login')
  }

  const [searchQuery, setSearchQuery] = useState('')

  const [statusFilter, setStatusFilter] = useState('All')

  const [withdrawTarget, setWithdrawTarget] = useState(null)

  const candidateApplications = useMemo(() => {
    if (isCandidate) {
      const email = user?.email || 'candidate@jobportal.com'
      const id = user?.id || 'usr_cand_01'
      return liveApplications.filter(
        (a) => a.candidateEmail === email || a.candidateId === id
      )
    }
    return liveApplications
  }, [liveApplications, isCandidate, user])

  const filteredApplications = useMemo(() => {
    let result = candidateApplications

    if (statusFilter !== 'All') {
      result = result.filter((app) => app.status === statusFilter)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (app) =>
          app.jobTitle?.toLowerCase().includes(q) ||
          app.company?.toLowerCase().includes(q) ||
          app.location?.toLowerCase().includes(q) ||
          app.status?.toLowerCase().includes(q) ||
          app.category?.toLowerCase().includes(q)
      )
    }

    return result
  }, [candidateApplications, statusFilter, searchQuery])

  const filteredSavedJobs = useMemo(() => {
    if (!searchQuery.trim()) return liveSavedJobs
    const q = searchQuery.toLowerCase().trim()
    return liveSavedJobs.filter(
      (item) =>
        item.jobTitle?.toLowerCase().includes(q) ||
        item.company?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q)
    )
  }, [liveSavedJobs, searchQuery])

  const statusCounts = useMemo(() => {
    const counts = { All: candidateApplications.length }
    candidateApplications.forEach((app) => {
      counts[app.status] = (counts[app.status] || 0) + 1
    })
    return counts
  }, [candidateApplications])

  const handleConfirmWithdrawal = () => {
    if (!withdrawTarget) return
    const res = withdrawApplication(withdrawTarget.id)
    if (res?.success) {
      toast.info(`Application for "${withdrawTarget.jobTitle}" has been withdrawn.`)
    } else {
      toast.error(res?.message || 'Failed to withdraw application.')
    }
    setWithdrawTarget(null)
  }

  const handleAdvanceStatus = (appId, newStatus) => {
    updateApplicationStatus(appId, newStatus)
    toast.success(`Application status updated to "${newStatus}"!`)
  }

  const handleApplyToSavedJob = (savedItem) => {
    const fullJob = liveJobs.find((j) => j.id === savedItem.jobId) || {
      id: savedItem.jobId,
      title: savedItem.jobTitle,
      company: savedItem.company,
      location: savedItem.location || 'Hybrid - Bengaluru',
      salary: savedItem.salary || 'Competitive',
      type: savedItem.type || 'Full-time',
      category: savedItem.category || 'Software Engineering'
    }

    const res = applyToJob(fullJob)
    if (res?.success) {
      toast.success(`Application submitted for ${savedItem.jobTitle} at ${savedItem.company}!`)
    } else {
      toast.warning(res?.message || 'Could not submit application.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col relative overflow-x-hidden selection:bg-cyan-500 selection:text-white">

      <div className="fixed top-0 left-1/4 -translate-x-1/2 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 translate-x-1/2 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-[140px] pointer-events-none -z-10" />

      <DashboardHeader user={user} onLogout={handleLogout} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-6">

        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Real-Time Career Tracker</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Applications & Saved Jobs
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                {isCandidate
                  ? 'Monitor your active hiring pipeline stages in real-time, review bookmarked opportunities, and manage your candidacy submissions.'
                  : 'Review incoming candidate applications, filter by stage, and manage hiring pipeline progression.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isCandidate ? 'My Applications' : 'Submissions'}
                </span>
                <span className="text-lg font-black text-slate-900">
                  {candidateApplications.length}
                </span>
              </div>
              {isCandidate && (
                <div className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Saved Jobs
                  </span>
                  <span className="text-lg font-black text-amber-600">
                    {liveSavedJobs.length}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => handleTabChange('applied')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'applied'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isCandidate ? 'Applied Jobs' : 'Candidate Submissions'}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'applied'
                    ? 'bg-white/20 text-white'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                {candidateApplications.length}
              </span>
            </button>

            {isCandidate && (
              <button
                type="button"
                onClick={() => handleTabChange('saved')}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'saved'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 fill-current" />
                <span>Saved Jobs</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    activeTab === 'saved'
                      ? 'bg-white/20 text-white'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  {liveSavedJobs.length}
                </span>
              </button>
            )}
          </div>
        </div>

        {activeTab === 'applied' && (
          <div className="space-y-6">

            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by job title, company, location, or status..."
                    className="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <span className="text-xs font-semibold text-slate-500 self-center">
                  Showing {filteredApplications.length} of {candidateApplications.length} applications
                </span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-1 text-xs">
                {['All', 'Applied', 'Under Review', 'Interview Scheduled', 'Shortlisted', 'Rejected'].map(
                  (status) => {
                    const count = statusCounts[status] || 0
                    const isActive = statusFilter === status
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                        }`}
                      >
                        <span>{status === 'All' ? 'All Statuses' : status}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    )
                  }
                )}
              </div>
            </div>

            {filteredApplications.length === 0 ? (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center space-y-3 shadow-xs">
                <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">
                  {searchQuery || statusFilter !== 'All'
                    ? 'No Applications Found'
                    : 'No Active Applications'}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {searchQuery || statusFilter !== 'All'
                    ? `No applications matched "${searchQuery || statusFilter}". Try adjusting your search query or status filter.`
                    : 'You haven’t applied to any job postings yet. Explore open requisitions published by hiring companies.'}
                </p>
                <div className="pt-2">
                  {searchQuery || statusFilter !== 'All' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('')
                        setStatusFilter('All')
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                    >
                      Clear Filters
                    </button>
                  ) : (
                    <Link
                      to="/jobs"
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Browse Open Jobs</span>
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((app) => {
                  const statusColors = {
                    Applied: 'bg-blue-50 text-blue-700 border-blue-200',
                    'Under Review': 'bg-cyan-50 text-cyan-700 border-cyan-200',
                    'Interview Scheduled': 'bg-purple-50 text-purple-700 border-purple-200',
                    Shortlisted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    Rejected: 'bg-rose-50 text-rose-700 border-rose-200'
                  }

                  let currentStageIdx = 0
                  if (app.status === 'Under Review') currentStageIdx = 1
                  if (app.status === 'Interview Scheduled' || app.status === 'Shortlisted') currentStageIdx = 2
                  if (app.status === 'Rejected' || app.status === 'Offer Extended') currentStageIdx = 3

                  return (
                    <div
                      key={app.id}
                      className="bg-white border border-slate-200/90 hover:border-blue-300 rounded-3xl p-6 transition-all shadow-xs hover:shadow-md space-y-5"
                    >

                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5">

                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center shrink-0 p-1.5 shadow-2xs">
                            <Building2 className="w-6 h-6 text-slate-700" />
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Link
                                to={`/jobs/${app.jobId}`}
                                className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors"
                              >
                                {app.jobTitle}
                              </Link>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                  statusColors[app.status] || 'bg-slate-50 text-slate-700 border-slate-200'
                                }`}
                              >
                                {app.status}
                              </span>
                            </div>

                            <p className="text-xs font-semibold text-slate-600 flex flex-wrap items-center gap-2">
                              <span className="text-slate-900 font-bold">{app.company}</span>
                              {app.location && (
                                <span className="flex items-center gap-1 text-slate-500">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  {app.location}
                                </span>
                              )}
                              {app.salary && (
                                <span className="flex items-center gap-1 text-slate-500">
                                  <DollarSign className="w-3 h-3 text-slate-400" />
                                  {app.salary}
                                </span>
                              )}
                              {app.type && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold">
                                  {app.type}
                                </span>
                              )}
                            </p>

                            <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-0.5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>Applied on {app.appliedDate || 'Recent'} &bull; Ref #{app.id.slice(-6)}</span>
                            </p>

                            {!isCandidate && (
                              <div className="pt-2 flex flex-wrap items-center gap-2">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-50 border border-cyan-200 text-xs text-cyan-900 font-bold">
                                  <User className="w-3.5 h-3.5 text-cyan-600" />
                                  <span>Applicant: {app.candidateName || 'Candidate'}</span>
                                  <span className="font-normal text-cyan-700">({app.candidateEmail || 'candidate@jobportal.com'})</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                          <Link
                            to={`/jobs/${app.jobId}`}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Job</span>
                          </Link>

                          {isCandidate ? (
                            <button
                              type="button"
                              onClick={() => setWithdrawTarget(app)}
                              className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                              title="Withdraw Application"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>Withdraw</span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/profile/${app.candidateId || 'usr_cand_01'}`}
                                className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                                title="Review candidate verified credentials and resume"
                              >
                                <User className="w-3.5 h-3.5 text-purple-600" />
                                <span>Review Profile & Resume</span>
                              </Link>
                              <select
                                value={app.status}
                                onChange={(e) => handleAdvanceStatus(app.id, e.target.value)}
                                className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-cyan-500 cursor-pointer shadow-2xs"
                                title="Update candidate pipeline status"
                              >
                                <option value="Applied">Applied</option>
                                <option value="Under Review">Under Review</option>
                                <option value="Interview Scheduled">Interview Scheduled</option>
                                <option value="Shortlisted">Shortlisted</option>
                                <option value="Rejected">Rejected</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-slate-50/70 border border-slate-200/60 rounded-2xl p-4">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                          <span className="flex items-center gap-1.5 text-blue-700">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            Application Pipeline Progression
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            Current Stage: <span className="font-bold text-slate-800">{app.status}</span>
                          </span>
                        </div>

                        <div className="relative flex items-center justify-between mt-3 px-2">

                          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 rounded-full -z-0" />

                          <div
                            className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-blue-500 rounded-full transition-all duration-500 -z-0"
                            style={{
                              width: `${(currentStageIdx / (PIPELINE_STEPS.length - 1)) * 88}%`
                            }}
                          />

                          {PIPELINE_STEPS.map((step, idx) => {
                            const isCompleted = idx <= currentStageIdx
                            const isCurrent = idx === currentStageIdx

                            return (
                              <div key={step.id} className="relative z-10 flex flex-col items-center">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                                    isCompleted
                                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                                      : 'bg-white text-slate-400 border-2 border-slate-200'
                                  } ${isCurrent ? 'scale-110' : ''}`}
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                  ) : (
                                    <span>{idx + 1}</span>
                                  )}
                                </div>
                                <span
                                  className={`text-[10px] mt-1.5 font-bold tracking-tight text-center ${
                                    isCompleted ? 'text-blue-900' : 'text-slate-400'
                                  }`}
                                >
                                  {step.label}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="space-y-6">

            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search saved jobs by title, company, or location..."
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <span className="text-xs font-semibold text-slate-500">
                {filteredSavedJobs.length} bookmarked opportunities
              </span>
            </div>

            {filteredSavedJobs.length === 0 ? (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center space-y-3 shadow-xs">
                <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">
                  {searchQuery ? 'No Saved Jobs Matched' : 'No Bookmarked Opportunities'}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {searchQuery
                    ? `No bookmarked opportunities matched "${searchQuery}".`
                    : 'Save interesting vacancies while browsing the jobs directory to easily apply later.'}
                </p>
                <div className="pt-2">
                  <Link
                    to="/jobs"
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Explore Jobs Directory</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSavedJobs.map((item) => {
                  const alreadyApplied = candidateApplications.some((a) => a.jobId === item.jobId)

                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-200/90 hover:border-amber-300 rounded-3xl p-6 transition-all shadow-xs hover:shadow-md flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold text-xs shadow-2xs">
                              <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                              <Link
                                to={`/jobs/${item.jobId}`}
                                className="text-sm font-bold text-slate-900 hover:text-amber-600 transition-colors line-clamp-1"
                              >
                                {item.jobTitle}
                              </Link>
                              <p className="text-xs font-semibold text-slate-600">{item.company}</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              removeSavedJob(item.jobId)
                              toast.info(`Removed "${item.jobTitle}" from saved jobs.`)
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 cursor-pointer transition-colors"
                            title="Remove from saved jobs"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1">
                          {item.location && (
                            <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {item.location}
                            </span>
                          )}
                          {item.salary && (
                            <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 font-semibold text-slate-700">
                              <DollarSign className="w-3 h-3 text-slate-400" />
                              {item.salary}
                            </span>
                          )}
                          {item.type && (
                            <span className="bg-slate-50 px-2 py-1 rounded-md border border-slate-100 text-[10px] font-bold text-slate-600">
                              {item.type}
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] text-slate-400 pt-1">
                          Saved on {item.savedDate || item.savedAt || 'Recently'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                        <Link
                          to={`/jobs/${item.jobId}`}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </Link>

                        {alreadyApplied ? (
                          <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Application Active</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleApplyToSavedJob(item)}
                            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Quick Apply</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {withdrawTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Withdraw Application?</h3>
                <p className="text-xs text-slate-500">Confirm withdrawing your candidate submission</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-600 space-y-1.5">
              <p>
                You are withdrawing your candidacy for:
              </p>
              <p className="font-bold text-slate-900 text-sm">
                {withdrawTarget.jobTitle}
              </p>
              <p className="text-slate-500">
                Company: <span className="font-semibold text-slate-700">{withdrawTarget.company}</span>
              </p>
              <p className="text-[11px] text-rose-600 pt-1 font-medium">
                &bull; Your application will be removed from the recruiter review pipeline. You can re-apply later if the job remains active.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setWithdrawTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
              >
                Keep Application
              </button>
              <button
                type="button"
                onClick={handleConfirmWithdrawal}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-500/20 cursor-pointer transition-colors"
              >
                Yes, Withdraw Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

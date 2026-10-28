import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { useDashboard } from '../context/DashboardContext'
import {
  Building2,
  Briefcase,
  Zap,
  Users,
  FileCheck,
  BookmarkCheck,
  Sparkles,
  PlusCircle,
  Search,
  Bookmark,
  X,
  Trash2,
  Calendar,
  Eye,
  Video,
  Send,
  CheckCircle2,
  BarChart3,
  User
} from 'lucide-react'

import DashboardHeader from '../components/DashboardHeader'
import StatCard from '../components/StatCard'
import DashboardStats from '../components/DashboardStats'
import QuickActions from '../components/QuickActions'
import RecentActivities from '../components/RecentActivities'
import JobModal from './jobs/JobModal'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const {
    metrics,
    jobs: liveJobs,
    applications: liveApplications,
    savedJobs: liveSavedJobs,
    addJob,
    applyToJob,
    withdrawApplication,
    toggleSaveJob,
    updateApplicationStatus
  } = useDashboard()

  const [showPostJobModal, setShowPostJobModal] = useState(false)
  const [showApplicationsModal, setShowApplicationsModal] = useState(false)
  const [showSavedModal, setShowSavedModal] = useState(false)
  const [showInterviewsModal, setShowInterviewsModal] = useState(false)

  const [appSearchQuery, setAppSearchQuery] = useState('')
  const [savedSearchQuery, setSavedSearchQuery] = useState('')

  const isCandidate = user?.role === 'candidate'

  const handleLogout = () => {
    logout()
    toast.info('Logged out successfully.')
    navigate('/login')
  }

  const handleAdvanceStatus = (appId, status) => {
    updateApplicationStatus(appId, status)
    toast.success(`Application status updated to "${status}"!`)
  }

  const candidateApplications = useMemo(() => {
    if (isCandidate) {
      const email = user?.email || 'candidate@jobportal.com'
      const id = user?.id || 'usr_cand_01'
      return liveApplications.filter(
        (a) => a.candidateEmail === email || a.candidateId === id
      )
    }
    return []
  }, [liveApplications, isCandidate, user])

  const recruiterCompany = user?.company?.trim().toLowerCase()

  const recruiterJobs = useMemo(() => {
    if (isCandidate) return liveJobs
    if (recruiterCompany) {
      const companyJobs = liveJobs.filter(
        (j) => j.company?.trim().toLowerCase() === recruiterCompany || j.postedBy === user?.email
      )
      if (companyJobs.length > 0) return companyJobs
    }
    return liveJobs
  }, [liveJobs, isCandidate, recruiterCompany, user?.email])

  const recruiterApplications = useMemo(() => {
    if (isCandidate) return []
    if (recruiterCompany) {
      const companyApps = liveApplications.filter(
        (a) => a.company?.trim().toLowerCase() === recruiterCompany
      )
      if (companyApps.length > 0) return companyApps
    }
    return liveApplications
  }, [liveApplications, isCandidate, recruiterCompany])

  const scheduledInterviews = useMemo(() => {
    const list = isCandidate
      ? candidateApplications
      : recruiterApplications.length > 0
      ? recruiterApplications
      : liveApplications
    return list.filter((a) => a.status === 'Interview Scheduled')
  }, [isCandidate, candidateApplications, recruiterApplications, liveApplications])

  const activeRecruiterJobsCount = useMemo(() => {
    return recruiterJobs.filter((j) => j.status === 'open' || j.status === 'active').length
  }, [recruiterJobs])

  const displayedApplications = useMemo(() => {
    const list = isCandidate
      ? candidateApplications
      : recruiterApplications.length > 0
      ? recruiterApplications
      : liveApplications
    if (!appSearchQuery.trim()) return list
    const q = appSearchQuery.toLowerCase().trim()
    return list.filter(
      (a) =>
        a.jobTitle?.toLowerCase().includes(q) ||
        a.company?.toLowerCase().includes(q) ||
        a.status?.toLowerCase().includes(q) ||
        a.candidateName?.toLowerCase().includes(q)
    )
  }, [isCandidate, candidateApplications, recruiterApplications, liveApplications, appSearchQuery])

  const displayedSavedJobs = useMemo(() => {
    if (!savedSearchQuery.trim()) return liveSavedJobs
    const q = savedSearchQuery.toLowerCase().trim()
    return liveSavedJobs.filter(
      (s) =>
        s.jobTitle?.toLowerCase().includes(q) ||
        s.company?.toLowerCase().includes(q)
    )
  }, [liveSavedJobs, savedSearchQuery])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col relative overflow-x-hidden selection:bg-cyan-500 selection:text-white">

      <div className="fixed top-0 left-1/4 -translate-x-1/2 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 translate-x-1/2 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-[140px] pointer-events-none -z-10" />

      <DashboardHeader user={user} onLogout={handleLogout} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-8">

        <div className="relative overflow-hidden bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {isCandidate ? 'Job Seeker Workspace' : 'Employer Hiring Workspace'} &bull; Real-Time Sync
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                Welcome,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600">
                  {user?.name || 'Professional'}
                </span>
                ! 👋
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-600 max-w-2xl leading-relaxed">
                {isCandidate
                  ? `Your candidate portal is live. You have ${candidateApplications.length} active applications and ${metrics.savedJobs} saved jobs. Explore live openings posted by recruiters.`
                  : `Recruiter workspace active for ${user?.company || 'Apex Cloud Systems'}. Manage ${recruiterJobs.length} company requisitions, review ${recruiterApplications.length} candidate applications, and coordinate hiring rounds.`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {isCandidate ? (
                <button
                  type="button"
                  onClick={() => navigate('/jobs')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer transform hover:scale-[1.02]"
                >
                  <Search className="w-4 h-4" />
                  <span>Explore Jobs ({liveJobs.length})</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPostJobModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center gap-2 transition-all cursor-pointer transform hover:scale-[1.02]"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post New Job</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => navigate('/reports')}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>Analytics & Reports</span>
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {isCandidate ? 'Career Search Key Metrics & Overview' : 'Enterprise Hiring Key Performance Indicators'}
              </h2>
              <p className="text-xs text-slate-500">
                {isCandidate
                  ? 'Real-time metrics calculated dynamically from your personal applications and market listings'
                  : 'Live requisition metrics and candidate submission velocity for your organization'}
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-blue-700 font-semibold px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Real-Time Sync
            </span>
          </div>

          {isCandidate ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <StatCard
                title="Total Jobs"
                value={metrics.totalJobs}
                subtitle="Published listings"
                icon={Briefcase}
                trend={`${metrics.totalJobs} Listings`}
                theme="blue"
                onClick={() => navigate('/jobs')}
              />
              <StatCard
                title="Active Openings"
                value={metrics.activeJobPostings}
                subtitle="Live vacancies"
                icon={Zap}
                trend={`${metrics.activeJobPostings} Live`}
                theme="cyan"
                isLive={metrics.activeJobPostings !== '0'}
                onClick={() => navigate('/jobs')}
              />
              <StatCard
                title="My Applications"
                value={String(candidateApplications.length)}
                subtitle="Submitted applications"
                icon={FileCheck}
                trend={`${candidateApplications.length} Applied`}
                theme="amber"
                onClick={() => setShowApplicationsModal(true)}
              />
              <StatCard
                title="Saved Jobs"
                value={metrics.savedJobs}
                subtitle="Bookmarked vacancies"
                icon={BookmarkCheck}
                trend={`${metrics.savedJobs} Saved`}
                theme="rose"
                onClick={() => setShowSavedModal(true)}
              />
              <StatCard
                title="Interviews"
                value={String(scheduledInterviews.length)}
                subtitle="Confirmed rounds"
                icon={Calendar}
                trend={`${scheduledInterviews.length} Scheduled`}
                theme="purple"
                onClick={() => setShowInterviewsModal(true)}
              />
              <StatCard
                title="Companies"
                value={metrics.totalCompanies}
                subtitle="Hiring partners"
                icon={Building2}
                trend={`${metrics.totalCompanies} Verified`}
                theme="emerald"
                onClick={() => navigate('/companies')}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <StatCard
                title="Company Requisitions"
                value={String(recruiterJobs.length)}
                subtitle="Posted job openings"
                icon={Briefcase}
                trend={`${recruiterJobs.length} Requisitions`}
                theme="blue"
                onClick={() => navigate('/jobs')}
              />
              <StatCard
                title="Active Openings"
                value={String(activeRecruiterJobsCount)}
                subtitle="Accepting candidates"
                icon={Zap}
                trend={`${activeRecruiterJobsCount} Live`}
                theme="cyan"
                isLive={activeRecruiterJobsCount > 0}
                onClick={() => navigate('/jobs')}
              />
              <StatCard
                title="Applications Received"
                value={String(recruiterApplications.length)}
                subtitle="Candidate submissions"
                icon={FileCheck}
                trend={`${recruiterApplications.length} Submissions`}
                theme="amber"
                onClick={() => setShowApplicationsModal(true)}
              />
              <StatCard
                title="Interviews Scheduled"
                value={String(scheduledInterviews.length)}
                subtitle="Upcoming rounds"
                icon={Calendar}
                trend={`${scheduledInterviews.length} Scheduled`}
                theme="purple"
                onClick={() => setShowInterviewsModal(true)}
              />
              <StatCard
                title="Candidate Pool"
                value={metrics.totalCandidates}
                subtitle="Registered job seekers"
                icon={Users}
                trend={`${metrics.totalCandidates} Profiles`}
                theme="emerald"
                onClick={() => navigate('/applications')}
              />
              <StatCard
                title="Partner Companies"
                value={metrics.totalCompanies}
                subtitle="Verified organizations"
                icon={Building2}
                trend={`${metrics.totalCompanies} Active`}
                theme="rose"
                onClick={() => navigate('/companies')}
              />
            </div>
          )}
        </div>

        {!isCandidate && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Active Company Requisitions & Talent Pipeline
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live job postings published for {user?.company || 'Apex Cloud Systems'} &bull; Real-time applicant tracking
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPostJobModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Post Requisition</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/jobs')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                >
                  <span>Manage All ({recruiterJobs.length})</span>
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {recruiterJobs.slice(0, 4).map((job) => {
                const isOpen = job.status === 'open' || job.status === 'active'
                const appCount = job.applicantsCount || 0

                return (
                  <div
                    key={job.id}
                    className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/70 px-2 rounded-2xl transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 hover:text-purple-600 transition-colors">
                          {job.title}
                        </span>
                        <span
                          className={`px-2 py-0.2 rounded-full text-[10px] font-bold border ${
                            isOpen
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {isOpen ? 'Accepting Applicants' : 'Closed'}
                        </span>
                        <span className="text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.2 rounded-full">
                          {appCount} {appCount === 1 ? 'Applicant' : 'Applicants'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-700">{job.category}</span>
                        <span>&bull;</span>
                        <span>{job.location}</span>
                        <span>&bull;</span>
                        <span className="font-semibold text-slate-900">{job.salary}</span>
                        <span>&bull;</span>
                        <span>{job.type}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowApplicationsModal(true)}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Review Applicants</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div>
          <div className="mb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {isCandidate ? 'Application Pipeline Analytics' : 'Candidate Screening & Hiring Funnel'}
            </h2>
            <p className="text-xs text-slate-500">
              {isCandidate
                ? 'Live funnel progression across your submitted applications'
                : 'Recruitment funnel progression across incoming applicant profiles'}
            </p>
          </div>
          <DashboardStats />
        </div>

        <QuickActions
          user={user}
          onOpenPostJob={() => setShowPostJobModal(true)}
          onOpenExploreJobs={() => navigate('/jobs')}
          onOpenApplications={() => setShowApplicationsModal(true)}
          onOpenSavedJobs={() => setShowSavedModal(true)}
          onOpenInterviews={() => setShowInterviewsModal(true)}
          onOpenProfile={() => navigate('/profile')}
        />

        <RecentActivities />

        <footer className="pt-6 pb-4 border-t border-slate-200 text-center text-xs text-slate-400">
          CareerX &bull; AI Powered Talent Network &bull; Responsive Light Theme &bull; 2-Way Real-Time Sync
        </footer>
      </main>

      <JobModal
        isOpen={showPostJobModal}
        onClose={() => setShowPostJobModal(false)}
        onSubmit={(formData) => {
          addJob(formData)
          toast.success(`Job requisition "${formData.title}" published! Available to candidates in real-time.`)
          setShowPostJobModal(false)
        }}
        defaultCompany={user?.company || (user?.role === 'recruiter' ? 'Apex Cloud Systems' : 'Romaguera-Crona')}
      />

      {showApplicationsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isCandidate
                      ? `My Applications Tracker (${candidateApplications.length})`
                      : `Candidate Submissions Pool (${displayedApplications.length})`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isCandidate
                      ? 'Live status tracking and management for your job applications'
                      : 'Review incoming candidate applications and advance recruitment stages'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowApplicationsModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-3 pb-1">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={appSearchQuery}
                  onChange={(e) => setAppSearchQuery(e.target.value)}
                  placeholder="Search applications by title, company, or status..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
                />
                {appSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setAppSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3">
              {displayedApplications.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <FileCheck className="w-10 h-10 mx-auto text-slate-300 mb-1" />
                  <h4 className="text-sm font-bold text-slate-800">
                    {appSearchQuery ? 'No Matching Applications' : 'No Applications Recorded Yet'}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {appSearchQuery
                      ? `No applications matched "${appSearchQuery}". Try clearing your search.`
                      : isCandidate
                      ? 'You have not submitted any applications yet. Explore our verified corporate job postings to apply in 1-click!'
                      : 'No candidate applications received yet for your company.'}
                  </p>
                  {isCandidate && !appSearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowApplicationsModal(false)
                        navigate('/jobs')
                      }}
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Explore Open Positions</span>
                    </button>
                  )}
                </div>
              ) : (
                displayedApplications.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-cyan-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{app.jobTitle}</h4>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            app.status === 'Applied'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : app.status === 'Under Review'
                              ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                              : app.status === 'Shortlisted'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : app.status === 'Interview Scheduled'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                      {isCandidate ? (
                        <p className="text-xs text-slate-600">
                          <span className="font-semibold text-slate-800">{app.company}</span>
                          {app.location && ` • ${app.location}`}
                          {app.salary && ` • ${app.salary}`}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-600 flex flex-wrap items-center gap-1.5">
                          <span className="font-bold text-slate-900">Applicant: {app.candidateName || 'Candidate'}</span>
                          <span className="text-[11px] text-cyan-700 font-medium">({app.candidateEmail || 'candidate@jobportal.com'})</span>
                        </p>
                      )}
                      <span className="text-[10px] text-slate-400 block">
                        Submitted: {app.appliedDate || app.appliedAt} &bull; Ref #{app.id.slice(-6)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isCandidate ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setShowApplicationsModal(false)
                              navigate(`/jobs/${app.jobId}`)
                            }}
                            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            <span>View Job</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              withdrawApplication(app.id)
                              toast.info(`Application for "${app.jobTitle}" withdrawn.`)
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 text-xs font-semibold cursor-pointer transition-colors"
                            title="Withdraw application"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setShowApplicationsModal(false)
                              navigate(`/profile/${app.candidateId || 'usr_cand_01'}`)
                            }}
                            className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold cursor-pointer flex items-center gap-1"
                            title="Review applicant profile and resume"
                          >
                            <User className="w-3 h-3 text-purple-600" />
                            <span>Profile</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdvanceStatus(app.id, 'Under Review')}
                            className="px-2 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 text-xs font-semibold cursor-pointer"
                          >
                            Review
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdvanceStatus(app.id, 'Interview Scheduled')}
                            className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold cursor-pointer"
                          >
                            Interview
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdvanceStatus(app.id, 'Shortlisted')}
                            className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold cursor-pointer"
                          >
                            Shortlist
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                Showing {displayedApplications.length} of {isCandidate ? candidateApplications.length : displayedApplications.length} applications
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowApplicationsModal(false)
                  navigate('/applications')
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1 transition-colors"
              >
                <span>Open Full Applications Hub</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showSavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                  <Bookmark className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Saved Opportunities ({liveSavedJobs.length})</h3>
                  <p className="text-xs text-slate-500">Bookmarked vacancies to apply at your convenience</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSavedModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-3 pb-1">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={savedSearchQuery}
                  onChange={(e) => setSavedSearchQuery(e.target.value)}
                  placeholder="Search saved jobs by title or company..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-all"
                />
                {savedSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setSavedSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3">
              {displayedSavedJobs.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Bookmark className="w-10 h-10 mx-auto text-slate-300 mb-1" />
                  <h4 className="text-sm font-bold text-slate-800">
                    {savedSearchQuery ? 'No Matching Saved Jobs' : 'No Saved Jobs Yet'}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {savedSearchQuery
                      ? `No saved jobs matched "${savedSearchQuery}". Try clearing your search.`
                      : 'When you bookmark jobs in the Explore Jobs section, they will appear here for fast 1-click access.'}
                  </p>
                  {!savedSearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowSavedModal(false)
                        navigate('/jobs')
                      }}
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Explore Jobs</span>
                    </button>
                  )}
                </div>
              ) : (
                displayedSavedJobs.map((item) => {
                  const alreadyApplied = candidateApplications.some((a) => a.jobId === item.jobId)
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-amber-300 transition-all flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{item.jobTitle}</h4>
                        <p className="text-xs text-slate-600 truncate">
                          {item.company} &bull; {item.salary}
                        </p>
                        <span className="text-[10px] text-slate-400">Saved: {item.savedAt}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setShowSavedModal(false)
                            navigate(`/jobs/${item.jobId}`)
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>View</span>
                        </button>

                        {alreadyApplied ? (
                          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Applied</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const targetJob = liveJobs.find((j) => j.id === item.jobId) || {
                                id: item.jobId,
                                title: item.jobTitle,
                                company: item.company,
                                salary: item.salary
                              }
                              const res = applyToJob(targetJob)
                              if (res.success) {
                                toast.success(`Applied to ${item.company} for "${item.jobTitle}"!`)
                              } else {
                                toast.warning(res.message)
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1 transition-colors"
                          >
                            <Send className="w-3 h-3" />
                            <span>Apply</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            toggleSaveJob({ id: item.jobId })
                            toast.info('Removed from saved jobs.')
                          }}
                          className="p-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 cursor-pointer transition-colors"
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                Showing {displayedSavedJobs.length} of {liveSavedJobs.length} saved jobs
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowSavedModal(false)
                  navigate('/applications?tab=saved')
                }}
                className="text-xs font-bold text-amber-600 hover:text-amber-800 cursor-pointer flex items-center gap-1 transition-colors"
              >
                <span>Open Full Saved Jobs Hub</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showInterviewsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Interview Calendar ({scheduledInterviews.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isCandidate
                      ? 'Upcoming technical discussions and screening rounds'
                      : 'Confirmed candidate interview rounds across your company requisitions'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInterviewsModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {scheduledInterviews.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-1" />
                  <h4 className="text-sm font-bold text-slate-800">No Scheduled Interviews Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {isCandidate
                      ? 'When hiring partners shortlist your application and confirm an interview schedule, the calendar time and meeting link will appear here.'
                      : 'Advance candidate applications to "Interview Scheduled" from the Submissions pool to schedule confirmed interview rounds.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowInterviewsModal(false)
                      if (isCandidate) {
                        navigate('/jobs')
                      } else {
                        setShowApplicationsModal(true)
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                  >
                    {isCandidate ? <Search className="w-3.5 h-3.5" /> : <FileCheck className="w-3.5 h-3.5" />}
                    <span>{isCandidate ? 'Apply for More Roles' : 'Review Candidate Submissions'}</span>
                  </button>
                </div>
              ) : (
                scheduledInterviews.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-purple-200 bg-purple-50/30 hover:bg-white transition-all space-y-3 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{item.jobTitle}</h4>
                        <p className="text-xs font-semibold text-purple-700">
                          {isCandidate
                            ? item.company
                            : `Candidate: ${item.candidateName || 'Applicant'} (${item.candidateEmail || 'candidate@jobportal.com'})`}
                        </p>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          Technical Architecture & Live Coding &bull; 45 Mins
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200 shrink-0">
                        Confirmed
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
                        <span className="font-medium text-slate-800">Tomorrow &bull; 02:30 PM - 03:15 PM IST</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toast.success('Joining mock Google Meet conference room...')}
                        className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Call</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

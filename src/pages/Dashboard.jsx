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
  CheckCircle2
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

  // Modal states
  const [showPostJobModal, setShowPostJobModal] = useState(false)
  const [showApplicationsModal, setShowApplicationsModal] = useState(false)
  const [showSavedModal, setShowSavedModal] = useState(false)
  const [showInterviewsModal, setShowInterviewsModal] = useState(false)

  const isCandidate = user?.role === 'candidate'

  const handleLogout = () => {
    logout()
    toast.info('Logged out successfully.')
    navigate('/login')
  }

  // Recruiter advance applicant status handler
  const handleAdvanceStatus = (appId, status) => {
    updateApplicationStatus(appId, status)
    toast.success(`Application status updated to "${status}"!`)
  }

  // Candidate applications scoping
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

  // Scheduled technical interviews
  const scheduledInterviews = useMemo(() => {
    return candidateApplications.filter((a) => a.status === 'Interview Scheduled')
  }, [candidateApplications])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col relative overflow-x-hidden selection:bg-cyan-500 selection:text-white">
      {/* Background Ambient Glow */}
      <div className="fixed top-0 left-1/4 -translate-x-1/2 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 translate-x-1/2 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Top Navigation Header */}
      <DashboardHeader user={user} onLogout={handleLogout} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-8">
        {/* 1. Welcome Hero Banner */}
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
                  ? `Your candidate portal is live. You have ${metrics.totalApplications} active applications and ${metrics.savedJobs} saved jobs. Explore live openings posted by recruiters.`
                  : `Recruiter workspace active for ${user?.company || 'Apex Cloud Systems'}. You have ${metrics.activeJobPostings} active job postings and ${metrics.totalApplications} applicant submissions.`}
              </p>
            </div>

            {/* Quick Hero Action Buttons */}
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
            </div>
          </div>
        </div>

        {/* 2. Top Metric Cards Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Platform Key Metrics & Overview
              </h2>
              <p className="text-xs text-slate-500">
                Real-time metrics calculated dynamically from platform activity
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-blue-700 font-semibold px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Real-Time Sync
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard
              title="Total Companies"
              value={metrics.totalCompanies}
              subtitle="Registered hiring partners"
              icon={Building2}
              trend={`${metrics.totalCompanies} Active`}
              theme="cyan"
              onClick={() => navigate('/companies')}
            />
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
              title="Active Job Postings"
              value={metrics.activeJobPostings}
              subtitle="Live requisitions"
              icon={Zap}
              trend={`${metrics.activeJobPostings} Live`}
              theme="purple"
              isLive={metrics.activeJobPostings !== '0'}
              onClick={() => navigate('/jobs')}
            />
            <StatCard
              title="Total Candidates"
              value={metrics.totalCandidates}
              subtitle="Active applicant pool"
              icon={Users}
              trend={`${metrics.totalCandidates} Profiles`}
              theme="emerald"
              onClick={() => (isCandidate ? navigate('/profile') : toast.info('Candidate Talent Pool: Verified profiles in talent network.'))}
            />
            <StatCard
              title="Total Applications"
              value={isCandidate ? String(candidateApplications.length) : metrics.totalApplications}
              subtitle={isCandidate ? 'My submitted applications' : 'Applications received'}
              icon={FileCheck}
              trend={`${isCandidate ? candidateApplications.length : metrics.totalApplications} Applied`}
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
          </div>
        </div>

        {/* 3. Dashboard Statistics & Pipeline Analytics Section */}
        <div>
          <div className="mb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Dashboard Statistics & Pipeline Analytics
            </h2>
            <p className="text-xs text-slate-500">
              Live funnel progression and sector distribution
            </p>
          </div>
          <DashboardStats />
        </div>

        {/* 4. Quick Action Cards */}
        <QuickActions
          user={user}
          onOpenPostJob={() => setShowPostJobModal(true)}
          onOpenExploreJobs={() => navigate('/jobs')}
          onOpenApplications={() => setShowApplicationsModal(true)}
          onOpenSavedJobs={() => setShowSavedModal(true)}
          onOpenInterviews={() => setShowInterviewsModal(true)}
          onOpenProfile={() => navigate('/profile')}
        />

        {/* 5. Recent Activities Timeline */}
        <RecentActivities />

        {/* 6. Footer System Note */}
        <footer className="pt-6 pb-4 border-t border-slate-200 text-center text-xs text-slate-400">
          CareerX &bull; AI Powered Talent Network &bull; Responsive Light Theme &bull; 2-Way Real-Time Sync
        </footer>
      </main>

      {/* ========================================================= */}
      {/* MODAL 1: POST JOB MODAL (Recruiter)                      */}
      {/* ========================================================= */}
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

      {/* ========================================================= */}
      {/* MODAL 2: APPLICATION TRACKER MODAL                       */}
      {/* ========================================================= */}
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
                      : `Candidate Submissions Pool (${liveApplications.length})`}
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

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {(isCandidate ? candidateApplications : liveApplications).length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <FileCheck className="w-10 h-10 mx-auto text-slate-300 mb-1" />
                  <h4 className="text-sm font-bold text-slate-800">No Applications Recorded Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {isCandidate
                      ? 'You have not submitted any applications yet. Explore our verified corporate job postings to apply in 1-click!'
                      : 'No candidate applications received yet for your company.'}
                  </p>
                  {isCandidate && (
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
                (isCandidate ? candidateApplications : liveApplications).map((app) => (
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
                      <p className="text-xs text-slate-600">
                        <span className="font-semibold text-slate-800">{app.company}</span>
                        {app.location && ` • ${app.location}`}
                        {app.salary && ` • ${app.salary}`}
                      </p>
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
                            onClick={() => handleAdvanceStatus(app.id, 'Shortlisted')}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold cursor-pointer"
                          >
                            Shortlist
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdvanceStatus(app.id, 'Interview Scheduled')}
                            className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold cursor-pointer"
                          >
                            Interview
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: SAVED OPPORTUNITIES MODAL (Candidate)           */}
      {/* ========================================================= */}
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

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {liveSavedJobs.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Bookmark className="w-10 h-10 mx-auto text-slate-300 mb-1" />
                  <h4 className="text-sm font-bold text-slate-800">No Saved Jobs Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    When you bookmark jobs in the Explore Jobs section, they will appear here for fast 1-click access.
                  </p>
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
                </div>
              ) : (
                liveSavedJobs.map((item) => {
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
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: INTERVIEW CALENDAR MODAL                        */}
      {/* ========================================================= */}
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
                    Upcoming technical discussions and screening rounds
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
                    When hiring partners shortlist your application and confirm an interview schedule, the calendar time and meeting link will appear here.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowInterviewsModal(false)
                      navigate('/jobs')
                    }}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Apply for More Roles</span>
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
                        <p className="text-xs font-semibold text-purple-700">{item.company}</p>
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

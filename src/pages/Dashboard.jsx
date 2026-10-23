import { useState } from 'react'
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
  CheckCircle,
  MapPin,
  Send,
  Trash2
} from 'lucide-react'

import DashboardHeader from '../components/dashboard/DashboardHeader'
import StatCard from '../components/dashboard/StatCard'
import DashboardStats from '../components/dashboard/DashboardStats'
import QuickActions from '../components/dashboard/QuickActions'
import RecentActivities from '../components/dashboard/RecentActivities'

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
    toggleSaveJob,
    updateApplicationStatus
  } = useDashboard()

  // Modal states
  const [showPostJobModal, setShowPostJobModal] = useState(false)
  const [showExploreModal, setShowExploreModal] = useState(false)
  const [showApplicationsModal, setShowApplicationsModal] = useState(false)
  const [showSavedModal, setShowSavedModal] = useState(false)

  // New Job form state
  const [newJobData, setNewJobData] = useState({
    title: '',
    company: user?.company || (user?.role === 'recruiter' ? 'Apex Cloud Systems' : 'Tech Innovators'),
    category: 'Software & Cloud Engineering',
    location: 'Hybrid - Bengaluru',
    salary: '₹18 - ₹26 LPA',
    type: 'Full-time',
    description: ''
  })

  const isCandidate = user?.role === 'candidate'

  const handleLogout = () => {
    logout()
    toast.info('Logged out successfully.')
    navigate('/login')
  }

  // Quick fill sample job template
  const handleQuickFillJob = () => {
    setNewJobData({
      title: 'Senior Full Stack React Engineer',
      company: user?.company || 'Apex Cloud Systems',
      category: 'Software & Cloud Engineering',
      location: 'Hybrid - Bengaluru, India',
      salary: '₹22 - ₹30 LPA',
      type: 'Full-time',
      description: 'Looking for an experienced React & Node.js architect to lead core talent platform engineering.'
    })
  }

  // Submit new job
  const handleCreateJobSubmit = (e) => {
    e.preventDefault()
    if (!newJobData.title.trim()) {
      toast.error('Please enter a job title')
      return
    }
    addJob(newJobData)
    toast.success(`Job "${newJobData.title}" posted successfully! Available to candidates in real-time.`)
    setShowPostJobModal(false)
    setNewJobData({
      title: '',
      company: user?.company || 'Apex Cloud Systems',
      category: 'Software & Cloud Engineering',
      location: 'Hybrid - Bengaluru',
      salary: '₹18 - ₹26 LPA',
      type: 'Full-time',
      description: ''
    })
  }

  // Candidate apply handler
  const handleApply = (job) => {
    const res = applyToJob(job)
    if (res.success) {
      toast.success(`Application submitted to ${job.company} for "${job.title}"!`)
    } else {
      toast.warning(res.message)
    }
  }

  // Candidate toggle save handler
  const handleToggleSave = (job) => {
    const res = toggleSaveJob(job)
    if (res.saved) {
      toast.success(res.message)
    } else {
      toast.info(res.message)
    }
  }

  // Recruiter advance applicant status handler
  const handleAdvanceStatus = (appId, status) => {
    updateApplicationStatus(appId, status)
    toast.success(`Application status updated to "${status}"!`)
  }

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
                  onClick={() => setShowExploreModal(true)}
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
            />
            <StatCard
              title="Active Job Postings"
              value={metrics.activeJobPostings}
              subtitle="Live requisitions"
              icon={Zap}
              trend={`${metrics.activeJobPostings} Live`}
              theme="purple"
              isLive={metrics.activeJobPostings !== '0'}
            />
            <StatCard
              title="Total Candidates"
              value={metrics.totalCandidates}
              subtitle="Active applicant pool"
              icon={Users}
              trend={`${metrics.totalCandidates} Profiles`}
              theme="emerald"
            />
            <StatCard
              title="Total Applications"
              value={metrics.totalApplications}
              subtitle={isCandidate ? 'My submitted applications' : 'Applications received'}
              icon={FileCheck}
              trend={`${metrics.totalApplications} Applied`}
              theme="amber"
            />
            <StatCard
              title="Saved Jobs"
              value={metrics.savedJobs}
              subtitle="Bookmarked vacancies"
              icon={BookmarkCheck}
              trend={`${metrics.savedJobs} Saved`}
              theme="rose"
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
          onOpenExploreJobs={() => setShowExploreModal(true)}
          onOpenApplications={() => setShowApplicationsModal(true)}
          onOpenSavedJobs={() => setShowSavedModal(true)}
          onOpenInterviews={() => toast.info('Interview Calendar: Synchronized with 0 scheduled calls currently.')}
          onOpenProfile={() => {
            if (user?.role === 'recruiter') {
              navigate('/companies')
            } else {
              toast.success(`Profile active for ${user?.name} (Candidate)`)
            }
          }}
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
      {showPostJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Post New Job Requisition</h3>
                  <p className="text-xs text-slate-500">Publish opening to candidate search in real-time</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPostJobModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateJobSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Full Stack React Engineer"
                  value={newJobData.title}
                  onChange={(e) => setNewJobData({ ...newJobData, title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company *</label>
                  <input
                    type="text"
                    required
                    placeholder="Company Name"
                    value={newJobData.company}
                    onChange={(e) => setNewJobData({ ...newJobData, company: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newJobData.category}
                    onChange={(e) => setNewJobData({ ...newJobData, category: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
                  >
                    <option>Software & Cloud Engineering</option>
                    <option>AI & Data Science</option>
                    <option>Product Management & UX</option>
                    <option>Cybersecurity & DevOps</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Hybrid - Bengaluru"
                    value={newJobData.location}
                    onChange={(e) => setNewJobData({ ...newJobData, location: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Compensation</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹20 - ₹28 LPA"
                    value={newJobData.salary}
                    onChange={(e) => setNewJobData({ ...newJobData, salary: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role Description</label>
                <textarea
                  rows={3}
                  placeholder="Outline responsibilities and skills required..."
                  value={newJobData.description}
                  onChange={(e) => setNewJobData({ ...newJobData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleQuickFillJob}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-800 underline cursor-pointer"
                >
                  ⚡ Auto-fill template
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPostJobModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    Publish Opening
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: EXPLORE JOBS MODAL (Candidate & Recruiter)       */}
      {/* ========================================================= */}
      {showExploreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Explore Job Openings ({liveJobs.length})</h3>
                  <p className="text-xs text-slate-500">Live positions updated dynamically in real-time</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExploreModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
              {liveJobs.length === 0 ? (
                <div className="py-12 text-center">
                  <Briefcase className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <h4 className="text-sm font-bold text-slate-800">No Job Openings Yet (Initial Stage)</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    No active job listings published at this stage. Check back soon for new openings from hiring partners.
                  </p>
                </div>
              ) : (
                liveJobs.map((job) => {
                  const hasApplied = liveApplications.some(
                    (a) => a.jobId === job.id && (a.candidateEmail === user?.email || a.candidateId === user?.id)
                  )
                  const isSaved = liveSavedJobs.some((s) => s.jobId === job.id)

                  return (
                    <div
                      key={job.id}
                      className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{job.title}</h4>
                          <p className="text-xs font-semibold text-cyan-700 mt-0.5">{job.company}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                          {job.category}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {job.location}
                        </span>
                        <span>&bull;</span>
                        <span className="font-semibold text-slate-700">{job.salary}</span>
                        <span>&bull;</span>
                        <span className="text-slate-400">Posted {job.postedAt}</span>
                      </div>

                      {job.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {job.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                        <span className="text-[11px] text-slate-400 font-medium">
                          {job.applicantsCount || 0} candidate applicants
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleSave(job)}
                            className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                              isSaved
                                ? 'bg-amber-50 text-amber-700 border-amber-300'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                            title={isSaved ? 'Remove bookmark' : 'Bookmark job'}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                          </button>

                          {hasApplied ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Applied
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleApply(job)}
                              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Quick Apply</span>
                            </button>
                          )}
                        </div>
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
      {/* MODAL 3: APPLICATION TRACKER MODAL                       */}
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
                    {isCandidate ? 'My Applications Tracker' : 'Candidate Submissions Pool'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isCandidate
                      ? 'Live status tracking across positions you applied to'
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
              {liveApplications.length === 0 ? (
                <div className="py-12 text-center">
                  <FileCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <h4 className="text-sm font-bold text-slate-800">No Applications Recorded Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    {isCandidate
                      ? 'You have not submitted any applications yet. Open Explore Jobs to apply!'
                      : 'No candidate applications received yet for your company.'}
                  </p>
                </div>
              ) : (
                liveApplications.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{app.jobTitle}</h4>
                      <p className="text-xs text-slate-600">
                        {app.company} &bull; Applicant: <span className="font-semibold text-slate-900">{app.candidateName}</span>
                      </p>
                      <span className="text-[10px] text-slate-400">Submitted at {app.appliedAt}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {app.status}
                      </span>

                      {!isCandidate && (
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
      {/* MODAL 4: SAVED OPPORTUNITIES MODAL (Candidate)           */}
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
                <div className="py-12 text-center">
                  <Bookmark className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <h4 className="text-sm font-bold text-slate-800">No Saved Jobs Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    When you bookmark jobs in the Explore Jobs section, they will appear here.
                  </p>
                </div>
              ) : (
                liveSavedJobs.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.jobTitle}</h4>
                      <p className="text-xs text-slate-600">{item.company} &bull; {item.salary}</p>
                      <span className="text-[10px] text-slate-400">Saved at {item.savedAt}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        toggleSaveJob({ id: item.jobId })
                        toast.info('Removed from saved jobs.')
                      }}
                      className="p-2 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 cursor-pointer"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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

import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDashboard } from '../../context/DashboardContext'
import { useAuth } from '../../context/AuthContext'
import { useCompanies } from '../../context/CompanyContext'
import { toast } from 'react-toastify'
import {
  Briefcase,
  MapPin,
  Calendar,
  ArrowLeft,
  Edit3,
  Trash2,
  Bookmark,
  Send,
  Check,
  Building2,
  Clock,
  Users,
  ShieldCheck,
  Share2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Award
} from 'lucide-react'

import DashboardHeader from '../../components/DashboardHeader'
import JobModal from './JobModal'

export default function JobDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const {
    jobs,
    applications,
    savedJobs,
    editJob,
    deleteJob,
    toggleJobStatus,
    applyToJob,
    toggleSaveJob
  } = useDashboard()
  const { companies } = useCompanies()

  const isCandidate = user?.role === 'candidate'

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Find job by ID
  const job = useMemo(() => {
    return jobs.find((j) => String(j.id) === String(id)) || null
  }, [jobs, id])

  // Matched Company Profile if exists
  const matchedCompany = useMemo(() => {
    if (!job) return null
    return (
      companies.find(
        (c) => c.name?.trim().toLowerCase() === job.company?.trim().toLowerCase()
      ) || null
    )
  }, [companies, job])

  // Related jobs in same category or company
  const relatedJobs = useMemo(() => {
    if (!job) return []
    return jobs
      .filter((j) => String(j.id) !== String(job.id) && (j.category === job.category || j.company === job.company))
      .slice(0, 3)
  }, [jobs, job])

  const handleLogout = () => {
    logout()
    toast.info('Logged out successfully.')
    navigate('/login')
  }

  // Candidate Application status
  const applicationRecord = useMemo(() => {
    if (!job) return null
    const candidateEmail = user?.email || 'candidate@jobportal.com'
    const candidateId = user?.id || 'cand_demo'
    return applications.find(
      (a) => a.jobId === job.id && (a.candidateEmail === candidateEmail || a.candidateId === candidateId)
    )
  }, [applications, job, user])

  const isApplied = Boolean(applicationRecord)
  const isSaved = useMemo(() => {
    if (!job) return false
    return savedJobs.some((s) => s.jobId === job.id)
  }, [savedJobs, job])

  const isOpen = job?.status === 'open' || job?.status === 'active'

  // Apply Handler
  const handleApply = () => {
    if (!job) return
    const res = applyToJob(job)
    if (res.success) {
      toast.success(`Application submitted to ${job.company} for "${job.title}"!`)
    } else {
      toast.warning(res.message)
    }
  }

  // Toggle Status Handler
  const handleToggleStatus = () => {
    if (!job) return
    const res = toggleJobStatus(job.id)
    if (res.success) {
      toast.success(
        `Job status changed to ${res.status === 'open' ? 'OPEN' : 'CLOSED'}.`
      )
    }
  }

  // Edit Submit Handler
  const handleEditSubmit = (formData) => {
    setIsSubmitting(true)
    try {
      const res = editJob(job.id, formData)
      if (res.success) {
        toast.success(`Job requisition "${formData.title}" updated successfully!`)
        setIsEditModalOpen(false)
      } else {
        toast.error(res.message || 'Failed to update job.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete Confirm Handler
  const handleDeleteConfirm = () => {
    deleteJob(job.id)
    toast.success(`Job requisition "${job.title}" removed.`)
    navigate('/jobs')
  }

  // Share link handler
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Job requisition link copied to clipboard!')
    }
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
        <DashboardHeader user={user} onLogout={handleLogout} />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-4 shadow-xs">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Job Requisition Not Found</h2>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
            The requested job posting may have been removed or is no longer available.
          </p>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Jobs Hub</span>
          </Link>
        </main>
      </div>
    )
  }

  const companyLogo = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(job.company || 'Company')}`

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col relative overflow-x-hidden selection:bg-cyan-500 selection:text-white">
      {/* Top Header */}
      <DashboardHeader user={user} onLogout={handleLogout} />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link to="/dashboard" className="hover:text-cyan-600 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <Link to="/jobs" className="hover:text-cyan-600 transition-colors">
              Jobs
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold truncate max-w-[200px]">{job.title}</span>
          </nav>

          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-cyan-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Jobs</span>
          </Link>
        </div>

        {/* Job Identity Hero Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
          {/* Top ambient strip */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pt-2">
            {/* Left: Job & Company Title */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <img
                src={companyLogo}
                alt={job.company}
                className="w-20 h-20 sm:w-22 sm:h-22 rounded-3xl object-cover border-2 border-slate-200/90 bg-white p-1.5 shadow-md shrink-0"
              />

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {job.title}
                  </h1>
                  {/* Status Pill */}
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
                      isOpen
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}
                    />
                    <span>{isOpen ? 'Open for Applications' : 'Position Closed'}</span>
                  </span>
                </div>

                {/* Company Name & Location Row */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  {matchedCompany ? (
                    <Link
                      to={`/companies/${matchedCompany.id}`}
                      className="font-bold text-cyan-700 hover:text-cyan-800 flex items-center gap-1 hover:underline"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{job.company}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </Link>
                  ) : (
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.company}</span>
                    </span>
                  )}

                  <span className="text-slate-300">&bull;</span>
                  <span className="flex items-center gap-1 text-slate-500 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.location}</span>
                  </span>
                  <span className="text-slate-300">&bull;</span>
                  <span className="text-slate-900 font-black">{job.salary}</span>
                </div>

                {/* Badges Row */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-100">
                    {job.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                    {job.type}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                    {job.experienceLevel}
                  </span>
                  {job.deadline && (
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-600" />
                      <span>Deadline: {job.deadline}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start sm:self-auto">
              {isCandidate ? (
                /* Candidate Actions */
                <>
                  <button
                    type="button"
                    onClick={() => toggleSaveJob(job)}
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
                      isSaved
                        ? 'bg-rose-50 border-rose-200 text-rose-600'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-slate-50'
                    }`}
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs transition-colors cursor-pointer"
                    title="Share Job Requisition"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  {isApplied ? (
                    <div className="px-5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2 shadow-xs">
                      <Check className="w-4 h-4" />
                      <span>Application Submitted</span>
                    </div>
                  ) : !isOpen ? (
                    <button
                      type="button"
                      disabled
                      className="px-5 py-2.5 rounded-xl bg-slate-200 text-slate-500 font-bold text-xs cursor-not-allowed"
                    >
                      Applications Closed
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApply}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-2 cursor-pointer transition-all transform hover:scale-[1.02]"
                    >
                      <Send className="w-4 h-4" />
                      <span>Apply Now</span>
                    </button>
                  )}
                </>
              ) : (
                /* Recruiter Actions */
                <>
                  <button
                    type="button"
                    onClick={handleToggleStatus}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                      isOpen
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    {isOpen ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    <span>{isOpen ? 'Mark Closed' : 'Mark Open'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs hover:border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Edit Job</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-600 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Description, Responsibilities, Skills, Candidate Banner (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Candidate Applied Status Banner */}
            {isApplied && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 flex items-start gap-4">
                <div className="p-2 rounded-2xl bg-emerald-500 text-white shrink-0 shadow-xs">
                  <Check className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-emerald-900">
                    Application Successfully Submitted!
                  </h3>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    Your profile was dispatched to the {job.company} talent team on{' '}
                    <span className="font-semibold">{applicationRecord.appliedAt}</span>. Current status:{' '}
                    <span className="font-bold uppercase tracking-wider">{applicationRecord.status}</span>.
                  </p>
                </div>
              </div>
            )}

            {/* Role Overview */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Role Overview & Description
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>

            {/* Key Responsibilities */}
            {job.responsibilities && (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
                    <Award className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Core Responsibilities & Deliverables
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {job.responsibilities}
                </p>
              </div>
            )}

            {/* Required Skills & Tech Stack */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600 border border-cyan-100">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Required Skills & Competencies
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-semibold">
                  {Array.isArray(job.skills) ? job.skills.length : 0} Tech Stacks
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {Array.isArray(job.skills) && job.skills.length > 0 ? (
                  job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-200 border border-slate-200/80 text-xs font-semibold text-slate-800 transition-colors shadow-2xs"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No specific skills listed.</span>
                )}
              </div>
            </div>

            {/* Bottom Quick Apply Callout for Candidates */}
            {isCandidate && !isApplied && isOpen && (
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Ready to take the next step in your career?
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Submit your application directly to the {job.company} recruitment pipeline.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-500/25 flex items-center gap-2 cursor-pointer shrink-0 transition-all transform hover:scale-[1.02]"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Application</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Fast Facts & Hiring Partner Profile (1 col) */}
          <div className="space-y-6">
            {/* Requisition Fast Facts */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center justify-between">
                <span>Requisition Fast Facts</span>
                <Clock className="w-4 h-4 text-slate-400" />
              </h3>

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Job Category</span>
                  <span className="font-bold text-slate-800">{job.category}</span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Employment Arrangement</span>
                  <span className="font-bold text-slate-800">{job.type}</span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Experience Level</span>
                  <span className="font-bold text-slate-800">{job.experienceLevel}</span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Compensation Package</span>
                  <span className="font-bold text-slate-900">{job.salary}</span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Location</span>
                  <span className="font-semibold text-slate-800">{job.location}</span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Application Deadline</span>
                  <span className="font-semibold text-slate-800">{job.deadline || 'Ongoing Review'}</span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Total Applicants</span>
                  <span className="font-bold text-cyan-700 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{job.applicantsCount || 0} candidate submissions</span>
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-[11px] font-bold text-emerald-800 leading-tight">
                    Verified Corporate Requisition &bull; Actively Reviewed
                  </span>
                </div>
              </div>
            </div>

            {/* Company Profile Card */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center justify-between">
                <span>Hiring Organization</span>
                <Building2 className="w-4 h-4 text-slate-400" />
              </h3>

              <div className="flex items-center gap-3">
                <img
                  src={companyLogo}
                  alt={job.company}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 bg-white p-1 shadow-2xs"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{job.company}</h4>
                  <span className="text-[11px] text-slate-500 block">Verified Hiring Partner</span>
                </div>
              </div>

              {matchedCompany && (
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {matchedCompany.description}
                </p>
              )}

              {matchedCompany ? (
                <Link
                  to={`/companies/${matchedCompany.id}`}
                  className="inline-flex items-center gap-1.5 w-full justify-center px-4 py-2 rounded-xl bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>View Full Company Profile</span>
                </Link>
              ) : (
                <Link
                  to="/companies"
                  className="inline-flex items-center gap-1.5 w-full justify-center px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Explore Company Directory</span>
                </Link>
              )}
            </div>

            {/* Related Jobs from Same Category */}
            {relatedJobs.length > 0 && (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                  Related Openings
                </h3>

                <div className="space-y-2.5">
                  {relatedJobs.map((rj) => (
                    <Link
                      key={rj.id}
                      to={`/jobs/${rj.id}`}
                      className="p-3 rounded-2xl border border-slate-200/80 hover:border-cyan-200 bg-slate-50/60 hover:bg-white transition-all block group"
                    >
                      <h5 className="text-xs font-bold text-slate-900 group-hover:text-cyan-700 transition-colors line-clamp-1">
                        {rj.title}
                      </h5>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                        <span>{rj.company}</span>
                        <span className="font-semibold text-slate-800">{rj.salary}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Job Modal */}
      <JobModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={job}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto shadow-xs">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Job Requisition?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <span className="font-bold text-slate-800">"{job.title}"</span>? This will permanently close the opening.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

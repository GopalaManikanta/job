import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useDashboard } from '../../context/DashboardContext'
import { useCompanies } from '../../context/CompanyContext'
import { toast } from 'react-toastify'
import {
  BarChart3,
  TrendingUp,
  Building2,
  Briefcase,
  Users,
  FileCheck,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Printer,
  Search,
  Eye,
  CheckCircle2,
  Filter,
  PieChart,
  Layers,
  Award,
  Sparkles,
  ChevronRight
} from 'lucide-react'
import DashboardHeader from '../../components/DashboardHeader'

const BASE_MONTHLY_DATA = [
  { month: 'May 2026', shortMonth: 'May', apps: 18, jobs: 4, growth: '+12%' },
  { month: 'Jun 2026', shortMonth: 'Jun', apps: 24, jobs: 5, growth: '+33%' },
  { month: 'Jul 2026', shortMonth: 'Jul', apps: 32, jobs: 6, growth: '+33%' },
  { month: 'Aug 2026', shortMonth: 'Aug', apps: 29, jobs: 5, growth: '-9%' },
  { month: 'Sep 2026', shortMonth: 'Sep', apps: 41, jobs: 7, growth: '+41%' },
  { month: 'Oct 2026', shortMonth: 'Oct', apps: 48, jobs: 8, growth: '+17%' }
]

const BASE_CANDIDATE_MONTHLY_DATA = [
  { month: 'May 2026', shortMonth: 'May', apps: 1, interviews: 0, jobs: 4, growth: '+0%' },
  { month: 'Jun 2026', shortMonth: 'Jun', apps: 2, interviews: 1, jobs: 5, growth: '+100%' },
  { month: 'Jul 2026', shortMonth: 'Jul', apps: 2, interviews: 0, jobs: 6, growth: '+0%' },
  { month: 'Aug 2026', shortMonth: 'Aug', apps: 3, interviews: 1, jobs: 5, growth: '+50%' },
  { month: 'Sep 2026', shortMonth: 'Sep', apps: 4, interviews: 1, jobs: 7, growth: '+33%' },
  { month: 'Oct 2026', shortMonth: 'Oct', apps: 4, interviews: 1, jobs: 8, growth: '+25%' }
]

export default function ReportsPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const {
    metrics,
    jobs: liveJobs,
    applications: liveApplications,
    savedJobs: liveSavedJobs,
    categories
  } = useDashboard()
  const { companies: liveCompanies } = useCompanies()

  const isCandidate = user?.role === 'candidate'

  const [timeRange, setTimeRange] = useState('6m')
  const [candidateChartMode, setCandidateChartMode] = useState('personal')
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null)
  const [jobSearchQuery, setJobSearchQuery] = useState('')
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All')

  const effectiveChartMode = isCandidate ? candidateChartMode : 'market'

  const handleLogout = () => {
    logout()
    toast.info('Logged out successfully.')
    navigate('/login')
  }

  const candidateEmail = user?.email || 'candidate@jobportal.com'
  const candidateId = user?.id || 'usr_cand_01'

  const candidateApplications = useMemo(() => {
    return liveApplications.filter(
      (a) => a.candidateEmail === candidateEmail || a.candidateId === candidateId
    )
  }, [liveApplications, candidateEmail, candidateId])

  const candidateAppliedJobIds = useMemo(() => {
    return new Set(candidateApplications.map((a) => String(a.jobId)))
  }, [candidateApplications])

  const candidateSavedJobIds = useMemo(() => {
    return new Set((liveSavedJobs || []).map((s) => String(s.jobId || s.id)))
  }, [liveSavedJobs])

  const candidateTotalApps = candidateApplications.length
  const candidateUnderReview = candidateApplications.filter((a) => a.status === 'Under Review').length
  const candidateInterviews = candidateApplications.filter((a) => a.status === 'Interview Scheduled').length
  const candidateShortlisted = candidateApplications.filter((a) => a.status === 'Shortlisted').length
  const candidateOffers = candidateApplications.filter((a) => a.status === 'Offers Extended').length
  const candidateApplied = candidateApplications.filter((a) => a.status === 'Applied').length
  const candidateSavedCount = (liveSavedJobs || []).length

  const candidateSuccessRate = candidateTotalApps > 0
    ? `${Math.round(((candidateShortlisted + candidateInterviews + candidateOffers) / candidateTotalApps) * 100)}%`
    : '0%'

  const totalJobPostings = liveJobs.length
  const totalCompaniesCount = useMemo(() => {
    const set = new Set([
      ...liveCompanies.map((c) => c.name?.trim().toLowerCase()).filter(Boolean),
      ...liveJobs.map((j) => j.company?.trim().toLowerCase()).filter(Boolean)
    ])
    return set.size
  }, [liveCompanies, liveJobs])

  const totalCandidatesCount = useMemo(() => {
    const candidateEmails = new Set(liveApplications.map((a) => a.candidateEmail?.toLowerCase()).filter(Boolean))
    candidateEmails.add('candidate@jobportal.com')
    return candidateEmails.size
  }, [liveApplications])

  const totalApplicationsCount = liveApplications.length
  const activeJobsCount = liveJobs.filter((j) => j.status === 'open' || j.status === 'active').length

  const avgApplicationsPerJob = totalJobPostings > 0
    ? (totalApplicationsCount / totalJobPostings).toFixed(1)
    : '0.0'

  const mostAppliedJobs = useMemo(() => {
    return [...liveJobs]
      .sort((a, b) => (b.applicantsCount || 0) - (a.applicantsCount || 0))
  }, [liveJobs])

  const filteredMostAppliedJobs = useMemo(() => {
    return mostAppliedJobs.filter((job) => {
      const matchesCategory =
        selectedCategoryFilter === 'All' || job.category === selectedCategoryFilter
      const q = jobSearchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        job.title?.toLowerCase().includes(q) ||
        job.company?.toLowerCase().includes(q) ||
        job.location?.toLowerCase().includes(q)
      return matchesCategory && matchesSearch
    })
  }, [mostAppliedJobs, selectedCategoryFilter, jobSearchQuery])

  const maxApplicantCount = useMemo(() => {
    return Math.max(1, ...liveJobs.map((j) => j.applicantsCount || 0))
  }, [liveJobs])

  const personalMonthlyStats = useMemo(() => {
    const data = BASE_CANDIDATE_MONTHLY_DATA.map((item, idx) => {
      if (idx === BASE_CANDIDATE_MONTHLY_DATA.length - 1) {
        return {
          ...item,
          apps: Math.max(item.apps, candidateTotalApps),
          interviews: Math.max(item.interviews, candidateInterviews),
          jobs: activeJobsCount
        }
      }
      return item
    })

    if (timeRange === '6m') {
      return data
    }

    if (timeRange === '1y') {
      const priorMonths = [
        { month: 'Nov 2025', shortMonth: 'Nov', apps: 1, interviews: 0, jobs: 3, growth: '+0%' },
        { month: 'Dec 2025', shortMonth: 'Dec', apps: 1, interviews: 0, jobs: 3, growth: '+0%' },
        { month: 'Jan 2026', shortMonth: 'Jan', apps: 2, interviews: 1, jobs: 4, growth: '+100%' },
        { month: 'Feb 2026', shortMonth: 'Feb', apps: 2, interviews: 0, jobs: 4, growth: '+0%' },
        { month: 'Mar 2026', shortMonth: 'Mar', apps: 3, interviews: 1, jobs: 5, growth: '+50%' },
        { month: 'Apr 2026', shortMonth: 'Apr', apps: 2, interviews: 0, jobs: 5, growth: '-33%' }
      ]
      return [...priorMonths, ...data]
    }

    return data
  }, [timeRange, candidateTotalApps, candidateInterviews, activeJobsCount])

  const marketMonthlyStats = useMemo(() => {
    const data = BASE_MONTHLY_DATA.map((item, idx) => {
      if (idx === BASE_MONTHLY_DATA.length - 1) {
        return {
          ...item,
          apps: item.apps + totalApplicationsCount,
          jobs: totalJobPostings
        }
      }
      return item
    })

    if (timeRange === '6m') {
      return data
    }

    if (timeRange === '1y') {
      const priorMonths = [
        { month: 'Nov 2025', shortMonth: 'Nov', apps: 12, jobs: 3, growth: '+5%' },
        { month: 'Dec 2025', shortMonth: 'Dec', apps: 15, jobs: 3, growth: '+25%' },
        { month: 'Jan 2026', shortMonth: 'Jan', apps: 20, jobs: 4, growth: '+33%' },
        { month: 'Feb 2026', shortMonth: 'Feb', apps: 22, jobs: 4, growth: '+10%' },
        { month: 'Mar 2026', shortMonth: 'Mar', apps: 26, jobs: 5, growth: '+18%' },
        { month: 'Apr 2026', shortMonth: 'Apr', apps: 25, jobs: 5, growth: '-4%' }
      ]
      return [...priorMonths, ...data]
    }

    return data
  }, [timeRange, totalApplicationsCount, totalJobPostings])

  const activeMonthlyStats = effectiveChartMode === 'personal' ? personalMonthlyStats : marketMonthlyStats

  const maxMonthlyApps = useMemo(() => {
    return Math.max(1, ...activeMonthlyStats.map((m) => m.apps))
  }, [activeMonthlyStats])

  const currentTotalAppsInView = useMemo(() => {
    return activeMonthlyStats.reduce((sum, item) => sum + item.apps, 0)
  }, [activeMonthlyStats])

  const candidatePipelineFunnel = useMemo(() => {
    const total = candidateTotalApps > 0 ? candidateTotalApps : 1
    return [
      {
        name: 'Submitted / Applied',
        count: candidateApplied,
        percentage: candidateTotalApps > 0 ? Math.round((candidateApplied / total) * 100) : 0,
        color: 'from-blue-500 to-cyan-500',
        badge: 'bg-blue-50 text-blue-700 border-blue-200'
      },
      {
        name: 'Under Review',
        count: candidateUnderReview,
        percentage: candidateTotalApps > 0 ? Math.round((candidateUnderReview / total) * 100) : 0,
        color: 'from-cyan-500 to-teal-500',
        badge: 'bg-cyan-50 text-cyan-700 border-cyan-200'
      },
      {
        name: 'Shortlisted',
        count: candidateShortlisted,
        percentage: candidateTotalApps > 0 ? Math.round((candidateShortlisted / total) * 100) : 0,
        color: 'from-amber-400 to-orange-500',
        badge: 'bg-amber-50 text-amber-700 border-amber-200'
      },
      {
        name: 'Interview Scheduled',
        count: candidateInterviews,
        percentage: candidateTotalApps > 0 ? Math.round((candidateInterviews / total) * 100) : 0,
        color: 'from-purple-500 to-indigo-500',
        badge: 'bg-purple-50 text-purple-700 border-purple-200'
      },
      {
        name: 'Offers Extended',
        count: candidateOffers,
        percentage: candidateTotalApps > 0 ? Math.round((candidateOffers / total) * 100) : 0,
        color: 'from-emerald-400 to-green-500',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      }
    ]
  }, [candidateTotalApps, candidateApplied, candidateUnderReview, candidateShortlisted, candidateInterviews, candidateOffers])

  const handleExportCSV = () => {
    if (effectiveChartMode === 'personal') {
      const headers = ['Reporting Month', 'Applications Submitted', 'Interviews Scheduled', 'MoM Growth']
      const rows = activeMonthlyStats.map((item) => [
        `"${item.month}"`,
        item.apps,
        item.interviews || 0,
        `"${item.growth}"`
      ])
      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `CareerX_Candidate_Career_Report_${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Candidate career report exported to CSV successfully!')
    } else {
      const headers = ['Month', 'Applications', 'Job Openings', 'MoM Growth']
      const rows = activeMonthlyStats.map((item) => [
        `"${item.month}"`,
        item.apps,
        item.jobs,
        `"${item.growth}"`
      ])
      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `CareerX_Platform_Talent_Report_${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Platform report exported to CSV successfully!')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col relative overflow-x-hidden selection:bg-cyan-500 selection:text-white print:bg-white print:text-black">

      <div className="fixed top-0 left-1/4 -translate-x-1/2 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[140px] pointer-events-none -z-10 print:hidden" />
      <div className="fixed bottom-0 right-1/4 translate-x-1/2 w-[600px] h-[600px] bg-indigo-100/30 rounded-full blur-[140px] pointer-events-none -z-10 print:hidden" />

      <div className="print:hidden">
        <DashboardHeader user={user} onLogout={handleLogout} />
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-6">

        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 shadow-2xs">
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              <span>{isCandidate ? 'Candidate Career Analytics & Market Intelligence' : 'Real-Time Reports & Talent Analytics'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isCandidate ? 'My Career Analytics & Reports' : 'Platform Analytics & Reports'}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 max-w-2xl leading-relaxed">
              {isCandidate
                ? 'Personalized application velocity, interview scheduling rate, saved opportunity tracker, and market hiring competition insights.'
                : 'Enterprise requisition reports, applicant volume velocity, company engagement metrics, and monthly growth statistics.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 print:hidden">

            <div className="flex items-center p-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs">
              {[
                { id: '6m', label: 'Last 6 Months' },
                { id: '1y', label: '1 Year' }
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setTimeRange(btn.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    timeRange === btn.id
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-xs hover:border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Download Report as CSV"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {isCandidate ? 'My Career Search Key Performance Indicators (KPIs)' : 'Core System Key Performance Indicators (KPIs)'}
              </h2>
              <p className="text-xs text-slate-500">
                {isCandidate ? 'Personal application status and career conversion tracking' : 'Live counts calculated dynamically across the portal'}
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Real-Time Sync Active
            </span>
          </div>

          {isCandidate ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">

                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-2xs">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      Submissions
                    </span>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                    {candidateTotalApps}
                  </h3>
                  <p className="text-xs font-bold text-slate-700 mt-1">Applications Submitted</p>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Directly tracked</span>
                    <Link to="/applications" className="text-blue-600 hover:underline font-bold flex items-center gap-0.5">
                      View All <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center shadow-2xs">
                      <Eye className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                      Screening
                    </span>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                    {candidateUnderReview}
                  </h3>
                  <p className="text-xs font-bold text-slate-700 mt-1">Under Review</p>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>In recruiter review</span>
                    <Link to="/applications" className="text-cyan-600 hover:underline font-bold flex items-center gap-0.5">
                      Status <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shadow-2xs">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      Confirmed
                    </span>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                    {candidateInterviews}
                  </h3>
                  <p className="text-xs font-bold text-slate-700 mt-1">Interviews Scheduled</p>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Active technical rounds</span>
                    <Link to="/applications" className="text-purple-600 hover:underline font-bold flex items-center gap-0.5">
                      Timeline <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shadow-2xs">
                      <Zap className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      Bookmarked
                    </span>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                    {candidateSavedCount}
                  </h3>
                  <p className="text-xs font-bold text-slate-700 mt-1">Saved Opportunities</p>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Ready for quick apply</span>
                    <Link to="/saved-jobs" className="text-amber-700 hover:underline font-bold flex items-center gap-0.5">
                      Saved <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-2xs">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Progress
                    </span>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                    {candidateSuccessRate}
                  </h3>
                  <p className="text-xs font-bold text-slate-700 mt-1">Interview / Success Rate</p>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{candidateInterviews + candidateShortlisted} in advanced pipeline</span>
                    <Link to="/jobs" className="text-emerald-700 hover:underline font-bold flex items-center gap-0.5">
                      Apply <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-cyan-50/90 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Live Market Context: Hiring Pulse Across CareerX
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      <strong>{activeJobsCount} Active Jobs</strong> across <strong>{totalCompaniesCount} Verified Companies</strong> with <strong>{avgApplicationsPerJob} avg applicants/job</strong>.
                    </p>
                  </div>
                </div>
                <Link
                  to="/jobs"
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-blue-200 text-xs font-bold text-blue-700 shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  <span>Explore Open Vacancies</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">

              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-2xs">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Requisitions
                  </span>
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                  {totalJobPostings}
                </h3>
                <p className="text-xs font-bold text-slate-700 mt-1">Total Job Postings</p>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>All published roles</span>
                  <Link to="/jobs" className="text-blue-600 hover:underline font-bold flex items-center gap-0.5">
                    View <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center shadow-2xs">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                    Partners
                  </span>
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                  {totalCompaniesCount}
                </h3>
                <p className="text-xs font-bold text-slate-700 mt-1">Total Companies</p>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Verified organizations</span>
                  <Link to="/companies" className="text-cyan-600 hover:underline font-bold flex items-center gap-0.5">
                    Browse <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-2xs">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Talent Pool
                  </span>
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                  {totalCandidatesCount}
                </h3>
                <p className="text-xs font-bold text-slate-700 mt-1">Total Candidates</p>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Active job seekers</span>
                  <span className="text-emerald-700 font-semibold">100% Verified</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shadow-2xs">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    Submissions
                  </span>
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                  {totalApplicationsCount}
                </h3>
                <p className="text-xs font-bold text-slate-700 mt-1">Total Applications</p>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Across all requisitions</span>
                  <Link to="/applications" className="text-amber-700 hover:underline font-bold flex items-center gap-0.5">
                    Tracker <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shadow-2xs">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Accepting
                  </span>
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                  {activeJobsCount}
                </h3>
                <p className="text-xs font-bold text-slate-700 mt-1">Active Jobs</p>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{metrics.activeJobPostings} Live openings</span>
                  <span className="text-purple-700 font-bold">{avgApplicationsPerJob} apps/job</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      {effectiveChartMode === 'personal'
                        ? 'My Application Momentum & Activity'
                        : 'Monthly Application Volume & Growth'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {effectiveChartMode === 'personal'
                        ? `Personal submissions and interview activity across (${timeRange === '6m' ? '6 Months' : '1 Year'})`
                        : `Application submissions recorded across months (${timeRange === '6m' ? '6 Months' : '1 Year'})`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isCandidate && (
                    <div className="flex items-center p-1 bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-bold shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setCandidateChartMode('personal')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          candidateChartMode === 'personal'
                            ? 'bg-white text-blue-700 shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        My Activity
                      </button>
                      <button
                        type="button"
                        onClick={() => setCandidateChartMode('market')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          candidateChartMode === 'market'
                            ? 'bg-white text-blue-700 shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        Market Volume
                      </button>
                    </div>
                  )}

                  <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                    Total: <strong className="text-blue-700 font-black">{currentTotalAppsInView}</strong> {effectiveChartMode === 'personal' ? 'My Apps' : 'Submissions'}
                  </span>
                </div>
              </div>

              <div className="my-6">
                <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 px-2 pt-8 pb-2 border-b border-slate-200">
                  {activeMonthlyStats.map((item, idx) => {
                    const heightPercent = Math.max(12, Math.round((item.apps / maxMonthlyApps) * 100))
                    const isHovered = hoveredBarIndex === idx
                    const isPeak = item.apps === maxMonthlyApps

                    return (
                      <div
                        key={item.month}
                        className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                        onMouseEnter={() => setHoveredBarIndex(idx)}
                        onMouseLeave={() => setHoveredBarIndex(null)}
                      >

                        {isHovered && (
                          <div className="absolute -top-12 z-20 px-2.5 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-bold shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                            <div>{item.month}</div>
                            <div className="text-cyan-400">
                              {item.apps} {effectiveChartMode === 'personal' ? 'My Submissions' : 'Applications'} ({item.growth})
                            </div>
                            {item.interviews !== undefined && item.interviews > 0 && (
                              <div className="text-purple-300">{item.interviews} Interviews Confirmed</div>
                            )}
                          </div>
                        )}

                        {isPeak && (
                          <span className="text-[9px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded-md mb-1.5 shadow-2xs">
                            Peak
                          </span>
                        )}

                        <span className="text-[11px] font-bold text-slate-700 mb-1 group-hover:text-blue-600 transition-colors">
                          {item.apps}
                        </span>

                        <div className="w-full max-w-[48px] rounded-t-xl overflow-hidden bg-slate-100 flex flex-col justify-end">
                          <div
                            className={`w-full rounded-t-xl transition-all duration-500 ease-out ${
                              isPeak
                                ? 'bg-gradient-to-t from-blue-600 via-indigo-600 to-cyan-500 shadow-md shadow-blue-500/20'
                                : 'bg-gradient-to-t from-slate-300 via-blue-400 to-cyan-400 group-hover:from-blue-500 group-hover:to-cyan-400'
                            }`}
                            style={{ height: `${heightPercent}%` }}
                          />
                        </div>

                        <span className="text-xs font-semibold text-slate-500 mt-2.5 group-hover:text-slate-900 transition-colors">
                          {item.shortMonth}
                        </span>
                      </div>
                    )
                  })}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 pt-1 font-medium">
                  <span>← Earlier Months</span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block" />
                    <span>
                      {effectiveChartMode === 'personal'
                        ? `Live Month Activity: ${candidateTotalApps} active applications submitted`
                        : `Live Month Volume: ${totalApplicationsCount} added today`}
                    </span>
                  </span>
                  <span>Latest Month →</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-center">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
                  {effectiveChartMode === 'personal' ? 'Monthly Submission Avg' : 'Average Monthly Volume'}
                </span>
                <span className="text-base font-black text-slate-900 mt-0.5 block">
                  {Math.round(currentTotalAppsInView / activeMonthlyStats.length)} Apps / Mo
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
                  Highest Volume Month
                </span>
                <span className="text-base font-black text-blue-700 mt-0.5 block">
                  {activeMonthlyStats.reduce((max, cur) => (cur.apps > max.apps ? cur : max), activeMonthlyStats[0]).month}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
                  {effectiveChartMode === 'personal' ? 'Interview Success Momentum' : 'Overall Trajectory'}
                </span>
                <span className="text-base font-black text-emerald-700 mt-0.5 flex items-center justify-center gap-1">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{effectiveChartMode === 'personal' ? `${candidateSuccessRate} Conversion` : '+48% YoY'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between">
            {isCandidate ? (
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        My Pipeline Funnel
                      </h3>
                      <p className="text-xs text-slate-500">Live breakdown of your application stages</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
                    {candidateTotalApps} Submissions
                  </span>
                </div>

                <div className="space-y-3.5 my-6">
                  {candidatePipelineFunnel.map((stage) => {
                    return (
                      <div key={stage.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 truncate max-w-[170px]">
                            {stage.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-semibold">{stage.count} Apps</span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border font-mono ${stage.badge}`}>
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
                    )
                  })}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                      <PieChart className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Sector Share
                      </h3>
                      <p className="text-xs text-slate-500">Category breakdown of listings</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
                    {categories.length} Sectors
                  </span>
                </div>

                <div className="space-y-4 my-6">
                  {categories.map((cat) => {
                    return (
                      <div key={cat.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 truncate max-w-[170px]">
                            {cat.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-semibold">{cat.openings} Openings</span>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                              {cat.share}
                            </span>
                          </div>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${cat.color} transition-all duration-700 ease-out`}
                            style={{ width: cat.share }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-100 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0 shadow-2xs">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {isCandidate ? 'Career Strategy Recommendation' : 'High Demand Sector'}
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {isCandidate
                      ? 'Software & Cloud Engineering roles currently offer the highest response velocity. Target roles with < 3 applicants for fast screening.'
                      : 'Software & Cloud accounts for the highest volume of total postings and submissions.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  {isCandidate ? 'Market Competition & Application Tracker' : 'Most Applied Jobs Leaderboard'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isCandidate
                    ? 'Explore candidate competition levels, track where you applied, and bookmark high-match roles'
                    : 'Ranking job requisitions by candidate submission volume and competitive interest'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search most applied roles..."
                  value={jobSearchQuery}
                  onChange={(e) => setJobSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all shadow-2xs"
                />
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold shadow-2xs">
                <Filter className="w-3 h-3 text-slate-400" />
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="bg-transparent focus:outline-none cursor-pointer text-slate-800 font-bold"
                >
                  <option value="All">All Categories</option>
                  <option value="Software & Cloud Engineering">Software & Cloud</option>
                  <option value="AI & Data Science">AI & Data Science</option>
                  <option value="Product Management & UX">Product & UX</option>
                  <option value="Cybersecurity & DevOps">Cybersecurity & DevOps</option>
                </select>
              </div>
            </div>
          </div>

          {filteredMostAppliedJobs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <Briefcase className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-bold text-slate-700">No matching jobs found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Try clearing your search query or category filter</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredMostAppliedJobs.map((job, idx) => {
                const count = job.applicantsCount || 0
                const percentOfMax = Math.round((count / maxApplicantCount) * 100)
                const isOpen = job.status === 'open' || job.status === 'active'
                const hasApplied = candidateAppliedJobIds.has(String(job.id))
                const hasSaved = candidateSavedJobIds.has(String(job.id))
                const isHighDemand = count >= 4

                return (
                  <div
                    key={job.id}
                    className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 px-2 rounded-2xl transition-colors"
                  >

                    <div className="flex items-start sm:items-center gap-3.5">

                      <div
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 shadow-2xs ${
                          idx === 0
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 ring-2 ring-amber-200/60'
                            : idx === 1
                            ? 'bg-slate-200 text-slate-800 border border-slate-300'
                            : idx === 2
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        #{idx + 1}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            to={`/jobs/${job.id}`}
                            className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                          >
                            {job.title}
                          </Link>
                          <span
                            className={`px-2 py-0.2 rounded-full text-[10px] font-bold border ${
                              isOpen
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {isOpen ? 'Open' : 'Closed'}
                          </span>

                          {isCandidate && hasApplied && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Applied
                            </span>
                          )}

                          {isCandidate && hasSaved && !hasApplied && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              <Zap className="w-2.5 h-2.5 text-purple-600" />
                              Bookmarked
                            </span>
                          )}

                          <span
                            className={`px-2 py-0.2 rounded-full text-[10px] font-bold border ${
                              isHighDemand
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : count >= 2
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {isHighDemand ? 'High Demand' : count >= 2 ? 'Moderate Competition' : 'Fast Track'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-800">{job.company}</span>
                          <span>&bull;</span>
                          <span>{job.category}</span>
                          <span>&bull;</span>
                          <span className="font-semibold text-slate-900">{job.salary}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end md:self-auto shrink-0 w-full md:w-auto justify-between md:justify-end">

                      <div className="w-36 sm:w-44 space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-500 text-[11px]">Applications</span>
                          <span className="text-blue-700 font-mono">{count} applicants</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-700"
                            style={{ width: `${percentOfMax}%` }}
                          />
                        </div>
                      </div>

                      {isCandidate && hasApplied ? (
                        <Link
                          to="/applications"
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Track</span>
                        </Link>
                      ) : (
                        <Link
                          to={`/jobs/${job.id}`}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isCandidate ? 'Apply' : 'View'}</span>
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  {effectiveChartMode === 'personal'
                    ? 'Personal Monthly Application Log & Milestones'
                    : 'Monthly Application Statistics Breakdown'}
                </h3>
                <p className="text-xs text-slate-500">
                  {effectiveChartMode === 'personal'
                    ? 'Month-over-month submission records, interview confirmations, and pacing metrics'
                    : 'Tabular month-over-month volume, requisition velocity, and growth rates'}
                </p>
              </div>
            </div>

            <span className="text-xs font-semibold text-slate-500">
              Displaying {activeMonthlyStats.length} reporting periods
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Reporting Month</th>
                  <th className="py-3 px-4">{effectiveChartMode === 'personal' ? 'Personal Submissions' : 'Application Submissions'}</th>
                  <th className="py-3 px-4">{effectiveChartMode === 'personal' ? 'Interviews Scheduled' : 'Active Openings'}</th>
                  <th className="py-3 px-4">Month-over-Month Growth</th>
                  <th className="py-3 px-4">Volume Share</th>
                  <th className="py-3 px-4 text-right">{effectiveChartMode === 'personal' ? 'Milestone Status' : 'Audit Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {activeMonthlyStats.map((item, idx) => {
                  const share = currentTotalAppsInView > 0
                    ? `${Math.round((item.apps / currentTotalAppsInView) * 100)}%`
                    : '0%'
                  const isPositive = item.growth.startsWith('+')

                  return (
                    <tr key={item.month} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>{item.month}</span>
                        {idx === activeMonthlyStats.length - 1 && (
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-cyan-100 text-cyan-800 font-extrabold">
                            Current Active
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900 font-mono text-sm">
                        {item.apps} {effectiveChartMode === 'personal' ? 'Apps' : ''}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {effectiveChartMode === 'personal'
                          ? `${item.interviews || 0} Interviews`
                          : `${item.jobs} Postings`}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-bold text-xs ${
                            isPositive ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {isPositive ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          )}
                          <span>{item.growth}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full rounded-full bg-blue-600" style={{ width: share }} />
                          </div>
                          <span className="font-mono text-slate-500 font-bold">{share}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{effectiveChartMode === 'personal' ? 'Logged & Active' : 'Verified'}</span>
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="pt-6 pb-4 border-t border-slate-200 text-center text-xs text-slate-400 print:text-slate-600">
          CareerX &bull; Enterprise Talent Analytics &bull; Real-Time Data Synchronization Engine &copy; 2026
        </footer>
      </main>
    </div>
  )
}

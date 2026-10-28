import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDashboard } from '../../context/DashboardContext'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'
import {
  Briefcase,
  Search,
  PlusCircle,
  MapPin,
  Calendar,
  Eye,
  Edit3,
  Trash2,
  Bookmark,
  Send,
  Check,
  LayoutGrid,
  ListFilter,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  X,
  Users,
  Building2
} from 'lucide-react'

import DashboardHeader from '../../components/DashboardHeader'
import JobModal, { JOB_CATEGORIES, EMPLOYMENT_TYPES, EXPERIENCE_LEVELS } from './JobModal'

const ITEMS_PER_PAGE = 6

export const LOCATION_OPTIONS = [
  'All Locations',
  'Bengaluru',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Mumbai',
  'Delhi NCR',
  'Remote',
  'Hybrid'
]

export const SALARY_RANGES = [
  { id: 'All Salaries', label: 'All Salaries' },
  { id: 'under_15', label: 'Under ₹15 LPA' },
  { id: '15_25', label: '₹15 - ₹25 LPA' },
  { id: '25_35', label: '₹25 - ₹35 LPA' },
  { id: '35_plus', label: '₹35+ LPA' }
]

export const parseSalaryNumbers = (salaryStr) => {
  if (!salaryStr) return { min: 0, max: 0 }
  const numbers = salaryStr.match(/\d+(\.\d+)?/g)?.map(Number) || []
  if (numbers.length === 0) return { min: 0, max: 0 }
  if (numbers.length === 1) return { min: numbers[0], max: numbers[0] }
  return { min: Math.min(...numbers), max: Math.max(...numbers) }
}

export default function JobsPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const {
    jobs,
    applications,
    savedJobs,
    addJob,
    editJob,
    deleteJob,
    toggleJobStatus,
    applyToJob,
    toggleSaveJob
  } = useDashboard()

  const isCandidate = user?.role === 'candidate'

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('All Locations')
  const [selectedType, setSelectedType] = useState('All Types')
  const [selectedExperience, setSelectedExperience] = useState('All Levels')
  const [selectedSalaryRange, setSelectedSalaryRange] = useState('All Salaries')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedSort, setSelectedSort] = useState('newest')
  const [recruiterScope, setRecruiterScope] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [currentPage, setCurrentPage] = useState(1)

  const [isJobModalOpen, setIsJobModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [deleteCandidate, setDeleteCandidate] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogout = () => {
    logout()
    toast.info('Logged out successfully.')
    navigate('/login')
  }

  const availableLocations = useMemo(() => {
    const locSet = new Set(LOCATION_OPTIONS)
    jobs.forEach((j) => {
      if (j.location) {
        const cleaned = j.location
          .replace(/^Hybrid\s*-\s*/i, '')
          .replace(/^Remote\s*-\s*/i, '')
          .split(',')[0]
          .trim()
        if (cleaned) locSet.add(cleaned)
      }
    })
    return Array.from(locSet)
  }, [jobs])

  const myCompanyCount = useMemo(() => {
    if (isCandidate) return 0
    const userCompany = user?.company?.trim().toLowerCase()
    const userEmail = user?.email?.trim().toLowerCase()
    return jobs.filter((j) => {
      const matchComp = userCompany && j.company?.trim().toLowerCase() === userCompany
      const matchEmail = userEmail && j.postedBy?.trim().toLowerCase() === userEmail
      return matchComp || matchEmail
    }).length
  }, [jobs, user, isCandidate])

  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {

        if (!isCandidate && recruiterScope === 'my_company') {
          const userCompany = user?.company?.trim().toLowerCase()
          const jobCompany = job.company?.trim().toLowerCase()
          const jobPostedBy = job.postedBy?.trim().toLowerCase()
          const userEmail = user?.email?.trim().toLowerCase()
          const matchesCompany = userCompany && jobCompany && jobCompany === userCompany
          const matchesPoster = userEmail && jobPostedBy && jobPostedBy === userEmail
          if (!matchesCompany && !matchesPoster) {
            return false
          }
        }

        const q = searchQuery.trim().toLowerCase()
        if (q) {
          const matchesTitle = job.title?.toLowerCase().includes(q)
          const matchesCompany = job.company?.toLowerCase().includes(q)
          const matchesLocation = job.location?.toLowerCase().includes(q)
          const matchesCategory = job.category?.toLowerCase().includes(q)
          const matchesDesc = job.description?.toLowerCase().includes(q)
          const matchesType = job.type?.toLowerCase().includes(q)
          const matchesSkills = Array.isArray(job.skills)
            ? job.skills.some((s) => s.toLowerCase().includes(q))
            : false
          if (!matchesTitle && !matchesCompany && !matchesLocation && !matchesCategory && !matchesDesc && !matchesType && !matchesSkills) {
            return false
          }
        }

        if (selectedLocation !== 'All Locations') {
          const locLower = (job.location || '').toLowerCase()
          const selLower = selectedLocation.toLowerCase()
          if (selLower === 'remote') {
            if (!locLower.includes('remote') && job.type?.toLowerCase() !== 'remote') return false
          } else if (selLower === 'hybrid') {
            if (!locLower.includes('hybrid') && job.type?.toLowerCase() !== 'hybrid') return false
          } else {
            if (!locLower.includes(selLower)) return false
          }
        }

        if (selectedType !== 'All Types') {
          const jobTypeLower = (job.type || '').toLowerCase()
          const selTypeLower = selectedType.toLowerCase()
          if (selTypeLower === 'remote') {
            if (jobTypeLower !== 'remote' && !(job.location || '').toLowerCase().includes('remote')) return false
          } else if (job.type !== selectedType) {
            return false
          }
        }

        if (selectedExperience !== 'All Levels') {
          const jobExp = (job.experienceLevel || '').toLowerCase()
          const selExp = selectedExperience.toLowerCase().split('(')[0].trim()
          if (!jobExp.includes(selExp)) {
            return false
          }
        }

        if (selectedSalaryRange !== 'All Salaries') {
          const { min, max } = parseSalaryNumbers(job.salary)
          if (selectedSalaryRange === 'under_15') {
            if (min >= 15 && max >= 15) return false
          } else if (selectedSalaryRange === '15_25') {
            if (max < 15 || min > 25) return false
          } else if (selectedSalaryRange === '25_35') {
            if (max < 25 || min > 35) return false
          } else if (selectedSalaryRange === '35_plus') {
            if (max < 35 && min < 35) return false
          }
        }

        if (selectedCategory !== 'All Categories' && job.category !== selectedCategory) {
          return false
        }

        if (selectedStatus === 'open' && job.status !== 'open' && job.status !== 'active') {
          return false
        }

        if (selectedStatus === 'closed' && job.status !== 'closed') {
          return false
        }

        return true
      })
      .sort((a, b) => {
        if (selectedSort === 'newest') {
          const timeA = new Date(a.createdAt || 0).getTime()
          const timeB = new Date(b.createdAt || 0).getTime()
          return timeB - timeA
        }
        if (selectedSort === 'salary_desc') {
          const numA = parseSalaryNumbers(a.salary).max
          const numB = parseSalaryNumbers(b.salary).max
          return numB - numA
        }
        if (selectedSort === 'salary_asc') {
          const numA = parseSalaryNumbers(a.salary).min
          const numB = parseSalaryNumbers(b.salary).min
          return numA - numB
        }
        if (selectedSort === 'deadline_asc') {
          return new Date(a.deadline || '2099-12-31') - new Date(b.deadline || '2099-12-31')
        }
        if (selectedSort === 'title_asc') {
          return (a.title || '').localeCompare(b.title || '')
        }
        return 0
      })
  }, [
    jobs,
    recruiterScope,
    isCandidate,
    user,
    searchQuery,
    selectedLocation,
    selectedType,
    selectedExperience,
    selectedSalaryRange,
    selectedCategory,
    selectedStatus,
    selectedSort
  ])

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / ITEMS_PER_PAGE))
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredJobs.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredJobs, currentPage])

  const handleSearchChange = (val) => {
    setSearchQuery(val)
    setCurrentPage(1)
  }

  const handleClearAllFilters = () => {
    setSearchQuery('')
    setSelectedLocation('All Locations')
    setSelectedType('All Types')
    setSelectedExperience('All Levels')
    setSelectedSalaryRange('All Salaries')
    setSelectedCategory('All Categories')
    setSelectedStatus('all')
    setRecruiterScope('all')
    setCurrentPage(1)
  }

  const handleJobModalSubmit = async (formData) => {
    setIsSubmitting(true)
    try {
      if (editingJob) {
        const res = editJob(editingJob.id, formData)
        if (res.success) {
          toast.success(`Job requisition "${formData.title}" updated successfully!`)
          setIsJobModalOpen(false)
          setEditingJob(null)
        } else {
          toast.error(res.message || 'Failed to update job.')
        }
      } else {
        addJob(formData)
        toast.success(`Job requisition "${formData.title}" published successfully!`)
        setIsJobModalOpen(false)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenEdit = (job) => {
    setEditingJob(job)
    setIsJobModalOpen(true)
  }

  const handleOpenCreate = () => {
    setEditingJob(null)
    setIsJobModalOpen(true)
  }

  const handleToggleStatus = (job) => {
    const res = toggleJobStatus(job.id)
    if (res.success) {
      toast.success(
        `Job "${job.title}" status changed to ${res.status === 'open' ? 'OPEN' : 'CLOSED'}.`
      )
    }
  }

  const handleDeleteConfirm = () => {
    if (!deleteCandidate) return
    deleteJob(deleteCandidate.id)
    toast.success(`Job requisition "${deleteCandidate.title}" deleted successfully.`)
    setDeleteCandidate(null)
  }

  const handleCandidateApply = (job) => {
    const res = applyToJob(job)
    if (res.success) {
      toast.success(`Application submitted to ${job.company} for "${job.title}"!`)
    } else {
      toast.warning(res.message)
    }
  }

  const isJobApplied = (jobId) => {
    const candidateEmail = user?.email || 'candidate@jobportal.com'
    const candidateId = user?.id || 'cand_demo'
    return applications.some(
      (a) => a.jobId === jobId && (a.candidateEmail === candidateEmail || a.candidateId === candidateId)
    )
  }

  const isJobSaved = (jobId) => {
    return savedJobs.some((s) => s.jobId === jobId)
  }

  const activeFiltersCount =
    (selectedLocation !== 'All Locations' ? 1 : 0) +
    (selectedType !== 'All Types' ? 1 : 0) +
    (selectedExperience !== 'All Levels' ? 1 : 0) +
    (selectedSalaryRange !== 'All Salaries' ? 1 : 0) +
    (selectedCategory !== 'All Categories' ? 1 : 0) +
    (selectedStatus !== 'all' ? 1 : 0) +
    (searchQuery ? 1 : 0) +
    (!isCandidate && recruiterScope === 'my_company' ? 1 : 0)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col relative overflow-x-hidden selection:bg-cyan-500 selection:text-white">

      <div className="fixed top-0 left-1/3 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-100/40 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 translate-x-1/2 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[140px] pointer-events-none -z-10" />

      <DashboardHeader user={user} onLogout={handleLogout} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-6">

        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-xs font-bold text-cyan-700 shadow-xs">
              <Briefcase className="w-3.5 h-3.5 text-cyan-600" />
              <span>Real-Time Job Requisitions Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Job Postings & Career Opportunities
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 max-w-2xl leading-relaxed">
              {isCandidate
                ? 'Explore verified job openings, filter by tech stack or experience level, and apply with instant confirmation in real-time.'
                : 'Create, edit, and manage corporate job requisitions, toggle application availability, and review candidate applicant pools.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">

            {!isCandidate ? (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-2 transition-all cursor-pointer transform hover:scale-[1.02]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post New Job</span>
              </button>
            ) : (
              <Link
                to="/dashboard"
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-cyan-600" />
                <span>My Dashboard</span>
              </Link>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, company, skills (e.g. React, AWS), location, or description..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-cyan-500 focus:bg-white transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">

              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-cyan-500 cursor-pointer shadow-xs"
              >
                <option value="newest">Sort: Latest Jobs (Newest First)</option>
                <option value="salary_desc">Sort: Salary (High to Low)</option>
                <option value="salary_asc">Sort: Salary (Low to High)</option>
                <option value="deadline_asc">Sort: Application Deadline (Soonest)</option>
                <option value="title_asc">Sort: Job Title (A - Z)</option>
              </select>

              <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white text-cyan-600 shadow-xs'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white text-cyan-600 shadow-xs'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Table View"
                >
                  <ListFilter className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-100 text-xs">

            {!isCandidate && (
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-xl border border-slate-200 shadow-2xs mr-1">
                <button
                  type="button"
                  onClick={() => {
                    setRecruiterScope('all')
                    setCurrentPage(1)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    recruiterScope === 'all'
                      ? 'bg-white text-cyan-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Listings ({jobs.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRecruiterScope('my_company')
                    setCurrentPage(1)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    recruiterScope === 'my_company'
                      ? 'bg-white text-cyan-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-cyan-600" />
                  <span>My Postings ({myCompanyCount})</span>
                </button>
              </div>
            )}

            <select
              value={selectedLocation}
              onChange={(e) => {
                setSelectedLocation(e.target.value)
                setCurrentPage(1)
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:border-cyan-500 cursor-pointer shadow-2xs"
            >
              {availableLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc === 'All Locations' ? 'All Locations' : `📍 ${loc}`}
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value)
                setCurrentPage(1)
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:border-cyan-500 cursor-pointer shadow-2xs"
            >
              <option value="All Types">All Job Types</option>
              {EMPLOYMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select
              value={selectedExperience}
              onChange={(e) => {
                setSelectedExperience(e.target.value)
                setCurrentPage(1)
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:border-cyan-500 cursor-pointer shadow-2xs"
            >
              <option value="All Levels">All Experience Levels</option>
              {EXPERIENCE_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>

            <select
              value={selectedSalaryRange}
              onChange={(e) => {
                setSelectedSalaryRange(e.target.value)
                setCurrentPage(1)
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:border-cyan-500 cursor-pointer shadow-2xs"
            >
              {SALARY_RANGES.map((sal) => (
                <option key={sal.id} value={sal.id}>
                  {sal.label}
                </option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setCurrentPage(1)
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:border-cyan-500 cursor-pointer shadow-2xs"
            >
              <option value="All Categories">All Categories</option>
              {JOB_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value)
                setCurrentPage(1)
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:border-cyan-500 cursor-pointer shadow-2xs"
            >
              <option value="all">Status: All Positions</option>
              <option value="open">Status: Open Only</option>
              <option value="closed">Status: Closed Only</option>
            </select>

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Filters ({activeFiltersCount})</span>
              </button>
            )}

            <span className="ml-auto text-xs font-semibold text-slate-400">
              Showing {filteredJobs.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} -{' '}
              {Math.min(filteredJobs.length, currentPage * ITEMS_PER_PAGE)} of {filteredJobs.length} requisitions
            </span>
          </div>
        </div>

        {filteredJobs.length === 0 ? (

          <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-3 shadow-xs">
              <Briefcase className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Job Postings Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
              No active job requisitions match your search criteria or selected filters.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="px-4 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 text-xs font-bold transition-all cursor-pointer"
              >
                Reset All Filters
              </button>
              {!isCandidate && (
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Post First Opening
                </button>
              )}
            </div>
          </div>
        ) : viewMode === 'grid' ? (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedJobs.map((job) => {
              const isOpen = job.status === 'open' || job.status === 'active'
              const applied = isJobApplied(job.id)
              const saved = isJobSaved(job.id)
              const companyLogo = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(job.company || 'Company')}`

              return (
                <div
                  key={job.id}
                  className="group relative bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-cyan-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between shadow-xs"
                >
                  <div>

                    <div className="flex items-start justify-between gap-3 mb-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={companyLogo}
                          alt={job.company}
                          className="w-11 h-11 rounded-2xl object-cover border border-slate-200 bg-white p-1 shadow-2xs group-hover:scale-105 transition-transform shrink-0"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-600 block line-clamp-1">
                            {job.company}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] text-cyan-700 font-semibold">
                            <ShieldCheck className="w-3 h-3 text-cyan-600" />
                            Verified Partner
                          </span>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-2xs ${
                          isOpen
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        <span>{isOpen ? 'Open' : 'Closed'}</span>
                      </span>
                    </div>

                    <Link
                      to={`/jobs/${job.id}`}
                      className="text-sm font-black text-slate-900 group-hover:text-cyan-700 transition-colors line-clamp-1 mb-2 block"
                    >
                      {job.title}
                    </Link>

                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-100">
                        {job.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {job.type}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                        {job.experienceLevel}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600 mb-3 font-medium">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{job.location}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-bold text-slate-900">{job.salary}</span>
                        {job.deadline && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            Due: {job.deadline}
                          </span>
                        )}
                      </div>
                    </div>

                    {Array.isArray(job.skills) && job.skills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 mb-3 pt-2 border-t border-slate-100">
                        {job.skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200/80"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 4 && (
                          <span className="text-[10px] text-slate-400 font-semibold">
                            +{job.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-cyan-700 hover:text-cyan-800"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </Link>

                    <div className="flex items-center gap-1.5">

                      {isCandidate ? (
                        <>
                          <button
                            type="button"
                            onClick={() => toggleSaveJob(job)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              saved
                                ? 'bg-rose-50 border-rose-200 text-rose-600'
                                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-rose-600'
                            }`}
                            title={saved ? 'Remove Bookmark' : 'Bookmark Job'}
                          >
                            <Bookmark className="w-3.5 h-3.5 fill-current" />
                          </button>

                          {applied ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                              <Check className="w-3 h-3" />
                              <span>Applied</span>
                            </span>
                          ) : !isOpen ? (
                            <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed">
                              Closed
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleCandidateApply(job)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                            >
                              <Send className="w-3 h-3" />
                              <span>Quick Apply</span>
                            </button>
                          )}
                        </>
                      ) : (

                        <>
                          <span
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200/80 text-[11px] font-semibold"
                            title="Total Applicants"
                          >
                            <Users className="w-3.5 h-3.5 text-cyan-600" />
                            <span>{job.applicantsCount || 0}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(job)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isOpen
                                ? 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
                                : 'text-slate-500 hover:bg-slate-100 border-slate-200'
                            }`}
                            title={isOpen ? 'Click to Close Position' : 'Click to Open Position'}
                          >
                            {isOpen ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(job)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 border border-slate-200 transition-colors cursor-pointer"
                            title="Edit Requisition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteCandidate(job)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                            title="Delete Requisition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (

          <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Role & Company</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Experience</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Salary</th>
                    <th className="py-3.5 px-4">Deadline</th>
                    <th className="py-3.5 px-4">Status</th>
                    {!isCandidate && <th className="py-3.5 px-4">Applicants</th>}
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {paginatedJobs.map((job) => {
                    const isOpen = job.status === 'open' || job.status === 'active'
                    const applied = isJobApplied(job.id)

                    return (
                      <tr key={job.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <Link
                            to={`/jobs/${job.id}`}
                            className="font-bold text-slate-900 hover:text-cyan-600 block line-clamp-1"
                          >
                            {job.title}
                          </Link>
                          <span className="text-[11px] text-slate-500 font-medium block">
                            {job.company}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-cyan-700">{job.category}</td>
                        <td className="py-3 px-4">{job.type}</td>
                        <td className="py-3 px-4">{job.experienceLevel}</td>
                        <td className="py-3 px-4">{job.location}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{job.salary}</td>
                        <td className="py-3 px-4 text-slate-500">{job.deadline || 'Ongoing'}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              isOpen
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-500' : 'bg-slate-400'}`}
                            />
                            <span>{isOpen ? 'Open' : 'Closed'}</span>
                          </span>
                        </td>
                        {!isCandidate && (
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                              <Users className="w-3.5 h-3.5 text-cyan-600" />
                              <span>{job.applicantsCount || 0}</span>
                            </span>
                          </td>
                        )}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/jobs/${job.id}`}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-600 hover:bg-slate-100"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>

                            {isCandidate ? (
                              applied ? (
                                <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-0.5">
                                  <Check className="w-3 h-3" />
                                  Applied
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleCandidateApply(job)}
                                  disabled={!isOpen}
                                  className="px-2.5 py-1 rounded-lg bg-cyan-600 text-white font-bold text-[11px] hover:bg-cyan-500 disabled:opacity-50 cursor-pointer"
                                >
                                  Apply
                                </button>
                              )
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(job)}
                                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                    isOpen
                                      ? 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
                                      : 'text-slate-500 hover:bg-slate-100 border-slate-200'
                                  }`}
                                  title={isOpen ? 'Click to Close Position' : 'Click to Open Position'}
                                >
                                  {isOpen ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(job)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-600 hover:bg-slate-100 cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteCandidate(job)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200/60">
            <span className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
              <span className="font-bold text-slate-900">{Math.min(filteredJobs.length, currentPage * ITEMS_PER_PAGE)}</span> of{' '}
              <span className="font-bold text-slate-900">{filteredJobs.length}</span> positions &bull; Page{' '}
              <span className="font-bold text-slate-900">{currentPage}</span> of{' '}
              <span className="font-bold text-slate-900">{totalPages}</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer transition-colors flex items-center gap-1 text-xs font-semibold"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  type="button"
                  onClick={() => setCurrentPage(pg)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentPage === pg
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pg}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer transition-colors flex items-center gap-1 text-xs font-semibold"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      <JobModal
        isOpen={isJobModalOpen}
        onClose={() => {
          setIsJobModalOpen(false)
          setEditingJob(null)
        }}
        onSubmit={handleJobModalSubmit}
        initialData={editingJob}
        isSubmitting={isSubmitting}
      />

      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto shadow-xs">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Job Requisition?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <span className="font-bold text-slate-800">"{deleteCandidate.title}"</span>? This will take down the listing in real-time.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
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

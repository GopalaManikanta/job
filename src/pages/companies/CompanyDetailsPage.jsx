import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCompanies } from '../../context/CompanyContext'
import { useAuth } from '../../context/AuthContext'
import { useDashboard } from '../../context/DashboardContext'
import { toast } from 'react-toastify'
import {
  Building2,
  MapPin,
  Globe,
  Mail,
  Users,
  Calendar,
  ArrowLeft,
  Edit3,
  Trash2,
  ExternalLink,
  Briefcase,
  CheckCircle2,
  ShieldCheck,
  Send,
  AlertCircle,
  Phone,
  UserCheck,
  Sparkles,
  Compass,
  PlusCircle,
  X,
  Award,
  HeartHandshake,
  Zap
} from 'lucide-react'

import DashboardHeader from '../../components/dashboard/DashboardHeader'
import CompanyModal from '../../components/companies/CompanyModal'

export default function CompanyDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { getCompanyById, editCompany, deleteCompany, fetchSingleCompany } = useCompanies()
  const { jobs, applyToJob, addJob } = useDashboard()

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPostJobModal, setShowPostJobModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [newJobData, setNewJobData] = useState({
    title: '',
    category: 'Software & Cloud Engineering',
    location: 'Hybrid - Bengaluru',
    salary: '₹18 - ₹26 LPA',
    type: 'Full-time',
    description: ''
  })

  const companyFromContext = getCompanyById(id)
  const [fetchedCompany, setFetchedCompany] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(!companyFromContext)

  const company = companyFromContext || fetchedCompany

  // Trigger visible GET request in Network tab for single company & preserve state
  useEffect(() => {
    let active = true
    if (id) {
      fetchSingleCompany(id)
        .then((res) => {
          if (active && res) {
            setFetchedCompany(res)
          }
        })
        .finally(() => {
          if (active) setLoadingDetails(false)
        })
    }
    return () => {
      active = false
    }
  }, [id, fetchSingleCompany])

  const companyJobs = useMemo(() => {
    if (!company) return []
    return jobs.filter(
      (j) => j.company?.trim().toLowerCase() === company.name?.trim().toLowerCase()
    )
  }, [jobs, company])

  const handleLogout = () => {
    logout()
    toast.info('Logged out successfully.')
    navigate('/login')
  }

  // Handle Edit Submit
  const handleEditSubmit = async (formData) => {
    setIsSubmitting(true)
    try {
      const res = await editCompany(id, formData)
      if (res.success) {
        toast.success(`Company "${formData.name}" profile updated successfully!`)
        setIsEditModalOpen(false)
        setFetchedCompany((prev) => ({ ...prev, ...formData }))
      } else {
        toast.error(res.message || 'Failed to update company.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Delete
  const handleDeleteConfirm = async () => {
    setIsSubmitting(true)
    try {
      const res = await deleteCompany(id)
      if (res.success) {
        toast.success(`Company "${company?.name}" removed from directory.`)
        navigate('/companies')
      } else {
        toast.error(res.message || 'Failed to delete company.')
      }
    } finally {
      setIsSubmitting(false)
      setShowDeleteConfirm(false)
    }
  }

  // Handle Apply
  const handleApply = (job) => {
    const res = applyToJob(job)
    if (res.success) {
      toast.success(`Application submitted to ${job.company} for "${job.title}"!`)
    } else {
      toast.warning(res.message)
    }
  }

  // Handle Post Job Requisition for this company
  const handlePostJobSubmit = (e) => {
    e.preventDefault()
    if (!newJobData.title.trim()) {
      toast.error('Please enter a job title.')
      return
    }
    addJob({
      ...newJobData,
      company: company.name
    })
    toast.success(`Job requisition "${newJobData.title}" published for ${company.name} in real-time!`)
    setShowPostJobModal(false)
    setNewJobData({
      title: '',
      category: 'Software & Cloud Engineering',
      location: company?.location || 'Hybrid - Bengaluru',
      salary: '₹18 - ₹26 LPA',
      type: 'Full-time',
      description: ''
    })
  }

  if (loadingDetails && !company) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
        <DashboardHeader user={user} onLogout={handleLogout} />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 mb-4 animate-spin shadow-xs">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Loading Company Profile...</h2>
          <p className="text-xs text-slate-500 mt-1">Retrieving verified organizational portfolio</p>
        </main>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
        <DashboardHeader user={user} onLogout={handleLogout} />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-4 shadow-xs">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Company Not Found</h2>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
            The requested company profile does not exist or may have been removed.
          </p>
          <Link
            to="/companies"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Company Directory</span>
          </Link>
        </main>
      </div>
    )
  }

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
            <Link to="/companies" className="hover:text-cyan-600 transition-colors">
              Companies
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold truncate max-w-[200px]">{company.name}</span>
          </nav>

          <Link
            to="/companies"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-cyan-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Companies</span>
          </Link>
        </div>

        {/* Company Identity Hero Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
          {/* Ambient top decoration */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pt-2">
            {/* Left: Brand Identity */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <img
                src={company.logo}
                alt={company.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-slate-200/90 bg-white p-1.5 shadow-md shrink-0"
              />
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {company.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                    <ShieldCheck className="w-3 h-3 text-cyan-600" />
                    Verified Partner
                  </span>
                </div>

                {/* Lead Contact Person & Username from API */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-blue-800 font-bold border border-blue-200">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    Lead: {company.contactPerson || 'Executive Lead'}
                  </span>
                  {company.username && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 font-mono text-[11px] font-semibold border border-slate-200">
                      @{company.username}
                    </span>
                  )}
                  {company.catchPhrase && (
                    <span className="text-slate-500 text-xs italic">
                      &ldquo;{company.catchPhrase}&rdquo;
                    </span>
                  )}
                </div>

                {/* Metadata Row */}
                <p className="text-xs font-semibold text-slate-500 flex flex-wrap items-center gap-3 pt-1">
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold">
                    {company.industry}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {company.location}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {company.employees} Employees
                  </span>
                  {company.founded && (
                    <>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Est. {company.founded}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setNewJobData((prev) => ({
                    ...prev,
                    location: company?.location || 'Hybrid - Bengaluru'
                  }))
                  setShowPostJobModal(true)
                }}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Post Job</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-xs hover:border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-cyan-600" />
                <span>Edit Profile</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-600 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Contact Bar with Phone, Email, Website from Network Tab */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs font-medium text-slate-600">
            {company.phone && (
              <a
                href={`tel:${company.phone}`}
                className="flex items-center gap-1.5 text-slate-800 hover:text-cyan-600 transition-colors font-semibold"
                title="Call phone from API"
              >
                <Phone className="w-3.5 h-3.5 text-cyan-600" />
                <span>{company.phone}</span>
              </a>
            )}

            {company.email && (
              <a
                href={`mailto:${company.email}`}
                className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                title="Official Email"
              >
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{company.email}</span>
              </a>
            )}

            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-cyan-600 hover:text-cyan-800 font-semibold hover:underline"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{company.website.replace(/^https?:\/\//, '')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* 2 Columns: Overview & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: About & Culture & Network Tab Inspector (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Card */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  About {company.name}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {company.description}
              </p>

              {/* Mission & Business Focus Highlight */}
              {(company.catchPhrase || company.bs) && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Sparkles className="w-4 h-4 text-cyan-600" />
                    <span>Executive Mission & Business Strategy</span>
                  </div>
                  {company.catchPhrase && (
                    <p className="text-xs text-slate-700">
                      <strong className="text-slate-900">Catchphrase:</strong> &ldquo;{company.catchPhrase}&rdquo;
                    </p>
                  )}
                  {company.bs && (
                    <p className="text-xs text-slate-700">
                      <strong className="text-slate-900">Strategic Practice (BS):</strong> {company.bs}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Culture & Perks */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Workplace Culture & Perks
                  </h3>
                  <p className="text-[11px] text-slate-500">Employee benefits offered at {company.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                  <div className="w-7 h-7 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Flexible & Hybrid Work</h4>
                  <p className="text-[11px] text-slate-600 leading-normal">
                    Remote flexibility with modern collaborative office hubs and flexible core hours.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Health & Wellness</h4>
                  <p className="text-[11px] text-slate-600 leading-normal">
                    Comprehensive medical insurance, annual wellness credits, and family health coverage.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                  <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Career Acceleration</h4>
                  <p className="text-[11px] text-slate-600 leading-normal">
                    Annual learning stipends, conference credits, and accelerated leadership tracks.
                  </p>
                </div>
              </div>
            </div>

            {/* Active Job Openings */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Active Job Openings ({companyJobs.length})
                    </h3>
                    <p className="text-[11px] text-slate-500">Live positions open at {company.name}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setNewJobData((prev) => ({
                      ...prev,
                      location: company?.location || 'Hybrid - Bengaluru'
                    }))
                    setShowPostJobModal(true)
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 text-xs font-bold cursor-pointer transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Post Opening</span>
                </button>
              </div>

              {companyJobs.length === 0 ? (
                <div className="py-10 px-4 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-3 shadow-xs">
                    <Briefcase className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">No Open Positions Currently Listed</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                    There are currently no active openings posted under {company.name}. You can post the first job requisition right now.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setNewJobData((prev) => ({
                        ...prev,
                        location: company?.location || 'Hybrid - Bengaluru'
                      }))
                      setShowPostJobModal(true)
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Post First Opening for {company.name}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {companyJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-white hover:border-cyan-200 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{job.title}</h4>
                          {job.type && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                              {job.type}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-cyan-700">
                            {job.category}
                          </span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {job.location}
                          </span>
                          <span>&bull;</span>
                          <span className="font-semibold text-slate-800">{job.salary}</span>
                        </div>
                        {job.description && (
                          <p className="text-[11px] text-slate-600 line-clamp-1 pt-0.5">
                            {job.description}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleApply(job)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1.5 self-start sm:self-auto shrink-0 transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Quick Apply</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Company Summary & Stats */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center justify-between">
                <span>Corporate Overview</span>
                <Compass className="w-4 h-4 text-slate-400" />
              </h3>

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Lead Representative</span>
                  <span className="font-bold text-slate-900">{company.contactPerson || 'Executive Contact'}</span>
                </div>
                {company.username && (
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block">Corporate Username</span>
                    <span className="font-mono font-semibold text-slate-800">@{company.username}</span>
                  </div>
                )}
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Direct Telephone</span>
                  <a
                    href={`tel:${company.phone}`}
                    className="font-mono font-semibold text-slate-800 hover:text-cyan-600 transition-colors"
                  >
                    {company.phone || '+1-800-555-0199'}
                  </a>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Industry Sector</span>
                  <span className="font-bold text-slate-800">{company.industry}</span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Workforce Scale</span>
                  <span className="font-bold text-slate-800">{company.employees} Employees</span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Global Headquarters</span>
                  <span className="font-bold text-slate-800">{company.fullAddress || company.location}</span>
                </div>
                {company.bs && (
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block">Business Specialty</span>
                    <span className="font-semibold text-slate-800">{company.bs}</span>
                  </div>
                )}
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Talent Inquiries</span>
                  <a href={`mailto:${company.email}`} className="font-semibold text-cyan-600 hover:underline">
                    {company.email}
                  </a>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-emerald-800 block">
                      Verified Hiring Partner
                    </span>
                    <span className="text-[10px] text-emerald-700">
                      Active talent acquisition and candidate review
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Company Modal */}
      <CompanyModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={company}
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
              <h3 className="text-base font-bold text-slate-900">Delete Company?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <span className="font-bold text-slate-800">"{company.name}"</span>? This action cannot be undone.
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
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Job Requisition Modal */}
      {showPostJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Post Job Opening</h3>
                  <p className="text-xs text-slate-500">Publish a live position for {company.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPostJobModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostJobSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Job Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newJobData.title}
                  onChange={(e) => setNewJobData({ ...newJobData, title: e.target.value })}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newJobData.category}
                    onChange={(e) => setNewJobData({ ...newJobData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-cyan-500 bg-white"
                  >
                    <option value="Software & Cloud Engineering">Software & Cloud Engineering</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="Data Science & AI">Data Science & AI</option>
                    <option value="DevOps & Infrastructure">DevOps & Infrastructure</option>
                    <option value="Sales & Business Development">Sales & Business Development</option>
                    <option value="Human Resources & People">Human Resources & People</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Employment Type</label>
                  <select
                    value={newJobData.type}
                    onChange={(e) => setNewJobData({ ...newJobData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-cyan-500 bg-white"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Work Location</label>
                  <input
                    type="text"
                    value={newJobData.location}
                    onChange={(e) => setNewJobData({ ...newJobData, location: e.target.value })}
                    placeholder="e.g. Hybrid - Bengaluru"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-cyan-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={newJobData.salary}
                    onChange={(e) => setNewJobData({ ...newJobData, salary: e.target.value })}
                    placeholder="e.g. ₹18 - ₹26 LPA"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-cyan-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Description</label>
                <textarea
                  rows={3}
                  value={newJobData.description}
                  onChange={(e) => setNewJobData({ ...newJobData, description: e.target.value })}
                  placeholder="Briefly describe key roles, responsibilities, or technical requirements..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-cyan-500 bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPostJobModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-xs hover:shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Publish Requisition</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

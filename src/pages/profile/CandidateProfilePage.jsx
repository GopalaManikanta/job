import { useState, useMemo, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { useDashboard } from '../../context/DashboardContext'
import DashboardHeader from '../../components/DashboardHeader'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Eye,
  Trash2,
  Plus,
  Sparkles,
  ArrowLeft,
  Download,
  Calendar,
  Building2,
  Check,
  X,
  ShieldCheck,
  Share2,
  Camera,
  FileCheck2,
  Award
} from 'lucide-react'

// Suggested skill pills for fast 1-click addition
const SUGGESTED_SKILLS = [
  'React',
  'TypeScript',
  'Node.js',
  'Next.js',
  'Tailwind CSS',
  'GraphQL',
  'Python',
  'Docker',
  'PostgreSQL',
  'AWS',
  'REST APIs',
  'Git',
  'MongoDB',
  'Redux',
  'CI/CD'
]

// Sample avatar presets for quick photo pick
const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300'
]

export default function CandidateProfilePage() {
  const { candidateId } = useParams()
  const navigate = useNavigate()
  const { user, logout, getCandidateProfile, saveCandidateProfile } = useAuth()
  const { metrics = { activeJobPostings: '0', totalApplications: '0', totalCompanies: '0' } } = useDashboard()

  const isRecruiter = user?.role === 'recruiter'
  const isViewingOtherCandidate = isRecruiter && candidateId && candidateId !== user?.id
  const isRecruiterSelfProfile = isRecruiter && !candidateId

  // Mode: 'view' | 'edit'
  const [mode, setMode] = useState(isViewingOtherCandidate ? 'view' : 'view')

  // Profile Data State
  const targetCandidateId = candidateId || user?.id
  const [activeTargetId, setActiveTargetId] = useState(targetCandidateId)
  const [profile, setProfile] = useState(() => {
    return getCandidateProfile(targetCandidateId)
  })

  // Edit Form State
  const [formData, setFormData] = useState(profile)
  const [touched, setTouched] = useState({})

  // Adjust state during render if candidateId changes
  if (activeTargetId !== targetCandidateId) {
    setActiveTargetId(targetCandidateId)
    const fresh = getCandidateProfile(targetCandidateId)
    setProfile(fresh)
    setFormData(fresh)
  }

  // Skills input state
  const [newSkillInput, setNewSkillInput] = useState('')

  // Resume state & preview modal
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [isUploadingResume, setIsUploadingResume] = useState(false)
  const fileInputRef = useRef(null)
  const resumeInputRef = useRef(null)

  // Real-time Form Validation
  const validate = (data) => {
    const errors = {}

    // Full Name
    if (!data.fullName || !data.fullName.trim()) {
      errors.fullName = 'Full Name is required.'
    } else if (data.fullName.trim().length < 2) {
      errors.fullName = 'Full Name must be at least 2 characters.'
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!data.email || !data.email.trim()) {
      errors.email = 'Email address is required.'
    } else if (!emailRegex.test(data.email.trim())) {
      errors.email = 'Please provide a valid email format.'
    }

    // Mobile Number
    const phoneRegex = /^[+]?[0-9\s-]{10,15}$/
    if (!data.mobileNumber || !data.mobileNumber.trim()) {
      errors.mobileNumber = 'Mobile number is required.'
    } else if (!phoneRegex.test(data.mobileNumber.trim().replace(/\s/g, ''))) {
      errors.mobileNumber = 'Please provide a valid 10 to 15 digit phone number.'
    }

    // Address
    if (!data.address?.city || !data.address.city.trim()) {
      errors.city = 'City is required.'
    }
    if (!data.address?.state || !data.address.state.trim()) {
      errors.state = 'State / Province is required.'
    }

    // Skills
    if (!data.skills || data.skills.length === 0) {
      errors.skills = 'Please add at least one technical or core skill.'
    }

    // Experience entries validation
    if (Array.isArray(data.experience)) {
      data.experience.forEach((exp, idx) => {
        if (!exp.role || !exp.role.trim()) {
          errors[`exp_${idx}_role`] = 'Role / Job Title is required.'
        }
        if (!exp.company || !exp.company.trim()) {
          errors[`exp_${idx}_company`] = 'Company Name is required.'
        }
      })
    }

    // Education entries validation
    if (Array.isArray(data.education)) {
      data.education.forEach((edu, idx) => {
        if (!edu.degree || !edu.degree.trim()) {
          errors[`edu_${idx}_degree`] = 'Degree or Certification name is required.'
        }
        if (!edu.institution || !edu.institution.trim()) {
          errors[`edu_${idx}_institution`] = 'University or Institution is required.'
        }
      })
    }

    return errors
  }

  // Derive real-time validation errors during render
  const formErrors = useMemo(() => {
    return mode === 'edit' ? validate(formData) : {}
  }, [formData, mode])

  // Profile Strength Calculation (0 - 100%)
  const profileStrength = useMemo(() => {
    let score = 0
    if (profile.fullName && profile.email) score += 20
    if (profile.mobileNumber) score += 10
    if (profile.address?.city && profile.address?.country) score += 10
    if (profile.avatar) score += 15
    if (profile.skills && profile.skills.length >= 3) score += 15
    if (profile.experience && profile.experience.length > 0) score += 15
    if (profile.education && profile.education.length > 0) score += 10
    if (profile.resume) score += 5
    return Math.min(score, 100)
  }, [profile])

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  // Field change handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddressChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }))
  }

  // Photo Upload Handler (FileReader preview)
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, or WEBP).')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file size must be less than 5 MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64Image = event.target?.result
      setFormData((prev) => ({
        ...prev,
        avatar: base64Image
      }))
      toast.success('Profile photo updated!')
    }
    reader.readAsDataURL(file)
  }

  // Resume Upload Handler (UI Only)
  const handleResumeUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const isDoc = allowed.includes(file.type) || file.name.endsWith('.pdf') || file.name.endsWith('.docx') || file.name.endsWith('.doc')
    if (!isDoc) {
      toast.error('Please upload a PDF or Word document (.pdf, .doc, .docx).')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Resume file size must be less than 5 MB.')
      return
    }

    setIsUploadingResume(true)
    setTimeout(() => {
      const formattedSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB'
      const newResume = {
        fileName: file.name,
        fileSize: formattedSize,
        uploadedAt: 'Just now',
        fileType: file.type || 'application/pdf'
      }
      setFormData((prev) => ({
        ...prev,
        resume: newResume
      }))
      setIsUploadingResume(false)
      toast.success(`Resume "${file.name}" uploaded successfully!`)
    }, 700)
  }

  // Add Skill
  const handleAddSkill = (skillToAdd) => {
    const target = (skillToAdd || newSkillInput).trim()
    if (!target) return

    if (formData.skills?.some((s) => s.toLowerCase() === target.toLowerCase())) {
      toast.info(`"${target}" is already in your skills list.`)
      setNewSkillInput('')
      return
    }

    setFormData((prev) => ({
      ...prev,
      skills: [...(prev.skills || []), target]
    }))
    setNewSkillInput('')
  }

  // Remove Skill
  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove)
    }))
  }

  // Experience Handlers
  const handleAddExperience = () => {
    const newExp = {
      id: `exp_${Date.now()}`,
      role: '',
      company: '',
      location: 'Hybrid / Remote',
      startDate: '',
      endDate: '',
      isCurrent: true,
      description: ''
    }
    setFormData((prev) => ({
      ...prev,
      experience: [newExp, ...(prev.experience || [])]
    }))
  }

  const handleUpdateExperience = (idx, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.experience]
      updated[idx] = { ...updated[idx], [field]: value }
      if (field === 'isCurrent' && value === true) {
        updated[idx].endDate = ''
      }
      return { ...prev, experience: updated }
    })
  }

  const handleRemoveExperience = (idx) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== idx)
    }))
  }

  // Education Handlers
  const handleAddEducation = () => {
    const newEdu = {
      id: `edu_${Date.now()}`,
      degree: '',
      institution: '',
      fieldOfStudy: '',
      startYear: '',
      endYear: '',
      grade: ''
    }
    setFormData((prev) => ({
      ...prev,
      education: [newEdu, ...(prev.education || [])]
    }))
  }

  const handleUpdateEducation = (idx, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.education]
      updated[idx] = { ...updated[idx], [field]: value }
      return { ...prev, education: updated }
    })
  }

  const handleRemoveEducation = (idx) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== idx)
    }))
  }

  // Save Changes
  const handleSaveProfile = (e) => {
    e.preventDefault()

    // Mark all touched
    const allTouched = {
      fullName: true,
      email: true,
      mobileNumber: true,
      city: true,
      state: true,
      skills: true
    }
    setTouched(allTouched)

    const errors = validate(formData)

    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the validation errors before saving.')
      return
    }

    const res = saveCandidateProfile(formData)
    if (res.success) {
      setProfile(res.profile)
      setMode('view')
      toast.success('Candidate Profile updated and synchronized successfully!')
    } else {
      toast.error(res.message || 'Failed to save profile.')
    }
  }

  // Share profile link
  const handleShareProfile = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Profile URL copied to clipboard!')
    }
  }

  // Logout
  const handleLogout = () => {
    logout()
    toast.info('Logged out successfully.')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col relative overflow-x-hidden selection:bg-cyan-500 selection:text-white">
      {/* Top Header */}
      <DashboardHeader user={user} onLogout={handleLogout} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Breadcrumb & Top Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link to="/dashboard" className="hover:text-cyan-600 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            {isViewingOtherCandidate ? (
              <>
                <Link to="/jobs" className="hover:text-cyan-600 transition-colors">
                  Jobs Hub
                </Link>
                <span>/</span>
                <span className="text-slate-900 font-bold">Applicant Review</span>
              </>
            ) : isRecruiterSelfProfile ? (
              <span className="text-slate-900 font-bold">Employer & Recruiter Profile</span>
            ) : (
              <span className="text-slate-900 font-bold">Candidate Profile</span>
            )}
          </nav>

          <div className="flex items-center gap-2.5">
            {isViewingOtherCandidate ? (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Requisitions</span>
              </button>
            ) : isRecruiterSelfProfile ? (
              <Link
                to="/jobs"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Manage Requisitions</span>
              </Link>
            ) : (
              <>
                {mode === 'view' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(profile)
                      setMode('edit')
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer transition-all transform hover:scale-[1.02]"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(profile)
                      setMode('view')
                    }}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Cancel / View Profile</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleShareProfile}
                  className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Share profile link"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Recruiter Notice Banner if reviewing applicant */}
        {isViewingOtherCandidate && (
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-purple-900">
                  Employer Talent Review Mode
                </h4>
                <p className="text-[11px] text-purple-700">
                  You are reviewing this candidate's verified credentials, work history, and portfolio assets.
                </p>
              </div>
            </div>
            <a
              href={`mailto:${profile.email}`}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
            >
              Contact Candidate
            </a>
          </div>
        )}

        {/* ========================================================= */}
        {/* RECRUITER / EMPLOYER PROFILE VIEW                         */}
        {/* ========================================================= */}
        {isRecruiterSelfProfile ? (
          <div className="space-y-6">
            {/* 1. Recruiter Hero Banner Card */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-100/40 via-pink-50/20 to-transparent rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="relative">
                    <img
                      src={
                        user?.avatar ||
                        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300'
                      }
                      alt={user?.name || 'Recruiter'}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white shadow-md bg-slate-100"
                    />
                    <span
                      className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-purple-600 border-2 border-white flex items-center justify-center shadow-xs"
                      title="Verified Employer Account"
                    >
                      <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        {user?.name || 'Priya Menon'}
                      </h1>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                        Verified Employer
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-600">
                      {user?.headline || 'Senior Talent Acquisition Lead'} &bull;{' '}
                      <span className="text-purple-700 font-bold">{user?.company || 'Apex Cloud Systems'}</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1 text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-purple-500" />
                        <span>{user?.email || 'recruiter@jobportal.com'}</span>
                      </span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-purple-500" />
                        <span>{user?.location || 'Bengaluru, India'}</span>
                      </span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <Building2 className="w-3.5 h-3.5 text-purple-500" />
                        <span>{user?.company || 'Apex Cloud Systems'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                  <Link
                    to="/companies"
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Company Directory</span>
                  </Link>
                  <Link
                    to="/jobs"
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all flex items-center gap-1.5"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Manage Jobs</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* 2. Recruiter Hiring Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center font-bold">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Active Job Requisitions
                  </span>
                  <span className="text-2xl font-black text-slate-900">{metrics.activeJobPostings}</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Applicant Submissions
                  </span>
                  <span className="text-2xl font-black text-slate-900">{metrics.totalApplications}</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Partner Companies
                  </span>
                  <span className="text-2xl font-black text-slate-900">{metrics.totalCompanies}</span>
                </div>
              </div>
            </div>

            {/* 3. Recruiter About & Enterprise Management Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center justify-between">
                  <span>Talent Acquisition Lead Overview</span>
                  <Award className="w-4 h-4 text-purple-500" />
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Overseeing full lifecycle talent acquisition, technical candidate assessments, and cross-functional hiring initiatives for {user?.company || 'Apex Cloud Systems'}. Coordinating hiring manager rounds and driving real-time talent pipeline metrics.
                </p>

                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-800 mb-2">Hiring Domains & Core Verticals</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Cloud & DevOps Architecture', 'AI & Machine Learning', 'React & Frontend Systems', 'Distributed Backend', 'Cybersecurity'].map((dom) => (
                      <span key={dom} className="px-3 py-1 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold">
                        {dom}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-3 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
                    Quick Hiring Shortcuts
                  </h3>
                  <div className="space-y-2 mt-3">
                    <Link
                      to="/applications"
                      className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200/80 text-xs font-bold text-slate-700 hover:text-purple-700 transition-colors flex items-center justify-between"
                    >
                      <span>Review Candidate Submissions</span>
                      <span>&rarr;</span>
                    </Link>
                    <Link
                      to="/jobs"
                      className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200/80 text-xs font-bold text-slate-700 hover:text-purple-700 transition-colors flex items-center justify-between"
                    >
                      <span>Post or Edit Job Listings</span>
                      <span>&rarr;</span>
                    </Link>
                    <Link
                      to="/companies"
                      className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200/80 text-xs font-bold text-slate-700 hover:text-purple-700 transition-colors flex items-center justify-between"
                    >
                      <span>Manage Enterprise Entities</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : mode === 'view' ? (
          <div className="space-y-6">
            {/* 1. Header Profile Banner Card */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-100/40 via-blue-50/20 to-transparent rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  {/* Avatar with status indicator */}
                  <div className="relative">
                    <img
                      src={
                        profile.avatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.fullName || 'User')}`
                      }
                      alt={profile.fullName}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white shadow-md bg-slate-100"
                    />
                    <span
                      className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-xs"
                      title="Profile Active & Open for Work"
                    >
                      <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        {profile.fullName}
                      </h1>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                        Verified Candidate
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-600">
                      {profile.headline || 'Full Stack React Engineer'}
                    </p>

                    {/* Metadata Chips */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {profile.address?.city && profile.address?.country
                            ? `${profile.address.city}, ${profile.address.country}`
                            : 'Hyderabad, India'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <a
                          href={`mailto:${profile.email}`}
                          className="hover:text-cyan-600 transition-colors"
                        >
                          {profile.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{profile.mobileNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Strength Score Meter */}
                <div className="w-full md:w-56 p-4 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Profile Strength
                    </span>
                    <span className="text-cyan-700">{profileStrength}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
                      style={{ width: `${profileStrength}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    {profileStrength >= 80
                      ? 'All essential candidate fields complete! 3x higher recruiter response rate.'
                      : 'Complete your bio, experience, and resume to reach 100% visibility.'}
                  </p>
                </div>
              </div>
            </div>

            {/* 2-Column Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column (2 cols): Bio, Experience, Education */}
              <div className="lg:col-span-2 space-y-6">
                {/* About Me / Professional Summary */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-600" />
                    <span>Professional Summary</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {profile.bio ||
                      'Passionate software professional committed to building scalable web applications with clean architecture and modern JavaScript ecosystems.'}
                  </p>
                </div>

                {/* Work Experience */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-cyan-600" />
                      <span>Work Experience</span>
                    </h3>
                    <span className="text-[11px] font-bold text-slate-500">
                      {profile.experience?.length || 0} Positions
                    </span>
                  </div>

                  {!profile.experience || profile.experience.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      <Briefcase className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                      <p>No work experience added yet.</p>
                    </div>
                  ) : (
                    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                      {profile.experience.map((exp) => (
                        <div key={exp.id} className="relative group">
                          {/* Dot indicator */}
                          <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-cyan-600 border-2 border-white shadow-xs" />
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h4 className="text-sm font-bold text-slate-900">
                                {exp.role}
                              </h4>
                              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-700">
                              <Building2 className="w-3.5 h-3.5" />
                              <span>{exp.company}</span>
                              <span className="text-slate-400">&bull;</span>
                              <span className="text-slate-500 font-normal">{exp.location}</span>
                            </div>
                            {exp.description && (
                              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                                {exp.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Education */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-cyan-600" />
                      <span>Education & Qualifications</span>
                    </h3>
                    <span className="text-[11px] font-bold text-slate-500">
                      {profile.education?.length || 0} Degrees
                    </span>
                  </div>

                  {!profile.education || profile.education.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      <GraduationCap className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                      <p>No education details added yet.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 space-y-4">
                      {profile.education.map((edu) => (
                        <div key={edu.id} className="pt-3 first:pt-0 space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="text-sm font-bold text-slate-900">
                              {edu.degree}
                            </h4>
                            <span className="text-[11px] font-semibold text-slate-400">
                              {edu.startYear} - {edu.endYear}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-slate-600">
                            {edu.institution} {edu.fieldOfStudy ? `• ${edu.fieldOfStudy}` : ''}
                          </p>
                          {edu.grade && (
                            <span className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full mt-1">
                              {edu.grade}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column (1 col): Skills, Resume Card, Contact Address */}
              <div className="space-y-6">
                {/* Skills & Competencies */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Award className="w-4 h-4 text-cyan-600" />
                      <span>Skills & Core Stacks</span>
                    </h3>
                    <span className="text-[11px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                      {profile.skills?.length || 0}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {profile.skills?.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/80 shadow-2xs hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-200 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Resume Card (UI Only) */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-600" />
                      <span>Resume / CV Asset</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Verified
                    </span>
                  </h3>

                  {profile.resume ? (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0 shadow-2xs">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {profile.resume.fileName}
                          </h4>
                          <span className="text-[10px] text-slate-500 block">
                            {profile.resume.fileSize} &bull; Uploaded {profile.resume.uploadedAt}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowResumeModal(true)}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Preview</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            toast.success(`Downloading ${profile.resume.fileName}...`)
                          }}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400 space-y-2">
                      <UploadCloud className="w-6 h-6 mx-auto text-slate-300" />
                      <p>No resume uploaded yet.</p>
                      {!isViewingOtherCandidate && (
                        <button
                          type="button"
                          onClick={() => setMode('edit')}
                          className="text-cyan-600 font-bold hover:underline"
                        >
                          Upload resume now
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Address & Contact Information */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-3 text-xs">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-cyan-600" />
                    <span>Location & Postal Address</span>
                  </h3>

                  <div className="space-y-2 text-slate-600">
                    {profile.address?.street && (
                      <p className="font-medium text-slate-800">{profile.address.street}</p>
                    )}
                    <p>
                      {profile.address?.city || 'Hyderabad'}, {profile.address?.state || 'Telangana'}
                      {profile.address?.pincode ? ` - ${profile.address.pincode}` : ''}
                    </p>
                    <p className="font-semibold text-slate-700">
                      {profile.address?.country || 'India'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* MODE 2: EDIT PROFILE MODE WITH FORM VALIDATION             */
          /* ========================================================= */
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Form Action Header */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-cyan-600" />
                  <span>Edit Candidate Profile</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your contact info, skill portfolio, work history, and resume in real-time.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(profile)
                    setMode('view')
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-500/25 flex items-center gap-1.5 transition-all cursor-pointer transform hover:scale-[1.02]"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Profile</span>
                </button>
              </div>
            </div>

            {/* Section 1: Profile Photo & Basic Information */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-600" />
                <span>Basic Candidate Details & Photo</span>
              </h3>

              {/* Photo Upload Row */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                  <img
                    src={
                      formData.avatar ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formData.fullName || 'User')}`
                    }
                    alt={formData.fullName}
                    className="w-24 h-24 rounded-3xl object-cover border-2 border-slate-200 shadow-md bg-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-slate-900/40 rounded-3xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[11px] font-bold transition-opacity cursor-pointer"
                  >
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span>Change</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Upload New Photo
                    </button>
                    <span className="text-[11px] text-slate-400">or pick preset:</span>
                    <div className="flex items-center gap-1.5">
                      {AVATAR_PRESETS.map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setFormData((p) => ({ ...p, avatar: url }))}
                          className="w-7 h-7 rounded-xl overflow-hidden border-2 border-slate-200 hover:border-cyan-500 transition-all cursor-pointer"
                        >
                          <img src={url} alt="preset" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Supports PNG, JPG, or WEBP up to 5 MB. Square aspect ratio recommended.
                  </p>
                </div>
              </div>

              {/* Basic Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName || ''}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('fullName')}
                    placeholder="e.g. Rohit Sharma"
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${
                      touched.fullName && formErrors.fullName
                        ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                        : 'border-slate-200 focus:border-cyan-500 focus:bg-white'
                    }`}
                  />
                  {touched.fullName && formErrors.fullName && (
                    <p className="text-rose-600 text-[11px] font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{formErrors.fullName}</span>
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('email')}
                    placeholder="e.g. candidate@jobportal.com"
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${
                      touched.email && formErrors.email
                        ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                        : 'border-slate-200 focus:border-cyan-500 focus:bg-white'
                    }`}
                  />
                  {touched.email && formErrors.email && (
                    <p className="text-rose-600 text-[11px] font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{formErrors.email}</span>
                    </p>
                  )}
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="mobileNumber"
                    value={formData.mobileNumber || ''}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('mobileNumber')}
                    placeholder="e.g. +91 98765 43210"
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${
                      touched.mobileNumber && formErrors.mobileNumber
                        ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                        : 'border-slate-200 focus:border-cyan-500 focus:bg-white'
                    }`}
                  />
                  {touched.mobileNumber && formErrors.mobileNumber && (
                    <p className="text-rose-600 text-[11px] font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{formErrors.mobileNumber}</span>
                    </p>
                  )}
                </div>

                {/* Professional Headline */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    name="headline"
                    value={formData.headline || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. Senior Full Stack React & Node.js Developer"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Professional Bio */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Professional Bio & Career Objective
                  </label>
                  <textarea
                    rows={3}
                    name="bio"
                    value={formData.bio || ''}
                    onChange={handleInputChange}
                    placeholder="Briefly describe your core expertise, career journey, and engineering philosophy..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Postal Address Details */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-600" />
                <span>Postal Address & Location</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Street Address / Apartment
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.address?.street || ''}
                    onChange={handleAddressChange}
                    placeholder="e.g. Flat 402, Cyber Heights, HITEC City"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.address?.city || ''}
                    onChange={handleAddressChange}
                    onBlur={() => handleBlur('city')}
                    placeholder="e.g. Hyderabad"
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${
                      touched.city && formErrors.city
                        ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                        : 'border-slate-200 focus:border-cyan-500 focus:bg-white'
                    }`}
                  />
                  {touched.city && formErrors.city && (
                    <p className="text-rose-600 text-[11px] font-semibold mt-1">
                      {formErrors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    State / Province <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.address?.state || ''}
                    onChange={handleAddressChange}
                    onBlur={() => handleBlur('state')}
                    placeholder="e.g. Telangana"
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${
                      touched.state && formErrors.state
                        ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                        : 'border-slate-200 focus:border-cyan-500 focus:bg-white'
                    }`}
                  />
                  {touched.state && formErrors.state && (
                    <p className="text-rose-600 text-[11px] font-semibold mt-1">
                      {formErrors.state}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Postal / Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.address?.pincode || ''}
                    onChange={handleAddressChange}
                    placeholder="e.g. 500081"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.address?.country || 'India'}
                    onChange={handleAddressChange}
                    placeholder="e.g. India"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Skills Management */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-cyan-600" />
                  <span>Skills & Technical Proficiencies <span className="text-rose-500">*</span></span>
                </h3>
                <span className="text-xs font-bold text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
                  {formData.skills?.length || 0} Added
                </span>
              </div>

              {/* Add Skill Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddSkill()
                    }
                  }}
                  placeholder="Type a skill and press Enter (e.g. Kubernetes, Next.js)..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill()}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Suggestion Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-400 mr-1">Suggestions:</span>
                {SUGGESTED_SKILLS.filter(
                  (s) => !formData.skills?.some((sk) => sk.toLowerCase() === s.toLowerCase())
                )
                  .slice(0, 8)
                  .map((suggested) => (
                    <button
                      key={suggested}
                      type="button"
                      onClick={() => handleAddSkill(suggested)}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                    >
                      + {suggested}
                    </button>
                  ))}
              </div>

              {/* Active Skills Tag List */}
              <div className="flex flex-wrap gap-2 pt-2">
                {formData.skills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-50 text-cyan-800 text-xs font-bold border border-cyan-200 shadow-2xs"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-cyan-600 hover:text-rose-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              {touched.skills && formErrors.skills && (
                <p className="text-rose-600 text-[11px] font-semibold flex items-center gap-1 pt-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{formErrors.skills}</span>
                </p>
              )}
            </div>

            {/* Section 4: Work Experience */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-cyan-600" />
                    <span>Work Experience History</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Add relevant software engineering, corporate, or consulting experience.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Role</span>
                </button>
              </div>

              {(!formData.experience || formData.experience.length === 0) ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  <Briefcase className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                  <p>No work experience entries yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.experience.map((exp, idx) => (
                    <div
                      key={exp.id || idx}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 relative"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                        <span className="text-xs font-bold text-slate-700">
                          Experience #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExperience(idx)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                          title="Remove this position"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Role / Job Title <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={exp.role || ''}
                            onChange={(e) => handleUpdateExperience(idx, 'role', e.target.value)}
                            placeholder="e.g. Senior Frontend Engineer"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Company Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={exp.company || ''}
                            onChange={(e) => handleUpdateExperience(idx, 'company', e.target.value)}
                            placeholder="e.g. Apex Cloud Systems"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Location
                          </label>
                          <input
                            type="text"
                            value={exp.location || ''}
                            onChange={(e) => handleUpdateExperience(idx, 'location', e.target.value)}
                            placeholder="e.g. Hyderabad, India (Hybrid)"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Start Date (YYYY-MM)
                          </label>
                          <input
                            type="month"
                            value={exp.startDate || ''}
                            onChange={(e) => handleUpdateExperience(idx, 'startDate', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            End Date
                          </label>
                          <input
                            type="month"
                            disabled={exp.isCurrent}
                            value={exp.endDate || ''}
                            onChange={(e) => handleUpdateExperience(idx, 'endDate', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 disabled:bg-slate-100 disabled:text-slate-400"
                          />
                        </div>

                        <div className="flex items-center pt-5">
                          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={exp.isCurrent || false}
                              onChange={(e) => handleUpdateExperience(idx, 'isCurrent', e.target.checked)}
                              className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
                            />
                            <span>Currently Working Here</span>
                          </label>
                        </div>

                        <div className="sm:col-span-2 lg:col-span-3">
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Responsibilities & Achievements
                          </label>
                          <textarea
                            rows={2}
                            value={exp.description || ''}
                            onChange={(e) => handleUpdateExperience(idx, 'description', e.target.value)}
                            placeholder="Key projects architected, teams mentored, performance enhancements achieved..."
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 5: Education */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-cyan-600" />
                    <span>Education & Certifications</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Degrees, diplomas, university qualifications, or professional certifications.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Degree</span>
                </button>
              </div>

              {(!formData.education || formData.education.length === 0) ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  <GraduationCap className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                  <p>No education records added yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.education.map((edu, idx) => (
                    <div
                      key={edu.id || idx}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 relative"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                        <span className="text-xs font-bold text-slate-700">
                          Education #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveEducation(idx)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                          title="Remove this degree"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Degree / Course <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={edu.degree || ''}
                            onChange={(e) => handleUpdateEducation(idx, 'degree', e.target.value)}
                            placeholder="e.g. B.Tech in Computer Science & Engineering"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            University / Institution <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={edu.institution || ''}
                            onChange={(e) => handleUpdateEducation(idx, 'institution', e.target.value)}
                            placeholder="e.g. JNTU Hyderabad"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Field of Study
                          </label>
                          <input
                            type="text"
                            value={edu.fieldOfStudy || ''}
                            onChange={(e) => handleUpdateEducation(idx, 'fieldOfStudy', e.target.value)}
                            placeholder="e.g. Computer Science"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Year Range (Start - End)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={edu.startYear || ''}
                              onChange={(e) => handleUpdateEducation(idx, 'startYear', e.target.value)}
                              placeholder="2018"
                              className="w-1/2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
                            />
                            <span className="text-slate-400">-</span>
                            <input
                              type="text"
                              value={edu.endYear || ''}
                              onChange={(e) => handleUpdateEducation(idx, 'endYear', e.target.value)}
                              placeholder="2022"
                              className="w-1/2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Grade / CGPA / Percentage
                          </label>
                          <input
                            type="text"
                            value={edu.grade || ''}
                            onChange={(e) => handleUpdateEducation(idx, 'grade', e.target.value)}
                            placeholder="e.g. 8.8 CGPA or 85%"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 6: Resume Upload (UI Only) */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-600" />
                <span>Resume / CV Document Upload (UI Only)</span>
              </h3>

              <div
                onClick={() => resumeInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-cyan-500 rounded-3xl p-8 text-center transition-all bg-slate-50/50 hover:bg-cyan-50/20 cursor-pointer space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-200 flex items-center justify-center mx-auto shadow-xs">
                  {isUploadingResume ? (
                    <div className="w-6 h-6 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <UploadCloud className="w-6 h-6" />
                  )}
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {isUploadingResume
                      ? 'Simulating secure document upload...'
                      : 'Click to select or drag and drop your updated Resume / CV'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Accepts PDF, DOCX, or DOC formats up to 5 MB
                  </p>
                </div>

                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword"
                  onChange={handleResumeUpload}
                  className="hidden"
                />
              </div>

              {/* Current Resume Attachment */}
              {formData.resume && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-900">
                        {formData.resume.fileName}
                      </h4>
                      <span className="text-[10px] text-emerald-700">
                        {formData.resume.fileSize} &bull; Attached and ready for submission
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, resume: null }))}
                    className="p-1.5 text-emerald-700 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Remove attached resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Sticky Action Bar */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex items-center justify-between gap-4">
              <span className="text-xs text-slate-500 font-medium">
                Changes will immediately synchronize across your Candidate Dashboard and Recruiter Applicant Views.
              </span>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(profile)
                    setMode('view')
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/25 flex items-center gap-2 transition-all cursor-pointer transform hover:scale-[1.02]"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Candidate Profile</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL: RESUME PREVIEW MODAL (UI Only)                    */}
      {/* ========================================================= */}
      {showResumeModal && profile.resume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {profile.resume.fileName}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    {profile.resume.fileSize} &bull; Document Preview
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowResumeModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Document Mockup View */}
            <div className="flex-1 overflow-y-auto py-6 px-4 bg-slate-50 rounded-2xl border border-slate-200 my-4 space-y-4 text-xs text-slate-700 font-sans">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-base font-black text-slate-900">{profile.fullName}</h2>
                <p className="text-xs text-cyan-700 font-semibold">{profile.headline}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {profile.email} &bull; {profile.mobileNumber} &bull; {profile.address?.city}, {profile.address?.country}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
                  Executive Summary
                </h4>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {profile.bio}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
                  Key Skills
                </h4>
                <p className="text-slate-600 text-[11px]">
                  {profile.skills?.join(' • ')}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
                  Career Experience
                </h4>
                {profile.experience?.map((exp) => (
                  <div key={exp.id} className="mb-2">
                    <span className="font-bold text-slate-800">{exp.role}</span> at {exp.company} ({exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate})
                    <p className="text-[11px] text-slate-600 mt-0.5">{exp.description}</p>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
                  Education & Credentials
                </h4>
                {profile.education?.map((edu) => (
                  <div key={edu.id}>
                    <span className="font-bold text-slate-800">{edu.degree}</span> &bull; {edu.institution} ({edu.startYear} - {edu.endYear}) {edu.grade ? `[${edu.grade}]` : ''}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">
                Official PDF Render Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowResumeModal(false)}
                  className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast.success(`Downloading ${profile.resume.fileName}...`)
                    setShowResumeModal(false)
                  }}
                  className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

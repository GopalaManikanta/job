import { useState } from 'react'
import { X, Briefcase, Plus, Sparkles, Loader2, Check, Calendar } from 'lucide-react'
import { useCompanies } from '../../context/CompanyContext'

export const JOB_CATEGORIES = [
  'Software & Cloud Engineering',
  'AI & Data Science',
  'Product Management & UX',
  'Cybersecurity & DevOps',
  'Sales & Business Development',
  'Human Resources & People',
  'Finance & Operations'
]

export const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Remote',
  'Hybrid',
  'Internship'
]

export const EXPERIENCE_LEVELS = [
  'Entry Level (0-2 yrs)',
  'Mid Level (2-5 yrs)',
  'Senior Level (5-8 yrs)',
  'Lead / Principal (8+ yrs)',
  'Executive'
]

const POPULAR_SKILL_PRESETS = [
  'React',
  'TypeScript',
  'Node.js',
  'Python',
  'AWS',
  'Docker',
  'Kubernetes',
  'Next.js',
  'GraphQL',
  'Tailwind CSS',
  'SQL',
  'Figma'
]

function JobFormContent({ initialData, onClose, onSubmit, isSubmitting }) {
  const isEdit = Boolean(initialData)
  const { companies } = useCompanies()

  const [formData, setFormData] = useState(() => {
    let initialSkills = ['React', 'TypeScript', 'Node.js']
    if (initialData?.skills) {
      if (Array.isArray(initialData.skills)) {
        initialSkills = initialData.skills
      } else if (typeof initialData.skills === 'string') {
        initialSkills = initialData.skills.split(',').map((s) => s.trim()).filter(Boolean)
      }
    }

    return {
      title: initialData?.title || '',
      company: initialData?.company || (companies[0]?.name || 'Apex Cloud Systems'),
      category: initialData?.category || 'Software & Cloud Engineering',
      type: initialData?.type || 'Full-time',
      experienceLevel: initialData?.experienceLevel || 'Mid Level (2-5 yrs)',
      salary: initialData?.salary || '₹18 - ₹26 LPA',
      location: initialData?.location || 'Hybrid - Bengaluru',
      skills: initialSkills,
      deadline:
        initialData?.deadline ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: initialData?.status || 'open',
      description:
        initialData?.description ||
        'We are seeking a talented professional to design, implement, and scale core technology systems in a fast-paced agile environment.',
      responsibilities:
        initialData?.responsibilities ||
        'Collaborate with product and engineering teams, write clean resilient code, automate CI/CD workflows, and ensure 99.9% uptime for cloud services.'
    }
  })

  const [skillInput, setSkillInput] = useState('')

  const handleAddSkill = (skillToAdd) => {
    const trimmed = (skillToAdd || skillInput).trim()
    if (!trimmed) return
    if (!formData.skills.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmed]
      }))
    }
    setSkillInput('')
  }

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove)
    }))
  }

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAddSkill()
    }
  }

  const handleQuickFill = () => {
    setFormData({
      title: 'Senior Full Stack React Engineer',
      company: companies[0]?.name || 'Apex Cloud Systems',
      category: 'Software & Cloud Engineering',
      type: 'Full-time',
      experienceLevel: 'Senior Level (5-8 yrs)',
      salary: '₹24 - ₹34 LPA',
      location: 'Hybrid - Bengaluru',
      skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Tailwind CSS', 'Docker'],
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'open',
      description: 'Lead the architecture, implementation, and optimization of user-facing web applications. You will spearhead design system scalability and deliver ultra-responsive experiences.',
      responsibilities: 'Architect modular frontend components, maintain high automated test coverage, partner with product managers on user experience experiments, and mentor team members.'
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-200">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isEdit ? 'Edit Job Requisition' : 'Create New Job Requisition'}
            </h3>
            <p className="text-xs text-slate-500">
              {isEdit
                ? 'Update live vacancy details, salary benchmarks, and requirements'
                : 'Publish an open role to the talent portal in real-time'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {/* Status Toggle & Quick Fill Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Job Requisition Status:</span>
            <div className="inline-flex p-1 bg-white border border-slate-200 rounded-xl shadow-xs">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'open' })}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  formData.status === 'open'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                ● Open (Active)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'closed' })}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  formData.status === 'closed'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                ● Closed (Paused)
              </button>
            </div>
          </div>

          {!isEdit && (
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-xs font-bold text-cyan-600 hover:text-cyan-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>⚡ Auto-fill template</span>
            </button>
          )}
        </div>

        {/* Job Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Job Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Senior Cloud Architecture Lead"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-cyan-500 focus:bg-white transition-all font-semibold"
          />
        </div>

        {/* Company & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Hiring Company <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              list="company-options"
              placeholder="Select or enter company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-cyan-500 focus:bg-white"
            />
            <datalist id="company-options">
              {companies.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Job Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-cyan-500 focus:bg-white"
            >
              {JOB_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Employment Type & Experience Level */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Employment Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-cyan-500 focus:bg-white"
            >
              {EMPLOYMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Experience Level <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.experienceLevel}
              onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-cyan-500 focus:bg-white"
            >
              {EXPERIENCE_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Salary Range & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Salary Range <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ₹20 - ₹30 LPA"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-cyan-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Location <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Hybrid - Bengaluru or Remote"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-cyan-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Application Deadline */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Application Deadline <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="date"
              required
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-cyan-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Required Skills (Interactive Chip Tag Input) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Required Skills <span className="text-rose-500">*</span>
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Type skill and press Enter or click presets..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleSkillKeyDown}
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-cyan-500 focus:bg-white"
            />
            <button
              type="button"
              onClick={() => handleAddSkill()}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {/* Active Skills Chips */}
          <div className="flex flex-wrap items-center gap-1.5 min-h-[32px] p-2 rounded-xl bg-slate-50/70 border border-slate-200/70 mb-2">
            {formData.skills.length === 0 ? (
              <span className="text-[11px] text-slate-400 italic">No skills selected yet.</span>
            ) : (
              formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200 shadow-2xs"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-rose-600 cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-1 text-[11px]">
            <span className="text-slate-400 font-medium mr-1">Quick Presets:</span>
            {POPULAR_SKILL_PRESETS.map((p) => {
              const selected = formData.skills.includes(p)
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => (selected ? handleRemoveSkill(p) : handleAddSkill(p))}
                  className={`px-2 py-0.5 rounded-md border text-[11px] font-medium transition-all cursor-pointer ${
                    selected
                      ? 'bg-cyan-600 text-white border-cyan-600 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-cyan-300'
                  }`}
                >
                  {selected && <Check className="w-2.5 h-2.5 inline mr-1" />}
                  {p}
                </button>
              )
            })}
          </div>
        </div>

        {/* Job Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Job Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            required
            placeholder="Describe the opportunity, technical challenges, and team scope..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-cyan-500 focus:bg-white resize-none"
          />
        </div>

        {/* Core Responsibilities */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Key Responsibilities <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            required
            placeholder="List principal duties, architectural contributions, and daily impact..."
            value={formData.responsibilities}
            onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-cyan-500 focus:bg-white resize-none"
          />
        </div>

        {/* Footer Controls */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-2 transition-all"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isEdit ? 'Update Requisition' : 'Publish Requisition'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default function JobModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <JobFormContent
        key={initialData ? initialData.id : 'new-job'}
        initialData={initialData}
        onClose={onClose}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

import { useState } from 'react'
import { X, Building2, Globe, Mail, MapPin, Loader2, Sparkles } from 'lucide-react'

const INDUSTRIES = [
  'Software & Cloud',
  'AI & Data Science',
  'Fintech & Banking',
  'Healthcare & Biotech',
  'E-Commerce & Retail'
]

const EMPLOYEE_RANGES = [
  '50-100',
  '100-250',
  '250-500',
  '500-1000',
  '1000+'
]

function CompanyFormContent({ initialData, onClose, onSubmit, isSubmitting }) {
  const isEdit = Boolean(initialData)

  const [formData, setFormData] = useState(() => ({
    name: initialData?.name || '',
    industry: initialData?.industry || 'Software & Cloud',
    location: initialData?.location || '',
    website: initialData?.website || '',
    email: initialData?.email || '',
    employees: initialData?.employees || '100-250',
    founded: String(initialData?.founded || '2021'),
    logo: initialData?.logo || '',
    description: initialData?.description || ''
  }))

  const previewLogo =
    formData.logo?.trim() ||
    `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(formData.name.trim() || 'Preview')}`

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleQuickFill = () => {
    setFormData({
      name: 'Starlight Cloud Innovations',
      industry: 'Software & Cloud',
      location: 'Bengaluru, India',
      website: 'https://starlightcloud.io',
      email: 'careers@starlightcloud.io',
      employees: '250-500',
      founded: '2022',
      logo: '',
      description: 'Next-generation distributed cloud infrastructure provider enabling ultra-low-latency edge computing and Kubernetes automation.'
    })
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl">

      <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-200">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isEdit ? 'Edit Company Information' : 'Add New Hiring Company'}
            </h3>
            <p className="text-xs text-slate-500">
              {isEdit ? 'Update registered profile and contact details' : 'Register a new enterprise partner to the talent network'}
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

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">

        <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
          <img
            src={previewLogo}
            alt="Logo preview"
            className="w-14 h-14 rounded-2xl object-cover border border-slate-200 bg-white p-1 shrink-0 shadow-xs"
          />
          <div className="flex-1 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Live Logo Preview</span>
            <p className="text-xs font-semibold text-slate-700 truncate">
              {formData.name || 'Company Name'}
            </p>
            <span className="text-[11px] text-cyan-600 font-medium">Auto-generated via brand seed</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Company Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Apex Cloud Systems"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Industry Sector *</label>
            <select
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white"
            >
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Employee Size *</label>
            <select
              value={formData.employees}
              onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white"
            >
              {EMPLOYEE_RANGES.map((range) => (
                <option key={range} value={range}>
                  {range} Employees
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Location *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. Bengaluru, India"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Year Founded</label>
            <input
              type="number"
              placeholder="e.g. 2020"
              value={formData.founded}
              onChange={(e) => setFormData({ ...formData, founded: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Website URL *</label>
            <div className="relative">
              <Globe className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="url"
                required
                placeholder="https://example.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Contact Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="email"
                required
                placeholder="careers@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Custom Logo URL (Optional)</label>
          <input
            type="url"
            placeholder="https://example.com/logo.png (leave empty for auto avatar)"
            value={formData.logo}
            onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Company Description *</label>
          <textarea
            rows={3}
            required
            placeholder="Outline company mission, primary products, engineering culture, and technological vision..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          {!isEdit ? (
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-xs font-semibold text-cyan-600 hover:text-cyan-800 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-fill template</span>
            </button>
          ) : <span />}

          <div className="flex items-center gap-2">
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-2 transition-all"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isEdit ? 'Save Changes' : 'Register Company'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default function CompanyModal({ isOpen, onClose, onSubmit, initialData = null, isSubmitting = false }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <CompanyFormContent
        key={initialData ? initialData.id : 'new'}
        initialData={initialData}
        onClose={onClose}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

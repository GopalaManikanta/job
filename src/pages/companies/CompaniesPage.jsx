import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCompanies } from '../../context/CompanyContext'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'
import {
  Building2,
  Search,
  Filter,
  ArrowUpDown,
  PlusCircle,
  ExternalLink,
  MapPin,
  Mail,
  Users,
  Eye,
  Edit3,
  Trash2,
  X,
  RefreshCw,
  AlertCircle,
  LayoutGrid,
  ListFilter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

import DashboardHeader from '../../components/DashboardHeader'
import CompanyModal from './CompanyModal'

const INDUSTRIES = [
  'All Industries',
  'Software & Cloud',
  'AI & Data Science',
  'Fintech & Banking',
  'Healthcare & Biotech',
  'E-Commerce & Retail'
]

const SORT_OPTIONS = [
  { id: 'name_asc', label: 'Company Name (A - Z)' },
  { id: 'name_desc', label: 'Company Name (Z - A)' },
  { id: 'employees_desc', label: 'Employees (Largest First)' }
]

const ITEMS_PER_PAGE = 6

export default function CompaniesPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const {
    companies,
    loading,
    error,
    fetchCompanies,
    addCompany,
    editCompany,
    deleteCompany
  } = useCompanies()

  // Search & Filter & Sort state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('All Industries')
  const [selectedSort, setSelectedSort] = useState('name_asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'table'

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState(null)
  const [deleteCandidate, setDeleteCandidate] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogout = () => {
    logout()
    toast.info('Logged out successfully.')
    navigate('/login')
  }

  // Filter & Sort Pipeline across all Network Response fields
  const filteredCompanies = useMemo(() => {
    return companies
      .filter((comp) => {
        const q = searchQuery.trim().toLowerCase()
        if (!q) return true

        const matchesName = comp.name?.toLowerCase().includes(q)
        const matchesLocation = comp.location?.toLowerCase().includes(q)
        const matchesIndustryQuery = comp.industry?.toLowerCase().includes(q)
        const matchesContact = comp.contactPerson?.toLowerCase().includes(q)
        const matchesUsername = comp.username?.toLowerCase().includes(q)
        const matchesEmail = comp.email?.toLowerCase().includes(q)
        const matchesPhone = comp.phone?.toLowerCase().includes(q)
        const matchesCatchPhrase = comp.catchPhrase?.toLowerCase().includes(q)
        const matchesBs = comp.bs?.toLowerCase().includes(q)

        const matchesSearch =
          matchesName ||
          matchesLocation ||
          matchesIndustryQuery ||
          matchesContact ||
          matchesUsername ||
          matchesEmail ||
          matchesPhone ||
          matchesCatchPhrase ||
          matchesBs

        const matchesIndustry =
          selectedIndustry === 'All Industries' || comp.industry === selectedIndustry

        return matchesSearch && matchesIndustry
      })
      .sort((a, b) => {
        if (selectedSort === 'name_asc') {
          return a.name.localeCompare(b.name)
        }
        if (selectedSort === 'name_desc') {
          return b.name.localeCompare(a.name)
        }
        if (selectedSort === 'employees_desc') {
          const numA = parseInt(a.employees, 10) || 0
          const numB = parseInt(b.employees, 10) || 0
          return numB - numA
        }
        return 0
      })
  }, [companies, searchQuery, selectedIndustry, selectedSort])

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE))
  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredCompanies.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredCompanies, currentPage])

  // Reset to page 1 on filter/search change
  const handleSearchChange = (val) => {
    setSearchQuery(val)
    setCurrentPage(1)
  }

  const handleIndustryChange = (ind) => {
    setSelectedIndustry(ind)
    setCurrentPage(1)
  }

  const handleSortChange = (sortId) => {
    setSelectedSort(sortId)
    setCurrentPage(1)
  }

  // Add / Edit Modal Submit
  const handleModalSubmit = async (formData) => {
    setIsSubmitting(true)
    try {
      if (editingCompany) {
        const res = await editCompany(editingCompany.id, formData)
        if (res.success) {
          toast.success(`Company "${formData.name}" profile updated successfully!`)
          setIsModalOpen(false)
          setEditingCompany(null)
        } else {
          toast.error(res.message || 'Failed to update company.')
        }
      } else {
        const res = await addCompany(formData)
        if (res.success) {
          toast.success(`Company "${formData.name}" registered successfully!`)
          setIsModalOpen(false)
        } else {
          toast.error(res.message || 'Failed to add company.')
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open Edit Modal
  const handleOpenEdit = (comp) => {
    setEditingCompany(comp)
    setIsModalOpen(true)
  }

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingCompany(null)
    setIsModalOpen(true)
  }

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return
    setIsSubmitting(true)
    try {
      const res = await deleteCompany(deleteCandidate.id)
      if (res.success) {
        toast.success(`Company "${deleteCandidate.name}" removed from directory.`)
        setDeleteCandidate(null)
      } else {
        toast.error(res.message || 'Failed to delete company.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col relative overflow-x-hidden selection:bg-cyan-500 selection:text-white">
      {/* Background Ambient Glow */}
      <div className="fixed top-0 left-1/3 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-100/40 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 translate-x-1/2 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Top Header */}
      <DashboardHeader user={user} onLogout={handleLogout} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-6">
        {/* 1. Header Banner */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-xs font-bold text-cyan-700 shadow-xs">
              <Building2 className="w-3.5 h-3.5 text-cyan-600" />
              <span>Partner Organizations Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Company Management
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 max-w-2xl leading-relaxed">
              Explore hiring partners, manage enterprise profiles, and track organization portfolios in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => fetchCompanies(true)}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-xs"
              title="Refresh Directory"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-600' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-2 transition-all cursor-pointer transform hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Company</span>
            </button>
          </div>
        </div>

        {/* 2. Search, Filter, Sort & View Control Bar */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search companies by name, location, or industry..."
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/90 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedSort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="bg-transparent focus:outline-none cursor-pointer text-slate-800 font-bold"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center p-1 bg-slate-100 border border-slate-200 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid' ? 'bg-white text-cyan-600 shadow-xs' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'table' ? 'bg-white text-cyan-600 shadow-xs' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="List View"
                >
                  <ListFilter className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Industry Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1 mr-1 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              Industry:
            </span>
            {INDUSTRIES.map((ind) => (
              <button
                key={ind}
                type="button"
                onClick={() => handleIndustryChange(ind)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  selectedIndustry === ind
                    ? 'bg-cyan-50 text-cyan-700 border border-cyan-300 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
            <button
              type="button"
              onClick={() => fetchCompanies(true)}
              className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 cursor-pointer transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* 4. Company List / Grid / Skeletons */}
        {loading && companies.length === 0 ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 animate-pulse shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200" />
                  <div className="space-y-1.5 flex-1">
                    <div className="w-3/4 h-3.5 bg-slate-200 rounded" />
                    <div className="w-1/2 h-2.5 bg-slate-200 rounded" />
                  </div>
                </div>
                <div className="w-full h-8 bg-slate-100 rounded-lg" />
                <div className="pt-3 border-t border-slate-100 flex justify-between">
                  <div className="w-20 h-4 bg-slate-200 rounded" />
                  <div className="w-16 h-4 bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCompanies.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-3 shadow-xs">
              <Building2 className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Companies Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
              No registered hiring partners match your search query or selected industry filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setSelectedIndustry('All Industries')
              }}
              className="px-4 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 text-xs font-bold transition-all cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedCompanies.map((company) => (
              <div
                key={company.id}
                className="group relative bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-cyan-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between shadow-xs"
              >
                <div>
                  {/* Top Bar: Logo + Name + Industry Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200 bg-white p-1 shadow-xs group-hover:scale-105 transition-transform shrink-0"
                      />
                      <div>
                        <Link
                          to={`/companies/${company.id}`}
                          className="text-sm font-bold text-slate-900 group-hover:text-cyan-700 transition-colors line-clamp-1"
                        >
                          {company.name}
                        </Link>
                        <span className="text-[10px] font-bold text-cyan-700 px-2 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 inline-block mt-1">
                          {company.industry}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Metadata Row: Location + Employees */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-2.5 font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {company.location}
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {company.employees}
                    </span>
                  </div>

                  {/* Representative & Phone from API */}
                  {company.contactPerson && (
                    <div className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 mb-2.5 text-slate-600">
                      <span className="font-semibold truncate">
                        Lead: <strong className="text-slate-900">{company.contactPerson}</strong>
                      </span>
                      {company.phone && (
                        <span className="font-mono text-[10px] text-slate-500 shrink-0">
                          {company.phone.split(' ')[0]}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Catchphrase from API */}
                  {company.catchPhrase && (
                    <p className="text-[11px] text-cyan-800 italic bg-cyan-50/70 border border-cyan-100 rounded-xl px-2.5 py-1 mb-2.5 line-clamp-1">
                      &ldquo;{company.catchPhrase}&rdquo;
                    </p>
                  )}

                  {/* Description snippet */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {company.description}
                  </p>

                  {/* Contact Links */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mb-3 pt-3 border-t border-slate-100">
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-cyan-600 hover:underline font-semibold"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Website</span>
                      </a>
                    )}
                    {company.email && (
                      <a
                        href={`mailto:${company.email}`}
                        className="flex items-center gap-1 hover:text-slate-800"
                        title={company.email}
                      >
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[130px]">{company.email}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/companies/${company.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-cyan-700 hover:text-cyan-800"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Profile</span>
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(company)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 transition-colors cursor-pointer"
                      title="Edit Company"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteCandidate(company)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Company"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table / List View */
          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Company</th>
                    <th className="py-3.5 px-4">Lead Contact</th>
                    <th className="py-3.5 px-4">Industry</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Employees</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {paginatedCompanies.map((company) => (
                    <tr key={company.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={company.logo}
                            alt={company.name}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 bg-white p-0.5"
                          />
                          <Link
                            to={`/companies/${company.id}`}
                            className="font-bold text-slate-900 hover:text-cyan-600 transition-colors"
                          >
                            {company.name}
                          </Link>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{company.contactPerson || 'Executive Lead'}</span>
                        {company.phone && <span className="text-[10px] text-slate-400 font-mono">{company.phone.split(' ')[0]}</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                          {company.industry}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{company.location}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{company.employees}</td>
                      <td className="py-3 px-4 text-slate-500">
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-600 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <span>Website</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Link
                            to={`/companies/${company.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 transition-colors"
                            title="View Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(company)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteCandidate(company)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. Pagination Bar */}
        {filteredCompanies.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-xs text-slate-500 font-medium">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredCompanies.length)} of {filteredCompanies.length} companies
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentPage === page
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Add / Edit Modal */}
      <CompanyModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingCompany(null)
        }}
        onSubmit={handleModalSubmit}
        initialData={editingCompany}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto shadow-xs">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Company?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <span className="font-bold text-slate-800">"{deleteCandidate.name}"</span>? This will remove the company from live listings.
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
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

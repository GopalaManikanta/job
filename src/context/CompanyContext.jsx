import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const CompanyContext = createContext(null)

const STORAGE_KEY = 'job_portal_companies'
const CUSTOM_COMPANIES_KEY = 'job_portal_custom_companies'
const API_BASE_URL = 'https://jsonplaceholder.typicode.com/users'

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

const mapApiToCompany = (apiUser, index = 0) => {
  const companyObj = apiUser.company || {}
  const addressObj = apiUser.address || {}

  const companyName = companyObj.name || apiUser.name || 'Enterprise Partner'
  const contactPerson = apiUser.name || 'Executive Lead'
  const phone = apiUser.phone || '+1-800-555-0199'
  const username = apiUser.username || 'partner'
  const catchPhrase = companyObj.catchPhrase || 'Enterprise Innovation Leader'
  const bs = companyObj.bs || 'Scalable Cloud Systems'

  const industry = INDUSTRIES[index % INDUSTRIES.length]
  const employees = EMPLOYEE_RANGES[index % EMPLOYEE_RANGES.length]
  const location = addressObj.city
    ? `${addressObj.city}${addressObj.street ? `, ${addressObj.street}` : ''}`
    : 'Bengaluru, India'
  const website = apiUser.website
    ? (apiUser.website.startsWith('http') ? apiUser.website : `https://${apiUser.website}`)
    : 'https://company.example.com'

  const description = `${catchPhrase}. Pioneering ${bs} with world-class engineering and global operational excellence.`

  const fullAddress = [addressObj.street, addressObj.suite, addressObj.city, addressObj.zipcode]
    .filter(Boolean)
    .join(', ') || 'Bengaluru, Karnataka, India'

  return {
    id: String(apiUser.id),
    name: companyName,
    contactPerson,
    phone,
    username,
    catchPhrase,
    bs,
    logo: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(companyName)}`,
    industry,
    location,
    fullAddress,
    street: addressObj.street || '',
    suite: addressObj.suite || '',
    city: addressObj.city || '',
    zipcode: addressObj.zipcode || '',
    website,
    email: apiUser.email ? apiUser.email.toLowerCase() : `contact@${companyName.toLowerCase().replace(/[^a-z]/g, '')}.com`,
    employees,
    description,
    founded: 2018 + (index % 6),
    createdAt: new Date().toISOString(),
    rawApiData: apiUser
  }
}

const fetchCompaniesFromApi = async () => {
  const response = await fetch(API_BASE_URL, {
    method: 'GET',
    headers: { Accept: 'application/json' }
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch companies: HTTP ${response.status}`)
  }
  const data = await response.json()
  return data.map((item, idx) => mapApiToCompany(item, idx))
}

const fetchCompanyByIdFromApi = async (id) => {
  const safeId = Number(id) >= 1 && Number(id) <= 10 ? id : 1
  const response = await fetch(`${API_BASE_URL}/${safeId}`, {
    method: 'GET',
    headers: { Accept: 'application/json' }
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch company details: HTTP ${response.status}`)
  }
  const data = await response.json()
  return mapApiToCompany(data, Number(id) || 0)
}

const createCompanyApi = async (companyData) => {
  const payload = {
    name: companyData.contactPerson || companyData.name,
    email: companyData.email,
    phone: companyData.phone || '+1-800-555-0199',
    website: companyData.website,
    company: {
      name: companyData.name,
      catchPhrase: companyData.catchPhrase || companyData.description?.slice(0, 60) || 'Enterprise Innovation Leader',
      bs: companyData.industry
    },
    address: {
      city: companyData.location?.split(',')[0] || 'Bengaluru'
    }
  }

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        Accept: 'application/json'
      },
      body: JSON.stringify(payload)
    })
    if (!response.ok) {
      throw new Error(`API create company failed: HTTP ${response.status}`)
    }
    const result = await response.json()
    return {
      ...companyData,
      id: String(result.id || `comp_${Date.now()}`)
    }
  } catch {
    return {
      ...companyData,
      id: `comp_${Date.now()}`
    }
  }
}

const updateCompanyApi = async (id, companyData) => {
  const safeId = Number(id) >= 1 && Number(id) <= 10 ? id : 1
  const payload = {
    name: companyData.contactPerson || companyData.name,
    email: companyData.email,
    phone: companyData.phone || '+1-800-555-0199',
    website: companyData.website,
    company: {
      name: companyData.name,
      catchPhrase: companyData.catchPhrase || companyData.description?.slice(0, 60),
      bs: companyData.industry
    },
    address: {
      city: companyData.location?.split(',')[0]
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${safeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        Accept: 'application/json'
      },
      body: JSON.stringify(payload)
    })
    if (!response.ok) {
      throw new Error(`API update company failed: HTTP ${response.status}`)
    }
    return {
      ...companyData,
      id: String(id)
    }
  } catch {
    return {
      ...companyData,
      id: String(id)
    }
  }
}

const deleteCompanyApi = async (id) => {
  const safeId = Number(id) >= 1 && Number(id) <= 10 ? id : 1
  try {
    const response = await fetch(`${API_BASE_URL}/${safeId}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' }
    })
    if (!response.ok) {
      throw new Error(`API delete company failed: HTTP ${response.status}`)
    }
    return { success: true, id: String(id) }
  } catch {
    return { success: true, id: String(id) }
  }
}

const readStorage = (key) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const writeStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {

  }
}

export function CompanyProvider({ children }) {
  const [companies, setCompanies] = useState(() => readStorage(STORAGE_KEY))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [networkActivity, setNetworkActivity] = useState(null)

  const broadcastSync = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('job_portal_sync'))
    }
  }

  const loadCompanies = useCallback(async () => {
    setLoading(true)
    setError(null)
    setNetworkActivity({
      method: 'GET',
      url: API_BASE_URL,
      status: 'Connecting...',
      time: new Date().toLocaleTimeString()
    })

    try {
      const apiCompanies = await fetchCompaniesFromApi()
      const customCompanies = readStorage(CUSTOM_COMPANIES_KEY)
      const merged = [...customCompanies, ...apiCompanies]

      setCompanies(merged)
      writeStorage(STORAGE_KEY, merged)
      setNetworkActivity({
        method: 'GET',
        url: API_BASE_URL,
        status: '200 OK',
        count: merged.length,
        time: new Date().toLocaleTimeString()
      })
      broadcastSync()
    } catch (err) {
      setError(err?.message || 'Failed to connect to Company API. Please check your network.')
      const cached = readStorage(STORAGE_KEY)
      if (cached && cached.length > 0) {
        setCompanies(cached)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCompaniesFromApi()
      .then((apiCompanies) => {
        const customCompanies = readStorage(CUSTOM_COMPANIES_KEY)
        const merged = [...customCompanies, ...apiCompanies]
        setCompanies(merged)
        writeStorage(STORAGE_KEY, merged)
        setNetworkActivity({
          method: 'GET',
          url: API_BASE_URL,
          status: '200 OK',
          count: merged.length,
          time: new Date().toLocaleTimeString()
        })
        broadcastSync()
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY) {
        setCompanies(readStorage(STORAGE_KEY))
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const addCompany = useCallback(async (formData) => {
    setLoading(true)
    setError(null)
    setNetworkActivity({
      method: 'POST',
      url: API_BASE_URL,
      status: 'Sending Payload...',
      time: new Date().toLocaleTimeString()
    })

    try {
      const companyPayload = {
        name: formData.name.trim(),
        industry: formData.industry || 'Software & Cloud',
        location: formData.location.trim() || 'Bengaluru, India',
        website: formData.website.trim() || 'https://enterprise.example.com',
        email: formData.email.trim().toLowerCase() || 'careers@enterprise.com',
        employees: formData.employees || '100-250',
        description: formData.description.trim() || `${formData.name} is an innovative organization building high-impact solutions.`,
        logo: formData.logo?.trim() || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(formData.name.trim())}`,
        founded: Number(formData.founded) || new Date().getFullYear(),
        createdAt: new Date().toISOString()
      }

      const newCompany = await createCompanyApi(companyPayload)
      const currentCustom = readStorage(CUSTOM_COMPANIES_KEY)
      const updatedCustom = [newCompany, ...currentCustom]
      writeStorage(CUSTOM_COMPANIES_KEY, updatedCustom)

      setCompanies((prev) => {
        const updated = [newCompany, ...prev]
        writeStorage(STORAGE_KEY, updated)
        return updated
      })

      setNetworkActivity({
        method: 'POST',
        url: API_BASE_URL,
        status: '201 Created',
        time: new Date().toLocaleTimeString()
      })

      broadcastSync()
      return { success: true, company: newCompany }
    } catch (err) {
      return { success: false, message: err?.message || 'Failed to create company.' }
    } finally {
      setLoading(false)
    }
  }, [])

  const editCompany = useCallback(async (id, formData) => {
    setLoading(true)
    setError(null)
    setNetworkActivity({
      method: 'PUT',
      url: `${API_BASE_URL}/${id}`,
      status: 'Updating...',
      time: new Date().toLocaleTimeString()
    })

    try {
      const updatedPayload = {
        name: formData.name.trim(),
        industry: formData.industry,
        location: formData.location.trim(),
        website: formData.website.trim(),
        email: formData.email.trim().toLowerCase(),
        employees: formData.employees,
        description: formData.description.trim(),
        logo: formData.logo?.trim() || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(formData.name.trim())}`,
        founded: Number(formData.founded) || 2020
      }

      const savedCompany = await updateCompanyApi(id, updatedPayload)
      const currentCustom = readStorage(CUSTOM_COMPANIES_KEY)
      const updatedCustom = currentCustom.map((c) => (String(c.id) === String(id) ? { ...c, ...savedCompany } : c))
      writeStorage(CUSTOM_COMPANIES_KEY, updatedCustom)

      setCompanies((prev) => {
        const updated = prev.map((c) => (String(c.id) === String(id) ? { ...c, ...savedCompany } : c))
        writeStorage(STORAGE_KEY, updated)
        return updated
      })

      setNetworkActivity({
        method: 'PUT',
        url: `${API_BASE_URL}/${id}`,
        status: '200 OK',
        time: new Date().toLocaleTimeString()
      })

      broadcastSync()
      return { success: true, company: savedCompany }
    } catch (err) {
      return { success: false, message: err?.message || 'Failed to update company.' }
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteCompany = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    setNetworkActivity({
      method: 'DELETE',
      url: `${API_BASE_URL}/${id}`,
      status: 'Deleting...',
      time: new Date().toLocaleTimeString()
    })

    try {
      await deleteCompanyApi(id)
      const currentCustom = readStorage(CUSTOM_COMPANIES_KEY)
      const updatedCustom = currentCustom.filter((c) => String(c.id) !== String(id))
      writeStorage(CUSTOM_COMPANIES_KEY, updatedCustom)

      setCompanies((prev) => {
        const updated = prev.filter((c) => String(c.id) !== String(id))
        writeStorage(STORAGE_KEY, updated)
        return updated
      })

      setNetworkActivity({
        method: 'DELETE',
        url: `${API_BASE_URL}/${id}`,
        status: '200 OK',
        time: new Date().toLocaleTimeString()
      })

      broadcastSync()
      return { success: true }
    } catch (err) {
      return { success: false, message: err?.message || 'Failed to delete company.' }
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchSingleCompany = useCallback(async (id) => {
    if (Number(id) >= 1 && Number(id) <= 10) {
      setNetworkActivity({
        method: 'GET',
        url: `${API_BASE_URL}/${id}`,
        status: 'Connecting...',
        time: new Date().toLocaleTimeString()
      })
      try {
        const fetched = await fetchCompanyByIdFromApi(id)
        if (fetched) {
          setNetworkActivity({
            method: 'GET',
            url: `${API_BASE_URL}/${id}`,
            status: '200 OK',
            time: new Date().toLocaleTimeString()
          })
          setCompanies((prev) => {
            const exists = prev.some((c) => String(c.id) === String(id))
            const updated = exists
              ? prev.map((c) => (String(c.id) === String(id) ? { ...c, ...fetched } : c))
              : [...prev, fetched]
            writeStorage(STORAGE_KEY, updated)
            return updated
          })
          return fetched
        }
      } catch {

      }
    }
    return companies.find((c) => String(c.id) === String(id)) || null
  }, [companies])

  const getCompanyById = useCallback(
    (id) => {
      return companies.find((c) => String(c.id) === String(id)) || null
    },
    [companies]
  )

  return (
    <CompanyContext.Provider
      value={{
        companies,
        loading,
        error,
        networkActivity,
        fetchCompanies: loadCompanies,
        fetchSingleCompany,
        addCompany,
        editCompany,
        deleteCompany,
        getCompanyById
      }}
    >
      {children}
    </CompanyContext.Provider>
  )
}

export function useCompanies() {
  const context = useContext(CompanyContext)
  if (!context) {
    throw new Error('useCompanies must be used within a CompanyProvider')
  }
  return context
}

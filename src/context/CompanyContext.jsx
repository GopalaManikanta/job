import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  fetchCompaniesFromApi,
  createCompanyApi,
  updateCompanyApi,
  deleteCompanyApi,
  fetchCompanyByIdFromApi
} from '../services/companyApi'

const CompanyContext = createContext(null)

const STORAGE_KEY = 'job_portal_companies'
const CUSTOM_COMPANIES_KEY = 'job_portal_custom_companies'

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
    // Ignore storage write issues silently
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

  // Load companies directly via real network fetch
  const loadCompanies = useCallback(async () => {
    setLoading(true)
    setError(null)
    setNetworkActivity({
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/users',
      status: 'Connecting...',
      time: new Date().toLocaleTimeString()
    })

    try {
      // 1. Visible in DevTools Network Tab: GET https://jsonplaceholder.typicode.com/users
      const apiCompanies = await fetchCompaniesFromApi()

      // Merge with any custom companies locally created by the user
      const customCompanies = readStorage(CUSTOM_COMPANIES_KEY)
      const merged = [...customCompanies, ...apiCompanies]

      setCompanies(merged)
      writeStorage(STORAGE_KEY, merged)
      setNetworkActivity({
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/users',
        status: '200 OK',
        count: merged.length,
        time: new Date().toLocaleTimeString()
      })
      broadcastSync()
    } catch (err) {
      setError(err?.message || 'Failed to connect to Company API. Please check your network.')
      // Fallback to cache
      const cached = readStorage(STORAGE_KEY)
      if (cached && cached.length > 0) {
        setCompanies(cached)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load on mount - fires real GET request in Network tab
  useEffect(() => {
    fetchCompaniesFromApi()
      .then((apiCompanies) => {
        const customCompanies = readStorage(CUSTOM_COMPANIES_KEY)
        const merged = [...customCompanies, ...apiCompanies]
        setCompanies(merged)
        writeStorage(STORAGE_KEY, merged)
        setNetworkActivity({
          method: 'GET',
          url: 'https://jsonplaceholder.typicode.com/users',
          status: '200 OK',
          count: merged.length,
          time: new Date().toLocaleTimeString()
        })
        broadcastSync()
      })
      .catch(() => {
        // Handled via fallback cache
      })
  }, [])

  // Synchronize across browser tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY) {
        setCompanies(readStorage(STORAGE_KEY))
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Add Company (Visible in DevTools Network Tab as POST)
  const addCompany = useCallback(async (formData) => {
    setLoading(true)
    setError(null)
    setNetworkActivity({
      method: 'POST',
      url: 'https://jsonplaceholder.typicode.com/users',
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

      // 2. Visible in DevTools Network Tab: POST https://jsonplaceholder.typicode.com/users
      const newCompany = await createCompanyApi(companyPayload)

      // Persist to custom companies store and active state
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
        url: 'https://jsonplaceholder.typicode.com/users',
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

  // Edit Company (Visible in DevTools Network Tab as PUT)
  const editCompany = useCallback(async (id, formData) => {
    setLoading(true)
    setError(null)
    setNetworkActivity({
      method: 'PUT',
      url: `https://jsonplaceholder.typicode.com/users/${id}`,
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

      // 3. Visible in DevTools Network Tab: PUT https://jsonplaceholder.typicode.com/users/:id
      const savedCompany = await updateCompanyApi(id, updatedPayload)

      // Update in custom list if present
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
        url: `https://jsonplaceholder.typicode.com/users/${id}`,
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

  // Delete Company (Visible in DevTools Network Tab as DELETE)
  const deleteCompany = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    setNetworkActivity({
      method: 'DELETE',
      url: `https://jsonplaceholder.typicode.com/users/${id}`,
      status: 'Deleting...',
      time: new Date().toLocaleTimeString()
    })

    try {
      // 4. Visible in DevTools Network Tab: DELETE https://jsonplaceholder.typicode.com/users/:id
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
        url: `https://jsonplaceholder.typicode.com/users/${id}`,
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

  // Single Company fetcher with API call
  const fetchSingleCompany = useCallback(async (id) => {
    // If it's a valid ID from the API (1 to 10)
    if (Number(id) >= 1 && Number(id) <= 10) {
      setNetworkActivity({
        method: 'GET',
        url: `https://jsonplaceholder.typicode.com/users/${id}`,
        status: 'Connecting...',
        time: new Date().toLocaleTimeString()
      })
      try {
        const fetched = await fetchCompanyByIdFromApi(id)
        if (fetched) {
          setNetworkActivity({
            method: 'GET',
            url: `https://jsonplaceholder.typicode.com/users/${id}`,
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
        // Fallback to local cache
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

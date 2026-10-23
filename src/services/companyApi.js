// Third-Party REST API Client for Company Management
// Integrates with JSONPlaceholder REST API (https://jsonplaceholder.typicode.com/users)

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

/**
 * Maps raw JSONPlaceholder user/company object into a complete Company entity
 * Preserves all fields from the Network tab response: name, contact person, phone, email, website, company name, catchPhrase, address
 */
export const mapApiToCompany = (apiUser, index = 0) => {
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

/**
 * 1. GET ALL COMPANIES (visible in DevTools Network tab)
 */
export const fetchCompaniesFromApi = async () => {
  const response = await fetch(API_BASE_URL, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch companies from API: HTTP ${response.status}`)
  }

  const data = await response.json()
  return data.map((item, idx) => mapApiToCompany(item, idx))
}

/**
 * 2. GET SINGLE COMPANY BY ID (visible in DevTools Network tab)
 */
export const fetchCompanyByIdFromApi = async (id) => {
  const safeId = Number(id) >= 1 && Number(id) <= 10 ? id : 1
  const url = `${API_BASE_URL}/${safeId}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch company details from API: HTTP ${response.status}`)
  }

  const data = await response.json()
  return mapApiToCompany(data, Number(id) || 0)
}

/**
 * 3. POST CREATE COMPANY (visible in DevTools Network tab)
 */
export const createCompanyApi = async (companyData) => {
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

  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'Accept': 'application/json'
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
}

/**
 * 4. PUT UPDATE COMPANY (visible in DevTools Network tab)
 */
export const updateCompanyApi = async (id, companyData) => {
  const safeId = Number(id) >= 1 && Number(id) <= 10 ? id : 1
  const url = `${API_BASE_URL}/${safeId}`

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

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'Accept': 'application/json'
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
}

/**
 * 5. DELETE COMPANY (visible in DevTools Network tab)
 */
export const deleteCompanyApi = async (id) => {
  const safeId = Number(id) >= 1 && Number(id) <= 10 ? id : 1
  const url = `${API_BASE_URL}/${safeId}`

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`API delete company failed: HTTP ${response.status}`)
  }

  return { success: true, id: String(id) }
}

import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const DEFAULT_CANDIDATE_PROFILE = {
  id: 'usr_cand_01',
  userId: 'usr_cand_01',
  fullName: 'Rohit Sharma',
  email: 'candidate@jobportal.com',
  mobileNumber: '+91 98765 43210',
  headline: 'Senior Full Stack React Engineer',
  bio: 'Passionate Full Stack Software Engineer with 5+ years of experience designing high-scale React, TypeScript, and Node.js applications. Strong advocate of component modularity, web performance, and zero-defect deployments.',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  address: {
    street: 'Flat 402, Cyber Heights, HITEC City',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500081',
    country: 'India'
  },
  skills: [
    'React',
    'TypeScript',
    'Node.js',
    'Tailwind CSS',
    'Next.js',
    'GraphQL',
    'PostgreSQL',
    'Docker',
    'REST APIs',
    'Git'
  ],
  experience: [
    {
      id: 'exp_01',
      role: 'Senior React Engineer',
      company: 'TechWave Solutions',
      location: 'Hyderabad, India (Hybrid)',
      startDate: '2022-06',
      endDate: '',
      isCurrent: true,
      description: 'Lead frontend architect for high-throughput cloud dashboards. Spearheaded micro-frontend migration resulting in 35% faster page load times.'
    },
    {
      id: 'exp_02',
      role: 'Frontend Developer',
      company: 'Innovate Apps Inc.',
      location: 'Bengaluru, India',
      startDate: '2020-07',
      endDate: '2022-05',
      isCurrent: false,
      description: 'Engineered responsive web applications using React, Redux, and Tailwind CSS. Collaborated with UX team to build design systems.'
    }
  ],
  education: [
    {
      id: 'edu_01',
      degree: 'B.Tech in Computer Science & Engineering',
      institution: 'Jawaharlal Nehru Technological University (JNTU)',
      fieldOfStudy: 'Computer Science',
      startYear: '2016',
      endYear: '2020',
      grade: '8.8 CGPA (First Class with Distinction)'
    }
  ],
  resume: {
    fileName: 'Rohit_Sharma_Senior_FullStack_Resume.pdf',
    fileSize: '1.4 MB',
    uploadedAt: 'Today at 09:30 AM',
    fileType: 'application/pdf'
  }
}

const INITIAL_USERS = [
  {
    id: 'usr_cand_01',
    name: 'Rohit Sharma',
    email: 'candidate@jobportal.com',
    password: 'password123',
    role: 'candidate',
    headline: 'Senior Full Stack React Engineer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    location: 'Hyderabad, India'
  },
  {
    id: 'usr_rec_01',
    name: 'Priya Menon',
    email: 'recruiter@jobportal.com',
    password: 'password123',
    role: 'recruiter',
    company: 'Apex Cloud Systems',
    headline: 'Senior Talent Acquisition Lead',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    location: 'Bengaluru, India'
  }
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('job_portal_auth_user')
      if (stored) {
        const parsed = JSON.parse(stored)

        delete parsed.appliedCount
        delete parsed.savedCount
        delete parsed.activeJobsCount
        delete parsed.totalApplicantsCount
        delete parsed.shortlistedCount
        delete parsed.profileViews
        return parsed
      }
      return null
    } catch {
      return null
    }
  })

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('job_portal_users')
      if (!storedUsers) {
        localStorage.setItem('job_portal_users', JSON.stringify(INITIAL_USERS))
      } else {
        let users = JSON.parse(storedUsers)
        if (Array.isArray(users)) {
          let modified = false
          users = users.map((u) => {
            if (
              u.appliedCount !== undefined ||
              u.savedCount !== undefined ||
              u.activeJobsCount !== undefined ||
              u.totalApplicantsCount !== undefined ||
              u.shortlistedCount !== undefined ||
              u.profileViews !== undefined
            ) {
              modified = true
              const cleanUser = { ...u }
              delete cleanUser.appliedCount
              delete cleanUser.savedCount
              delete cleanUser.activeJobsCount
              delete cleanUser.totalApplicantsCount
              delete cleanUser.shortlistedCount
              delete cleanUser.profileViews
              return cleanUser
            }
            return u
          })
          if (modified) {
            localStorage.setItem('job_portal_users', JSON.stringify(users))
          }
        }
      }

      const storedAuth = localStorage.getItem('job_portal_auth_user')
      if (storedAuth) {
        const authUser = JSON.parse(storedAuth)
        if (
          authUser.appliedCount !== undefined ||
          authUser.savedCount !== undefined ||
          authUser.activeJobsCount !== undefined ||
          authUser.totalApplicantsCount !== undefined ||
          authUser.shortlistedCount !== undefined ||
          authUser.profileViews !== undefined
        ) {
          delete authUser.appliedCount
          delete authUser.savedCount
          delete authUser.activeJobsCount
          delete authUser.totalApplicantsCount
          delete authUser.shortlistedCount
          delete authUser.profileViews
          localStorage.setItem('job_portal_auth_user', JSON.stringify(authUser))
        }
      }
    } catch {

    }
  }, [])

  const getUsers = () => {
    try {
      const raw = localStorage.getItem('job_portal_users')
      let users = raw ? JSON.parse(raw) : []
      if (!Array.isArray(users)) users = []

      let updated = false
      for (const initUser of INITIAL_USERS) {
        const idx = users.findIndex(
          (u) => u.email.toLowerCase() === initUser.email.toLowerCase()
        )
        if (idx === -1) {
          users.push(initUser)
          updated = true
        } else if (!users[idx].password) {
          users[idx].password = initUser.password
          updated = true
        }
      }

      if (updated || !raw) {
        localStorage.setItem('job_portal_users', JSON.stringify(users))
      }
      return users
    } catch {
      return INITIAL_USERS
    }
  }

  const saveUsers = (users) => {
    try {
      localStorage.setItem('job_portal_users', JSON.stringify(users))
    } catch {

    }
  }

  const login = async (email, password, role) => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const cleanEmail = (email || '').trim().toLowerCase()
    const cleanPassword = (password || '').trim()

    if (!cleanEmail) {
      return { success: false, message: 'Please enter your email address.' }
    }
    if (!cleanPassword) {
      return { success: false, message: 'Please enter your password.' }
    }

    const users = getUsers()
    let targetUser = users.find(
      (u) => u.email.toLowerCase() === cleanEmail
    )

    if (!targetUser) {
      const isRecruiter = role === 'recruiter' || cleanEmail.includes('recruiter') || cleanEmail.includes('hr')
      const derivedName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ')
      const formattedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1)

      targetUser = {
        id: `usr_${Date.now()}`,
        name: formattedName || (isRecruiter ? 'Hiring Partner' : 'Job Seeker'),
        email: cleanEmail,
        password: cleanPassword,
        role: role || (isRecruiter ? 'recruiter' : 'candidate'),
        company: isRecruiter ? 'Enterprise Partner' : undefined,
        headline: isRecruiter ? 'Senior Talent Partner' : 'Full Stack Developer',
        location: 'Bengaluru, India',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanEmail)}&backgroundColor=4f46e5,06b6d4`
      }

      users.push(targetUser)
      saveUsers(users)
    } else {
      if (targetUser.password && targetUser.password.trim() !== cleanPassword) {
        return {
          success: false,
          message: 'Incorrect password! For demo accounts, default is password123'
        }
      }
    }

    const effectiveRole = targetUser.role || role || 'candidate'
    const safeUser = {
      ...targetUser,
      role: effectiveRole
    }
    delete safeUser.password

    localStorage.setItem('job_portal_auth_user', JSON.stringify(safeUser))
    setUser(safeUser)

    return {
      success: true,
      user: safeUser
    }
  }

  const register = async (userData) => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const users = getUsers()
    const cleanEmail = userData.email.trim().toLowerCase()
    const cleanName = userData.name.trim() || 'New User'
    const targetRole = userData.role || 'candidate'

    const existingIndex = users.findIndex(
      (u) => u.email.toLowerCase() === cleanEmail
    )

    let finalUser = null

    if (existingIndex !== -1) {
      users[existingIndex].name = cleanName
      users[existingIndex].password = userData.password
      users[existingIndex].role = targetRole
      if (userData.company) users[existingIndex].company = userData.company
      finalUser = users[existingIndex]
    } else {
      finalUser = {
        id: `usr_${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        password: userData.password,
        role: targetRole,
        company: userData.company || (targetRole === 'recruiter' ? 'Enterprise Corp' : undefined),
        headline: targetRole === 'candidate' ? 'Full Stack Developer' : 'Senior Hiring Lead',
        location: 'Bengaluru, India',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=4f46e5,06b6d4`
      }
      users.push(finalUser)
    }

    saveUsers(users)

    const { password: _, ...safeUser } = finalUser
    localStorage.setItem('job_portal_auth_user', JSON.stringify(safeUser))
    setUser(safeUser)

    return {
      success: true,
      user: safeUser
    }
  }

  const requestPasswordReset = async (email) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const users = getUsers()
    const exists = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    )

    if (!exists) {
      return {
        success: false,
        message: 'No account registered with this email address.'
      }
    }

    const mockOtp = '748291'
    return {
      success: true,
      mockOtp,
      message: 'Verification code sent to your registered email address.'
    }
  }

  const resetPassword = async (email, newPassword) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const users = getUsers()
    const index = users.findIndex(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    )

    if (index === -1) {
      return {
        success: false,
        message: 'User account not found.'
      }
    }

    users[index].password = newPassword
    saveUsers(users)

    return {
      success: true,
      message: 'Your password has been reset successfully. You can now log in.'
    }
  }

  const updateUserProfile = (updatedData) => {
    try {
      const current = user || JSON.parse(localStorage.getItem('job_portal_auth_user') || '{}')
      const merged = { ...current, ...updatedData }
      localStorage.setItem('job_portal_auth_user', JSON.stringify(merged))
      setUser(merged)

      const users = getUsers()
      const idx = users.findIndex(
        (u) => u.id === merged.id || u.email?.toLowerCase() === merged.email?.toLowerCase()
      )
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...updatedData }
        saveUsers(users)
      }

      window.dispatchEvent(new Event('storage'))
      return { success: true, user: merged }
    } catch {
      return { success: false, message: 'Failed to update user profile.' }
    }
  }

  const getCandidateProfile = (candidateUserId) => {
    try {
      const targetId = candidateUserId || user?.id || 'usr_cand_01'
      const key = `job_portal_candidate_profile_${targetId}`
      const stored = localStorage.getItem(key)
      if (stored) {
        return JSON.parse(stored)
      }

      if (targetId === 'usr_cand_01' || user?.email === 'candidate@jobportal.com') {
        localStorage.setItem(key, JSON.stringify(DEFAULT_CANDIDATE_PROFILE))
        return DEFAULT_CANDIDATE_PROFILE
      }

      const dynamicProfile = {
        id: targetId,
        userId: targetId,
        fullName: user?.name || 'Professional',
        email: user?.email || '',
        mobileNumber: user?.mobileNumber || '+91 98765 00000',
        headline: user?.headline || 'Software Engineer',
        bio: 'Professional software developer passionate about building scalable solutions and continuous learning.',
        avatar: user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`,
        address: {
          street: 'Technology Park, Madhapur',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500081',
          country: 'India'
        },
        skills: ['JavaScript', 'React', 'HTML5', 'CSS3', 'Git'],
        experience: [],
        education: [],
        resume: null
      }
      localStorage.setItem(key, JSON.stringify(dynamicProfile))
      return dynamicProfile
    } catch {
      return DEFAULT_CANDIDATE_PROFILE
    }
  }

  const saveCandidateProfile = (profileData) => {
    try {
      const targetId = profileData.userId || profileData.id || user?.id || 'usr_cand_01'
      const key = `job_portal_candidate_profile_${targetId}`
      const fullProfile = {
        ...profileData,
        id: targetId,
        userId: targetId,
        updatedAt: new Date().toISOString()
      }
      localStorage.setItem(key, JSON.stringify(fullProfile))

      if (user && (user.id === targetId || user.email === fullProfile.email)) {
        updateUserProfile({
          name: fullProfile.fullName,
          email: fullProfile.email,
          headline: fullProfile.headline,
          avatar: fullProfile.avatar,
          mobileNumber: fullProfile.mobileNumber,
          location: fullProfile.address?.city && fullProfile.address?.country
            ? `${fullProfile.address.city}, ${fullProfile.address.country}`
            : user.location
        })
      }

      fetch('https://jsonplaceholder.typicode.com/users/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json; charset=UTF-8', Accept: 'application/json' },
        body: JSON.stringify(fullProfile)
      }).catch(() => {})

      window.dispatchEvent(new Event('storage'))
      return { success: true, profile: fullProfile }
    } catch {
      return { success: false, message: 'Failed to save profile' }
    }
  }

  const logout = () => {
    localStorage.removeItem('job_portal_auth_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        requestPasswordReset,
        resetPassword,
        logout,
        updateUserProfile,
        getCandidateProfile,
        saveCandidateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

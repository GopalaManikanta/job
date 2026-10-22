import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

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
        // Strip legacy mock counts if any
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

  // Sanitize stored users and auth state on mount
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

      // Sanitize stored auth user
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
    } catch (e) {
      console.error('Failed to initialize users in localStorage:', e)
    }
  }, [])

  // Retrieve users from localStorage
  const getUsers = () => {
    try {
      const raw = localStorage.getItem('job_portal_users')
      let users = raw ? JSON.parse(raw) : []
      if (!Array.isArray(users)) users = []

      // Guarantee demo users exist
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
    } catch (e) {
      console.error('Failed to save users in localStorage:', e)
    }
  }

  // Login handler
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

    // Fallback auto-registration for smooth demo login
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

  // Register handler
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

  // Request password reset
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

  // Reset password
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

  // Logout handler
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
        logout
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

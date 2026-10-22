import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './AuthContext'

const DashboardContext = createContext(null)

// Storage keys
const STORAGE_KEYS = {
  JOBS: 'job_portal_jobs',
  APPLICATIONS: 'job_portal_applications',
  SAVED_JOBS: 'job_portal_saved_jobs',
  ACTIVITIES: 'job_portal_activities'
}

// Storage helpers
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
  } catch (e) {
    console.error(`Failed to write to localStorage for key: ${key}`, e)
  }
}

export function DashboardProvider({ children }) {
  const { user } = useAuth()

  // Live state collections
  const [jobs, setJobs] = useState(() => readStorage(STORAGE_KEYS.JOBS))
  const [applications, setApplications] = useState(() => readStorage(STORAGE_KEYS.APPLICATIONS))
  const [savedJobs, setSavedJobs] = useState(() => readStorage(STORAGE_KEYS.SAVED_JOBS))
  const [activities, setActivities] = useState(() => readStorage(STORAGE_KEYS.ACTIVITIES))

  // Refresh all dashboard state from storage
  const refreshDashboard = useCallback(() => {
    setJobs(readStorage(STORAGE_KEYS.JOBS))
    setApplications(readStorage(STORAGE_KEYS.APPLICATIONS))
    setSavedJobs(readStorage(STORAGE_KEYS.SAVED_JOBS))
    setActivities(readStorage(STORAGE_KEYS.ACTIVITIES))
  }, [])

  // Synchronize across tabs and custom events
  useEffect(() => {
    const handleStorageChange = () => refreshDashboard()
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('job_portal_sync', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('job_portal_sync', handleStorageChange)
    }
  }, [refreshDashboard])

  // Helper to broadcast sync
  const broadcastSync = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('job_portal_sync'))
    }
  }

  // Record an activity event (max 20 entries)
  const logActivity = useCallback((activity) => {
    const current = readStorage(STORAGE_KEYS.ACTIVITIES)
    const updated = [activity, ...current].slice(0, 20)
    writeStorage(STORAGE_KEYS.ACTIVITIES, updated)
    setActivities(updated)
  }, [])

  // Action: Add new job (Recruiter)
  const addJob = useCallback(
    (jobData) => {
      const currentJobs = readStorage(STORAGE_KEYS.JOBS)
      const newJob = {
        id: `job_${Date.now()}`,
        title: jobData.title.trim(),
        company: jobData.company?.trim() || user?.company || 'Enterprise Partner',
        category: jobData.category || 'Software & Cloud Engineering',
        location: jobData.location?.trim() || 'Hybrid - Bengaluru',
        salary: jobData.salary?.trim() || '₹15 - ₹25 LPA',
        type: jobData.type || 'Full-time',
        description: jobData.description?.trim() || 'Exciting opportunity to build cutting-edge systems with an innovative team.',
        status: 'active',
        postedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        applicantsCount: 0
      }

      const updatedJobs = [newJob, ...currentJobs]
      writeStorage(STORAGE_KEYS.JOBS, updatedJobs)
      setJobs(updatedJobs)

      logActivity({
        id: `act_${Date.now()}`,
        type: 'jobs',
        title: `${newJob.company} published: ${newJob.title}`,
        subtitle: `${newJob.location} • ${newJob.salary}`,
        time: 'Just now',
        status: 'In Review',
        logo: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(newJob.company)}`
      })

      broadcastSync()
      return newJob
    },
    [user, logActivity]
  )

  // Action: Apply to job (Candidate)
  const applyToJob = useCallback(
    (job) => {
      const currentApps = readStorage(STORAGE_KEYS.APPLICATIONS)
      const candidateEmail = user?.email || 'candidate@jobportal.com'
      const candidateId = user?.id || 'cand_demo'

      const alreadyApplied = currentApps.some(
        (a) => a.jobId === job.id && (a.candidateEmail === candidateEmail || a.candidateId === candidateId)
      )

      if (alreadyApplied) {
        return { success: false, message: 'You have already applied for this position!' }
      }

      const newApp = {
        id: `app_${Date.now()}`,
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        candidateId,
        candidateName: user?.name || 'Candidate',
        candidateEmail,
        appliedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Applied'
      }

      const updatedApps = [newApp, ...currentApps]
      writeStorage(STORAGE_KEYS.APPLICATIONS, updatedApps)
      setApplications(updatedApps)

      // Increment applicantsCount on the job listing
      const currentJobs = readStorage(STORAGE_KEYS.JOBS)
      const jobIdx = currentJobs.findIndex((j) => j.id === job.id)
      if (jobIdx !== -1) {
        currentJobs[jobIdx].applicantsCount = (currentJobs[jobIdx].applicantsCount || 0) + 1
        writeStorage(STORAGE_KEYS.JOBS, currentJobs)
        setJobs(currentJobs)
      }

      logActivity({
        id: `act_${Date.now()}`,
        type: 'applications',
        title: `${newApp.candidateName} applied for ${newApp.jobTitle}`,
        subtitle: `${newApp.company} • Submitted Application`,
        time: 'Just now',
        status: 'Submitted',
        logo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newApp.candidateName)}`
      })

      broadcastSync()
      return { success: true, application: newApp }
    },
    [user, logActivity]
  )

  // Action: Toggle save/bookmark job
  const toggleSaveJob = useCallback((job) => {
    let currentSaved = readStorage(STORAGE_KEYS.SAVED_JOBS)
    const isSaved = currentSaved.some((s) => s.jobId === job.id)

    if (isSaved) {
      currentSaved = currentSaved.filter((s) => s.jobId !== job.id)
      writeStorage(STORAGE_KEYS.SAVED_JOBS, currentSaved)
      setSavedJobs(currentSaved)
      broadcastSync()
      return { saved: false, message: 'Removed from saved jobs.' }
    } else {
      const newItem = {
        id: `save_${Date.now()}`,
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      currentSaved = [newItem, ...currentSaved]
      writeStorage(STORAGE_KEYS.SAVED_JOBS, currentSaved)
      setSavedJobs(currentSaved)
      broadcastSync()
      return { saved: true, message: 'Job bookmarked successfully!' }
    }
  }, [])

  // Action: Update application status (Recruiter)
  const updateApplicationStatus = useCallback(
    (appId, newStatus) => {
      const currentApps = readStorage(STORAGE_KEYS.APPLICATIONS)
      const idx = currentApps.findIndex((a) => a.id === appId)
      if (idx !== -1) {
        currentApps[idx].status = newStatus
        writeStorage(STORAGE_KEYS.APPLICATIONS, currentApps)
        setApplications(currentApps)

        logActivity({
          id: `act_${Date.now()}`,
          type: 'interviews',
          title: `${currentApps[idx].jobTitle} application updated to: ${newStatus}`,
          subtitle: `Applicant: ${currentApps[idx].candidateName} • ${currentApps[idx].company}`,
          time: 'Just now',
          status: newStatus === 'Interview Scheduled' ? 'Scheduled' : 'Shortlisted',
          logo: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(currentApps[idx].company)}`
        })

        broadcastSync()
      }
    },
    [logActivity]
  )

  // Computed Real-Time Metrics (Strict clean 0 baseline at initial stage)
  const metrics = useMemo(() => {
    const jobCount = jobs.length
    const activeJobs = jobs.filter((j) => j.status === 'active').length

    // Unique hiring companies
    const companies = new Set(jobs.map((j) => j.company.trim().toLowerCase()))
    const companyCount = companies.size

    // User-aware application count
    let appCount = 0
    if (user?.role === 'recruiter') {
      const userCompany = user?.company?.trim().toLowerCase()
      appCount = applications.filter((a) => a.company?.trim().toLowerCase() === userCompany).length
    } else {
      appCount = applications.filter(
        (a) => a.candidateEmail === user?.email || a.candidateId === user?.id
      ).length
    }

    // Unique candidate pool
    const candidateEmails = new Set(applications.map((a) => a.candidateEmail))

    return {
      totalCompanies: String(companyCount),
      totalJobs: String(jobCount),
      activeJobPostings: String(activeJobs),
      totalCandidates: String(candidateEmails.size),
      totalApplications: String(appCount),
      savedJobs: String(savedJobs.length)
    }
  }, [jobs, applications, savedJobs, user])

  // Computed Pipeline Stages
  const pipelineStages = useMemo(() => {
    let userApps = applications
    if (user?.role === 'candidate') {
      userApps = applications.filter((a) => a.candidateEmail === user.email)
    } else if (user?.role === 'recruiter' && user?.company) {
      userApps = applications.filter((a) => a.company.toLowerCase() === user.company.toLowerCase())
    }

    const total = userApps.length
    const calcStage = (name, filterFn, color) => {
      const count = userApps.filter(filterFn).length
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0
      return { name, count, percentage, color }
    }

    return [
      calcStage('Applied', (a) => a.status === 'Applied', 'from-blue-500 to-cyan-500'),
      calcStage('Under Review', (a) => a.status === 'Under Review', 'from-cyan-500 to-teal-500'),
      calcStage('Shortlisted', (a) => a.status === 'Shortlisted', 'from-amber-400 to-orange-500'),
      calcStage('Interview Scheduled', (a) => a.status === 'Interview Scheduled', 'from-purple-500 to-indigo-500'),
      calcStage('Offers Extended', (a) => a.status === 'Offers Extended', 'from-emerald-400 to-green-500')
    ]
  }, [applications, user])

  // Computed Sector Categories
  const categories = useMemo(() => {
    const baseCategories = [
      { name: 'Software & Cloud Engineering', color: 'bg-cyan-500' },
      { name: 'AI & Data Science', color: 'bg-purple-500' },
      { name: 'Product Management & UX', color: 'bg-blue-500' },
      { name: 'Cybersecurity & DevOps', color: 'bg-emerald-500' }
    ]

    const totalJobs = jobs.length
    return baseCategories.map((cat) => {
      const openings = jobs.filter((j) => j.category === cat.name).length
      const share = totalJobs > 0 ? `${Math.round((openings / totalJobs) * 100)}%` : '0%'
      return {
        ...cat,
        openings,
        share
      }
    })
  }, [jobs])

  return (
    <DashboardContext.Provider
      value={{
        metrics,
        jobs,
        applications,
        savedJobs,
        activities,
        pipelineStages,
        categories,
        addJob,
        applyToJob,
        toggleSaveJob,
        updateApplicationStatus,
        refreshDashboard
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}

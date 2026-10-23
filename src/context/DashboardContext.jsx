import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './AuthContext'
import { useCompanies } from './CompanyContext'

const DashboardContext = createContext(null)

// Storage keys
const STORAGE_KEYS = {
  JOBS: 'job_portal_jobs',
  APPLICATIONS: 'job_portal_applications',
  SAVED_JOBS: 'job_portal_saved_jobs',
  ACTIVITIES: 'job_portal_activities'
}

// Initial Real-time Enterprise Job Listings
const INITIAL_JOBS = [
  {
    id: 'job_01',
    title: 'Senior Cloud Architecture Lead',
    company: 'Romaguera-Crona',
    category: 'Software & Cloud Engineering',
    type: 'Full-time',
    experienceLevel: 'Senior Level',
    salary: '₹28 - ₹38 LPA',
    location: 'Hybrid - Bengaluru',
    skills: ['AWS', 'Kubernetes', 'Golang', 'Terraform', 'Distributed Systems'],
    deadline: '2026-11-25',
    status: 'open',
    description: 'Lead the architecture and design of our mission-critical enterprise cloud infrastructure. You will work closely with distributed engineering teams to ensure 99.99% service reliability and automated CI/CD deployments.',
    responsibilities: 'Architect high-throughput cloud microservices, automate infrastructure provisioning using Terraform & Kubernetes, mentor junior engineers, and drive technical roadmaps.',
    postedAt: '10:30 AM',
    createdAt: new Date().toISOString(),
    postedBy: 'recruiter@jobportal.com',
    applicantsCount: 3
  },
  {
    id: 'job_02',
    title: 'AI & Computer Vision Engineer',
    company: 'Deckow-Crist',
    category: 'AI & Data Science',
    type: 'Full-time',
    experienceLevel: 'Mid Level',
    salary: '₹22 - ₹32 LPA',
    location: 'Hyderabad, India',
    skills: ['Python', 'PyTorch', 'OpenCV', 'TensorFlow', 'MLOps'],
    deadline: '2026-11-30',
    status: 'open',
    description: 'Join our cutting-edge AI research and product group building next-gen visual perception models and edge inference engines.',
    responsibilities: 'Train deep learning models for object recognition, optimize model weights for low-power edge hardware, benchmark accuracy, and deploy production endpoints.',
    postedAt: '11:15 AM',
    createdAt: new Date().toISOString(),
    postedBy: 'recruiter@jobportal.com',
    applicantsCount: 5
  },
  {
    id: 'job_03',
    title: 'Lead Frontend React Architect',
    company: 'Apex Cloud Systems',
    category: 'Software & Cloud Engineering',
    type: 'Remote',
    experienceLevel: 'Lead / Principal',
    salary: '₹30 - ₹42 LPA',
    location: 'Remote - India',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL'],
    deadline: '2026-12-05',
    status: 'open',
    description: 'We are seeking an exceptional frontend leader to drive frontend architecture, state synchronization, and design system performance across our global suite of SaaS platforms.',
    responsibilities: 'Drive architectural decisions for React frontend applications, maintain component libraries, optimize web vitals, and coordinate frontend releases with backend APIs.',
    postedAt: '09:45 AM',
    createdAt: new Date().toISOString(),
    postedBy: 'recruiter@jobportal.com',
    applicantsCount: 2
  },
  {
    id: 'job_04',
    title: 'Principal Product Designer (UX/UI)',
    company: 'Robel-Corkery',
    category: 'Product Management & UX',
    type: 'Full-time',
    experienceLevel: 'Senior Level',
    salary: '₹20 - ₹28 LPA',
    location: 'Pune, India',
    skills: ['Figma', 'Design Systems', 'User Research', 'Wireframing', 'Prototyping'],
    deadline: '2026-11-20',
    status: 'open',
    description: 'Craft intuitive, elegant, and frictionless user experiences for millions of active professionals utilizing our talent analytics platform.',
    responsibilities: 'Conduct generative user interviews, build pixel-perfect Figma components, prototype user flows, and partner closely with engineers to ensure fidelity.',
    postedAt: 'Yesterday',
    createdAt: new Date().toISOString(),
    postedBy: 'recruiter@jobportal.com',
    applicantsCount: 4
  },
  {
    id: 'job_05',
    title: 'DevSecOps & Site Reliability Engineer',
    company: 'Keebler LLC',
    category: 'Cybersecurity & DevOps',
    type: 'Full-time',
    experienceLevel: 'Mid Level',
    salary: '₹18 - ₹26 LPA',
    location: 'Chennai, India',
    skills: ['Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Prometheus'],
    deadline: '2026-11-15',
    status: 'open',
    description: 'Ensure rock-solid security postures, automated patch management, and telemetry observability across hybrid cloud environments.',
    responsibilities: 'Maintain Kubernetes clusters, configure automated Prometheus & Grafana alerts, conduct vulnerability scans, and implement zero-trust access controls.',
    postedAt: '2 days ago',
    createdAt: new Date().toISOString(),
    postedBy: 'recruiter@jobportal.com',
    applicantsCount: 1
  },
  {
    id: 'job_06',
    title: 'Enterprise Data Platform Architect',
    company: 'Considine-Lockman',
    category: 'AI & Data Science',
    type: 'Contract',
    experienceLevel: 'Lead / Principal',
    salary: '₹32 - ₹45 LPA',
    location: 'Hybrid - Bengaluru',
    skills: ['Snowflake', 'Apache Spark', 'Airflow', 'Python', 'SQL'],
    deadline: '2026-10-31',
    status: 'closed',
    description: 'Architect scalable data lakehouses and automated ETL pipelines handling multi-terabyte data streams with sub-second analytical querying.',
    responsibilities: 'Design lakehouse schemas, orchestrate daily Airflow DAGs, enforce data governance policies, and optimize Snowflake compute clusters.',
    postedAt: '3 days ago',
    createdAt: new Date().toISOString(),
    postedBy: 'recruiter@jobportal.com',
    applicantsCount: 8
  }
]

// Storage helpers
const readStorage = (key) => {
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
    if (key === STORAGE_KEYS.JOBS) {
      localStorage.setItem(key, JSON.stringify(INITIAL_JOBS))
      return INITIAL_JOBS
    }
    return []
  } catch {
    return key === STORAGE_KEYS.JOBS ? INITIAL_JOBS : []
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
  const { companies: registeredCompanies, networkActivity } = useCompanies()

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
        company: jobData.company?.trim() || user?.company || 'Apex Cloud Systems',
        category: jobData.category || 'Software & Cloud Engineering',
        type: jobData.type || 'Full-time',
        experienceLevel: jobData.experienceLevel || 'Mid Level',
        salary: jobData.salary?.trim() || '₹18 - ₹26 LPA',
        location: jobData.location?.trim() || 'Hybrid - Bengaluru',
        skills: Array.isArray(jobData.skills)
          ? jobData.skills
          : typeof jobData.skills === 'string'
          ? jobData.skills.split(',').map((s) => s.trim()).filter(Boolean)
          : ['React', 'TypeScript', 'Node.js'],
        deadline: jobData.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: jobData.status || 'open',
        description: jobData.description?.trim() || 'Exciting opportunity to build cutting-edge systems with an innovative team.',
        responsibilities: jobData.responsibilities?.trim() || 'Architect scalable web applications, collaborate with cross-functional teams, and maintain high standards of software quality.',
        postedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString(),
        postedBy: user?.email || 'recruiter@jobportal.com',
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
        status: 'Open',
        logo: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(newJob.company)}`
      })

      broadcastSync()
      return newJob
    },
    [user, logActivity]
  )

  // Action: Edit existing job (Recruiter)
  const editJob = useCallback(
    (jobId, jobData) => {
      const currentJobs = readStorage(STORAGE_KEYS.JOBS)
      const idx = currentJobs.findIndex((j) => String(j.id) === String(jobId))
      if (idx === -1) return { success: false, message: 'Job not found' }

      const updatedJob = {
        ...currentJobs[idx],
        ...jobData,
        id: String(jobId),
        skills: Array.isArray(jobData.skills)
          ? jobData.skills
          : typeof jobData.skills === 'string'
          ? jobData.skills.split(',').map((s) => s.trim()).filter(Boolean)
          : currentJobs[idx].skills,
        updatedAt: new Date().toISOString()
      }

      currentJobs[idx] = updatedJob
      writeStorage(STORAGE_KEYS.JOBS, currentJobs)
      setJobs(currentJobs)

      logActivity({
        id: `act_${Date.now()}`,
        type: 'jobs',
        title: `${updatedJob.company} updated: ${updatedJob.title}`,
        subtitle: `${updatedJob.location} • ${updatedJob.salary}`,
        time: 'Just now',
        status: updatedJob.status === 'open' ? 'Open' : 'Closed',
        logo: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(updatedJob.company)}`
      })

      broadcastSync()
      return { success: true, job: updatedJob }
    },
    [logActivity]
  )

  // Action: Delete job (Recruiter)
  const deleteJob = useCallback(
    (jobId) => {
      const currentJobs = readStorage(STORAGE_KEYS.JOBS)
      const jobToDelete = currentJobs.find((j) => String(j.id) === String(jobId))
      const filteredJobs = currentJobs.filter((j) => String(j.id) !== String(jobId))
      writeStorage(STORAGE_KEYS.JOBS, filteredJobs)
      setJobs(filteredJobs)

      // Clean up saved references
      const currentSaved = readStorage(STORAGE_KEYS.SAVED_JOBS)
      const filteredSaved = currentSaved.filter((s) => String(s.jobId) !== String(jobId))
      writeStorage(STORAGE_KEYS.SAVED_JOBS, filteredSaved)
      setSavedJobs(filteredSaved)

      if (jobToDelete) {
        logActivity({
          id: `act_${Date.now()}`,
          type: 'jobs',
          title: `Requisition removed: ${jobToDelete.title}`,
          subtitle: `${jobToDelete.company}`,
          time: 'Just now',
          status: 'Closed',
          logo: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(jobToDelete.company)}`
        })
      }

      broadcastSync()
      return { success: true }
    },
    [logActivity]
  )

  // Action: Toggle job status between Open and Closed
  const toggleJobStatus = useCallback(
    (jobId) => {
      const currentJobs = readStorage(STORAGE_KEYS.JOBS)
      const idx = currentJobs.findIndex((j) => String(j.id) === String(jobId))
      if (idx === -1) return { success: false, message: 'Job not found' }

      const newStatus = currentJobs[idx].status === 'open' ? 'closed' : 'open'
      currentJobs[idx].status = newStatus
      writeStorage(STORAGE_KEYS.JOBS, currentJobs)
      setJobs(currentJobs)

      logActivity({
        id: `act_${Date.now()}`,
        type: 'jobs',
        title: `${currentJobs[idx].company} changed status of ${currentJobs[idx].title} to ${newStatus.toUpperCase()}`,
        subtitle: newStatus === 'open' ? 'Accepting applications' : 'Applications paused',
        time: 'Just now',
        status: newStatus === 'open' ? 'Open' : 'Closed',
        logo: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(currentJobs[idx].company)}`
      })

      broadcastSync()
      return { success: true, status: newStatus }
    },
    [logActivity]
  )

  // Helper: Get job by ID
  const getJobById = useCallback(
    (jobId) => {
      return jobs.find((j) => String(j.id) === String(jobId)) || null
    },
    [jobs]
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
    const activeJobs = jobs.filter((j) => j.status === 'open' || j.status === 'active').length

    // Unique hiring companies from Company Management (live API) and live postings
    const companiesSet = new Set([
      ...registeredCompanies.map((c) => c.name?.trim().toLowerCase()).filter(Boolean),
      ...jobs.map((j) => j.company?.trim().toLowerCase()).filter(Boolean)
    ])
    const companyCount = companiesSet.size

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
  }, [jobs, applications, savedJobs, registeredCompanies, user])

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
        registeredCompanies,
        networkActivity,
        pipelineStages,
        categories,
        addJob,
        editJob,
        deleteJob,
        toggleJobStatus,
        getJobById,
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

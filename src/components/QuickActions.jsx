import {
  Search,
  PlusCircle,
  Bookmark,
  FileText,
  Calendar,
  UserCheck,
  ArrowRight,
  Zap,
  Users,
  FileCheck
} from 'lucide-react'
import { toast } from 'react-toastify'

const CANDIDATE_ACTIONS = [
  {
    id: 'qa_find_jobs',
    title: 'Explore Job Openings',
    description: 'Browse available listings and apply in 1-click in real-time',
    icon: Search,
    badge: 'Live Database',
    actionKey: 'explore_jobs',
    theme: 'hover:border-cyan-400 hover:bg-cyan-50/20 text-cyan-600'
  },
  {
    id: 'qa_saved_jobs',
    title: 'Saved Opportunities',
    description: 'Manage bookmarked jobs and apply whenever you are ready',
    icon: Bookmark,
    badge: 'Bookmarks',
    actionKey: 'saved_jobs',
    theme: 'hover:border-amber-400 hover:bg-amber-50/20 text-amber-600'
  },
  {
    id: 'qa_applications',
    title: 'Application Tracker',
    description: 'Track review status and hiring stage progression in real-time',
    icon: FileText,
    badge: 'Active Tracker',
    actionKey: 'track_applications',
    theme: 'hover:border-blue-400 hover:bg-blue-50/20 text-blue-600'
  },
  {
    id: 'qa_interviews',
    title: 'Interview Calendar',
    description: 'Schedule, reschedule, and manage upcoming technical rounds',
    icon: Calendar,
    badge: 'Calendar',
    actionKey: 'interviews',
    theme: 'hover:border-emerald-400 hover:bg-emerald-50/20 text-emerald-600'
  },
  {
    id: 'qa_profile',
    title: 'Complete Your Profile',
    description: 'Add your skills, resume, and experience to get noticed by recruiters',
    icon: UserCheck,
    badge: 'Profile',
    actionKey: 'update_profile',
    theme: 'hover:border-rose-400 hover:bg-rose-50/20 text-rose-600'
  },
  {
    id: 'qa_resume',
    title: 'Resume & Documents',
    description: 'Manage your uploaded resumes, cover letters, and portfolio links',
    icon: FileCheck,
    badge: 'Career Assets',
    actionKey: 'resume_docs',
    theme: 'hover:border-purple-400 hover:bg-purple-50/20 text-purple-600'
  }
]

const RECRUITER_ACTIONS = [
  {
    id: 'qa_post_job',
    title: 'Post New Job Requisition',
    description: 'Publish a new opening to start receiving applicant profiles instantly',
    icon: PlusCircle,
    badge: 'Recruiter Action',
    actionKey: 'post_job',
    theme: 'hover:border-purple-400 hover:bg-purple-50/20 text-purple-600'
  },
  {
    id: 'qa_applications',
    title: 'Review Candidate Submissions',
    description: 'Review applicants, advance candidates, and shortlist profiles',
    icon: FileText,
    badge: 'Applicant Pool',
    actionKey: 'track_applications',
    theme: 'hover:border-blue-400 hover:bg-blue-50/20 text-blue-600'
  },
  {
    id: 'qa_find_jobs',
    title: 'Manage Active Openings',
    description: 'View and manage all active job postings for your company',
    icon: Search,
    badge: 'Active Jobs',
    actionKey: 'explore_jobs',
    theme: 'hover:border-cyan-400 hover:bg-cyan-50/20 text-cyan-600'
  },
  {
    id: 'qa_interviews',
    title: 'Interview Schedule & Pipeline',
    description: 'Schedule interview rounds and send invites to shortlisted talent',
    icon: Calendar,
    badge: 'Interviews',
    actionKey: 'interviews',
    theme: 'hover:border-emerald-400 hover:bg-emerald-50/20 text-emerald-600'
  },
  {
    id: 'qa_profile',
    title: 'Company Hiring Profile',
    description: 'Manage employer branding, perks, and hiring preferences',
    icon: UserCheck,
    badge: 'Employer Brand',
    actionKey: 'update_profile',
    theme: 'hover:border-rose-400 hover:bg-rose-50/20 text-rose-600'
  },
  {
    id: 'qa_talent_pool',
    title: 'Talent Network Search',
    description: 'Search candidates by skill, experience, and domain expertise',
    icon: Users,
    badge: 'Talent Pool',
    actionKey: 'talent_search',
    theme: 'hover:border-indigo-400 hover:bg-indigo-50/20 text-indigo-600'
  }
]

export default function QuickActions({
  user,
  onOpenPostJob,
  onOpenExploreJobs,
  onOpenApplications,
  onOpenSavedJobs,
  onOpenInterviews,
  onOpenProfile
}) {
  const isCandidate = user?.role === 'candidate'
  const actions = isCandidate ? CANDIDATE_ACTIONS : RECRUITER_ACTIONS

  const handleAction = (action) => {
    switch (action.actionKey) {
      case 'explore_jobs':
        if (onOpenExploreJobs) onOpenExploreJobs()
        break
      case 'post_job':
        if (onOpenPostJob) onOpenPostJob()
        break
      case 'saved_jobs':
        if (onOpenSavedJobs) onOpenSavedJobs()
        break
      case 'track_applications':
        if (onOpenApplications) onOpenApplications()
        break
      case 'interviews':
        if (onOpenInterviews) onOpenInterviews()
        break
      case 'update_profile':
        if (onOpenProfile) onOpenProfile()
        break
      case 'resume_docs':
        if (onOpenProfile) onOpenProfile()
        break
      case 'talent_search':
        toast.info('Talent Network Search: Browse registered candidate profiles in the talent pool.')
        break
      default:
        break
    }
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-50 border border-cyan-100 text-cyan-600">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Quick Action Cards
            </h2>
            <p className="text-xs text-slate-500">
              One-click shortcuts to start your activity in the portal
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => {
          const IconComponent = action.icon

          return (
            <button
              key={action.id}
              type="button"
              onClick={() => handleAction(action)}
              className={`group relative text-left bg-white border border-slate-200/90 rounded-2xl p-5 transition-all duration-300 transform hover:-translate-y-1 shadow-xs hover:shadow-md ${action.theme} cursor-pointer flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                    <IconComponent className="w-5 h-5 transition-colors" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {action.badge}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-slate-950 transition-colors">
                  {action.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {action.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600 group-hover:text-slate-900">Launch Action</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

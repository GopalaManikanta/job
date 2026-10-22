import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Zap, Building2, User } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from '../../components/auth/AuthLayout'

export default function LoginPage() {
  const [role, setRole] = useState('candidate')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/dashboard'

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: 'candidate@jobportal.com',
      password: 'password123',
      rememberMe: true
    }
  })

  // Synchronize credentials when role tab is clicked
  const handleRoleChange = (newRole) => {
    setRole(newRole)
    const currentEmail = watch('email')
    if (!currentEmail || currentEmail === 'candidate@jobportal.com' || currentEmail === 'recruiter@jobportal.com') {
      const demoEmail = newRole === 'candidate' ? 'candidate@jobportal.com' : 'recruiter@jobportal.com'
      setValue('email', demoEmail, { shouldValidate: true })
      setValue('password', 'password123', { shouldValidate: true })
    }
  }

  // Form submission handler
  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const res = await login(data.email, data.password, role)
      if (res.success) {
        toast.success(`Welcome back, ${res.user.name}!`)
        navigate(from, { replace: true })
      } else {
        toast.error(res.message || 'Login failed. Please check credentials.')
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Immediate toast feedback on form validation issues
  const onInvalid = (fieldErrors) => {
    if (fieldErrors.email) {
      toast.error(fieldErrors.email.message || 'Please enter a valid email address')
    } else if (fieldErrors.password) {
      toast.error(fieldErrors.password.message || 'Please enter your password')
    }
  }

  // 1-Click Demo Login shortcut
  const handleQuickDemo = async (demoRole) => {
    setRole(demoRole)
    const demoCreds =
      demoRole === 'candidate'
        ? { email: 'candidate@jobportal.com', password: 'password123' }
        : { email: 'recruiter@jobportal.com', password: 'password123' }

    setValue('email', demoCreds.email, { shouldValidate: true })
    setValue('password', demoCreds.password, { shouldValidate: true })

    setIsSubmitting(true)
    try {
      const res = await login(demoCreds.email, demoCreds.password, demoRole)
      if (res.success) {
        toast.success(`Logged in as Demo ${demoRole === 'candidate' ? 'Job Seeker' : 'Recruiter'}!`)
        navigate('/dashboard', { replace: true })
      } else {
        toast.error(res.message || 'Login failed')
      }
    } catch {
      toast.error('Login failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle={`Sign in as a ${role === 'candidate' ? 'Job Seeker to explore career opportunities' : 'Recruiter to hire top industry talent'}`}
      activeRole={role}
      onRoleChange={handleRoleChange}
    >
      {/* 1-Click Quick Demo Bar (Translucent Glass) */}
      <div
        className={`mb-6 p-3.5 rounded-2xl border transition-all duration-300 backdrop-blur-md ${
          role === 'candidate'
            ? 'bg-cyan-950/30 border-cyan-400/40 shadow-lg shadow-cyan-950/25 ring-1 ring-cyan-400/20'
            : 'bg-purple-950/30 border-purple-400/40 shadow-lg shadow-purple-950/25 ring-1 ring-purple-400/20'
        }`}
      >
        <div className="flex items-center gap-1.5 text-xs font-semibold mb-2.5">
          <Zap
            className={`w-3.5 h-3.5 fill-current ${
              role === 'candidate' ? 'text-cyan-400' : 'text-purple-400'
            }`}
          />
          <span className={role === 'candidate' ? 'text-cyan-200 drop-shadow' : 'text-purple-200 drop-shadow'}>
            Quick 1-Click Demo Logins
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemo('candidate')}
            disabled={isSubmitting}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer disabled:opacity-50 backdrop-blur-sm ${
              role === 'candidate'
                ? 'bg-cyan-500/25 border-cyan-400/50 text-cyan-200 shadow-sm shadow-cyan-500/25 ring-1 ring-cyan-400/30'
                : 'bg-white/10 border-white/20 text-slate-200 hover:bg-white/20 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span>Candidate Demo</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('recruiter')}
            disabled={isSubmitting}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer disabled:opacity-50 backdrop-blur-sm ${
              role === 'recruiter'
                ? 'bg-purple-500/25 border-purple-400/50 text-purple-200 shadow-sm shadow-purple-500/25 ring-1 ring-purple-400/30'
                : 'bg-white/10 border-white/20 text-slate-200 hover:bg-white/20 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Recruiter Demo</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-100 mb-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            Work or Personal Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              placeholder="you@domain.com"
              {...register('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address'
                }
              })}
              className={`w-full pl-10 pr-4 py-2.5 bg-black/35 backdrop-blur-md border rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-black/50 transition-all shadow-inner ${
                errors.email
                  ? 'border-rose-500/80 focus:ring-rose-500/30'
                  : role === 'candidate'
                  ? 'border-white/20 focus:border-cyan-400 focus:ring-cyan-500/25'
                  : 'border-white/20 focus:border-purple-400 focus:ring-purple-500/25'
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-xs text-rose-400 font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              Password
            </label>
            <Link
              to="/forgot-password"
              className={`text-xs font-semibold transition-colors drop-shadow ${
                role === 'candidate'
                  ? 'text-cyan-300 hover:text-cyan-200'
                  : 'text-purple-300 hover:text-purple-200'
              }`}
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              className={`w-full pl-10 pr-11 py-2.5 bg-black/35 backdrop-blur-md border rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-black/50 transition-all shadow-inner ${
                errors.password
                  ? 'border-rose-500/80 focus:ring-rose-500/30'
                  : role === 'candidate'
                  ? 'border-white/20 focus:border-cyan-400 focus:ring-cyan-500/25'
                  : 'border-white/20 focus:border-purple-400 focus:ring-purple-500/25'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-rose-400 font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('rememberMe')}
              className={`w-4 h-4 rounded border-white/30 bg-black/40 focus:ring-offset-black ${
                role === 'candidate' ? 'text-cyan-500 focus:ring-cyan-500' : 'text-purple-500 focus:ring-purple-500'
              }`}
            />
            <span className="text-xs text-slate-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Keep me signed in</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full mt-2 py-3 px-4 rounded-xl text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer ${
            role === 'candidate'
              ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-cyan-500/30 hover:shadow-cyan-500/40 ring-1 ring-white/20'
              : 'bg-gradient-to-r from-purple-500 via-pink-600 to-rose-600 hover:from-purple-400 hover:to-rose-500 shadow-purple-500/30 hover:shadow-purple-500/40 ring-1 ring-white/20'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In as {role === 'candidate' ? 'Job Seeker' : 'Recruiter'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Register */}
      <div className="mt-6 pt-5 border-t border-white/10 text-center">
        <p className="text-xs text-slate-400">
          New to CareerX?{' '}
          <Link
            to={`/register?role=${role}`}
            className={`font-bold transition-colors ml-1 ${
              role === 'candidate' ? 'text-cyan-400 hover:text-cyan-300' : 'text-purple-400 hover:text-purple-300'
            }`}
          >
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

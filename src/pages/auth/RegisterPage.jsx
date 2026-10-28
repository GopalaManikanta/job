import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, Lock, User, Building2, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from './AuthLayout'

export default function RegisterPage() {
  const [searchParams] = useSearchParams()
  const initialRole = searchParams.get('role') === 'recruiter' ? 'recruiter' : 'candidate'
  const [role, setRole] = useState(initialRole)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register: registerUser } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: 'Ravi Teja',
      email: 'ravi.teja@jobportal.com',
      company: 'Apex Cloud Innovations',
      password: 'password123',
      confirmPassword: 'password123',
      agreeTerms: true
    }
  })

  const passwordValue = watch('password', '')

  const handleRoleChange = (newRole) => {
    setRole(newRole)
    const currentEmail = watch('email')
    if (!currentEmail || currentEmail === 'ravi.teja@jobportal.com' || currentEmail === 'priya.recruiter@jobportal.com') {
      setValue('email', newRole === 'candidate' ? 'ravi.teja@jobportal.com' : 'priya.recruiter@jobportal.com', { shouldValidate: true })
      setValue('name', newRole === 'candidate' ? 'Ravi Teja' : 'Priya Menon', { shouldValidate: true })
      if (newRole === 'recruiter') {
        setValue('company', 'Apex Cloud Innovations', { shouldValidate: true })
      }
    }
  }

  const passwordStrength = useMemo(() => {
    if (!passwordValue) return { score: 0, label: 'Empty', color: 'bg-slate-700' }
    let score = 0
    if (passwordValue.length >= 8) score += 1
    if (/[A-Z]/.test(passwordValue)) score += 1
    if (/[0-9]/.test(passwordValue)) score += 1
    if (/[^A-Za-z0-9]/.test(passwordValue)) score += 1

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' }
    if (score === 2 || score === 3) return { score: 2, label: 'Medium', color: 'bg-amber-500' }
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' }
  }, [passwordValue])

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const res = await registerUser({
        name: data.name,
        email: data.email,
        company: role === 'recruiter' ? data.company : undefined,
        password: data.password,
        role
      })

      if (res.success) {
        toast.success(`Account registered! Welcome, ${res.user.name}.`)
        navigate('/dashboard', { replace: true })
      } else {
        toast.error(res.message || 'Registration failed')
      }
    } catch {
      toast.error('Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const onInvalid = (fieldErrors) => {
    if (fieldErrors.name) {
      toast.error(fieldErrors.name.message || 'Please enter your full name')
    } else if (fieldErrors.company && role === 'recruiter') {
      toast.error(fieldErrors.company.message || 'Please enter your company name')
    } else if (fieldErrors.email) {
      toast.error(fieldErrors.email.message || 'Please enter a valid email address')
    } else if (fieldErrors.password) {
      toast.error(fieldErrors.password.message || 'Please enter a password (min 6 characters)')
    } else if (fieldErrors.confirmPassword) {
      toast.error(fieldErrors.confirmPassword.message || 'Passwords do not match')
    } else if (fieldErrors.agreeTerms) {
      toast.error(fieldErrors.agreeTerms.message || 'Please agree to the Terms of Service')
    }
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle={`Join thousands of ${role === 'candidate' ? 'job seekers accelerating their careers' : 'employers hiring world-class teams'}`}
      activeRole={role}
      onRoleChange={handleRoleChange}
    >
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4">

        <div>
          <label className="block text-xs font-semibold text-slate-100 mb-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="e.g. Manikanta Rao"
              {...register('name', {
                required: 'Full name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters'
                }
              })}
              className={`w-full pl-10 pr-4 py-2.5 bg-black/35 backdrop-blur-md border rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-black/50 transition-all shadow-inner ${
                errors.name
                  ? 'border-rose-500/80 focus:ring-rose-500/30'
                  : role === 'candidate'
                  ? 'border-white/20 focus:border-cyan-400 focus:ring-cyan-500/25'
                  : 'border-white/20 focus:border-purple-400 focus:ring-purple-500/25'
              }`}
            />
          </div>
          {errors.name && (
            <p className="mt-1.5 text-xs text-rose-400 font-medium">
              {errors.name.message}
            </p>
          )}
        </div>

        {role === 'recruiter' && (
          <div>
            <label className="block text-xs font-semibold text-slate-100 mb-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              Company / Organization Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
                <Building2 className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="e.g. Acme Innovations Corp"
                {...register('company', {
                  required: role === 'recruiter' ? 'Company name is required for recruiters' : false
                })}
                className="w-full pl-10 pr-4 py-2.5 bg-black/35 backdrop-blur-md border border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/25 focus:bg-black/50 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none transition-all shadow-inner"
              />
            </div>
            {errors.company && (
              <p className="mt-1.5 text-xs text-rose-400 font-medium">
                {errors.company.message}
              </p>
            )}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-100 mb-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            Email Address
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

        <div>
          <label className="block text-xs font-semibold text-slate-100 mb-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            Create Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 chars with mixed characters"
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
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {passwordValue && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">Security Level:</span>
                <span
                  className={`font-bold tracking-wide ${
                    passwordStrength.label === 'Strong'
                      ? 'text-cyan-400'
                      : passwordStrength.label === 'Medium'
                      ? 'text-blue-400'
                      : 'text-rose-400'
                  }`}
                >
                  {passwordStrength.label}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 h-1.5">
                <div
                  className={`rounded-full transition-all duration-300 ${
                    passwordStrength.score >= 1 ? (role === 'candidate' ? 'bg-cyan-400' : 'bg-purple-400') : 'bg-white/10'
                  }`}
                />
                <div
                  className={`rounded-full transition-all duration-300 ${
                    passwordStrength.score >= 2 ? (role === 'candidate' ? 'bg-cyan-400' : 'bg-purple-400') : 'bg-white/10'
                  }`}
                />
                <div
                  className={`rounded-full transition-all duration-300 ${
                    passwordStrength.score >= 3 ? (role === 'candidate' ? 'bg-cyan-400' : 'bg-purple-400') : 'bg-white/10'
                  }`}
                />
              </div>
            </div>
          )}

          {errors.password && (
            <p className="mt-1.5 text-xs text-rose-400 font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-100 mb-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter your password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (val) =>
                  val === watch('password') || 'Passwords do not match'
              })}
              className={`w-full pl-10 pr-11 py-2.5 bg-black/35 backdrop-blur-md border rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-black/50 transition-all shadow-inner ${
                errors.confirmPassword
                  ? 'border-rose-500/80 focus:ring-rose-500/30'
                  : role === 'candidate'
                  ? 'border-white/20 focus:border-cyan-400 focus:ring-cyan-500/25'
                  : 'border-white/20 focus:border-purple-400 focus:ring-purple-500/25'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-rose-400 font-medium">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              {...register('agreeTerms', {
                required: 'You must agree to the Terms of Service and Privacy Policy'
              })}
              className={`mt-0.5 w-4 h-4 rounded border-white/30 bg-black/40 focus:ring-offset-black ${
                role === 'candidate' ? 'text-cyan-500 focus:ring-cyan-500' : 'text-purple-500 focus:ring-purple-500'
              }`}
            />
            <span className="text-xs text-slate-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] leading-relaxed">
              I agree to the{' '}
              <a
                href="#terms"
                className={`underline transition-colors ${
                  role === 'candidate' ? 'text-cyan-400 hover:text-cyan-300' : 'text-purple-400 hover:text-purple-300'
                }`}
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href="#privacy"
                className={`underline transition-colors ${
                  role === 'candidate' ? 'text-cyan-400 hover:text-cyan-300' : 'text-purple-400 hover:text-purple-300'
                }`}
              >
                Privacy Policy
              </a>
              .
            </span>
          </label>
          {errors.agreeTerms && (
            <p className="mt-1 text-xs text-rose-400 font-medium">
              {errors.agreeTerms.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full mt-3 py-3 px-4 rounded-xl text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer ${
            role === 'candidate'
              ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-cyan-500/30 hover:shadow-cyan-500/40 ring-1 ring-white/20'
              : 'bg-gradient-to-r from-purple-500 via-pink-600 to-rose-600 hover:from-purple-400 hover:to-rose-500 shadow-purple-500/30 hover:shadow-purple-500/40 ring-1 ring-white/20'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating your account...</span>
            </>
          ) : (
            <>
              <span>Complete {role === 'candidate' ? 'Job Seeker' : 'Recruiter'} Registration</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-white/10 text-center">
        <p className="text-xs text-slate-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className={`font-bold transition-colors ml-1 ${
              role === 'candidate' ? 'text-cyan-400 hover:text-cyan-300' : 'text-purple-400 hover:text-purple-300'
            }`}
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

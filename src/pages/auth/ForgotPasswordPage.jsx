import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ShieldCheck, ArrowLeft, ArrowRight, Loader2, CheckCircle2, KeyRound, Eye, EyeOff } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from './AuthLayout'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [userEmail, setUserEmail] = useState('')
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [timer, setTimer] = useState(60)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { requestPasswordReset, resetPassword } = useAuth()
  const navigate = useNavigate()

  // Countdown timer for Step 2
  useEffect(() => {
    let interval = null
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [step, timer])

  // Form handlers
  const emailForm = useForm({ defaultValues: { email: '' } })
  const otpForm = useForm({ defaultValues: { otp: '' } })
  const resetForm = useForm({ defaultValues: { newPassword: '', confirmNewPassword: '' } })

  // Step 1: Send reset code
  const handleEmailSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const res = await requestPasswordReset(data.email)
      if (res.success) {
        setUserEmail(data.email)
        setGeneratedOtp(res.mockOtp)
        setTimer(60)
        setStep(2)
        toast.info(`Demo verification code generated: ${res.mockOtp}`)
      } else {
        toast.error(res.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Step 2: Verify OTP
  const handleOtpSubmit = async (data) => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setIsSubmitting(false)

    if (data.otp.trim() === generatedOtp) {
      toast.success('Security code verified successfully!')
      setStep(3)
    } else {
      toast.error('Invalid verification code. Please check and try again.')
    }
  }

  // Step 3: Set new password
  const handleResetSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const res = await resetPassword(userEmail, data.newPassword)
      if (res.success) {
        toast.success(res.message)
        setStep(4)
      } else {
        toast.error(res.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title={step === 4 ? 'Password Updated!' : 'Account Recovery'}
      subtitle={
        step === 1
          ? 'Enter your verified email to receive a secure recovery code'
          : step === 2
          ? `Enter the 6-digit code dispatched to ${userEmail}`
          : step === 3
          ? 'Choose a strong and secure new password for your account'
          : 'Your credentials have been securely updated in local storage'
      }
      showRoleToggle={false}
    >
      {/* Progress Steps Indicator */}
      {step < 4 && (
        <div className="mb-6 flex items-center justify-between">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step === s
                    ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/30 ring-2 ring-white/20'
                    : step > s
                    ? 'bg-cyan-500 text-white'
                    : 'bg-black/40 text-slate-400 border border-white/20 backdrop-blur-sm'
                }`}
              >
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-0.5 mx-2 rounded transition-colors ${
                    step > s ? 'bg-cyan-500' : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* STEP 1: Enter Email */}
      {step === 1 && (
        <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-100 mb-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              Registered Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                placeholder="e.g. candidate@jobportal.com"
                {...emailForm.register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address'
                  }
                })}
                className="w-full pl-10 pr-4 py-2.5 bg-black/35 backdrop-blur-md border border-white/20 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/25 focus:bg-black/50 transition-all shadow-inner"
              />
            </div>
            {emailForm.formState.errors.email && (
              <p className="mt-1.5 text-xs text-rose-400 font-medium">
                {emailForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 ring-1 ring-white/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking records...</span>
              </>
            ) : (
              <>
                <span>Send Recovery Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* STEP 2: Verify Code */}
      {step === 2 && (
        <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)} className="space-y-4">
          {/* Quick Demo Code Prompt */}
          <div className="p-3 bg-cyan-950/25 border border-cyan-500/30 rounded-xl flex items-center justify-between text-xs">
            <span className="text-cyan-300">
              Demo Code: <strong className="text-white font-mono tracking-widest">{generatedOtp}</strong>
            </span>
            <button
              type="button"
              onClick={() => otpForm.setValue('otp', generatedOtp)}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline font-bold cursor-pointer"
            >
              Auto-fill Code
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-100 mb-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              6-Digit Security Code
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                {...otpForm.register('otp', {
                  required: 'Please enter the 6-digit code',
                  minLength: { value: 6, message: 'Code must be 6 digits' }
                })}
                className="w-full pl-10 pr-4 py-2.5 bg-black/35 backdrop-blur-md border border-white/20 rounded-xl text-sm font-mono tracking-widest text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/25 focus:bg-black/50 transition-all text-center shadow-inner"
              />
            </div>
            {otpForm.formState.errors.otp && (
              <p className="mt-1.5 text-xs text-rose-400 font-medium">
                {otpForm.formState.errors.otp.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              {timer > 0 ? (
                <>Resend code in <strong className="text-slate-200">{timer}s</strong></>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setTimer(60)
                    toast.info(`New demo code dispatched: ${generatedOtp}`)
                  }}
                  className="text-cyan-400 hover:text-cyan-300 underline font-medium cursor-pointer"
                >
                  Resend Security Code
                </button>
              )}
            </span>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Change Email
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 ring-1 ring-white/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Verify & Proceed</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* STEP 3: Reset Password */}
      {step === 3 && (
        <form onSubmit={resetForm.handleSubmit(handleResetSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-100 mb-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                {...resetForm.register('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                className="w-full pl-10 pr-11 py-2.5 bg-black/35 backdrop-blur-md border border-white/20 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/25 focus:bg-black/50 transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-300 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {resetForm.formState.errors.newPassword && (
              <p className="mt-1.5 text-xs text-rose-400 font-medium">
                {resetForm.formState.errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-100 mb-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter your new password"
                {...resetForm.register('confirmNewPassword', {
                  required: 'Please confirm your new password',
                  validate: (val) =>
                    val === resetForm.watch('newPassword') || 'Passwords do not match'
                })}
                className="w-full pl-10 pr-11 py-2.5 bg-black/35 backdrop-blur-md border border-white/20 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/25 focus:bg-black/50 transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-300 hover:text-white cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {resetForm.formState.errors.confirmNewPassword && (
              <p className="mt-1.5 text-xs text-rose-400 font-medium">
                {resetForm.formState.errors.confirmNewPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 ring-1 ring-white/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>Save New Password</span>
            )}
          </button>
        </form>
      )}

      {/* STEP 4: Success View */}
      {step === 4 && (
        <div className="text-center py-4 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Password Updated</h3>
            <p className="text-xs text-slate-300 mt-1">
              Your account password has been updated in local storage. You can now log in securely.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 ring-1 ring-white/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <span>Proceed to Login</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Back to Login link */}
      <div className="mt-6 pt-5 border-t border-white/10 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Sign In</span>
        </Link>
      </div>
    </AuthLayout>
  )
}

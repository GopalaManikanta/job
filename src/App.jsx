import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { AuthProvider } from './context/AuthContext'
import { CompanyProvider } from './context/CompanyContext'
import { DashboardProvider } from './context/DashboardContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import Dashboard from './pages/Dashboard'
import CompaniesPage from './pages/companies/CompaniesPage'
import CompanyDetailsPage from './pages/companies/CompanyDetailsPage'

export default function App() {
  return (
    <AuthProvider>
      <CompanyProvider>
        <DashboardProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/companies"
                element={
                  <ProtectedRoute>
                    <CompaniesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/companies/:id"
                element={
                  <ProtectedRoute>
                    <CompanyDetailsPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallbacks */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>

            {/* Global Toast Notifications */}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </BrowserRouter>
        </DashboardProvider>
      </CompanyProvider>
    </AuthProvider>
  )
}

import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loadUserFromStorage } from './redux/slices/authSlice'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ServicesPage from './pages/ServicesPage'
import ServiceDetailPage from './pages/ServiceDetailPage'
import BookingPage from './pages/BookingPage'
import ChatPage from './pages/ChatPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import AdminPanel from './pages/AdminPanel'
import NotFoundPage from './pages/NotFoundPage'

// Components
import Navbar from './components/layout/Navbar'
import ProtectedRoute from './components/common/ProtectedRoute'
import LoadingSpinner from './components/common/LoadingSpinner'

function App() {
  const dispatch = useDispatch()
  const { loading } = useSelector(state => state.auth)

  useEffect(() => {
    dispatch(loadUserFromStorage())
  }, [dispatch])

  if (loading) return <LoadingSpinner fullScreen />

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:id" element={<ServiceDetailPage />} />

        {/* Protected - All roles */}
        <Route path="/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute><ChatPage /></ProtectedRoute>
        } />
        <Route path="/chat/:userId" element={
          <ProtectedRoute><ChatPage /></ProtectedRoute>
        } />

        {/* Customer only */}
        <Route path="/book/:serviceId" element={
          <ProtectedRoute roles={['CUSTOMER']}><BookingPage /></ProtectedRoute>
        } />

        {/* Dashboard - Provider & Customer */}
        <Route path="/dashboard" element={
          <ProtectedRoute roles={['CUSTOMER', 'PROVIDER']}><DashboardPage /></ProtectedRoute>
        } />

        {/* Admin only */}
        <Route path="/admin/*" element={
          <ProtectedRoute roles={['ADMIN']}><AdminPanel /></ProtectedRoute>
        } />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}

export default App

import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { dashboardAPI } from '../api/dashboardAPI'
import { usersAPI } from '../api/usersAPI'
import { servicesAPI } from '../api/servicesAPI'
import { bookingsAPI } from '../api/bookingsAPI'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import toast from 'react-hot-toast'

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const AdminPanel = () => {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    const path = location.pathname.split('/')[2] || 'dashboard'
    setActiveTab(path)
  }, [location])

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'services', label: 'Services', icon: '🛠️' },
    { id: 'bookings', label: 'Bookings', icon: '📋' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Panel</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {tabs.map(tab => (
          <Link key={tab.id} to={`/admin/${tab.id === 'dashboard' ? '' : tab.id}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            <span>{tab.icon}</span>
            {tab.label}
          </Link>
        ))}
      </div>

      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/users" element={<AdminUsers />} />
        <Route path="/services" element={<AdminServices />} />
        <Route path="/bookings" element={<AdminBookings />} />
      </Routes>
    </div>
  )
}

const AdminDashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await dashboardAPI.getAdminDashboard()
      setData(res.data.data)
    } catch (err) {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!data) return <div>Failed to load</div>

  const stats = [
    { label: 'Total Users', value: data.totalUsers, icon: '👥', color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Services', value: data.totalServices, icon: '🛠️', color: 'bg-purple-50 text-purple-600' },
    { label: 'Total Bookings', value: data.totalBookings, icon: '📋', color: 'bg-green-50 text-green-600' },
    { label: 'Revenue', value: `$${data.totalRevenue}`, icon: '💰', color: 'bg-yellow-50 text-yellow-600' },
  ]

  const bookingsChart = {
    labels: data.bookingsByMonth.map(d => d.month),
    datasets: [{ label: 'Bookings', data: data.bookingsByMonth.map(d => d.count), backgroundColor: 'rgba(59, 130, 246, 0.7)', borderRadius: 6 }]
  }

  const usersChart = {
    labels: data.usersByRole.map(d => d.role),
    datasets: [{ data: data.usersByRole.map(d => d.count), backgroundColor: ['#3b82f6', '#8b5cf6', '#ef4444'] }]
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${stat.color}`}>{stat.icon}</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Bookings This Year</h3>
          <Bar data={bookingsChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Users by Role</h3>
          <Doughnut data={usersChart} options={{ responsive: true }} />
        </div>
      </div>
    </div>
  )
}

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadUsers() }, [])

  const loadUsers = async () => {
    try {
      const res = await usersAPI.getAll({ page: 0, size: 50 })
      setUsers(res.data.data.content)
    } catch (err) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleBan = async (id, banned) => {
    try {
      if (banned) await usersAPI.unbanUser(id)
      else await usersAPI.banUser(id)
      toast.success(banned ? 'User unbanned' : 'User banned')
      loadUsers()
    } catch (err) {
      toast.error('Action failed')
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-gray-900 mb-6">All Users</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left p-3 font-semibold text-gray-700">Name</th>
              <th className="text-left p-3 font-semibold text-gray-700">Email</th>
              <th className="text-left p-3 font-semibold text-gray-700">Role</th>
              <th className="text-left p-3 font-semibold text-gray-700">Status</th>
              <th className="text-left p-3 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3">{user.name}</td>
                <td className="p-3 text-gray-500">{user.email}</td>
                <td className="p-3"><span className="badge bg-blue-100 text-blue-700">{user.role}</span></td>
                <td className="p-3">
                  <span className={`badge ${user.banned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {user.banned ? 'Banned' : 'Active'}
                  </span>
                </td>
                <td className="p-3">
                  <button onClick={() => handleBan(user.id, user.banned)}
                    className={`text-xs font-medium ${user.banned ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'}`}>
                    {user.banned ? 'Unban' : 'Ban'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const AdminServices = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadServices() }, [])

  const loadServices = async () => {
    try {
      const res = await servicesAPI.getAllAdmin({ page: 0, size: 50 })
      setServices(res.data.data.content)
    } catch (err) {
      toast.error('Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      await servicesAPI.approveService(id)
      toast.success('Service approved')
      loadServices()
    } catch (err) {
      toast.error('Action failed')
    }
  }

  const handleReject = async (id) => {
    try {
      await servicesAPI.rejectService(id)
      toast.success('Service rejected')
      loadServices()
    } catch (err) {
      toast.error('Action failed')
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-gray-900 mb-6">All Services</h2>
      <div className="space-y-3">
        {services.map(service => (
          <div key={service.id} className="border border-gray-100 rounded-xl p-4 flex items-center gap-4">
            <img src={service.imageUrl || `https://picsum.photos/seed/${service.id}/80/80`} alt={service.title}
              className="w-16 h-16 rounded-xl object-cover" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{service.title}</h3>
              <p className="text-sm text-gray-500">{service.providerName} • ${service.price}</p>
              <span className={`badge text-xs mt-1 ${
                service.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                service.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>{service.status}</span>
            </div>
            {service.status === 'PENDING' && (
              <div className="flex gap-2">
                <button onClick={() => handleApprove(service.id)} className="text-xs bg-green-600 hover:bg-green-700 text-white font-semibold py-1.5 px-3 rounded-lg">Approve</button>
                <button onClick={() => handleReject(service.id)} className="text-xs btn-danger py-1.5 px-3">Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const AdminBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadBookings() }, [])

  const loadBookings = async () => {
    try {
      const res = await bookingsAPI.getAllBookings({ page: 0, size: 50 })
      setBookings(res.data.data.content)
    } catch (err) {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  const STATUS_COLORS = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    ACCEPTED: 'bg-blue-100 text-blue-700',
    REJECTED: 'bg-red-100 text-red-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-gray-900 mb-6">All Bookings</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left p-3 font-semibold text-gray-700">Service</th>
              <th className="text-left p-3 font-semibold text-gray-700">Customer</th>
              <th className="text-left p-3 font-semibold text-gray-700">Provider</th>
              <th className="text-left p-3 font-semibold text-gray-700">Date</th>
              <th className="text-left p-3 font-semibold text-gray-700">Amount</th>
              <th className="text-left p-3 font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3">{booking.serviceTitle}</td>
                <td className="p-3 text-gray-500">{booking.customerName}</td>
                <td className="p-3 text-gray-500">{booking.providerName}</td>
                <td className="p-3 text-gray-500">{new Date(booking.bookingDate).toLocaleDateString()}</td>
                <td className="p-3 font-semibold">${booking.amount}</td>
                <td className="p-3"><span className={`badge ${STATUS_COLORS[booking.status]}`}>{booking.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminPanel

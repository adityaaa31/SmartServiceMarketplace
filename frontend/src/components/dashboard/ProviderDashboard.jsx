import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchProviderBookings, updateBookingStatus } from '../../redux/slices/bookingsSlice'
import { fetchMyServices, deleteService } from '../../redux/slices/servicesSlice'
import { dashboardAPI } from '../../api/dashboardAPI'
import { servicesAPI } from '../../api/servicesAPI'
import LoadingSpinner from '../common/LoadingSpinner'
import Modal from '../common/Modal'
import Pagination from '../common/Pagination'
import ServiceForm from './ServiceForm'
import toast from 'react-hot-toast'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACCEPTED: 'bg-blue-100 text-blue-700',
  REJECTED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
}

const ProviderDashboard = () => {
  const dispatch = useDispatch()
  const { bookings, loading: bookingLoading, pagination } = useSelector(state => state.bookings)
  const { myServices, loading: serviceLoading } = useSelector(state => state.services)
  const { user } = useSelector(state => state.auth)
  const [activeTab, setActiveTab] = useState('bookings')
  const [page, setPage] = useState(0)
  const [dashData, setDashData] = useState(null)
  const [serviceModal, setServiceModal] = useState(null) // null | 'create' | service object
  const [categories, setCategories] = useState([])

  useEffect(() => {
    dispatch(fetchProviderBookings({ page, size: 10 }))
    dispatch(fetchMyServices({ page: 0, size: 20 }))
    loadDashboard()
    loadCategories()
  }, [dispatch])

  useEffect(() => {
    dispatch(fetchProviderBookings({ page, size: 10 }))
  }, [page])

  const loadDashboard = async () => {
    try {
      const res = await dashboardAPI.getProviderDashboard()
      setDashData(res.data.data)
    } catch (err) { console.error(err) }
  }

  const loadCategories = async () => {
    try {
      const res = await import('../../api/categoriesAPI')
      const data = await res.categoriesAPI.getAll()
      setCategories(data.data.data)
    } catch (err) { console.error(err) }
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      await dispatch(updateBookingStatus({ id, status })).unwrap()
      toast.success(`Booking ${status.toLowerCase()}`)
    } catch (err) {
      toast.error(err || 'Failed to update')
    }
  }

  const handleDeleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return
    try {
      await dispatch(deleteService(id)).unwrap()
      toast.success('Service deleted')
    } catch (err) {
      toast.error(err || 'Failed to delete')
    }
  }

  const stats = [
    { label: 'Total Services', value: myServices.length, icon: '🛠️', color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Bookings', value: dashData?.totalBookings || 0, icon: '📋', color: 'bg-purple-50 text-purple-600' },
    { label: 'Pending', value: bookings.filter(b => b.status === 'PENDING').length, icon: '⏳', color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Revenue', value: `$${dashData?.totalRevenue || 0}`, icon: '💰', color: 'bg-green-50 text-green-600' },
  ]

  const chartData = dashData?.bookingsByMonth ? {
    labels: dashData.bookingsByMonth.map(d => d.month),
    datasets: [{
      label: 'Bookings',
      data: dashData.bookingsByMonth.map(d => d.count),
      backgroundColor: 'rgba(59, 130, 246, 0.7)',
      borderRadius: 6,
    }]
  } : null

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
        </div>
        <button onClick={() => setServiceModal('create')} className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Service
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartData && (
        <div className="card mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Bookings This Year</h3>
          <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {['bookings', 'services'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'bookings' && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Booking Requests</h2>
          {bookingLoading ? <LoadingSpinner /> : bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-gray-500">No bookings yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map(booking => (
                <div key={booking.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-semibold text-sm">{booking.customerName?.[0]}</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900">{booking.customerName}</h3>
                        <p className="text-sm text-gray-500 truncate">{booking.serviceTitle}</p>
                        <p className="text-sm text-gray-500">
                          📅 {new Date(booking.bookingDate).toLocaleDateString()} at {booking.bookingTime?.slice(0, 5)}
                        </p>
                        {booking.notes && <p className="text-xs text-gray-400 mt-1">Note: {booking.notes}</p>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={`badge ${STATUS_COLORS[booking.status]}`}>{booking.status}</span>
                      <span className="font-bold text-gray-900">${booking.amount}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    <Link to={`/chat/${booking.customerId}`} className="text-xs btn-secondary py-1.5 px-3">Chat</Link>
                    {booking.status === 'PENDING' && (
                      <>
                        <button onClick={() => handleStatusUpdate(booking.id, 'ACCEPTED')}
                          className="text-xs bg-green-600 hover:bg-green-700 text-white font-semibold py-1.5 px-3 rounded-lg transition-colors">
                          Accept
                        </button>
                        <button onClick={() => handleStatusUpdate(booking.id, 'REJECTED')}
                          className="text-xs btn-danger py-1.5 px-3">
                          Reject
                        </button>
                      </>
                    )}
                    {booking.status === 'ACCEPTED' && (
                      <button onClick={() => handleStatusUpdate(booking.id, 'COMPLETED')}
                        className="text-xs bg-green-600 hover:bg-green-700 text-white font-semibold py-1.5 px-3 rounded-lg transition-colors">
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <Pagination currentPage={pagination.number} totalPages={pagination.totalPages} onPageChange={setPage} />
        </div>
      )}

      {activeTab === 'services' && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">My Services</h2>
          {serviceLoading ? <LoadingSpinner /> : myServices.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🛠️</div>
              <p className="text-gray-500 mb-4">No services yet</p>
              <button onClick={() => setServiceModal('create')} className="btn-primary">Add Your First Service</button>
            </div>
          ) : (
            <div className="space-y-4">
              {myServices.map(service => (
                <div key={service.id} className="border border-gray-100 rounded-xl p-4 flex items-center gap-4">
                  <img src={service.imageUrl || `https://picsum.photos/seed/${service.id}/80/80`} alt={service.title}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    onError={(e) => { e.target.src = `https://picsum.photos/seed/${service.id}/80/80` }} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{service.title}</h3>
                    <p className="text-sm text-gray-500">{service.categoryName} • ${service.price}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`badge text-xs ${
                        service.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        service.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>{service.status}</span>
                      <span className="text-xs text-gray-400">⭐ {service.averageRating?.toFixed(1)} ({service.totalReviews})</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => setServiceModal(service)}
                      className="text-xs btn-secondary py-1.5 px-3">Edit</button>
                    <button onClick={() => handleDeleteService(service.id)}
                      className="text-xs btn-danger py-1.5 px-3">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Service Modal */}
      <Modal
        isOpen={!!serviceModal}
        onClose={() => setServiceModal(null)}
        title={serviceModal === 'create' ? 'Add New Service' : 'Edit Service'}
        size="lg"
      >
        <ServiceForm
          service={serviceModal !== 'create' ? serviceModal : null}
          categories={categories}
          onClose={() => setServiceModal(null)}
          onSuccess={() => {
            setServiceModal(null)
            dispatch(fetchMyServices({ page: 0, size: 20 }))
          }}
        />
      </Modal>
    </div>
  )
}

export default ProviderDashboard

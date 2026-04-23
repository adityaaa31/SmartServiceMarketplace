import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchMyBookings, updateBookingStatus } from '../../redux/slices/bookingsSlice'
import { reviewsAPI } from '../../api/reviewsAPI'
import LoadingSpinner from '../common/LoadingSpinner'
import Modal from '../common/Modal'
import StarRating from '../common/StarRating'
import Pagination from '../common/Pagination'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACCEPTED: 'bg-blue-100 text-blue-700',
  REJECTED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
}

const CustomerDashboard = () => {
  const dispatch = useDispatch()
  const { bookings, loading, pagination } = useSelector(state => state.bookings)
  const { user } = useSelector(state => state.auth)
  const [page, setPage] = useState(0)
  const [reviewModal, setReviewModal] = useState(null)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    dispatch(fetchMyBookings({ page, size: 10 }))
  }, [dispatch, page])

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return
    try {
      await dispatch(updateBookingStatus({ id, status: 'CANCELLED' })).unwrap()
      toast.success('Booking cancelled')
    } catch (err) {
      toast.error(err || 'Failed to cancel')
    }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    setSubmittingReview(true)
    try {
      await reviewsAPI.createReview({ bookingId: reviewModal.id, ...reviewForm })
      toast.success('Review submitted!')
      setReviewModal(null)
      dispatch(fetchMyBookings({ page, size: 10 }))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  const stats = [
    { label: 'Total Bookings', value: pagination.totalElements, icon: '📋', color: 'bg-blue-50 text-blue-600' },
    { label: 'Completed', value: bookings.filter(b => b.status === 'COMPLETED').length, icon: '✅', color: 'bg-green-50 text-green-600' },
    { label: 'Pending', value: bookings.filter(b => b.status === 'PENDING').length, icon: '⏳', color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Cancelled', value: bookings.filter(b => b.status === 'CANCELLED').length, icon: '❌', color: 'bg-red-50 text-red-600' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
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

      {/* Quick action */}
      <div className="mb-8">
        <Link to="/services" className="btn-primary inline-flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Book a New Service
        </Link>
      </div>

      {/* Bookings list */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">My Bookings</h2>
        {loading ? <LoadingSpinner /> : bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-gray-500">No bookings yet</p>
            <Link to="/services" className="btn-primary mt-4 inline-block">Browse Services</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => (
              <div key={booking.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <img
                      src={booking.serviceImage || `https://picsum.photos/seed/${booking.serviceId}/80/80`}
                      alt={booking.serviceTitle}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      onError={(e) => { e.target.src = `https://picsum.photos/seed/${booking.serviceId}/80/80` }}
                    />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{booking.serviceTitle}</h3>
                      <p className="text-sm text-gray-500">by {booking.providerName}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        📅 {new Date(booking.bookingDate).toLocaleDateString()} at {booking.bookingTime?.slice(0, 5)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`badge ${STATUS_COLORS[booking.status]}`}>{booking.status}</span>
                    <span className="font-bold text-gray-900">${booking.amount}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <Link to={`/chat/${booking.providerId}`}
                    className="text-xs btn-secondary py-1.5 px-3">
                    Chat
                  </Link>
                  {booking.status === 'PENDING' && (
                    <button onClick={() => handleCancel(booking.id)}
                      className="text-xs btn-danger py-1.5 px-3">
                      Cancel
                    </button>
                  )}
                  {booking.status === 'COMPLETED' && !booking.hasReview && (
                    <button onClick={() => setReviewModal(booking)}
                      className="text-xs btn-primary py-1.5 px-3">
                      ⭐ Leave Review
                    </button>
                  )}
                  {booking.status === 'COMPLETED' && booking.hasReview && (
                    <span className="text-xs text-green-600 font-medium">✓ Reviewed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <Pagination currentPage={pagination.number} totalPages={pagination.totalPages} onPageChange={setPage} />
      </div>

      {/* Review Modal */}
      <Modal isOpen={!!reviewModal} onClose={() => setReviewModal(null)} title="Leave a Review">
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Service: <strong>{reviewModal?.serviceTitle}</strong></p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <StarRating rating={reviewForm.rating} size="lg" interactive onChange={r => setReviewForm(f => ({ ...f, rating: r }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Comment (optional)</label>
            <textarea value={reviewForm.comment}
              onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
              placeholder="Share your experience..."
              rows={4} className="input-field resize-none" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setReviewModal(null)} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" disabled={submittingReview} className="flex-1 btn-primary">
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default CustomerDashboard

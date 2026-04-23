import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchServiceById } from '../redux/slices/servicesSlice'
import { createBooking } from '../redux/slices/bookingsSlice'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
]

const BookingPage = () => {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentService: service, loading } = useSelector(state => state.services)
  const { loading: bookingLoading } = useSelector(state => state.bookings)

  const [form, setForm] = useState({
    bookingDate: '',
    bookingTime: '',
    notes: '',
    address: '',
  })

  const today = new Date()
  today.setDate(today.getDate() + 1)
  const minDate = today.toISOString().split('T')[0]

  useEffect(() => {
    dispatch(fetchServiceById(serviceId))
  }, [serviceId, dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.bookingDate || !form.bookingTime) {
      toast.error('Please select date and time')
      return
    }
    try {
      await dispatch(createBooking({
        serviceId: parseInt(serviceId),
        bookingDate: form.bookingDate,
        bookingTime: form.bookingTime + ':00',
        notes: form.notes,
        address: form.address,
      })).unwrap()
      toast.success('Booking created successfully!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err || 'Booking failed')
    }
  }

  if (loading) return <LoadingSpinner fullScreen />
  if (!service) return <div className="text-center py-20">Service not found</div>

  const defaultImage = `https://picsum.photos/seed/${service.id}/400/200`

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Book Service</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Select Date</h3>
              <input
                type="date"
                value={form.bookingDate}
                min={minDate}
                onChange={e => setForm({ ...form, bookingDate: e.target.value })}
                className="input-field"
                required
              />
            </div>

            {/* Time */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Select Time</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {TIME_SLOTS.map(slot => (
                  <button key={slot} type="button"
                    onClick={() => setForm({ ...form, bookingTime: slot })}
                    className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                      form.bookingTime === slot
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                    }`}>
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Address */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Service Address</h3>
              <input
                type="text"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                placeholder="Enter your address"
                className="input-field"
              />
            </div>

            {/* Notes */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Additional Notes</h3>
              <textarea
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Any special instructions or requirements..."
                rows={3}
                className="input-field resize-none"
              />
            </div>

            <button type="submit" disabled={bookingLoading}
              className="w-full btn-primary py-4 text-base">
              {bookingLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Confirming...
                </span>
              ) : `Confirm Booking — $${service.price}`}
            </button>
          </form>
        </div>

        {/* Summary */}
        <div className="lg:col-span-2">
          <div className="card sticky top-24">
            <h3 className="font-semibold text-gray-900 mb-4">Booking Summary</h3>
            <img src={service.imageUrl || defaultImage} alt={service.title}
              className="w-full h-40 object-cover rounded-xl mb-4"
              onError={(e) => { e.target.src = defaultImage }} />
            <h4 className="font-semibold text-gray-900 mb-1">{service.title}</h4>
            <p className="text-sm text-gray-500 mb-4">by {service.providerName}</p>

            <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
              {form.bookingDate && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium">{new Date(form.bookingDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                </div>
              )}
              {form.bookingTime && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Time</span>
                  <span className="font-medium">{form.bookingTime}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-100 pt-2 mt-2">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-blue-600 text-lg">${service.price}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingPage

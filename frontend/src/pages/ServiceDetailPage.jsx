import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchServiceById } from '../redux/slices/servicesSlice'
import { reviewsAPI } from '../api/reviewsAPI'
import StarRating from '../components/common/StarRating'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const ServiceDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentService: service, loading } = useSelector(state => state.services)
  const { user } = useSelector(state => state.auth)
  const [reviews, setReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(false)

  useEffect(() => {
    dispatch(fetchServiceById(id))
    loadReviews()
  }, [id, dispatch])

  const loadReviews = async () => {
    setLoadingReviews(true)
    try {
      const res = await reviewsAPI.getServiceReviews(id, { page: 0, size: 10 })
      setReviews(res.data.data.content)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingReviews(false)
    }
  }

  const handleBookNow = () => {
    if (!user) {
      toast.error('Please login to book')
      navigate('/login', { state: { from: { pathname: `/book/${id}` } } })
      return
    }
    if (user.role !== 'CUSTOMER') {
      toast.error('Only customers can book services')
      return
    }
    navigate(`/book/${id}`)
  }

  if (loading) return <LoadingSpinner fullScreen />
  if (!service) return <div className="text-center py-20">Service not found</div>

  const defaultImage = `https://picsum.photos/seed/${service.id}/800/400`

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <img src={service.imageUrl || defaultImage} alt={service.title}
            className="w-full h-80 object-cover rounded-2xl" onError={(e) => { e.target.src = defaultImage }} />

          <div>
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-2">
                  {service.categoryName}
                </span>
                <h1 className="text-3xl font-bold text-gray-900">{service.title}</h1>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <StarRating rating={service.averageRating} size="md" />
                <span className="text-sm font-medium text-gray-700">
                  {service.averageRating?.toFixed(1)} ({service.totalReviews} reviews)
                </span>
              </div>
              <span className="text-sm text-gray-500">• {service.totalBookings} bookings</span>
            </div>

            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{service.description}</p>

            {service.location && (
              <div className="flex items-center gap-2 mt-4 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {service.location}
              </div>
            )}
          </div>

          {/* Provider info */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">About the Provider</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                {service.providerImage
                  ? <img src={service.providerImage} alt="" className="w-12 h-12 rounded-full object-cover" />
                  : <span className="text-blue-600 font-bold">{service.providerName?.[0]}</span>
                }
              </div>
              <div>
                <p className="font-semibold text-gray-900">{service.providerName}</p>
                <p className="text-sm text-gray-500">Professional Service Provider</p>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Customer Reviews</h3>
            {loadingReviews ? (
              <LoadingSpinner />
            ) : reviews.length === 0 ? (
              <p className="text-gray-500 text-sm">No reviews yet</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium">{review.customerName?.[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{review.customerName}</p>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                    </div>
                    {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-1">Starting at</p>
              <p className="text-4xl font-bold text-gray-900">${service.price}</p>
              {service.deliveryTime && (
                <p className="text-sm text-gray-500 mt-2">⏱️ {service.deliveryTime} day delivery</p>
              )}
            </div>

            <button onClick={handleBookNow}
              className="w-full btn-primary py-3 text-base mb-3">
              Book Now
            </button>

            {user && user.role !== 'ADMIN' && service.providerId !== user.id && (
              <Link to={`/chat/${service.providerId}`}
                className="w-full btn-secondary py-3 text-base text-center block">
                Contact Provider
              </Link>
            )}

            <div className="mt-6 pt-6 border-t border-gray-100 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Verified Provider
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Secure Payment
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Money-back Guarantee
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceDetailPage

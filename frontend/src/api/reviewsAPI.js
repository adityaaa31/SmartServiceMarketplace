import axiosInstance from './axiosInstance'

export const reviewsAPI = {
  createReview: (data) => axiosInstance.post('/reviews', data),
  getServiceReviews: (serviceId, params) => axiosInstance.get(`/reviews/service/${serviceId}`, { params }),
  getMyReviews: (params) => axiosInstance.get('/reviews/my-reviews', { params }),
}

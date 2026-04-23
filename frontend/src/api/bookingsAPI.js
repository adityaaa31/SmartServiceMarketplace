import axiosInstance from './axiosInstance'

export const bookingsAPI = {
  createBooking: (data) => axiosInstance.post('/bookings', data),
  getMyBookings: (params) => axiosInstance.get('/bookings/my-bookings', { params }),
  getProviderBookings: (params) => axiosInstance.get('/bookings/provider-bookings', { params }),
  getAllBookings: (params) => axiosInstance.get('/bookings/admin/all', { params }),
  getBookingById: (id) => axiosInstance.get(`/bookings/${id}`),
  updateStatus: (id, status) => axiosInstance.put(`/bookings/${id}/status`, null, { params: { status } }),
}

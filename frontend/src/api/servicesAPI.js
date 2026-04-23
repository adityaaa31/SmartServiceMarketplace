import axiosInstance from './axiosInstance'

export const servicesAPI = {
  getServices: (params) => axiosInstance.get('/services', { params }),
  getServiceById: (id) => axiosInstance.get(`/services/${id}`),
  getMyServices: (params) => axiosInstance.get('/services/my-services', { params }),
  getAllAdmin: (params) => axiosInstance.get('/services/admin/all', { params }),
  createService: (data) => axiosInstance.post('/services', data),
  updateService: (id, data) => axiosInstance.put(`/services/${id}`, data),
  deleteService: (id) => axiosInstance.delete(`/services/${id}`),
  approveService: (id) => axiosInstance.put(`/services/${id}/approve`),
  rejectService: (id) => axiosInstance.put(`/services/${id}/reject`),
}

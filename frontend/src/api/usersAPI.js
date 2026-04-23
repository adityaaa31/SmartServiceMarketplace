import axiosInstance from './axiosInstance'

export const usersAPI = {
  getMe: () => axiosInstance.get('/users/me'),
  updateMe: (data) => axiosInstance.put('/users/me', data),
  getById: (id) => axiosInstance.get(`/users/${id}`),
  getAll: (params) => axiosInstance.get('/users', { params }),
  banUser: (id) => axiosInstance.put(`/users/${id}/ban`),
  unbanUser: (id) => axiosInstance.put(`/users/${id}/unban`),
  deleteUser: (id) => axiosInstance.delete(`/users/${id}`),
}

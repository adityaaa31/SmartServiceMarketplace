import axiosInstance from './axiosInstance'

export const dashboardAPI = {
  getAdminDashboard: () => axiosInstance.get('/dashboard/admin'),
  getProviderDashboard: () => axiosInstance.get('/dashboard/provider'),
}

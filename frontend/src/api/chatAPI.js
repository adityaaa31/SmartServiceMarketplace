import axiosInstance from './axiosInstance'

export const chatAPI = {
  sendMessage: (data) => axiosInstance.post('/chat/send', data),
  getConversation: (userId) => axiosInstance.get(`/chat/conversation/${userId}`),
  getConversationByBooking: (userId, bookingId) => axiosInstance.get(`/chat/conversation/${userId}/booking/${bookingId}`),
  getContacts: () => axiosInstance.get('/chat/contacts'),
  getUnreadCount: (senderId) => axiosInstance.get(`/chat/unread/${senderId}`),
}

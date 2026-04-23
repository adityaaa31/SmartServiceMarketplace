import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import servicesReducer from './slices/servicesSlice'
import bookingsReducer from './slices/bookingsSlice'
import chatReducer from './slices/chatSlice'
import categoriesReducer from './slices/categoriesSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    services: servicesReducer,
    bookings: bookingsReducer,
    chat: chatReducer,
    categories: categoriesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['chat/addMessage'],
      },
    }),
})

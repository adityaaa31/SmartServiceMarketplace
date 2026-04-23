import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { bookingsAPI } from '../../api/bookingsAPI'

export const fetchMyBookings = createAsyncThunk('bookings/fetchMine', async (params, { rejectWithValue }) => {
  try {
    const response = await bookingsAPI.getMyBookings(params)
    return response.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch bookings')
  }
})

export const fetchProviderBookings = createAsyncThunk('bookings/fetchProvider', async (params, { rejectWithValue }) => {
  try {
    const response = await bookingsAPI.getProviderBookings(params)
    return response.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch bookings')
  }
})

export const createBooking = createAsyncThunk('bookings/create', async (data, { rejectWithValue }) => {
  try {
    const response = await bookingsAPI.createBooking(data)
    return response.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create booking')
  }
})

export const updateBookingStatus = createAsyncThunk('bookings/updateStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const response = await bookingsAPI.updateStatus(id, status)
    return response.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update booking')
  }
})

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: {
    bookings: [],
    pagination: { totalElements: 0, totalPages: 0, number: 0 },
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyBookings.pending, (state) => { state.loading = true })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false
        state.bookings = action.payload.content
        state.pagination = { totalElements: action.payload.totalElements, totalPages: action.payload.totalPages, number: action.payload.number }
      })
      .addCase(fetchMyBookings.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(fetchProviderBookings.pending, (state) => { state.loading = true })
      .addCase(fetchProviderBookings.fulfilled, (state, action) => {
        state.loading = false
        state.bookings = action.payload.content
        state.pagination = { totalElements: action.payload.totalElements, totalPages: action.payload.totalPages, number: action.payload.number }
      })
      .addCase(fetchProviderBookings.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(createBooking.fulfilled, (state, action) => {
        state.bookings.unshift(action.payload)
      })

      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const idx = state.bookings.findIndex(b => b.id === action.payload.id)
        if (idx !== -1) state.bookings[idx] = action.payload
      })
  },
})

export const { clearError } = bookingsSlice.actions
export default bookingsSlice.reducer

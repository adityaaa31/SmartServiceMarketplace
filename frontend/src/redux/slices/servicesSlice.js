import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { servicesAPI } from '../../api/servicesAPI'

export const fetchServices = createAsyncThunk('services/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const response = await servicesAPI.getServices(params)
    return response.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch services')
  }
})

export const fetchServiceById = createAsyncThunk('services/fetchById', async (id, { rejectWithValue }) => {
  try {
    const response = await servicesAPI.getServiceById(id)
    return response.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch service')
  }
})

export const fetchMyServices = createAsyncThunk('services/fetchMine', async (params, { rejectWithValue }) => {
  try {
    const response = await servicesAPI.getMyServices(params)
    return response.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch services')
  }
})

export const createService = createAsyncThunk('services/create', async (data, { rejectWithValue }) => {
  try {
    const response = await servicesAPI.createService(data)
    return response.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create service')
  }
})

export const updateService = createAsyncThunk('services/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await servicesAPI.updateService(id, data)
    return response.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update service')
  }
})

export const deleteService = createAsyncThunk('services/delete', async (id, { rejectWithValue }) => {
  try {
    await servicesAPI.deleteService(id)
    return id
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete service')
  }
})

const servicesSlice = createSlice({
  name: 'services',
  initialState: {
    services: [],
    currentService: null,
    myServices: [],
    pagination: { totalElements: 0, totalPages: 0, number: 0 },
    loading: false,
    error: null,
    filters: { search: '', categoryId: null, minPrice: '', maxPrice: '', minRating: null, sortBy: 'createdAt', sortDir: 'desc' },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = { search: '', categoryId: null, minPrice: '', maxPrice: '', minRating: null, sortBy: 'createdAt', sortDir: 'desc' }
    },
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => { state.loading = true })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false
        state.services = action.payload.content
        state.pagination = { totalElements: action.payload.totalElements, totalPages: action.payload.totalPages, number: action.payload.number }
      })
      .addCase(fetchServices.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(fetchServiceById.pending, (state) => { state.loading = true })
      .addCase(fetchServiceById.fulfilled, (state, action) => { state.loading = false; state.currentService = action.payload })
      .addCase(fetchServiceById.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(fetchMyServices.pending, (state) => { state.loading = true })
      .addCase(fetchMyServices.fulfilled, (state, action) => {
        state.loading = false
        state.myServices = action.payload.content
      })
      .addCase(fetchMyServices.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(createService.fulfilled, (state, action) => {
        state.myServices.unshift(action.payload)
      })
      .addCase(updateService.fulfilled, (state, action) => {
        const idx = state.myServices.findIndex(s => s.id === action.payload.id)
        if (idx !== -1) state.myServices[idx] = action.payload
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.myServices = state.myServices.filter(s => s.id !== action.payload)
      })
  },
})

export const { setFilters, clearFilters, clearError } = servicesSlice.actions
export default servicesSlice.reducer

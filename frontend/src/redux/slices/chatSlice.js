import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { chatAPI } from '../../api/chatAPI'

export const fetchConversation = createAsyncThunk('chat/fetchConversation', async (userId, { rejectWithValue }) => {
  try {
    const response = await chatAPI.getConversation(userId)
    return { userId, messages: response.data.data }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch messages')
  }
})

export const fetchContacts = createAsyncThunk('chat/fetchContacts', async (_, { rejectWithValue }) => {
  try {
    const response = await chatAPI.getContacts()
    return response.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch contacts')
  }
})

export const sendMessage = createAsyncThunk('chat/sendMessage', async (data, { rejectWithValue }) => {
  try {
    const response = await chatAPI.sendMessage(data)
    return response.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to send message')
  }
})

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    conversations: {},
    contacts: [],
    activeUserId: null,
    loading: false,
    error: null,
  },
  reducers: {
    setActiveUser: (state, action) => {
      state.activeUserId = action.payload
    },
    addMessage: (state, action) => {
      const msg = action.payload
      const key = msg.senderId === state.activeUserId ? msg.senderId : msg.receiverId
      if (!state.conversations[key]) state.conversations[key] = []
      // Avoid duplicates
      const exists = state.conversations[key].find(m => m.id === msg.id)
      if (!exists) state.conversations[key].push(msg)
    },
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversation.pending, (state) => { state.loading = true })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.loading = false
        state.conversations[action.payload.userId] = action.payload.messages
      })
      .addCase(fetchConversation.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.contacts = action.payload
      })

      .addCase(sendMessage.fulfilled, (state, action) => {
        const msg = action.payload
        const key = msg.receiverId
        if (!state.conversations[key]) state.conversations[key] = []
        state.conversations[key].push(msg)
      })
  },
})

export const { setActiveUser, addMessage, clearError } = chatSlice.actions
export default chatSlice.reducer

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { toast } from 'react-toastify'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const createTicket = createAsyncThunk(
  'tickets/createTicket',
  async (ticketData, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token
        }
      }
      const response = await axios.post(`${API_URL}/tickets`, ticketData, config)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data.msg)
    }
  }
)

export const getTickets = createAsyncThunk(
  'tickets/getTickets',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth
      const config = {
        headers: {
          'x-auth-token': token
        }
      }
      const response = await axios.get(`${API_URL}/tickets`, config)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data.msg)
    }
  }
)

export const getTicket = createAsyncThunk(
  'tickets/getTicket',
  async (ticketId, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth
      const config = {
        headers: {
          'x-auth-token': token
        }
      }
      const response = await axios.get(`${API_URL}/tickets/${ticketId}`, config)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data.msg)
    }
  }
)

export const updateTicket = createAsyncThunk(
  'tickets/updateTicket',
  async ({ ticketId, ticketData }, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth
      const config = {
        headers: {
          'x-auth-token': token
        }
      }
      const response = await axios.put(`${API_URL}/tickets/${ticketId}`, ticketData, config)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data.msg)
    }
  }
)

export const addMessage = createAsyncThunk(
  'tickets/addMessage',
  async ({ ticketId, messageData }, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token
        }
      }
      const response = await axios.post(`${API_URL}/tickets/${ticketId}/messages`, messageData, config)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data.msg)
    }
  }
)

export const deleteTicket = createAsyncThunk(
  'tickets/deleteTicket',
  async (ticketId, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth
      const config = {
        headers: {
          'x-auth-token': token
        }
      }
      await axios.delete(`${API_URL}/tickets/${ticketId}`, config)
      return ticketId
    } catch (error) {
      return rejectWithValue(error.response.data.msg)
    }
  }
)

const initialState = {
  tickets: [],
  currentTicket: null,
  loading: false,
  error: null
}

const ticketSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    clearCurrentTicket: (state) => {
      state.currentTicket = null
    },
    clearError: (state) => {
      state.error = null
    },
    updateTicketInRealtime: (state, action) => {
      const updatedTicket = action.payload
      if (state.currentTicket?._id === updatedTicket._id) {
        state.currentTicket = updatedTicket
      }
      state.tickets = state.tickets.map(ticket =>
        ticket._id === updatedTicket._id ? updatedTicket : ticket
      )
    },
    removeTicketInRealtime: (state, action) => {
      const ticketId = action.payload
      if (state.currentTicket?._id === ticketId) {
        state.currentTicket = null
      }
      state.tickets = state.tickets.filter(ticket => ticket._id !== ticketId)
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Ticket
      .addCase(createTicket.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.loading = false
        state.tickets.unshift(action.payload)
        toast.success('Ticket created successfully!')
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload)
      })
      // Get Tickets
      .addCase(getTickets.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getTickets.fulfilled, (state, action) => {
        state.loading = false
        state.tickets = action.payload
      })
      .addCase(getTickets.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload)
      })
      // Get Single Ticket
      .addCase(getTicket.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getTicket.fulfilled, (state, action) => {
        state.loading = false
        state.currentTicket = action.payload
      })
      .addCase(getTicket.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload)
      })
      // Update Ticket
      .addCase(updateTicket.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateTicket.fulfilled, (state, action) => {
        state.loading = false
        state.currentTicket = action.payload
        state.tickets = state.tickets.map(ticket =>
          ticket._id === action.payload._id ? action.payload : ticket
        )
        toast.success('Ticket updated successfully!')
      })
      .addCase(updateTicket.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload)
      })
      // Add Message
      .addCase(addMessage.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addMessage.fulfilled, (state, action) => {
        state.loading = false
        state.currentTicket = action.payload
        toast.success('Message added successfully!')
      })
      .addCase(addMessage.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload)
      })
      // Delete Ticket
      .addCase(deleteTicket.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteTicket.fulfilled, (state, action) => {
        state.loading = false
        state.tickets = state.tickets.filter(ticket => ticket._id !== action.payload)
        state.currentTicket = null
        toast.success('Ticket deleted successfully!')
      })
      .addCase(deleteTicket.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload)
      })
  }
})

export const {
  clearCurrentTicket,
  clearError,
  updateTicketInRealtime,
  removeTicketInRealtime
} = ticketSlice.actions

export default ticketSlice.reducer 
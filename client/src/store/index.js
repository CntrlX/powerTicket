import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import ticketReducer from './slices/ticketSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    tickets: ticketReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})

export default store 
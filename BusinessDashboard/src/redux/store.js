import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { businessApi } from './api/businessApi'
import businessAuthReducer from './slices/businessAuthSlice'

export const store = configureStore({
  reducer: {
    [businessApi.reducerPath]: businessApi.reducer,
    businessAuth: businessAuthReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(businessApi.middleware),
})

setupListeners(store.dispatch)

export default store

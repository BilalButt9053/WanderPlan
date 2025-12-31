import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  business: null,
  token: localStorage.getItem('businessToken') || null,
  isAuthenticated: false,
  status: null, // pending, approved, rejected, suspended
  pendingBusinessId: null,
  pendingEmail: null,
}

const businessAuthSlice = createSlice({
  name: 'businessAuth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { business, token } = action.payload
      state.business = business
      state.token = token
      state.isAuthenticated = true
      state.status = business?.status
      if (token) {
        localStorage.setItem('businessToken', token)
      }
    },
    setPendingBusiness: (state, action) => {
      const { businessId, email } = action.payload
      state.pendingBusinessId = businessId
      state.pendingEmail = email
      sessionStorage.setItem('pendingBusinessId', businessId)
      sessionStorage.setItem('pendingEmail', email)
    },
    clearPendingBusiness: (state) => {
      state.pendingBusinessId = null
      state.pendingEmail = null
      sessionStorage.removeItem('pendingBusinessId')
      sessionStorage.removeItem('pendingEmail')
    },
    logout: (state) => {
      state.business = null
      state.token = null
      state.isAuthenticated = false
      state.status = null
      state.pendingBusinessId = null
      state.pendingEmail = null
      localStorage.removeItem('businessToken')
      sessionStorage.removeItem('pendingBusinessId')
      sessionStorage.removeItem('pendingEmail')
    },
    updateBusinessStatus: (state, action) => {
      state.status = action.payload
      if (state.business) {
        state.business.status = action.payload
      }
    },
    loadPendingBusiness: (state) => {
      const businessId = sessionStorage.getItem('pendingBusinessId')
      const email = sessionStorage.getItem('pendingEmail')
      if (businessId && email) {
        state.pendingBusinessId = businessId
        state.pendingEmail = email
      }
    },
  },
})

export const {
  setCredentials,
  setPendingBusiness,
  clearPendingBusiness,
  logout,
  updateBusinessStatus,
  loadPendingBusiness,
} = businessAuthSlice.actions

export default businessAuthSlice.reducer

// Selectors
export const selectCurrentBusiness = (state) => state.businessAuth.business
export const selectCurrentToken = (state) => state.businessAuth.token
export const selectIsAuthenticated = (state) => state.businessAuth.isAuthenticated
export const selectBusinessStatus = (state) => state.businessAuth.status
export const selectPendingBusinessId = (state) => state.businessAuth.pendingBusinessId
export const selectPendingEmail = (state) => state.businessAuth.pendingEmail

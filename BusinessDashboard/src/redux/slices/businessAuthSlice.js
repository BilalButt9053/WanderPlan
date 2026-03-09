import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  business: null,
  token: localStorage.getItem('businessToken') || null,
  isAuthenticated: false,
  isLoading: !!localStorage.getItem('businessToken'), // true if token exists (need to verify)
  status: null, // pending, approved, rejected, suspended
  pendingBusinessId: null,
  pendingEmail: null,
  // Temporary storage for signup + onboarding data before registration
  tempRegistrationData: JSON.parse(sessionStorage.getItem('tempRegistrationData') || 'null'),
}

const businessAuthSlice = createSlice({
  name: 'businessAuth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { business, token } = action.payload
      state.business = business
      state.token = token || state.token
      state.isAuthenticated = true
      state.isLoading = false
      state.status = business?.status
      if (token) {
        localStorage.setItem('businessToken', token)
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    setPendingBusiness: (state, action) => {
      const data = action.payload
      
      // If it contains signup data (ownerName, email, password)
      if (data.ownerName || data.password) {
        state.tempRegistrationData = data
        sessionStorage.setItem('tempRegistrationData', JSON.stringify(data))
      }
      
      // If it contains businessId and email (from registration response)
      if (data.businessId && data.email) {
        state.pendingBusinessId = data.businessId
        state.pendingEmail = data.email
        sessionStorage.setItem('pendingBusinessId', data.businessId)
        sessionStorage.setItem('pendingEmail', data.email)
      }
    },
    updateTempRegistrationData: (state, action) => {
      state.tempRegistrationData = {
        ...state.tempRegistrationData,
        ...action.payload
      }
      sessionStorage.setItem('tempRegistrationData', JSON.stringify(state.tempRegistrationData))
    },
    clearPendingBusiness: (state) => {
      state.pendingBusinessId = null
      state.pendingEmail = null
      state.tempRegistrationData = null
      sessionStorage.removeItem('pendingBusinessId')
      sessionStorage.removeItem('pendingEmail')
      sessionStorage.removeItem('tempRegistrationData')
    },
    logout: (state) => {
      state.business = null
      state.token = null
      state.isAuthenticated = false
      state.isLoading = false
      state.status = null
      state.pendingBusinessId = null
      state.pendingEmail = null
      state.tempRegistrationData = null
      localStorage.removeItem('businessToken')
      sessionStorage.removeItem('pendingBusinessId')
      sessionStorage.removeItem('pendingEmail')
      sessionStorage.removeItem('tempRegistrationData')
    },
    updateBusinessStatus: (state, action) => {
      state.status = action.payload
      if (state.business) {
        state.business.status = action.payload
      }
    },
    loadPendingBusiness: (state) => {
      const tempData = sessionStorage.getItem('tempRegistrationData')
      const businessId = sessionStorage.getItem('pendingBusinessId')
      const email = sessionStorage.getItem('pendingEmail')
      
      if (businessId && email) {
        state.pendingBusinessId = businessId
        state.pendingEmail = email
      }
      if (tempData) {
        state.tempRegistrationData = JSON.parse(tempData)
      }
    },
  },
})

export const {
  setCredentials,
  setLoading,
  setPendingBusiness,
  updateTempRegistrationData,
  clearPendingBusiness,
  logout,
  updateBusinessStatus,
  loadPendingBusiness,
} = businessAuthSlice.actions

export default businessAuthSlice.reducer

// Selectors
export const selectTempRegistrationData = (state) => state.businessAuth.tempRegistrationData
export const selectCurrentBusiness = (state) => state.businessAuth.business
export const selectCurrentToken = (state) => state.businessAuth.token
export const selectIsAuthenticated = (state) => state.businessAuth.isAuthenticated
export const selectIsLoading = (state) => state.businessAuth.isLoading
export const selectBusinessStatus = (state) => state.businessAuth.status
export const selectPendingBusinessId = (state) => state.businessAuth.pendingBusinessId
export const selectPendingEmail = (state) => state.businessAuth.pendingEmail

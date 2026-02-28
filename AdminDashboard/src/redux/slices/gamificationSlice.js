import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  badges: [],
  challenges: [],
  leaderboard: [],
  loading: false,
  error: null,
  stats: {
    totalBadges: 0,
    activeChallenges: 0,
    totalPoints: 0,
  },
};

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    setBadges: (state, action) => {
      state.badges = action.payload;
    },
    setChallenges: (state, action) => {
      state.challenges = action.payload;
    },
    setLeaderboard: (state, action) => {
      state.leaderboard = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    addBadge: (state, action) => {
      state.badges.push(action.payload);
    },
    updateBadge: (state, action) => {
      const index = state.badges.findIndex(badge => badge.id === action.payload.id);
      if (index !== -1) {
        state.badges[index] = { ...state.badges[index], ...action.payload };
      }
    },
    deleteBadge: (state, action) => {
      state.badges = state.badges.filter(badge => badge.id !== action.payload);
    },
    addChallenge: (state, action) => {
      state.challenges.push(action.payload);
    },
    updateChallenge: (state, action) => {
      const index = state.challenges.findIndex(challenge => challenge.id === action.payload.id);
      if (index !== -1) {
        state.challenges[index] = { ...state.challenges[index], ...action.payload };
      }
    },
    deleteChallenge: (state, action) => {
      state.challenges = state.challenges.filter(challenge => challenge.id !== action.payload);
    },
    setStats: (state, action) => {
      state.stats = action.payload;
    },
  },
});

export const {
  setBadges,
  setChallenges,
  setLeaderboard,
  setLoading,
  setError,
  addBadge,
  updateBadge,
  deleteBadge,
  addChallenge,
  updateChallenge,
  deleteChallenge,
  setStats,
} = gamificationSlice.actions;

export default gamificationSlice.reducer;

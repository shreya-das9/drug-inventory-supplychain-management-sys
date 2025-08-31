// // client/src/store/slices/authSlice.js
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { register as apiRegister, login as apiLogin, me as apiMe } from '../../services/auth.api';

// // get persisted token/user from localStorage (if any)
// const persistedToken = localStorage.getItem('token') || null;
// const persistedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

// export const registerThunk = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
//   try {
//     const res = await apiRegister(payload);
//     return res;
//   } catch (err) {
//     return rejectWithValue(err.response?.data?.error || err.message);
//   }
// });

// export const loginThunk = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
//   try {
//     const res = await apiLogin(payload);
//     return res;
//   } catch (err) {
//     return rejectWithValue(err.response?.data?.error || err.message);
//   }
// });

// export const refreshMe = createAsyncThunk('auth/refreshMe', async (_, { rejectWithValue }) => {
//   try {
//     const res = await apiMe();
//     // apiMe returns { user }
//     return res;
//   } catch (err) {
//     return rejectWithValue(err.response?.data?.error || err.message);
//   }
// });

// const initialState = {
//   token: persistedToken,
//   user: persistedUser,
//   loading: false,
//   error: null
// };

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     logout(state) {
//       state.token = null;
//       state.user = null;
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // register
//       .addCase(registerThunk.pending, (s) => { s.loading = true; s.error = null; })
//       .addCase(registerThunk.fulfilled, (s, { payload }) => {
//         s.loading = false;
//         s.token = payload.token;
//         s.user = payload.user;
//         localStorage.setItem('token', payload.token);
//         localStorage.setItem('user', JSON.stringify(payload.user));
//       })
//       .addCase(registerThunk.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error.message; })

//       // login
//       .addCase(loginThunk.pending, (s) => { s.loading = true; s.error = null; })
//       .addCase(loginThunk.fulfilled, (s, { payload }) => {
//         s.loading = false;
//         s.token = payload.token;
//         s.user = payload.user;
//         localStorage.setItem('token', payload.token);
//         localStorage.setItem('user', JSON.stringify(payload.user));
//       })
//       .addCase(loginThunk.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error.message; })

//       // refreshMe
//       .addCase(refreshMe.pending, (s) => { s.loading = true; s.error = null; })
//       .addCase(refreshMe.fulfilled, (s, { payload }) => {
//         s.loading = false;
//         s.user = payload.user;
//         if (s.user) localStorage.setItem('user', JSON.stringify(s.user));
//       })
//       .addCase(refreshMe.rejected, (s, a) => {
//         s.loading = false;
//         s.error = a.payload || a.error.message;
//         // if token invalid, clean up
//         s.token = null;
//         s.user = null;
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//       });
//   }
// });

// export const { logout } = authSlice.actions;
// export default authSlice.reducer;
// client/src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { register as apiRegister, login as apiLogin, me as apiMe } from '../../services/auth.api';

// get persisted token/user from localStorage (if any)
const persistedToken = localStorage.getItem('token') || null;
const persistedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

export const registerThunk = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const res = await apiRegister(payload);
    return res;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.message);
  }
});

export const loginThunk = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const res = await apiLogin(payload);
    return res;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.message);
  }
});

export const refreshMe = createAsyncThunk('auth/refreshMe', async (_, { rejectWithValue }) => {
  try {
    const res = await apiMe();
    // apiMe returns { user }
    return res;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.message);
  }
});

const initialState = {
  token: persistedToken,
  user: persistedUser,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.loading = false;
      state.error = null;
      if (action.payload.token) {
        localStorage.setItem('token', action.payload.token);
      }
      if (action.payload.user) {
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      }
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // register
      .addCase(registerThunk.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(registerThunk.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.token = payload.token;
        s.user = payload.user;
        localStorage.setItem('token', payload.token);
        localStorage.setItem('user', JSON.stringify(payload.user));
      })
      .addCase(registerThunk.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error.message; })

      // login
      .addCase(loginThunk.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(loginThunk.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.token = payload.token;
        s.user = payload.user;
        localStorage.setItem('token', payload.token);
        localStorage.setItem('user', JSON.stringify(payload.user));
      })
      .addCase(loginThunk.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error.message; })

      // refreshMe
      .addCase(refreshMe.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(refreshMe.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.user = payload.user;
        if (s.user) localStorage.setItem('user', JSON.stringify(s.user));
      })
      .addCase(refreshMe.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload || a.error.message;
        // if token invalid, clean up
        s.token = null;
        s.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      });
  }
});

export const { logout, setCredentials, clearError } = authSlice.actions;
export default authSlice.reducer;
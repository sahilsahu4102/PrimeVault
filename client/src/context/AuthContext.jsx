import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, refreshSession, setAccessToken, hasSessionFlag, setSessionFlag } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // The access token is held in memory (see services/api.js), so after a reload the session is restored from the
  // httpOnly refresh cookie. Until that answers we are "loading", but only if this browser had a session at all.
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(hasSessionFlag);

  useEffect(() => {
    if (!hasSessionFlag()) return undefined;
    let live = true;
    refreshSession()
      .then((userData) => { if (live) setUser(userData); })
      .catch(() => { setSessionFlag(false); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, []);

  const startSession = useCallback((userData, accessToken) => {
    setAccessToken(accessToken);
    setSessionFlag(true);
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    const res = await authAPI.register({ name, email, password });
    const { user: userData, accessToken } = res.data.data;
    startSession(userData, accessToken);
    toast.success('Account created successfully!');
    return userData;
  }, [startSession]);

  const login = useCallback(async ({ email, password }) => {
    const res = await authAPI.login({ email, password });
    const { user: userData, accessToken } = res.data.data;
    startSession(userData, accessToken);
    toast.success(`Welcome back, ${userData.name}!`);
    return userData;
  }, [startSession]);

  const guest = useCallback(async () => {
    const res = await authAPI.guest();
    const { user: userData, accessToken } = res.data.data;
    return startSession(userData, accessToken);
  }, [startSession]);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
      // Continue with local logout even if API fails
    }
    setAccessToken(null);
    setSessionFlag(false);
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const isAdmin = user?.role === 'ADMIN';
  const isAuthenticated = !!user;
  // The server makes guest accounts on a reserved address that no real account can use (see auth.service.js).
  const isGuest = !!user?.email?.endsWith('@guest.invalid');

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isAdmin,
        isGuest,
        register,
        login,
        guest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

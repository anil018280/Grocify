import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { apiRequest, getStoredToken, setStoredToken } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setAuthReady(true);
      return;
    }

    let cancelled = false;

    async function hydrateUser() {
      try {
        const [me, profile] = await Promise.all([
          apiRequest("/auth/me", { token }),
          apiRequest("/profile", { token }),
        ]);
        if (!cancelled) {
          setUser({
            id: me.id,
            name: me.name,
            email: me.email,
            profile,
          });
        }
      } catch {
        setStoredToken(null);
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setAuthReady(true);
        }
      }
    }

    hydrateUser();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      authReady,
      async login(email, password) {
        const payload = await apiRequest("/auth/login", {
          method: "POST",
          body: { email, password },
        });
        setStoredToken(payload.access_token);
        setToken(payload.access_token);
        setUser(payload.user);
        return payload.user;
      },
      async register(name, email, password) {
        const payload = await apiRequest("/auth/register", {
          method: "POST",
          body: { name, email, password },
        });
        setStoredToken(payload.access_token);
        setToken(payload.access_token);
        setUser(payload.user);
        return payload.user;
      },
      logout() {
        setStoredToken(null);
        setToken(null);
        setUser(null);
      },
    }),
    [authReady, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

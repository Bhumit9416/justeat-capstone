import { createContext, useContext, useEffect, useState } from "react";
import { login as apiLogin, register as apiRegister } from "../api/auth";
import { toast } from "react-toastify";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleAuthSuccess = (apiResponse) => {
    if (!apiResponse?.success || !apiResponse.data) return false;
    const { token, username, email, role } = apiResponse.data;
    const usr = { username, email, role };
    setToken(token);
    setUser(usr);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(usr));
    return true;
  };

  // Errors are intentionally not caught here — pages handle them for inline display
  const login = async (username, password) => {
    const res = await apiLogin(username, password);
    const ok = handleAuthSuccess(res);
    if (ok) toast.success("Login successful");
    return ok;
  };

  const register = async (payload) => {
    const res = await apiRegister(payload);
    const ok = handleAuthSuccess(res);
    if (ok) toast.success("Registration successful");
    return ok;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

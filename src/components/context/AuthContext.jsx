import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setIsLogin(true);
      setToken(token);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(token);
    setIsLogin(true);
    setUser(userData);
  };

  const logout = () => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}/logout`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
          "bypass-tunnel-reminder": "1",
        },
      })
      .then(() => {
        localStorage.clear();
        setIsLogin(false);
        setUser(null);
      })
      .catch((error) => {
        console.error("Logout error:", error);
      });
  };

  return (
    <AuthContext.Provider value={{ isLogin, user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

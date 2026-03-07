import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
  const [ipAddress,setIpAddress] = useState('')

  return (
    <AuthContext.Provider value={{ ipAddress, setIpAddress }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook (recommended)
export const useAuth = () => {
  return useContext(AuthContext);
};

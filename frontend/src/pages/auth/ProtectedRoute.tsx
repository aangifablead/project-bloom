import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth(); // Assuming your context has a loading state

  if (isLoading) return <div>Loading...</div>; // Prevent flickering during auth check

  if (!user) {
    // Redirect them to login if they try to access protected content
    return <Navigate to="/login" replace />;
  }

  return children;
};
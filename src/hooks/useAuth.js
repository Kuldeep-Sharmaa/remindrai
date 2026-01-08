import { useEffect } from "react"; // Added useEffect for potential future use or if needed elsewhere
// ✅ IMPORTANT: Import your authService functions directly
import { signup, login, logout } from "../services/authService";
import { useAuthContext } from "../context/AuthContext"; // Keep this for current user and loading state

export const useAuth = () => {
  const { currentUser, loading } = useAuthContext();

  // ✅ Remove the local implementations of signup, login, logout from here.
  // We will now expose the ones imported from authService.js

  // No need to define signup, login, logout functions here anymore,
  // as we're directly importing and returning the centralized ones.

  // You can still add any hook-specific logic here if needed,
  // for example, side effects based on currentUser changes.
  useEffect(() => {
    // Example: console.log("Auth state changed:", currentUser);
  }, [currentUser]);

  return {
    currentUser,
    loading,
    // ✅ EXPOSE THE IMPORTED FUNCTIONS
    signup, // This is now the signup from authService.js
    login, // This is now the login from authService.js
    logout, // This is now the logout from authService.js
  };
};

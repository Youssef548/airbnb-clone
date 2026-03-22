// Auth utilities - token is now managed via httpOnly cookies
// These helpers remain for clearing client-side user data

export const clearAuthData = () => {
  localStorage.removeItem("currentUser");
};

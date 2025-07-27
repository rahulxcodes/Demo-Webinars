// Utility to handle token expiration and refresh
export const clearExpiredTokens = () => {
  console.log('Clearing all expired tokens...');
  localStorage.clear(); // Clear all localStorage to ensure no cached tokens
  
  // Force page reload to clear any cached state
  setTimeout(() => {
    window.location.reload();
  }, 100);
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Treat invalid tokens as expired
  }
};
import jwtDecode from 'jwt-decode';

export const isTokenExpired = token => {
  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp < currentTime;
  } catch (error) {
    console.error('Failed to decode token', error);
    return true; // 
  }
};

  
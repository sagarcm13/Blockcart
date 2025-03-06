import { jwtDecode } from "jwt-decode";
export function isTokenExpired(token) {
  if (!token) return true;

  const decodedToken = jwtDecode(token); // No need for .default here
  const currentTime = Date.now() / 1000;
  return decodedToken.exp < currentTime;
}
/**
 * SecureRoute component
 * Provides a wrapper to secure the routes that needs authorisation
 */

import { Navigate } from "react-router-dom";
import { jwtDecode, JwtPayload } from "jwt-decode"; //
import { useState, useEffect, ReactNode } from "react";

import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";


interface SecureRouteProps {
  children: ReactNode; // Children can be any valid React node
}

function SecureRoute({ children }: SecureRouteProps): React.ReactNode {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    auth().catch((error) => {
      console.error("Auth process failed:", error);
      setIsAuthorized(false);
    });
  }, []);

  // Get a refresh token
  const refreshToken = async (): Promise<void> => {
    const currentRefreshToken: string | null =
      localStorage.getItem(REFRESH_TOKEN);
    // if there is no refresh token, return not authenticated
    if (!currentRefreshToken) {
      setIsAuthorized(false);
      return;
    }

    try {
      // Send response to this route with payload of refresh token
      const res = await api.post("/user/token/refresh/", {
        refresh: currentRefreshToken,
      });
      // if refreshh token is valid, set it in local storage
      if (res.status === 200) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        // Optionally update refresh token if your backend sends a new one
        if (res.data.refresh) {
          localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        }
        setIsAuthorized(true);
      } else {
        // If status is not 200 (e.g., 401 if refresh token is invalid)
        setIsAuthorized(false);
      }
    } catch (error: any) {
      // Type guard for Axios errors
      if (error.isAxiosError) {
        console.error("Error refreshing token:", error.message);
        if (error.response) {
          console.error("Refresh token error response:", error.response.data);
        }
      } else if (error instanceof Error) {
        console.error(
          "An unexpected error occurred during token refresh:",
          error.message,
        );
      } else {
        console.error("An unknown error occurred during token refresh:", error);
      }
      setIsAuthorized(false);
    }
  };

  const auth = async (): Promise<void> => {
    // Checks if the token is expired. If yes, get a refresh token.
    const token: string | null = localStorage.getItem(ACCESS_TOKEN);

    if (!token) {
      setIsAuthorized(false);

      return;
    }

    try {
      // jwtDecode returns JwtPayload by default, or T if generic is provided
      const decoded: JwtPayload = jwtDecode(token);

      // Ensure 'expiration' property exists and is a number
      if (typeof decoded.exp !== "number") {
        console.error("Token does not contain a valid expiration time.");
        setIsAuthorized(false);
        return;
      }
      // Get the token expiration date and check if it has expired
      const tokenExpiration: number = decoded.exp;
      const now: number = Date.now() / 1000;

      if (tokenExpiration < now) {
        // Token expired, try to refresh
        console.log("Access token expired, attempting to refresh...");
        await refreshToken();
      } else {
        // Token is still valid
        console.log("Access token is valid.");
        setIsAuthorized(true);
      }
    } catch (error) {
      // Catch errors during jwtDecode
      console.error("Error decoding token or during authentication:", error);
      setIsAuthorized(false);
    }
  };

  if (isAuthorized === null) {
    return <div>Loading...</div>; // Indicates initial authorization check is in progress
  }
  return isAuthorized ? children : <Navigate to="/login" />;
}

export default SecureRoute;

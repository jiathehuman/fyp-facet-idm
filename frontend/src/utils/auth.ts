/**
 * Auth.ts handles authentication with Google and Ethereum
 */
import { NavigateFunction } from "react-router-dom";
import { CredentialResponse } from "@react-oauth/google";

import api from "../api";

import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/constants";

// Global Type declarations
declare global {
  interface Window {
    ethereum?: EthereumProvider;
    web3?: {
      currentProvider?: EthereumProvider;
    };
  }
}

// Basic interface for Ethereum provider
interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on?: (eventName: string, handler: (...args: any[]) => void) => void;
  removeListener?: (
    eventName: string,
    handler: (...args: any[]) => void,
  ) => void;
}

// Interface for the user object
interface User {
  id: string;
  username: string;
  email?: string;
  wallet_address?: string;
}

// Interface for the authentication response from your backend
interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

// Handle google login
export const handleGoogleLogin = async (response: CredentialResponse): Promise<{ success: boolean; user?: User }> => {
  if (!response.credential) {
    console.error("Google login failed: No credential found in response.");

    return { success: false };
  }
  try {
    const apiResponse = await api.post<AuthResponse>("/auth/google/", {
      idToken: response.credential,
    });

    const { access, refresh, user } = apiResponse.data;
    localStorage.setItem(ACCESS_TOKEN, access);
    localStorage.setItem(REFRESH_TOKEN, refresh);
    localStorage.setItem("currentUser", JSON.stringify(user));


    console.log("Google authentication successful!", user);

    return { success: true, user };
  } catch (err: any) {
    console.error("Error when authenticating backend with Google:", err);
    return { success: false };
  }
};

export const detectCurrentProvider = (): EthereumProvider | null => {
  if (window.ethereum) {
    return window.ethereum;
  } else if (window.web3 && window.web3.currentProvider) {
    console.warn(
      "Using window.web3.currentProvider. Upgrade to a browser with window.ethereum.",
    );

    return window.web3.currentProvider;
  }
  console.log(
    "Non-Ethereum browser detected. Register or login with other method instead",
  );

  return null;
};


export const handleMetaMaskLogin = async (
  navigate: NavigateFunction,
): Promise<{ success: boolean; message?: string; user?: User }> => {
  const MESSAGE_TO_SIGN: string =
    "Please sign this message to authenticate with our service.";

  try {
    const currentProvider = detectCurrentProvider();

    if (!currentProvider) {
      console.error("MetaMask is not installed. Please install it to connect.");
      return { success: false, message: "MetaMask not installed" };
    }


    const userAccounts: string[] = await currentProvider.request({method: "eth_requestAccounts"});
    const account: string = userAccounts[0]; // Get the currently selected account

    console.log("Connected Ethereum Account:", account);

    // Personal sign
    const signature: string = await currentProvider.request({
      method: "personal_sign",
      params: [MESSAGE_TO_SIGN, account],
    });

    console.log("Signature:", signature);

    try {
      // Send to backend for authentication
      const apiResponse = await api.post<AuthResponse>("/auth/ethereum/", {
        wallet_address: account,
        signature: signature,
        message: MESSAGE_TO_SIGN,
      });

      // Backend returns access and refresh token
      const { access, refresh, user } = apiResponse.data;

      localStorage.setItem(ACCESS_TOKEN, access);
      localStorage.setItem(REFRESH_TOKEN, refresh);
      localStorage.setItem("currentUser", JSON.stringify(user)); // Store user data

      console.log("Authentication successful!", user);
      console.log(`Logged in successfully with wallet: ${user.wallet_address}`);

      // Navigate only if successful
      if (navigate) {
        navigate("/dashboard");
      }

      return { success: true, user };
    } catch (err: any) {
      console.error("Backend authentication failed:", err);
      let errorMessage: string = "Authentication failed. Please try again.";

      if (err.response && err.response.data && err.response.data.detail) {
        errorMessage = `Authentication failed: ${err.response.data.detail}`;
      }
      console.error(errorMessage);

      return { success: false, message: errorMessage };
    }
  } catch (err: any) {
    console.error("Error connecting to MetaMask or signing message:", err);
    let errorMessage: string =
      "Failed to connect to MetaMask";

    if (err && typeof err === "object" && "code" in err && err.code === 4001) {
      errorMessage =
        "MetaMask connection or signature request rejected by user.";
    }
    console.error(errorMessage);

    return { success: false, message: errorMessage };
  }
};

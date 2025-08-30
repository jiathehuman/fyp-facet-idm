import { useState } from "react";
import { siteConfig } from "@/config/site";
// @ts-ignore
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";
// Import HeroUI Components
import { Alert } from "@heroui/alert";
import { Card, CardBody } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Form } from "@heroui/form";
// To help users login with Google
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
// To help users login with Metamask
import { Wallet } from "ethers";

// Import utility functions to handle auth
import { handleGoogleLogin, handleMetaMaskLogin } from "../utils/auth";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";

// Import navbar on above
import DefaultLayout from "@/layouts/default";
import { title } from "@/components/primitives";
// Axios API make calls to backend
import api from "@/api";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  // toggle the alert component's visibility
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [description, setDescription] = useState<string>("");

  // Toggle alert component
  function onAlertClose() {
    setIsVisible(false);
    navigate("/login"); // when user acknowledges their eth details
  }

  // Creates a new ethereum wallet for the user
  function createWallet() {
    // Generate Random ethereum wallet
    const wallet = Wallet.createRandom();
    // Visible wallet address
    const walletAddress = wallet.address;
    // Private key of new wallet, displayed to user and not stored in this app.
    const privateKey = wallet.privateKey;
    // Seed phrases abd recovery phrases
    // Reference: https://wolovim.medium.com/ethereum-201-mnemonics-bb01a9108c38
    let mnemonicPhrase: string | null = null;

    // If there is a seed phrase, get the phrase
    if (wallet.mnemonic) {
      mnemonicPhrase = wallet.mnemonic.phrase;
    }
    // Set the description for the alert
    setDescription(`Dear user, \n your new Ethereum wallet address is: ${walletAddress}.\n
                    Please save your private key and mnemonic phrase in a secure place.
                    This message will be shown only once. \n
                    Private Key: ${privateKey} \n
                    Mnemonic: ${mnemonicPhrase}`);
    setIsVisible(true); // display the wallet
    return walletAddress;
  }

  // Callback when google login is successful
  const onGoogleSuccess = async (response: CredentialResponse) => {
    try {
      const result = await handleGoogleLogin(response); // get result

      if (result.user) {
        const { user } = result;
        // If user does not have a wallet address, generate a new wallet
        if (!user.wallet_address) {
          createWallet();
          await handleGoogleLogin(response); // login again after
        } else {
          console.log("User has a wallet address");
        }
      } else {
        console.error(
          "Google login is successful but user data is not returned",
        );
      }
    } catch (err: any) {
      if (isAxiosError(err)) {
        // Get the error message
        console.error("Google Authentication error (Axios)", err.message);
      } else {
        if (err instanceof Error) {
          console.error("Google Authentication error (Non-axios)", err);
        } else {
          console.error("Google Authentication error (Unknown)", err);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Callback when the Metamask login succeeds
  const onMetamaskConnect = async () => {
    setLoading(true);
    const result = await handleMetaMaskLogin(navigate); // Pass navigate as an argument

    if (!result.success) setError(result.message || "Metamask login failed");
    setLoading(false);
  };

  // Upon submitting the register form
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();

    try {
      // Register the user
      const registerRes = await api.post("/user/register/", {
        username,
        password,
      });
      // Get an access and refresh token
      const res = await api.post("/user/token/", { username, password });
      // Store tokens from registration response
      localStorage.setItem(ACCESS_TOKEN, res.data.access);
      localStorage.setItem(REFRESH_TOKEN, res.data.refresh);

      let walletAddress = createWallet();
      // Update the wallet for the user
      const updateWallet = await api.patch(
        "/user/profile/",
        { wallet_address: walletAddress },
        {
          headers: {
            Authorization: `Bearer ${registerRes.data.access}`,
          },
        },
      );

      if (updateWallet.status === 200) {
        console.log("Wallet address successfully associated with user.");
      } else {
        console.warn(
          "Failed to associate wallet address with user on backend.",
        );
      }
    } catch (err: any) {
      if (isAxiosError(err) && err.response) {
        const { data } = err.response;
        // if it is a username error
        if (typeof data === "object" && data !== null && "username" in data) {
          alert(`Username: ${(data as { username: string[] }).username[0]}`);
        } else if (typeof data === "object" && data !== null) {
          alert(`An error occurred: ${data}`);
        } // show data
      } else {
        alert(`Error occurred. Please try again later.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        {/*Alert component*/}
        <div className="top-1 z-10">
          {isVisible && (
            <Alert
              color="success"
              description={description}
              isVisible={isVisible}
              style={{ whiteSpace: "pre-wrap" }}
              variant="faded"
              onClose={() => onAlertClose()}
            />
          )}
        </div>
        {/*End of Alert Component*/}
        <div className="inline-block max-w-lg text-center justify-center">
          <Card className="mt-10">
            <CardBody className="mt-10 text-center">
              <h1 className={title()}>Register</h1>
              <Form
                className="w-full max-w-xs p-10 items-center"
                onSubmit={onSubmit}
              >
                <Input
                  isRequired
                  className="mb-5"
                  errorMessage="Please enter a valid email"
                  label="Email"
                  labelPlacement="outside"
                  name="email"
                  placeholder="Enter your email"
                  type="email"
                  onChange={(e) => setUsername(e.target.value)}
                />
                <Input
                  isRequired
                  className="mb-5"
                  errorMessage="Please enter a valid password"
                  label="Password"
                  labelPlacement="outside"
                  name="email"
                  placeholder="Password"
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button color="primary" type="submit" variant="bordered">
                  Submit
                </Button>
                <GoogleOAuthProvider clientId="430499644512-dg58u4hv3g4aaurtn8o792fl0pc4242k.apps.googleusercontent.com">
                  <GoogleLogin
                    shape="pill"
                    text="signup_with"
                    type="standard"
                    onError={() => {
                      console.error("Error in logging in with Google");
                    }}
                    onSuccess={onGoogleSuccess}
                  />
                </GoogleOAuthProvider>
                <Button color="primary" size="sm" onPress={onMetamaskConnect}>
                  Register with Ethereum Wallet
                </Button>
                  <p className="mt-5">
                    Have an account?
                    <span className="text-primary ml-2">
                      <a href={siteConfig.links.login}>Login</a>
                    </span>
                  </p>
              </Form>
            </CardBody>
          </Card>
        </div>
      </section>
      {error && <div>{error}</div>}
      {loading && <Spinner />}
    </DefaultLayout>
  );
}
import { useState, useEffect} from "react";
//@ts-ignore
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";

// Import Google Login libraries
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Import for HeroUI Components
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Form } from "@heroui/form";
import { Spinner } from "@heroui/spinner";

// Get tokens constants to handle user credentials
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { handleGoogleLogin, handleMetaMaskLogin } from "../utils/auth";

// Get the default navbar
import DefaultLayout from "@/layouts/default";
import api from "@/api";
import { title } from "@/components/primitives";
import { siteConfig } from "@/config/site";

// Countdown when too many login attempt
const formatCountdown = (ms: number) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [now, setNow] = useState<number>(Date.now());

  // Check if there is a cooldown
  const inCooldown = cooldownUntil !== null && now < cooldownUntil;
  const msLeft = inCooldown ? Math.max(0, cooldownUntil - now) : 0;

  useEffect(() => {
    if (!cooldownUntil) return;

    // update "now" every 500ms so the UI re-renders and msLeft recomputes
    const id = setInterval(() => setNow(Date.now()), 500);

    // auto-clear when cooldown ends
    const clearAtEnd = setTimeout(() => {
      setCooldownUntil(null);
      setNow(Date.now()); // final tick to render 0
    }, Math.max(0, cooldownUntil - Date.now()));

    return () => {
      clearInterval(id);
      clearTimeout(clearAtEnd);
    };
  }, [cooldownUntil]);

  // Callback for a successful Google login
  // Reference: https://developers.google.com/identity/protocols/oauth2
  const onGoogleSuccess = async (response: CredentialResponse) => {
    try {
      const result = await handleGoogleLogin(response);
      if (result.user) {
        navigate("/");
      } else {
        console.error(
          "Google login is successful but user data is not returned",
        );
      }
    } catch (err: any) {
      if (isAxiosError(err)) {
        console.error("Google Authentication error (Axios)", err.message);
        if (err.response)
          console.error(
            "Google Server error when authenticating",
            err.response?.data,
          );
      } else if (err instanceof Error) {
        console.error("Google Authentication error (Non-axios)", err);
      } else {
        console.error("Google Authentication error (Unknown)", err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Callback for login with Metamask
  const onMetamaskConnect = async () => {
    setLoading(true);
    await handleMetaMaskLogin(navigate); // Pass navigate as an argument
    setLoading(false);
  };

  // On normal credentials login
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inCooldown) return;

    setLoading(true);
    try {
      const res = await api.post("/user/token/", { username, password });
      localStorage.setItem(ACCESS_TOKEN, res.data.access);
      localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
      navigate("/");
    } catch (err: any) {
      if (isAxiosError(err) && err.response) {
        // If HTTP Too Many Requests is the HTTP Status
        if (err.response.status === 429) {
          // Try both lowercase and uppercase
          const ra = err.response.headers["retry-after"] ?? err.response.headers["Retry-After"];
          // 30s from now
          let until = Date.now() + 30_000;
          // If retry after exists
          if (ra) {
            // If it is digits, it is in seconds
            if (/^\d+$/.test(String(ra))) until = Date.now() + parseInt(String(ra), 10) * 1000;
            // Else parse the HTTP date through Date.Parse
            else { const t = Date.parse(String(ra)); if (!Number.isNaN(t)) until = t; }
          }
          setCooldownUntil(until); // store the timestamp in statep
          alert((err.response.data as any)?.message ?? "Too many attempts. Please wait.");
          return;
        }
        // Not a 429, just simply fialed login.
        alert((err.response.data as any)?.detail ?? "Login failed.");
      } else {
        // Not an Axios error
        alert("Network/CORS error.");
      }
    }finally {
      setLoading(false);
    }
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <Card className="mt-10">
            <CardBody className="mt-10 text-center">
              <h1 className={title()}>Login</h1>
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
                {/* Button for normal credentials login */}
                <Button color="primary" type="submit" variant="bordered">
                  {inCooldown ? `Please wait ${formatCountdown(msLeft)}` : (loading ? "Signing in..." : "Sign in")}
                </Button>
                {/* Button for Google Login */}
                <GoogleOAuthProvider clientId="430499644512-dg58u4hv3g4aaurtn8o792fl0pc4242k.apps.googleusercontent.com">
                  <GoogleLogin
                    shape="pill"
                    text="signin_with"
                    type="standard"
                    onError={() => {
                      console.error("Error in logging in with Google");
                    }}
                    onSuccess={onGoogleSuccess}
                  />
                </GoogleOAuthProvider>
                <Button color="primary" size="sm" onPress={onMetamaskConnect}>
                  Login with Ethereum Wallet
                </Button>
                <p className="mt-5">
                  Not a user?{" "}
                  <span className="text-primary">
                    <a href={siteConfig.links.register}>Register</a>
                  </span>{" "}
                  with us.
                </p>
              </Form>
              {loading && <Spinner />}
            </CardBody>
          </Card>
        </div>
      </section>
    </DefaultLayout>
  );
}
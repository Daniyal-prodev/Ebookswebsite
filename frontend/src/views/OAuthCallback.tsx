import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

export default function OAuthCallback() {
  const { provider } = useParams();
  const [sp] = useSearchParams();
  const [msg, setMsg] = useState("Processing...");
  const nav = useNavigate();

  useEffect(() => {
    const code = sp.get("code") || "";
    if (!provider) {
      setMsg("Invalid provider");
      return;
    }
    fetch((import.meta as any).env.VITE_API_URL + `/oauth/${provider}/callback?code=${encodeURIComponent(code)}`, {
      credentials: "include",
    })
      .then(r => r.json())
      .then(data => {
        if (data && data.access_token) {
          localStorage.setItem("customer_token", data.access_token);
          nav("/account");
        } else if (data && data.status === "disabled") {
          setMsg("OAuth not configured");
        } else {
          setMsg("Unable to sign in");
        }
      })
      .catch(() => setMsg("Error completing sign in"));
  }, []);
  return <div className="max-w-md mx-auto px-4 py-12 text-center text-slate-700">{msg}</div>;
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "@/lib/api";

export default function VerifyEmailPage() {
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const initialEmail = params.get("email") || "";
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    if (!email) {
      const stored = localStorage.getItem("pending_email");
      if (stored) setEmail(stored);
    } else {
      localStorage.setItem("pending_email", email);
    }
  }, [email]);

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const res = await apiPost<{ access_token: string }>("/auth/customer/verify", { email, code });
      localStorage.removeItem("pending_email");
      localStorage.setItem("customer_token", res.access_token);
      nav("/account");
    } catch (e) {
      setError("Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setLoading(true);
    setError("");
    setInfo("");
    try {
      await apiPost<{ ok: boolean }>("/auth/customer/resend", { email });
      setInfo("Verification code sent. Check your email.");
    } catch (e) {
      setError("Unable to resend code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-4">Verify your email</h1>
      <form onSubmit={onVerify} className="space-y-3 bg-white rounded-xl shadow p-6">
        <input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Verification code" value={code} onChange={e=>setCode(e.target.value)} />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {info && <div className="text-green-600 text-sm">{info}</div>}
        <button disabled={loading} className="w-full bg-pink-600 text-white rounded py-2">{loading ? "Verifying..." : "Verify"}</button>
        <button type="button" disabled={loading} onClick={onResend} className="w-full border rounded py-2">Resend code</button>
      </form>
    </div>
  );
}

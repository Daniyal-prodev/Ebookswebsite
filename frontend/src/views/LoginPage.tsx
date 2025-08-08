import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiPost } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await apiPost<{ access_token: string }>("/auth/customer/login", { email, password });
      localStorage.setItem("customer_token", res.access_token);
      nav("/account");
    } catch (e) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={onSubmit} className="space-y-3 bg-white rounded-xl shadow p-6">
        <input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="w-full border rounded px-3 py-2" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button disabled={loading} className="w-full bg-pink-600 text-white rounded py-2">{loading ? "Signing in..." : "Sign in"}</button>
      </form>
      <div className="text-sm mt-3">No account? <Link className="text-pink-600 underline" to="/signup">Sign up</Link></div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiPost, apiGet } from "@/lib/api";

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
        <div className="pt-2 grid grid-cols-1 gap-2">
          <button
            type="button"
            className="w-full border rounded py-2 flex items-center justify-center gap-2"
            onClick={async()=>{
              const r=await apiGet<any>("/oauth/google/start");
              if(r.auth_url){
                if(r.auth_url.startsWith("/")){
                  const res = await apiGet<any>(r.auth_url);
                  if(res.access_token){ localStorage.setItem("customer_token", res.access_token); nav("/account"); return; }
                } else {
                  window.location.href=r.auth_url;
                }
              } else { alert("Google sign-in not configured"); }
            }}>
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3A11.9 11.9 0 1 1 24 12a11.8 11.8 0 0 1 8.4 3.3l5.7-5.8A20 20 0 1 0 24 44c10.5 0 19-8.5 19-19c0-1.5-.2-3-.4-4.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12a11.8 11.8 0 0 1 8.4 3.3l5.7-5.8A19.9 19.9 0 0 0 24 4A20 20 0 0 0 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.2A12 12 0 0 1 24 36a11.9 11.9 0 0 1-11.3-8H6.3A20 20 0 0 0 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4 5.8l6.3 5.2C38.2 36.5 44 31 44 25c0-1.5-.2-3-.4-4.5z"/></svg>
            Continue with Google
          </button>
          <button
            type="button"
            className="w-full border rounded py-2 flex items-center justify-center gap-2"
            onClick={async()=>{
              const r=await apiGet<any>("/oauth/facebook/start");
              if(r.auth_url){
                if(r.auth_url.startsWith("/")){
                  const res = await apiGet<any>(r.auth_url);
                  if(res.access_token){ localStorage.setItem("customer_token", res.access_token); nav("/account"); return; }
                } else {
                  window.location.href=r.auth_url;
                }
              } else { alert("Facebook sign-in not configured"); }
            }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.093 10.125 24v-8.437H7.078v-3.49h3.047V9.356c0-3.007 1.792-4.668 4.533-4.668c1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.49 0-1.953.93-1.953 1.887v2.26h3.328l-.532 3.49h-2.796V24C19.612 23.093 24 18.1 24 12.073"/></svg>
            Continue with Facebook
          </button>
          <button
            type="button"
            className="w-full border rounded py-2 flex items-center justify-center gap-2"
            onClick={async()=>{
              const r=await apiGet<any>("/oauth/github/start");
              if(r.auth_url){
                if(r.auth_url.startsWith("/")){
                  const res = await apiGet<any>(r.auth_url);
                  if(res.access_token){ localStorage.setItem("customer_token", res.access_token); nav("/account"); return; }
                } else {
                  window.location.href=r.auth_url;
                }
              } else { alert("GitHub sign-in not configured"); }
            }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#000" d="M12 .5C5.73.5.98 5.24.98 11.5c0 4.86 3.15 8.98 7.5 10.43c.55.1.75-.24.75-.53c0-.26-.01-1.12-.02-2.03c-3.05.66-3.7-1.3-3.7-1.3c-.5-1.27-1.22-1.6-1.22-1.6c-1-.68.08-.66.08-.66c1.1.08 1.68 1.12 1.68 1.12c.98 1.67 2.56 1.19 3.18.9c.1-.71.38-1.19.7-1.46c-2.44-.28-5-1.22-5-5.42c0-1.2.43-2.17 1.12-2.94c-.11-.28-.49-1.4.11-2.92c0 0 .93-.3 3.05 1.12c.89-.25 1.84-.37 2.78-.37c.94 0 1.89.12 2.78.37c2.12-1.42 3.05-1.12 3.05-1.12c.6 1.52.22 2.64.11 2.92c.69.77 1.12 1.74 1.12 2.94c0 4.21-2.56 5.13-5 5.4c.39.34.74 1.02.74 2.06c0 1.49-.01 2.7-.01 3.07c0 .29.2.64.75.53c4.35-1.45 7.5-5.57 7.5-10.43C23.02 5.24 18.27.5 12 .5z"/></svg>
            Continue with GitHub
          </button>
        </div>
      </form>
      <div className="text-sm mt-3">No account? <Link className="text-pink-600 underline" to="/signup">Sign up</Link></div>
    </div>
  );
}

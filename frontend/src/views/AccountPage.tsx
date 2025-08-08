import { useEffect, useState } from "react";
import { apiGetAuth } from "@/lib/api";

type Me = { email: string; name?: string | null };

export default function AccountPage() {
  const [me, setMe] = useState<Me | null>(null);
  useEffect(() => {
    const token = localStorage.getItem("customer_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    apiGetAuth<Me>("/me", token).then(setMe).catch(()=> window.location.href="/login");
  }, []);
  if (!me) return <div className="max-w-4xl mx-auto px-4 py-12">Loading…</div>;
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
      <h1 className="text-3xl font-extrabold">My Account</h1>
      <div className="bg-white rounded-xl shadow p-6">
        <div className="font-semibold">{me.name || "Reader"}</div>
        <div className="text-slate-600">{me.email}</div>
      </div>
    </div>
  );
}

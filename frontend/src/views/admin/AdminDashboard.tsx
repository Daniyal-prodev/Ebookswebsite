import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function AdminDashboard(){
  const navigate = useNavigate();
  useEffect(()=>{
    const token = localStorage.getItem("admin_token");
    if(!token){
      navigate("/secret-admin/login");
    }
  }, [navigate]);
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="flex gap-4 mb-6">
        <NavLink to="/secret-admin">Products</NavLink>
      </nav>
      <Outlet />
    </div>
  )
}

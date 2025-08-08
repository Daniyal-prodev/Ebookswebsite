import { Link, Outlet, NavLink } from "react-router-dom";
import { ShoppingCart, BookOpen } from "lucide-react";

function AuthLinks() {
  const token = typeof window !== "undefined" ? localStorage.getItem("customer_token") : null;
  if (token) {
    return (
      <>
        <NavLink to="/account" className="text-sm hover:text-pink-600">Account</NavLink>
        <button
          className="text-sm hover:text-pink-600"
          onClick={() => { localStorage.removeItem("customer_token"); window.location.href = "/"; }}
        >
          Logout
        </button>
      </>
    );
  }
  return (
    <>
      <NavLink to="/login" className="text-sm hover:text-pink-600">Login</NavLink>
      <NavLink to="/signup" className="text-sm hover:text-pink-600">Sign up</NavLink>
    </>
  );
}

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col relative bg-gradient-to-br from-pink-50 via-violet-50 to-blue-50">
      <div className="pointer-events-none absolute -z-10 inset-0 [mask-image:radial-gradient(closest-side,white,transparent)]">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-pink-300/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl animate-pulse [animation-delay:200ms]" />
      </div>
      <header className="sticky top-0 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b z-40 transition-shadow">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <BookOpen className="text-pink-600 group-hover:scale-105 transition" />
            <span className="font-extrabold text-xl tracking-tight">Kids Ebooks</span>
          </Link>
          <nav className="flex items-center gap-5">
            <NavLink to="/catalog" className={({isActive}) => `text-sm hover:text-pink-600 transition ${isActive ? "text-pink-600 font-semibold" : "text-slate-700"}`}>Catalog</NavLink>
            <NavLink to="/about" className={({isActive}) => `text-sm hover:text-pink-600 transition ${isActive ? "text-pink-600 font-semibold" : "text-slate-700"}`}>About</NavLink>
            <NavLink to="/contact" className={({isActive}) => `text-sm hover:text-pink-600 transition ${isActive ? "text-pink-600 font-semibold" : "text-slate-700"}`}>Contact</NavLink>
            <AuthLinks />
            <NavLink to="/cart" className="text-sm hover:text-pink-600 flex items-center gap-1">
              <ShoppingCart size={18} /> Cart
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t bg-white/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-slate-600">
          © {new Date().getFullYear()} Kids Ebooks · <Link to="/about" className="hover:text-pink-600">About</Link> · <Link to="/contact" className="hover:text-pink-600">Contact</Link>
        </div>
      </footer>
    </div>
  );
}

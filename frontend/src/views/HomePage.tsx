import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import type { Product } from "./types";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    apiGet<Product[]>("/products").then(setProducts).catch(console.error);
  }, []);
  return (
    <>
      <section className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Magical stories for curious kids
          </h1>
          <p className="mt-4 text-slate-600">
            Explore our handpicked library of delightful children’s ebooks designed to spark imagination and foster a love of reading.
          </p>
          <div className="mt-6 flex gap-3">
            <Button asChild>
              <Link to="/catalog">Buy now</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-xl bg-white shadow p-0 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop" alt="Kids reading" className="w-full h-72 object-cover" />
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold mb-6">Trending Now</h2>
        <div className="overflow-hidden">
          <div className="flex gap-4 marquee">
            {[...products, ...products].map((p, idx) => {
              const sale = typeof p.sale_price_cents === "number" && p.sale_price_cents! >= 0;
              const price = sale ? p.sale_price_cents! : p.price_cents;
              return (
                <Link key={p.id + '-' + idx} to={`/product/${p.id}`} className="min-w-[180px] bg-white rounded-xl shadow hover:shadow-lg transition p-3">
                  {p.cover_image_url && <img src={p.cover_image_url} alt={p.title} className="h-24 w-full object-cover rounded mb-2" />}
                  <div className="text-sm font-semibold line-clamp-1">{p.title}</div>
                  <div className="text-sm font-bold flex items-center gap-2">
                    <span>${(price/100).toFixed(2)}</span>
                    {sale && <span className="text-slate-400 line-through text-xs">${(p.price_cents/100).toFixed(2)}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6 mt-10">All Books</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map(p => {
            const sale = typeof p.sale_price_cents === "number" && p.sale_price_cents! >= 0;
            const price = sale ? p.sale_price_cents! : p.price_cents;
            return (
              <Link key={p.id} to={`/product/${p.id}`} className="bg-white rounded-xl shadow hover:shadow-lg transition p-4">
                {p.cover_image_url && <img src={p.cover_image_url} alt={p.title} className="h-32 w-full object-cover rounded mb-3" />}
                <div className="font-semibold">{p.title}</div>
                <div className="mt-2 font-bold flex items-center gap-2">
                  <span>${(price/100).toFixed(2)}</span>
                  {sale && <span className="text-slate-400 line-through text-sm">${(p.price_cents/100).toFixed(2)}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "@/lib/api";
import type { Product } from "./types";

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    apiGet<Product[]>("/products").then(setProducts).catch(console.error);
  }, []);
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-6">Catalog</h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map(p => {
          const sale = typeof p.sale_price_cents === "number" && p.sale_price_cents >= 0;
          const price = sale ? p.sale_price_cents! : p.price_cents;
          return (
            <Link key={p.id} to={`/product/${p.id}`} className="bg-white rounded-xl shadow hover:shadow-lg transition p-4">
              {p.cover_image_url && <img src={p.cover_image_url} alt={p.title} className="rounded mb-3 h-44 w-full object-cover" />}
              <div className="font-semibold">{p.title}</div>
              <div className="mt-2 font-bold flex items-center gap-2">
                <span>${(price/100).toFixed(2)}</span>
                {sale && <span className="text-slate-400 line-through text-sm">${(p.price_cents/100).toFixed(2)}</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

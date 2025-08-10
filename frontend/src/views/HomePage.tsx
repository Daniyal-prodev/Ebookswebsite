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
      <section className="relative max-w-7xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 via-fuchsia-600 to-indigo-600">
              Magical stories
            </span>{" "}
            for curious kids
          </h1>
          <p className="mt-5 text-slate-600 text-lg leading-relaxed">
            Explore our handpicked library of delightful children’s ebooks designed to spark imagination and foster a love of reading.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild><Link to="/catalog">Browse Catalog</Link></Button>
            <Button variant="outline" asChild><Link to="/about">Learn More</Link></Button>
          </div>
        </div>
        <div className="rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 overflow-hidden">
          <img
            src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNGw0cXprcTFvMDJxOXkzZnZ3cGVva2N0c3N0cXRma3F4YTVzZG9lMiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/gd09ZrT3kBgu4/giphy.gif"
            alt="Cute animated cartoon for small kids"
            className="w-full h-[18rem] md:h-[24rem] object-cover"
          />
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
        <div className="grid xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(p => {
            const sale = typeof p.sale_price_cents === "number" && p.sale_price_cents! >= 0;
            const price = sale ? p.sale_price_cents! : p.price_cents;
            return (
              <Link key={p.id} to={`/product/${p.id}`} className="group bg-white rounded-xl border border-slate-200 hover:border-pink-200 shadow-sm hover:shadow-md transition p-4">
                {p.cover_image_url && (
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-lg mb-3">
                    <img src={p.cover_image_url} alt={p.title} className="h-full w-full object-cover group-hover:scale-[1.02] transition" />
                  </div>
                )}
                <div className="font-semibold line-clamp-1">{p.title}</div>
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

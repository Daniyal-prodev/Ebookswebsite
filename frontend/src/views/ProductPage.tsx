import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGet } from "@/lib/api";
import type { Product } from "./types";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/cart";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  useEffect(() => {
    apiGet<Product>(`/products/${id}`).then(setProduct).catch(console.error);
  }, [id]);
  if (!product) return <div className="max-w-6xl mx-auto px-4 py-10">Loading…</div>;

  const effectivePrice = typeof product.sale_price_cents === "number" && product.sale_price_cents! >= 0
    ? product.sale_price_cents!
    : product.price_cents;

  const onAdd = ()=>{
    addToCart(product.id, 1);
    alert("Added to cart");
  };
  const onBuyNow = ()=>{
    addToCart(product.id, 1);
    window.location.href = "/checkout";
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="space-y-3">
          {product.images && product.images.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {product.images.map((url, i) => (
                <img key={i} src={url} className="rounded-lg shadow object-cover w-full h-40" />
              ))}
            </div>
          ) : (
            product.cover_image_url && <img src={product.cover_image_url} className="rounded-xl shadow" />
          )}
        </div>
        <div>
          <h2 className="text-3xl font-bold">{product.title}</h2>
          <div className="text-slate-600">{product.author}</div>
          <div className="mt-2 text-sm text-slate-500">{product.age_group ? `Age: ${product.age_group}` : null}</div>
          <div className="mt-6 text-2xl font-extrabold flex items-center gap-3">
            <span>${(effectivePrice/100).toFixed(2)}</span>
            {typeof product.sale_price_cents === "number" && product.sale_price_cents! >= 0 && (
              <span className="text-slate-400 line-through text-lg">${(product.price_cents/100).toFixed(2)}</span>
            )}
          </div>
          <div className="mt-4">{product.description}</div>
          {product.description_sections && product.description_sections.length > 0 && (
            <div className="mt-4 space-y-3">
              {product.description_sections.map((section, i) => (
                <p key={i} className="text-slate-700">{section}</p>
              ))}
            </div>
          )}
          {product.tags && product.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.tags.map((t, i) => (
                <span key={i} className="px-2 py-1 text-xs rounded-full bg-pink-100 text-pink-700">{t}</span>
              ))}
            </div>
          )}
          <div className="mt-6 flex gap-3">
            <Button onClick={onAdd}>Add to Cart</Button>
            <Button variant="outline" onClick={onBuyNow}>Buy Now</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

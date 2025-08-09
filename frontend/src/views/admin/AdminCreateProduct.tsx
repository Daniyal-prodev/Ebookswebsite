import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiAuthed } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminCreateProduct(){
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [priceCents, setPriceCents] = useState<number | "">("");
  const [salePriceCents, setSalePriceCents] = useState<number | "">("");
  const [discountPercent, setDiscountPercent] = useState<number | "">("");
  const [categories, setCategories] = useState<string>("");
  const [ageGroup, setAgeGroup] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [images, setImages] = useState<string>("");
  const [descriptionSections, setDescriptionSections] = useState<string>("");
  const [visible, setVisible] = useState(true);
  const [inventory, setInventory] = useState<number | "">("");
  const [tags, setTags] = useState<string>("");
  const [featured, setFeatured] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [downloadableAssetId, setDownloadableAssetId] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("admin_token") || "";

  const syncDiscounts = (base: number | "", sale: number | "", disc: number | "")=>{
    if (base !== "" && sale !== "" && (disc === "" || disc === 0)) {
      const pct = Math.max(0, Math.min(100, Math.round((1 - (sale as number)/(base as number)) * 100)));
      setDiscountPercent(pct);
    } else if (base !== "" && disc !== "" && sale === "") {
      const sp = Math.max(0, Math.round((base as number) * (1 - (disc as number)/100)));
      setSalePriceCents(sp);
    }
  };

  const onSubmit = async ()=>{
    if (title.trim() === "" || author.trim() === "" || description.trim() === "" || priceCents === "") {
      alert("Please fill required fields.");
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        title,
        author,
        description,
        price_cents: Number(priceCents),
        sale_price_cents: salePriceCents === "" ? null : Number(salePriceCents),
        discount_percent: discountPercent === "" ? null : Number(discountPercent),
        categories: categories.split(",").map(s=>s.trim()).filter(Boolean),
        age_group: ageGroup || null,
        cover_image_url: coverImageUrl || null,
        downloadable_asset_id: downloadableAssetId || null,
        visible,
        inventory: inventory === "" ? null : Number(inventory),
        tags: tags.split(",").map(s=>s.trim()).filter(Boolean),
        featured,
        seo_title: seoTitle || null,
        seo_description: seoDescription || null,
        images: images.split(",").map(s=>s.trim()).filter(Boolean),
        description_sections: descriptionSections.split("|").map(s=>s.trim()).filter(Boolean),
      };
      const created = await apiAuthed<any>("POST", "/admin/products", payload, token);
      navigate(`/secret-admin/products/${created.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        <Input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <Input placeholder="Author" value={author} onChange={e=>setAuthor(e.target.value)} />
      </div>
      <Input placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
      <div className="grid md:grid-cols-3 gap-3">
        <Input type="number" placeholder="Price (cents)" value={priceCents} onChange={e=>{ const v = e.target.value === "" ? "" : Number(e.target.value); setPriceCents(v); syncDiscounts(v, salePriceCents, discountPercent); }} />
        <Input type="number" placeholder="Sale Price (cents, optional)" value={salePriceCents} onChange={e=>{ const v = e.target.value === "" ? "" : Number(e.target.value); setSalePriceCents(v); syncDiscounts(priceCents, v, discountPercent); }} />
        <Input type="number" placeholder="Discount Percent (0-100, optional)" value={discountPercent} onChange={e=>{ const v = e.target.value === "" ? "" : Number(e.target.value); setDiscountPercent(v); syncDiscounts(priceCents, salePriceCents, v); }} />
      </div>
      <Input placeholder="Cover Image URL" value={coverImageUrl} onChange={e=>setCoverImageUrl(e.target.value)} />
      <Input placeholder="Gallery Image URLs (comma-separated)" value={images} onChange={e=>setImages(e.target.value)} />
      <div className="flex gap-2 overflow-x-auto py-2">
        {images.split(",").map(s=>s.trim()).filter(Boolean).map((url, i)=>(
          <img key={i} src={url} className="h-20 w-20 object-cover rounded" />
        ))}
      </div>
      <Input placeholder="Extra Description Sections (separate with | )" value={descriptionSections} onChange={e=>setDescriptionSections(e.target.value)} />
      <Input placeholder="Categories (comma-separated)" value={categories} onChange={e=>setCategories(e.target.value)} />
      <Input placeholder="Tags (comma-separated)" value={tags} onChange={e=>setTags(e.target.value)} />
      <Input placeholder="Age group e.g. 4-8" value={ageGroup} onChange={e=>setAgeGroup(e.target.value)} />
      <Input placeholder="Inventory (optional)" value={inventory} onChange={e=>setInventory(e.target.value === "" ? "" : Number(e.target.value))} />
      <Input placeholder="Downloadable Asset ID" value={downloadableAssetId} onChange={e=>setDownloadableAssetId(e.target.value)} />
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={visible} onChange={e=>setVisible(e.target.checked)} />
          <span>Visible</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={featured} onChange={e=>setFeatured(e.target.checked)} />
          <span>Featured</span>
        </label>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <Input placeholder="SEO Title" value={seoTitle} onChange={e=>setSeoTitle(e.target.value)} />
        <Input placeholder="SEO Description" value={seoDescription} onChange={e=>setSeoDescription(e.target.value)} />
      </div>
      <div className="flex gap-3">
        <Button disabled={saving} onClick={onSubmit}>{saving ? "Creating..." : "Create Product"}</Button>
      </div>
    </div>
  );
}

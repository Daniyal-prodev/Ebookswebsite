export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-extrabold">About Kids Ebooks</h1>
      <p className="text-slate-700">
        We curate delightful children’s ebooks that spark imagination, empathy, and a lifelong love of reading.
      </p>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-bold mb-2">Our Mission</h3>
          <p className="text-sm text-slate-600">To make high‑quality children’s literature accessible and joyful for families everywhere.</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-bold mb-2">Curation</h3>
          <p className="text-sm text-slate-600">Handpicked stories with age‑appropriate themes, diverse characters, and beautiful illustrations.</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-bold mb-2">Safety</h3>
          <p className="text-sm text-slate-600">Ad‑free storefront and secure checkouts. Parents stay in control of purchases and downloads.</p>
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-3">FAQs</h2>
        <ul className="space-y-3">
          <li>
            <div className="font-semibold">What formats do you provide?</div>
            <div className="text-sm text-slate-600">Standard PDF/EPUB for easy reading on phones, tablets, and computers.</div>
          </li>
          <li>
            <div className="font-semibold">Do you offer discounts?</div>
            <div className="text-sm text-slate-600">Yes—look for sale badges. Cart totals automatically reflect any discounts.</div>
          </li>
        </ul>
      </div>
    </div>
  );
}

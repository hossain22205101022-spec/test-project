import ProductCard from "@/components/shared/ProductCard";
import type { Product } from "@/types";

interface ShopProductCardsProps {
  products: Product[];
}

export default function ShopProductCards({ products }: ShopProductCardsProps) {
  if (!products || products.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-medium tracking-widest uppercase text-neutral-400">
          Shop this post
        </p>
        <span className="text-[10px] text-neutral-300 tracking-wide">Paid links</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

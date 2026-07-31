import Image from "next/image";
import { Heart } from "lucide-react";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Detect a price-drop hint in the retailer or name field (you can extend this logic)
  const hasPriceDrop = product.retailer?.toLowerCase().includes("sale") ||
    product.retailer?.toLowerCase().includes("deal") ||
    product.name?.toLowerCase().includes("sale");

  return (
    <a
      href={product.affiliate_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative aspect-square flex flex-col bg-white rounded-card overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-200"
    >
      {/* Image area */}
      <div className="relative w-full h-full bg-gray-50">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 180px"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Price drop badge */}
        {hasPriceDrop && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
            Price
            <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 fill-white">
              <path d="M5 8L1 3h8z" />
            </svg>
          </div>
        )}

        {/* Heart button */}
        <button
          onClick={(e) => e.preventDefault()}
          className="absolute bottom-2 right-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Save product"
        >
          <Heart size={16} className="text-gray-400 fill-none hover:fill-red-400 hover:text-red-400 transition-colors" />
        </button>
      </div>
    </a>
  );
}

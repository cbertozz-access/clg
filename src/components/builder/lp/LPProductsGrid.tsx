"use client";

import { useState, useEffect } from "react";

interface Product {
  id: string;
  model: string;
  brand: string;
  category: string;
  subCategory?: string;
  operationalSpecification?: {
    capacityT?: number;
  };
  productImages?: Array<{
    imageThumbUrl?: string;
  }>;
}

export interface LPProductsGridProps {
  sectionTitle?: string;
  apiEndpoint?: string;
  category?: string;
  productsPerRow?: 2 | 3;
  maxProducts?: number;
  showFilters?: boolean;
  viewAllLink?: string;
  viewAllText?: string;
  backgroundColor?: "light" | "white";
}

export function LPProductsGrid({
  sectionTitle = "Featured Equipment",
  apiEndpoint = "https://acccessproducts.netlify.app/api/products",
  category = "Forklift",
  productsPerRow = 3,
  maxProducts = 6,
  showFilters = false,
  viewAllLink = "#",
  viewAllText = "View All Equipment",
  backgroundColor = "light",
}: LPProductsGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await fetch(`${apiEndpoint}?limit=500`);
        const data = await response.json();
        const allProducts = data.products || [];
        const filtered = category
          ? allProducts.filter((p: Product) => p.category === category)
          : allProducts;
        setProducts(filtered.slice(0, maxProducts));
      } catch (err) {
        setError("Failed to load products");
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [apiEndpoint, category, maxProducts]);

  const gridCols = productsPerRow === 2 ? "md:grid-cols-2" : "md:grid-cols-3";
  const bgClass = backgroundColor === "light" ? "bg-[#F3F4F6]" : "bg-white";

  const renderSkeleton = () => (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-5">
        <div className="h-5 bg-gray-200 rounded mb-2 w-3/4" />
        <div className="h-4 bg-gray-200 rounded mb-3 w-1/2" />
        <div className="flex gap-2 mb-4">
          <div className="h-6 bg-gray-200 rounded w-12" />
          <div className="h-6 bg-gray-200 rounded w-16" />
        </div>
        <div className="h-10 bg-gray-200 rounded w-full" />
      </div>
    </div>
  );

  const renderProduct = (product: Product, index: number) => {
    const imageUrl = product.productImages?.[0]?.imageThumbUrl;
    const capacity = product.operationalSpecification?.capacityT
      ? `${product.operationalSpecification.capacityT}T`
      : "";

    let badge = null;
    if (index === 0) {
      badge = (
        <div className="absolute top-3 left-3 bg-[#E63229] text-white text-xs font-semibold px-2 py-1 rounded">
          POPULAR
        </div>
      );
    } else if (product.subCategory?.toLowerCase().includes("electric")) {
      badge = (
        <div className="absolute top-3 left-3 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded">
          ECO OPTION
        </div>
      );
    } else if ((product.operationalSpecification?.capacityT || 0) >= 10) {
      badge = (
        <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded">
          HEAVY DUTY
        </div>
      );
    }

    return (
      <div
        key={product.id || index}
        className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
      >
        <div className="aspect-[4/3] bg-white relative overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.model}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-2 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm">No image</p>
              </div>
            </div>
          )}
          {badge}
        </div>
        <div className="p-5">
          <h3 className="font-bold text-[#1A1A1A] mb-1 group-hover:text-[#E63229] transition-colors">
            {product.model}
          </h3>
          <p className="text-[#6B7280] text-sm mb-3">{product.brand}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {capacity && (
              <span className="text-xs bg-[#F3F4F6] text-[#6B7280] px-2 py-1 rounded">
                {capacity}
              </span>
            )}
            {product.subCategory && (
              <span className="text-xs bg-[#F3F4F6] text-[#6B7280] px-2 py-1 rounded">
                {product.subCategory}
              </span>
            )}
          </div>
          <button className="w-full bg-[#E63229] hover:bg-[#C42920] text-white py-2 rounded-lg font-semibold text-sm transition-colors">
            Get Quote
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className={`py-16 ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h2 className="text-3xl font-bold text-[#1A1A1A]">{sectionTitle}</h2>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              {loading ? "Loading..." : `${products.length} Products`}
            </span>
          </div>
        </div>

        <div className={`grid ${gridCols} gap-6 mb-8`}>
          {loading
            ? Array(maxProducts)
                .fill(0)
                .map((_, i) => <div key={i}>{renderSkeleton()}</div>)
            : error
              ? (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    {error}
                  </div>
                )
              : products.map((product, index) => renderProduct(product, index))}
        </div>

        {viewAllLink && viewAllText && (
          <div className="text-center">
            <a
              href={viewAllLink}
              className="inline-flex items-center gap-2 text-[#E63229] hover:text-[#C42920] font-semibold"
            >
              {viewAllText}
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

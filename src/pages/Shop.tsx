import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import FilterSidebar, { Filters } from "@/components/FilterSidebar";
import ProductCard from "@/components/ProductCard";
import { db } from "@/firebaseConfig";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { Product } from "@/types/Product";
import { User } from "@/types/User";
import { isEqual } from "lodash";
import { useLocation } from "react-router-dom";
import { fetchProductsAndSellers } from "@/controllers/productController";
import { ProductWithSeller } from "@/types/ProductWithSeller";

const Shop = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [products, setProducts] = useState<ProductWithSeller[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductWithSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplyButton, setShowApplyButton] = useState(false);
  const [pendingFilters, setPendingFilters] = useState<Filters | null>(null);
  const appliedFilters = useRef<Filters | null>(null);
  const location = useLocation();
  const { searchResults, searchQuery } = location.state || { searchResults: null, searchQuery: "" };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let productsWithSellers: ProductWithSeller[];
        if (searchResults) {
          productsWithSellers = await Promise.all(
            searchResults.map(async (product: Product) => {
              let seller: User;
              if (product.owner_id) {
                const userDocRef = doc(db, "users", product.owner_id);
                const userDocSnap = await getDoc(userDocRef);
                seller = userDocSnap.exists()
                  ? ({ id: userDocSnap.id, ...userDocSnap.data() } as User)
                  : { id: 'unknown', name: 'Unknown Seller', email: '', listedProducts: [], rating: 0, reviewsCount: 0, itemsSold: 0, createdAt: Timestamp.now() };
              } else {
                seller = { id: 'unknown', name: 'Unknown Seller', email: '', listedProducts: [], rating: 0, reviewsCount: 0, itemsSold: 0, createdAt: Timestamp.now() };
              }
              return { ...product, seller };
            })
          );
        } else {
          productsWithSellers = await fetchProductsAndSellers();
        }
        setProducts(productsWithSellers);
        setFilteredProducts(productsWithSellers);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchResults]);

  const handleFiltersChange = useCallback((newFilters: Filters) => {
    setPendingFilters(newFilters);
    setShowApplyButton(!isEqual(newFilters, appliedFilters.current));
  }, []);

  const applyFilters = useCallback(() => {
    if (!pendingFilters) return;

    let tempFilteredProducts = [...products];

    const minPrice = parseFloat(pendingFilters.minPrice);
    if (!isNaN(minPrice)) {
      tempFilteredProducts = tempFilteredProducts.filter(p => p.price >= minPrice);
    }
    const maxPrice = parseFloat(pendingFilters.maxPrice);
    if (!isNaN(maxPrice)) {
      tempFilteredProducts = tempFilteredProducts.filter(p => p.price <= maxPrice);
    }
    if (pendingFilters.selectedSizes.length > 0) {
      tempFilteredProducts = tempFilteredProducts.filter(p =>
        p.sizes.some(size => pendingFilters.selectedSizes.includes(size))
      );
    }
    if (pendingFilters.selectedConditions.length > 0) {
      tempFilteredProducts = tempFilteredProducts.filter(p =>
        pendingFilters.selectedConditions.includes(p.condition)
      );
    }
    if (pendingFilters.selectedMaterials.length > 0) {
        tempFilteredProducts = tempFilteredProducts.filter(p => {
            if (!p.material) return false;
            const productMaterial = p.material.toLowerCase();
            return pendingFilters.selectedMaterials.some(selectedMaterial =>
                productMaterial.includes(selectedMaterial.toLowerCase())
            );
        });
    }

    setFilteredProducts(tempFilteredProducts);
    appliedFilters.current = pendingFilters;
    setShowApplyButton(false);
  }, [pendingFilters, products]);

  return (
    <div className="flex gap-6">
      <div className="hidden lg:block w-64 flex-shrink-0">
        <FilterSidebar onFiltersChange={handleFiltersChange} />
      </div>

      <div className="flex-1">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {searchResults && filteredProducts.length === 0 && (
              <p>No results found for "{searchQuery}"</p>
            )}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-6"
                  : "space-y-4"
              }
            >
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  price={product.price}
                  image={product.primaryImageUrl || ""}
                  seller={{
                    name: product.seller.name,
                    rating: product.seller.rating,
                    avatar: product.seller.profilePictureUrl,
                  }}
                  condition={product.condition}
                  size={product.sizes[0]}
                  category={product.category}
                />
              ))}
            </div>
          </>
        )}
      </div>
      
      <div
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 transition-transform duration-300 ease-in-out ${
          showApplyButton ? "translate-y-0" : "translate-y-[200%]"
        }`}
      >
        <Button onClick={applyFilters} size="lg" variant="premium">
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default Shop;
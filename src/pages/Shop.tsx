import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import FilterSidebar, { Filters } from "@/components/FilterSidebar";
import ProductCard from "@/components/ProductCard";
import { db } from "@/firebaseConfig";
import { collection, getDocs, doc, getDoc, Timestamp } from "firebase/firestore";
import { Product } from "@/types/Product";
import { User } from "@/types/User";
import { isEqual } from "lodash";
import { useLocation } from "react-router-dom";

interface ProductWithSeller extends Product {
  seller: User;
}

const Shop = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [allProducts, setAllProducts] = useState<ProductWithSeller[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductWithSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplyButton, setShowApplyButton] = useState(false);
  const [pendingFilters, setPendingFilters] = useState<Filters | null>(null);
  const appliedFilters = useRef<Filters | null>(null);
  const location = useLocation();
  const { searchResults, searchQuery } = location.state || { searchResults: null, searchQuery: "" };

  useEffect(() => {
    const fetchProductsAndSellers = async () => {
      setLoading(true);
      try {
        const productsSnapshot = await getDocs(collection(db, "products"));
        const productsData = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

        const productsWithSellers: ProductWithSeller[] = await Promise.all(
          productsData.map(async (product) => {
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
        setAllProducts(productsWithSellers);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndSellers();
  }, []);

  useEffect(() => {
    if (searchResults) {
      const fetchSellersForResults = async () => {
        const resultsWithSellers: ProductWithSeller[] = await Promise.all(
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
        setFilteredProducts(resultsWithSellers);
      };
      fetchSellersForResults();
    } else {
      setFilteredProducts(allProducts);
    }
  }, [searchResults, allProducts]);

  const handleFiltersChange = useCallback((newFilters: Filters) => {
    setPendingFilters(newFilters);
    setShowApplyButton(!isEqual(newFilters, appliedFilters.current));
  }, []);

  const applyFilters = useCallback(() => {
    if (!pendingFilters) return;

    let tempFilteredProducts = searchResults ? [...searchResults] : [...allProducts];

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
      tempFilteredProducts = tempFilteredProducts.filter(p =>
        p.material && pendingFilters.selectedMaterials.includes(p.material)
      );
    }

    setFilteredProducts(tempFilteredProducts);
    appliedFilters.current = pendingFilters;
    setShowApplyButton(false);
  }, [pendingFilters, allProducts, searchResults]);

  const productsToDisplay = searchResults ? filteredProducts : allProducts;

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
            {searchResults && productsToDisplay.length === 0 && (
              <p>No results found for "{searchQuery}"</p>
            )}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-6"
                  : "space-y-4"
              }
            >
              {productsToDisplay.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  price={product.price}
                  image={product.imageUrls[0]}
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
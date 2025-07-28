import { useState, useEffect } from "react";
import { Search, Grid, List, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import Header from "@/components/Header";
import FilterSidebar from "@/components/FilterSidebar";
import ProductCard from "@/components/ProductCard";
import { db } from "@/firebaseConfig";
import { collection, getDocs, doc, getDoc, Timestamp } from "firebase/firestore";
import { Product } from "@/types/Product";
import { User } from "@/types/User";

interface ProductWithSeller extends Product {
  seller: User;
}

const Shop = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<ProductWithSeller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductsAndSellers = async () => {
      setLoading(true);
      try {
        const productsSnapshot = await getDocs(collection(db, "products"));
        const productsData = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

        const productsWithSellers: ProductWithSeller[] = [];
        for (const product of productsData) {
          let seller: User;
          if (product.owner_id) {
            const userDocRef = doc(db, "users", product.owner_id);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              seller = { id: userDocSnap.id, ...userDocSnap.data() } as User;
            } else {
              // Seller not found, use placeholder
              seller = { id: 'unknown', name: 'Unknown Seller', email: '', listedProducts: [], rating: 0, reviewsCount: 0, itemsSold: 0, createdAt: Timestamp.now() };
            }
          } else {
            // No owner_id on product, use placeholder
            seller = { id: 'unknown', name: 'Unknown Seller', email: '', listedProducts: [], rating: 0, reviewsCount: 0, itemsSold: 0, createdAt: Timestamp.now() };
          }
          productsWithSellers.push({
            ...product,
            seller,
          });
        }
        setProducts(productsWithSellers);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndSellers();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6">
        {/* ... (Breadcrumb, Search, and Filter Header) */}

        <div className="flex gap-6">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <FilterSidebar />
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* ... (Results Count) */}

            {loading ? (
              <p>Loading...</p>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {products.map((product) => (
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
            )}

            {/* ... (Load More Button) ... */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;

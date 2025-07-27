import { useState } from "react";
import { Search, Grid, List, Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Header from "@/components/Header";
import FilterSidebar from "@/components/FilterSidebar";
import ProductCard from "@/components/ProductCard";

// Import generated images
import kurtaGreen from "@/assets/kurta-green.jpg";
import kimonoBurgundy from "@/assets/kimono-burgundy.jpg";
import dashikiOrange from "@/assets/dashiki-orange.jpg";
import huipilWhite from "@/assets/huipil-white.jpg";

const Shop = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");

  // Sample products data
  const products = [
    {
      id: "1",
      title: "Vintage Silk Kurta with Intricate Embroidery",
      price: 89,
      image: kurtaGreen,
      seller: { name: "Priya Sharma", rating: 4.8 },
      condition: "Excellent",
      size: "M",
      category: "Kurta"
    },
    {
      id: "2", 
      title: "Traditional Japanese Kimono - Crane Pattern",
      price: 145,
      image: kimonoBurgundy,
      seller: { name: "Yuki Tanaka", rating: 4.9 },
      condition: "Like New",
      size: "L",
      category: "Kimono"
    },
    {
      id: "3",
      title: "Authentic African Dashiki - Geometric Design",
      price: 65,
      image: dashikiOrange,
      seller: { name: "Kwame Asante", rating: 4.7 },
      condition: "Good",
      size: "L",
      category: "Dashiki"
    },
    {
      id: "4",
      title: "Hand-Embroidered Mexican Huipil",
      price: 95,
      image: huipilWhite,
      seller: { name: "Maria Gonzalez", rating: 4.6 },
      condition: "Excellent",
      size: "S",
      category: "Huipil"
    },
    {
      id: "5",
      title: "Royal Blue Silk Kurta - Wedding Edition",
      price: 120,
      image: kurtaGreen,
      seller: { name: "Raj Patel", rating: 4.5 },
      condition: "Excellent",
      size: "XL",
      category: "Kurta"
    },
    {
      id: "6",
      title: "Cherry Blossom Kimono - Spring Collection",
      price: 165,
      image: kimonoBurgundy,
      seller: { name: "Sakura Miyamoto", rating: 4.9 },
      condition: "Like New",
      size: "M",
      category: "Kimono"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <span>Home</span>
          <span>/</span>
          <span>Shop</span>
          {searchTerm && (
            <>
              <span>/</span>
              <span>Search Results for "{searchTerm}"</span>
            </>
          )}
        </div>

        {/* Search and Filter Header */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search for traditional clothes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Sort and View Options */}
          <div className="flex items-center space-x-2">
            <Select defaultValue="relevance">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none border-l"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <FilterSidebar />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <FilterSidebar />
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                Showing {products.length} of {products.length} results
                {searchTerm && ` for "${searchTerm}"`}
              </p>
            </div>

            {/* Products */}
            <div className={
              viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
                : "space-y-4"
            }>
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  {...product}
                />
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More Products
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
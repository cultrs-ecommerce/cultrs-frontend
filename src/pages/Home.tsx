import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { useEffect, useState } from "react";
import { getLatestListings } from "@/controllers/productController";
import Header from "@/components/Header";
import { ProductWithSeller } from "@/types/ProductWithSeller";

const Home = () => {
  const [clothingListings, setClothingListings] = useState<ProductWithSeller[]>([]);
  const [nonClothingListings, setNonClothingListings] = useState<ProductWithSeller[]>([]);

  useEffect(() => {
    const fetchLatestListings = async () => {
      const [clothing, nonClothing] = await getLatestListings(4);
      setClothingListings(clothing);
      setNonClothingListings(nonClothing);
    };
    fetchLatestListings();
  }, []);

  return (
    <div className="bg-background">
      <Header />
      {/* Hero Section */}
      <section className="hero-gradient py-20 px-4 -mt-8">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Thrifting but{" "}
            <span className="text-primary">Cultred</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover & sell pre-loved ethnic wear from around the globe.
            Give beautiful garments a new story.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="premium">
              <Link to="/shop">
                Shop Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/sell">Start Selling</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Newly Added
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Fresh additions to our marketplace. Be the first to discover these unique pieces.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {clothingListings.map((product) => (
               <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                price={product.price}
                image={product.primaryImageUrl}
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

          <div className="text-center">
            <Button asChild style={{background: "white"}} variant="outline" size="lg">
              <Link to="/shop">Explore All New Items</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Non Clothing Section */}
      <section className="py-16">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Discover Accessories & More
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore a curated selection of accessories, home decor, and jewelry to complement your style.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {nonClothingListings.map((product) => (
               <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                price={product.price}
                image={product.primaryImageUrl}
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

          <div className="text-center">
            <Button asChild style={{background: "white"}} variant="outline" size="lg">
              <Link to="/shop">Explore All New Items</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Have Something You Want To Sell?
            </h2>
            <p className="text-xl text-muted-foreground">
              Earn money while preserving cultural heritage.
            </p>
            <Button asChild size="lg" variant="premium">
              <Link to="/sell">
                Start Selling Today <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background  px-4 py-12 -mb-8">
        <div className="container mx-auto text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">Heritage</h3>
            <p className="text-background/80 max-w-md mx-auto">
              Connecting cultures through traditional clothing.
              Sustainable fashion with a story.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div>
              <h4 className="font-semibold mb-3">Shop</h4>
              <div className="space-y-2 text-sm text-background/80">
                <div>Browse All</div>
                <div>Categories</div>
                <div>New Arrivals</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Sell</h4>
              <div className="space-y-2 text-sm text-background/80">
                <div>Start Selling</div>
                <div>Seller Guide</div>
                <div>Pricing Tips</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <div className="space-y-2 text-sm text-background/80">
                <div>Help Center</div>
                <div>Contact Us</div>
                <div>Returns</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <div className="space-y-2 text-sm text-background/80">
                <div>About Us</div>
                <div>Careers</div>
                <div>Press</div>
              </div>
            </div>
          </div>

          <div className="text-sm text-background/60">
            © 2025 Cultrs.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

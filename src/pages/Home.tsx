import { ArrowRight, TrendingUp, Award, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";

// Import generated images
import kurtaGreen from "@/assets/kurta-green.jpg";
import kimonoBurgundy from "@/assets/kimono-burgundy.jpg";
import dashikiOrange from "@/assets/dashiki-orange.jpg";
import huipilWhite from "@/assets/huipil-white.jpg";
import Header from "@/components/Header";

const Home = () => {
  // Sample product data
  const featuredProducts = [
    {
      id: "1",
      title: "Vintage Silk Kurta with Intricate Embroidery",
      price: 89,
      image: kurtaGreen,
      seller: { name: "Priya Sharma", rating: 4.8 },
      condition: "Excellent",
      size: "M",
      category: "Kurta",
      featured: true
    },
    {
      id: "2", 
      title: "Traditional Japanese Kimono - Crane Pattern",
      price: 145,
      image: kimonoBurgundy,
      seller: { name: "Yuki Tanaka", rating: 4.9 },
      condition: "Like New",
      size: "L",
      category: "Kimono",
      featured: true
    },
    {
      id: "3",
      title: "Authentic African Dashiki - Geometric Design",
      price: 65,
      image: dashikiOrange,
      seller: { name: "Kwame Asante", rating: 4.7 },
      condition: "Good",
      size: "L",
      category: "Dashiki",
      featured: true
    }
  ];

  const newArrivals = [
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
      title: "Vintage Silk Kurta - Forest Green",
      price: 78,
      image: kurtaGreen,
      seller: { name: "Raj Patel", rating: 4.5 },
      condition: "Good",
      size: "XL",
      category: "Kurta"
    },
    {
      id: "6",
      title: "Traditional Kimono - Cherry Blossom",
      price: 165,
      image: kimonoBurgundy,
      seller: { name: "Sakura Miyamoto", rating: 4.9 },
      condition: "Like New",
      size: "M",
      category: "Kimono"
    }
  ];

  return (
    <div className="bg-background">
      <Header />
      {/* Hero Section */}
      <section className="hero-gradient py-20 px-4 -mt-8">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Timeless Traditions,{" "}
            <span className="text-primary">Reimagined</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover & sell pre-loved ethnic wear from around the globe. 
            Give beautiful garments a new story.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="premium">
              <Link to="/shop">
                Discover Collection <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/sell">Start Selling</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-muted/30 px-4 py-16">
        <div className="container mx-auto ">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <TrendingUp className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-3xl font-bold text-foreground">10k+</h3>
              <p className="text-muted-foreground">Items Sold</p>
            </div>
            <div className="space-y-2">
              <Users className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-3xl font-bold text-foreground">5k+</h3>
              <p className="text-muted-foreground">Happy Customers</p>
            </div>
            <div className="space-y-2">
              <Award className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-3xl font-bold text-foreground">4.8</h3>
              <p className="text-muted-foreground">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured from Top Sellers */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Featured from Top Sellers
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Handpicked pieces from our highest-rated sellers, known for their quality and authenticity.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
          
          <div className="text-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/shop">View All Featured Items</Link>
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
            {newArrivals.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
          
          <div className="text-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/shop">Explore All New Items</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Have Traditional Clothes to Sell?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join our community of sellers and give your beautiful garments a new home.
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
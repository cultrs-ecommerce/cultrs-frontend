import { useState, useEffect } from "react";
import {
  Heart,
  Star,
  ArrowLeft,
  Share2,
  Shield,
  Truck,
  RotateCcw,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { Product } from "@/types/Product";

// Sample data for similar products and reviews (can be replaced with dynamic data)
import kimonoBurgundy from "@/assets/kimono-burgundy.jpg";
import dashikiOrange from "@/assets/dashiki-orange.jpg";

const similarProducts = [
  {
    id: "2",
    title: "Traditional Japanese Kimono",
    price: 145,
    image: kimonoBurgundy,
    seller: { name: "Yuki Tanaka", rating: 4.9 },
    condition: "Like New",
    size: "L",
    category: "Kimono",
  },
  {
    id: "3",
    title: "African Dashiki Shirt",
    price: 65,
    image: dashikiOrange,
    seller: { name: "Kwame Asante", rating: 4.7 },
    condition: "Good",
    size: "L",
    category: "Dashiki",
  },
];

const reviews = [
  {
    id: 1,
    user: "Sarah Chen",
    rating: 5,
    date: "2024-01-15",
    comment:
      "Beautiful item! The embroidery is stunning and the fit is perfect. The seller was very responsive and shipped quickly.",
  },
  {
    id: 2,
    user: "Michael Rodriguez",
    rating: 4,
    date: "2024-01-10",
    comment:
      "Good quality piece. Exactly as described. Would recommend this seller.",
  },
];

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        } else {
          console.log("No such document!");
          // Handle product not found
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-6 text-center">
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Link to="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  const seller = {
    // Placeholder seller data
    name: "Priya Sharma",
    rating: 4.8,
    reviews: 127,
    avatar: "",
    joinedDate: "2022",
    location: "Mumbai, India",
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <Link
          to="/shop"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-smooth"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={product.imageUrls[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="flex space-x-2">
              {product.imageUrls.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-smooth ${
                    selectedImage === index ? "border-primary" : "border-border"
                  }`}
                >
                  <img
                    src={image}
                    alt={`View ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary">{product.category}</Badge>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsFavorited(!isFavorited)}
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        isFavorited ? "fill-primary text-primary" : ""
                      }`}
                    />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-foreground mb-4">
                {product.title}
              </h1>

              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-primary">
                  ${product.price}
                </span>
              </div>
            </div>

            {/* Size & Condition */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Size:</span>
                <span>{product.sizes.join(", ")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Condition:</span>
                <Badge
                  variant={
                    product.condition === "Good" ? "default" : "secondary"
                  }
                >
                  {product.condition}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Add to Cart */}
            <div className="space-y-3">
              <Button size="lg" className="w-full" variant="premium">
                Add to Cart - ${product.price}
              </Button>
              <Button size="lg" variant="outline" className="w-full">
                Message Seller
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <Shield className="h-6 w-6 text-primary mx-auto" />
                <span className="text-xs text-muted-foreground">
                  Buyer Protection
                </span>
              </div>
              <div className="space-y-2">
                <Truck className="h-6 w-6 text-primary mx-auto" />
                <span className="text-xs text-muted-foreground">
                  Fast Shipping
                </span>
              </div>
              <div className="space-y-2">
                <RotateCcw className="h-6 w-6 text-primary mx-auto" />
                <span className="text-xs text-muted-foreground">
                  Easy Returns
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Seller Info */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Seller Information</h3>
          <div className="flex items-start space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback>
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-semibold text-lg">{seller.name}</h4>
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="ml-1 font-medium">{seller.rating}</span>
                </div>
                <span className="text-muted-foreground">
                  ({seller.reviews} reviews)
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                Joined {seller.joinedDate} • {seller.location}
              </p>
            </div>
            <Button variant="outline">View Profile</Button>
          </div>
        </Card>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Description</h3>
            <p className="text-muted-foreground">{product.description}</p>

            <Separator className="my-4" />

            <div className="space-y-2">
              {product.material && (
                <div className="flex justify-between">
                  <span className="font-medium">Material:</span>
                  <span>{product.material}</span>
                </div>
              )}
              {product.careInstructions && (
                <div className="flex justify-between">
                  <span className="font-medium">Care:</span>
                  <span>{product.careInstructions}</span>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Measurements</h3>
            <p className="text-muted-foreground">
              No measurement data available.
            </p>
          </Card>
        </div>

        {/* Reviews */}
        <Card className="p-6 mb-12">
          <h3 className="text-lg font-semibold mb-6">Recent Reviews</h3>
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border-b border-border last:border-b-0 pb-4 last:pb-0"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{review.user}</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "fill-accent text-accent"
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {review.date}
                  </span>
                </div>
                <p className="text-muted-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Similar Items */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">You Might Also Like</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarProducts.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

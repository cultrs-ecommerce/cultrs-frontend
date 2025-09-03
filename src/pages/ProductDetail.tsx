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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useParams, Link, useNavigate } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { db } from "@/firebaseConfig";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { Product } from "@/types/Product";
import { ProductImage } from "@/types/ProductImage"; // Import ProductImage
import { User as UserType } from "@/types/User";
import { useAuth } from "@/hooks/useAuth";
import { createChat } from "@/controllers/chatController";
import { useAnalytics } from "@/hooks/useAnalytics";
import { getProductWithImages, fetchSellerProducts } from "@/controllers/productController"; // Import getProductWithImages
import {
  fetchZipCodeData,
  getCity,
  getState,
} from "@/lib/zipCodeApi";

type ProductWithImages = Product & { images: ProductImage[] };

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductWithImages | null>(null);
  const [seller, setSeller] = useState<UserType | null>(null);
  const [sellerLocation, setSellerLocation] = useState<string>(
    "Location not specified",
  );
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { trackProductView } = useAnalytics();

  useEffect(() => {
    const fetchProductAndSeller = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const productData = await getProductWithImages(id);

        console.log(productData);
        console.log(id);

        if (productData) {
          setProduct(productData);

          if (user && productData.id) {
            trackProductView(user.id, productData.id);
          }

          if (productData.owner_id) {
            const sellerDocRef = doc(db, "users", productData.owner_id);
            const sellerDocSnap = await getDoc(sellerDocRef);
            if (sellerDocSnap.exists()) {
              const sellerData = {
                id: sellerDocSnap.id,
                ...sellerDocSnap.data(),
              } as UserType;
              setSeller(sellerData);

              if (sellerData.zipCode) {
                const locationData = await fetchZipCodeData(sellerData.zipCode);
                const city = getCity(locationData);
                const state = getState(locationData);
                if (city && state) {
                  setSellerLocation(`From ${city}, ${state}`);
                }
              }

              if (productData.id) {
                const products = await fetchSellerProducts(
                  sellerData.id,
                  productData.id,
                );
                setSellerProducts(products);
              }

            } else {
              setSeller({
                id: "unknown",
                name: "Unknown Seller",
                email: "",
                listedProducts: [],
                rating: 0,
                reviewsCount: 0,
                itemsSold: 0,
                createdAt: Timestamp.now(),
              });
            }
          }
        } else {
          console.log("No such product!");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndSeller();
  }, [id, user, trackProductView]);

  const handleMessageSeller = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (seller && seller.id !== "unknown" && seller.id !== user.id) {
      try {
        const chatId = await createChat(user.id, seller.id);
        navigate(`/chat`);
      } catch (error) {
        console.error("Failed to create or navigate to chat:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <p>Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <Link to="/shop">
          <Button>Back to Shop</Button>
        </Link>
      </div>
    );
  }

  const isOwnProduct = user && product.owner_id === user.id;

  return (
    <div>
      <Link
        to="/shop"
        className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-smooth"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        {/* Images */}
        <div className="flex flex-col-reverse md:flex-row gap-4">
          <div className="flex md:flex-col gap-2">
            {product.images.map((image, index) => (
              <button
                key={image.id || index}
                onClick={() => setSelectedImage(index)}
                className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-smooth ${
                  selectedImage === index ? "border-primary" : "border-border"
                } bg-white`}
              >
                <img
                  src={image.imageData}
                  alt={`View ${index + 1}`}
                  className="w-full h-full object-contain"
                />
              </button>
            ))}
          </div>

          <div className="flex-1 rounded-lg overflow-hidden bg-white aspect-square">
            {product.images.length > 0 && (
              <img
                src={product.images[selectedImage].imageData}
                alt={product.title}
                className="w-full h-full object-contain"
              />
            )}
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
                ${product.price.toFixed(2)}
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
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={handleMessageSeller}
              disabled={isOwnProduct}
            >
              {isOwnProduct ? "This is your listing" : "Message Seller"}
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
      {seller && (
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Seller Information</h3>
          <div className="flex items-start space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={seller.profilePictureUrl} />
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
                  ({seller.reviewsCount} reviews)
                </span>
              </div>
              <p className="text-muted-foreground text-sm">{sellerLocation}</p>
            </div>
            <Button variant="outline">View Profile</Button>
          </div>
        </Card>
      )}

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
            {product.brand && (
              <div className="flex justify-between">
                <span className="font-medium">Brand:</span>
                <span>{product.brand}</span>
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
            No measurement data available for this item.
          </p>
        </Card>
      </div>

      {/* More From This Seller */}
      {sellerProducts.length > 0 && (
        <div>
          <h3 className="text-2xl font-semibold mb-6">
            More From {seller?.name || "This Seller"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellerProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                title={p.title}
                price={p.price}
                image={p.primaryImageUrl || ""}
                seller={{
                  name: seller?.name || "Unknown",
                  rating: seller?.rating || 0,
                  avatar: seller?.profilePictureUrl || "",
                }}
                condition={p.condition}
                size={p.sizes.join(", ")}
                category={p.category}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;

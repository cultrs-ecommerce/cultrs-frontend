import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  image: string;
  seller: {
    name: string;
    rating: number;
    avatar?: string;
  };
  condition: string;
  size: string;
  category: string;
  featured?: boolean;
}

const ProductCard = ({
  id,
  title,
  price,
  image,
  seller,
  condition,
  size,
  featured = false,
}: ProductCardProps) => {
  return (
    (<Link to={`/product/${id}`} className="product-card overflow-hidden group">
      <div
        className={`relative ${featured ? "ring-2 ring-primary/20" : ""} bg-white`}
      >
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="w-full h-48 object-contain transition-smooth group-hover:scale-105"
        />

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white backdrop-blur-sm"
          // Prevent link navigation when clicking button
          onClick={(e) => e.preventDefault()}
        >
          <Heart className="h-4 w-4" />
        </Button>

        {/* Condition Badge */}
        <Badge
          variant={condition === "Excellent" ? "default" : "secondary"}
          className="absolute top-2 left-2"
        >
          {condition}
        </Badge>

        {featured && (
          <Badge className="absolute bottom-2 left-2 bg-accent text-accent-foreground">
            Featured
          </Badge>
        )}
      </div>

      <div className="p-4">
        {/* Category & Size */}
        <div className="flex justify-between items-center">
          <span className="font-semibold text-md text-foreground group-hover:text-primary transition-smooth line-clamp-2">
            {title}
          </span>
          <span className="text-xs font-medium">Size {size}</span>
        </div>

        {/* Seller Info */}
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-xs text-muted-foreground">{seller.name}</span>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">${price}</span>
          <Button
            variant="warm"
            size="sm"
            // Prevent link navigation when clicking button
            onClick={(e) => e.preventDefault()}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </Link>)
  );
};

export default ProductCard;

import { Heart, Star, User } from "lucide-react";
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
  category,
  featured = false 
}: ProductCardProps) => {
  return (
    <div className={`product-card overflow-hidden group ${featured ? 'ring-2 ring-primary/20' : ''}`}>
      <div className="relative">
        <Link to={`/product/${id}`}>
          <img
            src={image}
            alt={title}
            className="w-full h-64 object-cover transition-smooth group-hover:scale-105"
          />
        </Link>
        
        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white backdrop-blur-sm"
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
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">{category}</span>
          <span className="text-sm font-medium">Size {size}</span>
        </div>

        {/* Title */}
        <Link to={`/product/${id}`}>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-smooth mb-2 line-clamp-2">
            {title}
          </h3>
        </Link>

        {/* Seller Info */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
            {seller.avatar ? (
              <img src={seller.avatar} alt={seller.name} className="w-6 h-6 rounded-full" />
            ) : (
              <User className="h-3 w-3" />
            )}
          </div>
          <span className="text-sm text-muted-foreground">{seller.name}</span>
          <div className="flex items-center">
            <Star className="h-3 w-3 fill-accent text-accent" />
            <span className="text-xs text-muted-foreground ml-1">{seller.rating}</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">${price}</span>
          <Button variant="warm" size="sm">
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
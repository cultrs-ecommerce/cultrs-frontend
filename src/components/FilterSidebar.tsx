import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface FilterSidebarProps {
  onFiltersChange?: (filters: any) => void;
}

const FilterSidebar = ({ onFiltersChange }: FilterSidebarProps) => {
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);

  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
  const conditions = ["Excellent", "Good", "Fair", "Like New"];
  const categories = ["Kurta", "Kimono", "Dashiki", "Huipil", "Saree", "Hanbok", "Cheongsam"];

  const handleSizeChange = (size: string, checked: boolean) => {
    if (checked) {
      setSelectedSizes([...selectedSizes, size]);
    } else {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    }
  };

  const handleConditionChange = (condition: string, checked: boolean) => {
    if (checked) {
      setSelectedConditions([...selectedConditions, condition]);
    } else {
      setSelectedConditions(selectedConditions.filter(c => c !== condition));
    }
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    }
  };

  const clearFilters = () => {
    setPriceRange([0, 500]);
    setSelectedSizes([]);
    setSelectedConditions([]);
    setSelectedCategories([]);
    setMinRating(0);
  };

  return (
    <Card className="p-6 sticky top-24">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Filters</h3>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        </div>

        <Separator />

        {/* Price Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Price Range</Label>
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={500}
            step={10}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>

        <Separator />

        {/* Size */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Size</Label>
          <div className="grid grid-cols-2 gap-2">
            {sizes.map((size) => (
              <div key={size} className="flex items-center space-x-2">
                <Checkbox
                  id={`size-${size}`}
                  checked={selectedSizes.includes(size)}
                  onCheckedChange={(checked) => handleSizeChange(size, checked as boolean)}
                />
                <Label htmlFor={`size-${size}`} className="text-sm">{size}</Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Condition */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Condition</Label>
          <div className="space-y-2">
            {conditions.map((condition) => (
              <div key={condition} className="flex items-center space-x-2">
                <Checkbox
                  id={`condition-${condition}`}
                  checked={selectedConditions.includes(condition)}
                  onCheckedChange={(checked) => handleConditionChange(condition, checked as boolean)}
                />
                <Label htmlFor={`condition-${condition}`} className="text-sm">{condition}</Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Category */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Category</Label>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                />
                <Label htmlFor={`category-${category}`} className="text-sm">{category}</Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Seller Rating */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Minimum Seller Rating</Label>
          <Slider
            value={[minRating]}
            onValueChange={(value) => setMinRating(value[0])}
            max={5}
            step={0.5}
            className="w-full"
          />
          <div className="text-sm text-muted-foreground">
            {minRating} stars and above
          </div>
        </div>

        {/* Apply Filters */}
        <Button className="w-full" variant="premium">
          Apply Filters
        </Button>
      </div>
    </Card>
  );
};

export default FilterSidebar;
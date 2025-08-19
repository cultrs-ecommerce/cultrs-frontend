import { useState, ChangeEvent, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export interface Filters {
  minPrice: string;
  maxPrice: string;
  selectedSizes: string[];
  selectedConditions: string[];
  selectedMaterials: string[];
}

interface FilterSidebarProps {
  onFiltersChange: (filters: Filters) => void;
}

const FilterSidebar = ({ onFiltersChange }: FilterSidebarProps) => {
  const [filters, setFilters] = useState<Filters>({
    minPrice: "0",
    maxPrice: "2000",
    selectedSizes: [],
    selectedConditions: [],
    selectedMaterials: [],
  });
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      onFiltersChange(filters);
    }
  }, [filters, onFiltersChange]);

  const handlePriceChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: "min" | "max"
  ) => {
    const value = e.target.value;
    setFilters((prev) => ({
      ...prev,
      [type === "min" ? "minPrice" : "maxPrice"]: value,
    }));
  };

  const handleCheckboxChange = (
    category: "selectedSizes" | "selectedConditions" | "selectedMaterials",
    value: string,
    checked: boolean
  ) => {
    setFilters((prev) => {
      const currentValues = prev[category];
      const newValues = checked
        ? [...currentValues, value]
        : currentValues.filter((item) => item !== value);
      return { ...prev, [category]: newValues };
    });
  };

  const clearFilters = () => {
    setFilters({
      minPrice: "0",
      maxPrice: "2000",
      selectedSizes: [],
      selectedConditions: [],
      selectedMaterials: [],
    });
  };

  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
  const conditions = ["New with tags", "Excellent", "Good", "Fair"];
  const materials = ["Cotton", "Silk", "Polyester", "Linen", "Wool", "Rayon"];

  return (
    <Card className="p-6 sticky top-24">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Filters</h3>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">Price Range</Label>
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="min-price" className="text-xs text-muted-foreground">Min</Label>
              <Input
                id="min-price"
                type="number"
                min="0"
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) => handlePriceChange(e, "min")}
                className="w-full"
              />
            </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor="max-price" className="text-xs text-muted-foreground">Max</Label>
              <Input
                id="max-price"
                type="number"
                min="0"
                placeholder="500"
                value={filters.maxPrice}
                onChange={(e) => handlePriceChange(e, "max")}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">Size</Label>
          <div className="grid grid-cols-2 gap-2">
            {sizes.map((size) => (
              <div key={size} className="flex items-center space-x-2">
                <Checkbox
                  id={`size-${size}`}
                  checked={filters.selectedSizes.includes(size)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("selectedSizes", size, checked as boolean)
                  }
                />
                <Label htmlFor={`size-${size}`} className="text-sm">{size}</Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">Condition</Label>
          <div className="space-y-2">
            {conditions.map((condition) => (
              <div key={condition} className="flex items-center space-x-2">
                <Checkbox
                  id={`condition-${condition}`}
                  checked={filters.selectedConditions.includes(condition)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("selectedConditions", condition, checked as boolean)
                  }
                />
                <Label htmlFor={`condition-${condition}`} className="text-sm">{condition}</Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">Material</Label>
          <div className="space-y-2">
            {materials.map((material) => (
              <div key={material} className="flex items-center space-x-2">
                <Checkbox
                  id={`material-${material}`}
                  checked={filters.selectedMaterials.includes(material)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("selectedMaterials", material, checked as boolean)
                  }
                />
                <Label htmlFor={`material-${material}`} className="text-sm">{material}</Label>
              </div>
            ))}
          </div>
        </div>

        
      
        
        {/* <Separator /> */}

        {/* Category */}
        {/* <div className="space-y-3">
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
        </div> */}

        {/* Seller Rating */}
        {/* <div className="space-y-3">
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
        </div> */}

        {/* <Separator /> */}

      </div>
    </Card>

    

  );
};

export default FilterSidebar;
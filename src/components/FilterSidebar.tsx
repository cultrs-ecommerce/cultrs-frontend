import { useState, ChangeEvent, useEffect } from "react";
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
  const [minPrice, setMinPrice] = useState("0");
  const [maxPrice, setMaxPrice] = useState("2000");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);

  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
  const conditions = ["New with tags", "Excellent", "Good", "Fair"];
  const materials = ["Cotton", "Silk", "Polyester", "Linen", "Wool", "Rayon"];
  const categories = [
    "Kurta",
    "Kimono",
    "Dashiki",
    "Huipil",
    "Saree",
    "Hanbok",
    "Cheongsam",
  ];

  useEffect(() => {
    // onFilterChange();
  }, [
    minPrice,
    maxPrice,
    selectedSizes,
    selectedConditions,
    selectedCategories,
    selectedMaterials,
    minRating,
  ]);

  const handleSizeChange = (size: string, checked: boolean) => {
    if (checked) {
      setSelectedSizes([...selectedSizes, size]);
    } else {
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
    }
  };

  const handleConditionChange = (condition: string, checked: boolean) => {
    if (checked) {
      setSelectedConditions([...selectedConditions, condition]);
    } else {
      setSelectedConditions(selectedConditions.filter((c) => c !== condition));
    }
  };

  const handleMaterialChange = (material: string, checked: boolean) => {
    if (checked) {
      setSelectedMaterials([...selectedMaterials, material]);
    } else {
      setSelectedMaterials(selectedMaterials.filter((m) => m !== material));
    }
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    }
  };

  const handlePriceChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: "min" | "max"
  ) => {
    const value = e.target.value;
    // Allow empty string for user input flexibility, but treat as 0 for logic
    const numericValue = value === "" ? 0 : parseInt(value, 10);

    if (numericValue < 0) return; // Prevent negative values

    if (type === "min") {
      setMinPrice(value);
    } else {
      setMaxPrice(value);
    }
  };

  const clearFilters = () => {
    setMinPrice("0");
    setMaxPrice("2000");
    setSelectedSizes([]);
    setSelectedConditions([]);
    setSelectedCategories([]);
    setSelectedMaterials([]);
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
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-1">
              <Label
                htmlFor="min-price"
                className="text-xs text-muted-foreground"
              >
                Min
              </Label>
              <Input
                id="min-price"
                type="number"
                min="0"
                placeholder="0"
                value={minPrice}
                onChange={(e) => handlePriceChange(e, "min")}
                className="w-full"
              />
            </div>
            <div className="flex-1 space-y-1">
              <Label
                htmlFor="max-price"
                className="text-xs text-muted-foreground"
              >
                Max
              </Label>
              <Input
                id="max-price"
                type="number"
                min="0"
                placeholder="500"
                value={maxPrice}
                onChange={(e) => handlePriceChange(e, "max")}
                className="w-full"
              />
            </div>
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
                  onCheckedChange={(checked) =>
                    handleSizeChange(size, checked as boolean)
                  }
                />
                <Label htmlFor={`size-${size}`} className="text-sm">
                  {size}
                </Label>
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
                  onCheckedChange={(checked) =>
                    handleConditionChange(condition, checked as boolean)
                  }
                />
                <Label htmlFor={`condition-${condition}`} className="text-sm">
                  {condition}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Material */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Material</Label>
          <div className="space-y-2">
            {materials.map((material) => (
              <div key={material} className="flex items-center space-x-2">
                <Checkbox
                  id={`material-${material}`}
                  checked={selectedMaterials.includes(material)}
                  onCheckedChange={(checked) =>
                    handleMaterialChange(material, checked as boolean)
                  }
                />
                <Label htmlFor={`material-${material}`} className="text-sm">
                  {material}
                </Label>
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

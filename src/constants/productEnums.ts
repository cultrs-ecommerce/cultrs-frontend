export const categories = [
  "Traditional Wear",
  "Casual Wear", 
  "Formal Wear",
  "Jewelry",
  "Accessories",
  "Footwear",
  "Home Decor"
] as const;

export const conditions = [
  "New with tags", 
  "Excellent",
  "Good",
  "Fair"
] as const;

export const clothingSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "One Size"] as const;
export const shoeSizesUS = ["5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12", "13", "14", "15"] as const;
export const jewelrySizes = ["One Size"] as const; // Example, you might need more specific sizes
export const accessoriesSizes = ["One Size"] as const; // Example

export const shippingOptions = [
  'seller_pays',
  'buyer_pays',
  'pickup_only'
] as const;

export type Category = typeof categories[number];
export type Condition = typeof conditions[number];
export type ClothingSize = typeof clothingSizes[number];
export type ShoeSizeUS = typeof shoeSizesUS[number];
export type JewelrySize = typeof jewelrySizes[number];
export type AccessorySize = typeof accessoriesSizes[number];
export type ShippingOption = typeof shippingOptions[number];

// Map categories to their relevant size types
export const categorySizeMap: Record<Category, readonly string[]> = {
  "Traditional Wear": clothingSizes,
  "Casual Wear": clothingSizes,
  "Formal Wear": clothingSizes,
  "Jewelry": jewelrySizes, // Using a specific jewelry size array
  "Accessories": accessoriesSizes, // Using a specific accessories size array
  "Footwear": shoeSizesUS,
  "Home Decor": [] // Home decor might not have sizes
};

export type Size = ClothingSize | ShoeSizeUS | JewelrySize | AccessorySize; // Union type for all possible sizes
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import {
  categories,
  conditions,
  categorySizeMap,
  Size,
  shippingOptions,
} from "@/constants/productEnums";
import { saveProduct, updateProduct, getProductWithImages } from "@/controllers/productController";
import { useNavigate, useParams } from "react-router-dom";
import { auth } from "@/firebaseConfig";
import heic2any from "heic2any";

const listingSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
  price: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().min(0.01, "Price must be a positive number")
  ),
  category: z.enum(categories),
  condition: z.enum(conditions),
  brand: z.string().optional(),
  material: z.string().optional(),
  careInstructions: z.string().optional(),
  shippingInfo: z.enum(shippingOptions),
});

type ListingFormData = z.infer<typeof listingSchema>;

const tags = [
  "wedding",
  "casual",
  "formal",
  "traditional",
  "jewelry",
  "south asian",
  "indian",
  "pakistani",
  "bangladeshi",
  "ethnic",
  "designer",
  "vintage",
  "handmade",
  "silk",
  "cotton",
  "embroidered",
  "beaded",
  "festive",
];

export default function CreateListing() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<Size[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: "",
      description: "",
      price: undefined,
      category: undefined,
      condition: undefined,
      brand: "",
      material: "",
      careInstructions: "",
      shippingInfo: undefined,
    },
  });

  useEffect(() => {
    if (productId) {
      setIsEditMode(true);
      const fetchProduct = async () => {
        try {
          const productData = await getProductWithImages(productId);
          if (productData) {
            form.reset(productData);
            setSelectedTags(productData.tags || []);
            setSelectedSizes(productData.sizes || []);
            setImagePreviews(productData.images.map(img => img.imageData));
          } else {
            toast.error("Product not found");
            navigate("/profile");
          }
        } catch (error) {
          console.error("Error fetching product:", error);
          toast.error("Failed to load product data");
        }
      };
      fetchProduct();
    }
  }, [productId, form, navigate]);


  const selectedCategory = form.watch("category");
  const availableSizesForCategory = selectedCategory
    ? categorySizeMap[selectedCategory]
    : [];

  useEffect(() => {
    if (!isEditMode) {
        setSelectedSizes([]);
    }
  }, [selectedCategory, isEditMode]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (images.length + files.length > 5) {
      toast.error("You can only upload up to 5 images");
      return;
    }

    const processedFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of files) {
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.heic') || fileName.endsWith('.heif')) {
        try {
          toast.info("Converting HEIC image... Please wait.");
          const convertedBlob = await heic2any({
            blob: file,
            toType: "image/png",
            quality: 0.8,
          });

          const finalBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

          const newFileName = file.name.replace(/\.(heic|heif)$/i, ".png");
          const convertedFile = new File([finalBlob], newFileName, { type: 'image/png' });
          processedFiles.push(convertedFile);
          newPreviews.push(URL.createObjectURL(convertedFile));
          toast.success("HEIC image converted successfully!");
        } catch (error) {
          console.error("Error converting HEIC image:", error);
          toast.error("Failed to convert HEIC image. Please try another format.");
        }
      } else {
        processedFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    }

    setImages([...images, ...processedFiles]);
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    if(images[index]) URL.revokeObjectURL(imagePreviews[index]);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleSize = (size: Size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const onSubmit = async (data: ListingFormData) => {
    setIsSubmitting(true);
    if (images.length === 0 && imagePreviews.length === 0) {
      toast.error("Please add at least one image");
      setIsSubmitting(false);
      return;
    }

    if (selectedTags.length === 0) {
      toast.error("Please select at least one tag");
      setIsSubmitting(false);
      return;
    }

    if (availableSizesForCategory.length > 0 && selectedSizes.length === 0) {
      toast.error("Please select at least one size");
      setIsSubmitting(false);
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("You must be logged in to create a listing.");
      setIsSubmitting(false);
      return;
    }
    const ownerId = currentUser.uid;

    try {
        const productData = {
            owner_id: ownerId,
            title: data.title,
            price: data.price,
            category: data.category,
            condition: data.condition,
            description: data.description,
            shippingInfo: data.shippingInfo,
            tags: selectedTags,
            sizes: selectedSizes,
            brand: data.brand,
            material: data.material,
            careInstructions: data.careInstructions,
        };

      if (isEditMode && productId) {
        await updateProduct(productId, productData, images);
        toast.success("Listing updated successfully!");
        navigate("/profile");
      } else {
        await saveProduct(productData, images);
        toast.success("Listing created successfully!");
        navigate("/");
      }
    } catch (error) {
      console.error("Error saving listing:", error);
      toast.error("Failed to save listing. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {isEditMode ? "Edit Your Listing" : "Create Your Listing"}
        </h1>
        <p className="text-muted-foreground">
          {isEditMode ? "Update your item details below" : "Share your beautiful items with our community"}
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter a descriptive title for your item"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="$0.00"
                          min={0}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {conditions.map((condition) => (
                            <SelectItem key={condition} value={condition}>
                              {condition}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand/Designer</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Brand or designer name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your item in detail - include measurements, special features, styling tips, etc."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide detailed information about your item to help
                      buyers make informed decisions.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-contain rounded-md border bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {imagePreviews.length < 5 && (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-md cursor-pointer hover:border-primary transition-colors">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">
                        Add Image
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*,.heic,.heif"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload up to 5 high-quality images. The first image will be
                  used as the main photo.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tags & Sizes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-3 block">Tags *</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={
                        selectedTags.includes(tag) ? "default" : "outline"
                      }
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Select relevant tags to help buyers find your item.
                </p>
              </div>
              {availableSizesForCategory.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Available Sizes *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableSizesForCategory.map((size) => (
                      <Button
                        key={size}
                        type="button"
                        variant={
                          selectedSizes.includes(size as Size)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => toggleSize(size as Size)}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Select all sizes available for this item.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="material"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material/Fabric</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 100% Silk, Cotton Blend, Georgette"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="careInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Care Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="How should this item be cared for? (e.g., Dry clean only, Hand wash cold, etc.)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shippingInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shipping Information</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select shipping option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {shippingOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Save as Draft
            </Button>
            <Button type="submit" variant="premium" disabled={isSubmitting}>
              {isSubmitting ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Listing" : "Create Listing")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

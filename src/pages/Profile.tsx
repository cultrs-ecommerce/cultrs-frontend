import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Navigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { Product } from "@/types/Product";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  MapPin,
  Star,
  Package,
  Trash2,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import EditProfileModal from "@/components/EditProfileModal"; // Import the modal
import { User as UserType } from "@/types/User";
import { deleteProduct } from "@/controllers/productController";

const Profile = () => {
  const { user, setUser, currentUser, loading } = useAuth();
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      fetchUserProducts();
    }
  }, [currentUser]);

  const fetchUserProducts = async () => {
    if (!currentUser) return;

    try {
      const q = query(
        collection(db, "products"),
        where("owner_id", "==", currentUser.uid)
      );

      const querySnapshot = await getDocs(q);
      const products: Product[] = [];

      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as Product);
      });

      setUserProducts(products);
    } catch (error) {
      console.error("Error fetching user products:", error);
      toast.error("Failed to load your products");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
      setUserProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success("Product and all associated images have been deleted.");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product.");
    }
  };

  const handleEditProduct = (productId: string) => {
    navigate(`/sell/${productId}`);
  };

  const handleProfileUpdate = (updatedUser: UserType) => {
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading...</h1>
          <p className="text-muted-foreground">
            Please wait while we load your profile.
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading Profile...</h1>
          <p className="text-muted-foreground">
            Please wait while we load your profile data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="m-auto">
      <div className="mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-start space-x-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.profilePictureUrl} />
                <AvatarFallback>
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">
                  {user.name || "User"}
                </CardTitle>
                <CardDescription className="text-base mb-4">
                  {user.email || currentUser.email}
                </CardDescription>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">
                      {(user.rating || 0).toFixed(1)}
                    </span>
                    <span className="text-muted-foreground">
                      ({user.reviewsCount || 0} reviews)
                    </span>
                  </div>

                  {user.zipCode && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{user.zipCode}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-1">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>{user.itemsSold} items sold</span>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="listings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="listings">My Listings</TabsTrigger>
          <TabsTrigger value="comments">Recent Comments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Your Products ({userProducts.length})
            </h2>
            <Button onClick={() => navigate("/sell")}>Add New Product</Button>
          </div>

          {loadingProducts ? (
            <div className="text-center py-8">
              <p>Loading your products...</p>
            </div>
          ) : userProducts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No products listed yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Start selling by creating your first product listing.
                </p>
                <Button onClick={() => navigate("/sell")}>
                  Create Your First Listing
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <img
                        src={product.primaryImageUrl || "/placeholder.svg"}
                        alt={product.title}
                        className="h-16 w-16 object-cover rounded-md"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.title}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => product.id && handleEditProduct(product.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => product.id && handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <h2 className="text-xl font-semibold">Your Performance</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Listings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userProducts.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Listings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userProducts.filter((p) => p.status === "active").length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Views
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userProducts.reduce((sum, p) => sum + (p.viewsCount || 0), 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Likes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userProducts.reduce((sum, p) => sum + (p.likesCount || 0), 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your account activity over the past 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Analytics dashboard coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={handleProfileUpdate}
      />
    </div>
  );
};

export default Profile;
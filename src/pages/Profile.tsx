import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { Product } from "@/types/Product";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import { 
  User, 
  MapPin, 
  Star, 
  Package, 
  MessageCircle, 
  Trash2, 
  Edit,
  Eye,
  Heart
} from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const { user, currentUser, loading } = useAuth();
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [recentComments, setRecentComments] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchUserProducts();
      // For now, we'll simulate recent comments since there's no comments collection
      setRecentComments([
        {
          id: "1",
          text: "Beautiful piece! Is this still available?",
          productTitle: "Vintage Silk Saree",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          id: "2", 
          text: "What are the measurements for this kurta?",
          productTitle: "Traditional Cotton Kurta",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        }
      ]);
    }
  }, [user]);

  const fetchUserProducts = async () => {
    if (!user) return;
    
    try {
      const q = query(
        collection(db, "products"),
        where("owner_id", "==", user.id)
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

  const handleRemoveProduct = async (productId: string) => {
    try {
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, { status: "paused" });
      
      setUserProducts(prev => 
        prev.map(product => 
          product.id === productId 
            ? { ...product, status: "paused" as const }
            : product
        )
      );
      
      toast.success("Product removed from listing");
    } catch (error) {
      console.error("Error removing product:", error);
      toast.error("Failed to remove product");
    }
  };

  const handleReactivateProduct = async (productId: string) => {
    try {
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, { status: "active" });
      
      setUserProducts(prev => 
        prev.map(product => 
          product.id === productId 
            ? { ...product, status: "active" as const }
            : product
        )
      );
      
      toast.success("Product reactivated");
    } catch (error) {
      console.error("Error reactivating product:", error);
      toast.error("Failed to reactivate product");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading...</h1>
          <p className="text-muted-foreground">Please wait while we load your profile.</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If currentUser exists but user data is still loading from Firestore
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading Profile...</h1>
          <p className="text-muted-foreground">Please wait while we load your profile data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
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
                  <CardTitle className="text-2xl mb-2">{user.name}</CardTitle>
                  <CardDescription className="text-base mb-4">{user.email}</CardDescription>
                  
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{user.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({user.reviewsCount} reviews)</span>
                    </div>
                    
                    {user.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>{user.itemsSold} items sold</span>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="comments">Recent Comments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          {/* My Listings Tab */}
          <TabsContent value="listings" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Products ({userProducts.length})</h2>
              <Button>Add New Product</Button>
            </div>
            
            {loadingProducts ? (
              <div className="text-center py-8">
                <p>Loading your products...</p>
              </div>
            ) : userProducts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No products listed yet</h3>
                  <p className="text-muted-foreground mb-4">Start selling by creating your first product listing.</p>
                  <Button>Create Your First Listing</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={product.imageUrls[0] || "/placeholder.svg"}
                        alt={product.title}
                        className="object-cover w-full h-full"
                      />
                      <Badge 
                        className={`absolute top-2 right-2 ${
                          product.status === 'active' ? 'bg-green-500' :
                          product.status === 'sold' ? 'bg-gray-500' :
                          product.status === 'paused' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}
                      >
                        {product.status}
                      </Badge>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2 line-clamp-2">{product.title}</h3>
                      <p className="text-xl font-bold text-primary mb-2">₹{product.price}</p>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{product.viewsCount}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="h-3 w-3" />
                            <span>{product.likesCount}</span>
                          </div>
                        </div>
                        <Badge variant="secondary">{product.condition}</Badge>
                      </div>
                      
                      <div className="flex space-x-2">
                        {product.status === 'active' ? (
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => product.id && handleRemoveProduct(product.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        ) : product.status === 'paused' ? (
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => product.id && handleReactivateProduct(product.id)}
                          >
                            Reactivate
                          </Button>
                        ) : null}
                        
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Recent Comments Tab */}
          <TabsContent value="comments" className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Comments on Your Items</h2>
            
            {recentComments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No comments yet</h3>
                  <p className="text-muted-foreground">Comments from buyers will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {recentComments.map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{comment.productTitle}</h4>
                        <span className="text-sm text-muted-foreground">
                          {comment.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{comment.text}</p>
                      <Separator className="my-3" />
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Reply
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <h2 className="text-xl font-semibold">Your Performance</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Listings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userProducts.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Listings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userProducts.filter(p => p.status === 'active').length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userProducts.reduce((sum, p) => sum + p.viewsCount, 0)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Likes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userProducts.reduce((sum, p) => sum + p.likesCount, 0)}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your account activity over the past 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Analytics dashboard coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;

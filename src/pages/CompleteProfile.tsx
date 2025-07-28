import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { toast } from "sonner";
import authBackground from "@/assets/auth-background.jpg";

const CompleteProfile = () => {
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!location) {
      setError("Please enter your location.");
      return;
    }

    if (!currentUser) {
      setError("You must be logged in to complete your profile.");
      toast.error("Authentication error. Please log in again.");
      navigate("/login");
      return;
    }

    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        location: location,
      });
      toast.success("Profile updated successfully!");
      navigate("/"); // Redirect to the homepage after completion
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
      toast.error("Failed to update profile.");
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src={authBackground}
          alt="Traditional clothing collection"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10" />
      </div>

      <div className="w-full lg:w-1/2 bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="card-shadow">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-foreground">
                Before you begin
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Let's complete your profile with a few more details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="location"
                    className="text-sm font-medium text-foreground"
                  >
                    Your Location
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    placeholder="e.g., New York, USA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full"
                    required
                  />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2"
                >
                  Continue
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;

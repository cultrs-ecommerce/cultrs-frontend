import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/firebaseConfig";
import { signOut } from "firebase/auth";
import { toast } from "sonner";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await signOut(auth);
        toast.success("You have been successfully logged out.");
      } catch (error) {
        console.error("Logout Error:", error);
        toast.error("Failed to log out. Please try again.");
      } finally {
        navigate("/login");
      }
    };

    performLogout();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Logging out...</h1>
        <p className="text-muted-foreground">You are being redirected.</p>
      </div>
    </div>
  );
};

export default Logout;

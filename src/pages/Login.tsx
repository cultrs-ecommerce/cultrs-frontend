import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import authBackground from "@/assets/auth-background.jpg";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { firebaseErrorMessages } from "@/constants/errorMessages";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      // Handle successful login (e.g., redirect to dashboard)
      console.log("Login successful!");
      navigate('/');
    } catch (error: any) {
      console.error("Login error:", error);
      setError(firebaseErrorMessages[error.code] || firebaseErrorMessages['default']);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Image Side */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img 
          src={authBackground} 
          alt="Traditional clothing collection" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10" />
      </div>
      
      {/* Form Side */}
      <div className="w-full lg:w-1/2 bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="card-shadow">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-foreground">
                Welcome Back!
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full"
                    required
                  />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2"
                >
                  Login
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link 
                    to="/signup" 
                    className="text-primary hover:text-primary/80 font-medium transition-smooth"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
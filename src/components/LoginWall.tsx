import React from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

interface LoginWallProps {
  children: React.ReactNode;
}

const LoginWall: React.FC<LoginWallProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div>
        <div className="blur-sm">{children}</div>
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center mx-4">
            <h2 className="text-2xl font-bold mb-4">You need to be logged in</h2>
            <p className="mb-6">Please log in or create an account to access this page.</p>
            <div className="flex justify-center items-center gap-4 flex-wrap">
              <Button onClick={() => navigate("/login")}>Login</Button>
              <Button variant="outline" onClick={() => navigate("/signup")}>Sign Up</Button>
              <Button variant="ghost" onClick={() => navigate(-1)}>Go Back</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default LoginWall;

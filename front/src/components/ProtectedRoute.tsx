import type React from "react";
import { Navigate } from "react-router-dom";
import { authService } from "../services/api";
import type { User } from "../gql/graphql";
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { resetApolloClient } from "../services/apollo-client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      await resetApolloClient();
      try {
        const currentUser = await authService.getCurrentUser();
        console.log("curretUser : ", currentUser.getCurrentUser);
        setUser(currentUser.getCurrentUser as User);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <LoaderCircle className="animate-spin" />
      </div>
    );
  } else if (
    !loading &&
    (!token || user instanceof Error || !user || !user.id)
  ) {
    return <Navigate to="/login" replace />;
  } else {
    return <>{children}</>;
  }
}

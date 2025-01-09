import React, { useEffect, useLayoutEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { useNavigate } from "react-router-dom";
import { fetchUser } from "../../redux/slices/authSlice";
import { CircularProgress } from "@mui/material";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const { auth, user, loading } = useSelector((state: RootState) => state.user);

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useLayoutEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  useEffect(() => {
    console.log(user);
    console.log(auth);
    
    
    if (auth && user) {
      // const hasAccess = allowedRoles.includes(user.role); 
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, [auth, user]);

  if (loading || isAuthorized === null) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#f4f4f4]">
        <CircularProgress />
      </div>
    );
  }

  if (!auth) {
    navigate("/login"); 
    return null;
  }

  if (!isAuthorized) {
    navigate("/unauthorized"); 
    return null;
  }

  return <>{children}</>;
};

export default AuthLayout;

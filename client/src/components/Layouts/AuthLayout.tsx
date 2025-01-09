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

  const { auth, loading } = useSelector((state: RootState) => state.user);
  const [isReady, setIsReady] = useState(false);

  useLayoutEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  useEffect(() => {
    if (!loading) {
      if (auth) {
        setIsReady(true);
      } else {
        navigate("/login"); 
      }
    }
  }, [auth, loading, navigate]);

  if (loading || !isReady) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#f4f4f4]">
        <CircularProgress />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthLayout;

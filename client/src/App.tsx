import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  LoginPage,
  RegisterPage,
  HomePage,
  MemberManagementPage,
  DashboardHomePage,
  DonationDetailsPage,
  EventsPage,
} from "./pages";
import { AuthLayout, DashboardLayout } from "./components";
import { fetchUser } from "./redux/slices/authSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "./redux/store";

const App: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  dispatch(fetchUser());
  return (
    <BrowserRouter>
      <div className="h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard/*"
            element={
              <AuthLayout allowedRoles={["admin"]}>
                <DashboardLayout>
                  <Routes>
                    <Route path="/" element={<DashboardHomePage />} />
                    <Route
                      path="/members-details"
                      element={<MemberManagementPage />}
                    />
                    <Route
                      path="/donation-details"
                      element={<DonationDetailsPage />}
                    />
                    <Route path="/events" element={<EventsPage />} />
                  </Routes>
                </DashboardLayout>
              </AuthLayout>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;

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
  DonorFormPage,
} from "./pages";
import { AuthLayout, DashboardLayout } from "./components";
import { fetchUser } from "./redux/slices/authSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "./redux/store";
import GoalsPage from "./pages/Dashboard/GoalsPage";
import PaymentSuccessPage from "./components/constants/PaymentSuccess";

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
          <Route path="/donor-form/:goalId" element={<DonorFormPage />} />
          <Route path="/donation-success" element={<PaymentSuccessPage />} />
          <Route
            path="/dashboard/*"
            element={
              <AuthLayout>
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
                    <Route path="/goals" element={<GoalsPage />} />
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

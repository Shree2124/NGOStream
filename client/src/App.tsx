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
  EventFrontPage,
  FeedbackForm,
} from "./pages";
import {
  AuthLayout,
  DashboardLayout,
  EventRegistrationForm,
  SidebarProvider,
} from "./components";
import { fetchUser } from "./redux/slices/authSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "./redux/store";
import GoalsPage from "./pages/Dashboard/GoalsPage";
import PaymentSuccessPage from "./components/constants/PaymentSuccess";
import FundraisingMetrics from "./pages/predicted";

const App: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  dispatch(fetchUser());
  return (
    <BrowserRouter>
      <div className="">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/predict" element={<FundraisingMetrics />} />
          <Route path="/donor-form/:goalId" element={<DonorFormPage />} />
          <Route path="/donation-success" element={<PaymentSuccessPage />} />
          <Route path="/feedback/:eventId" element={<FeedbackForm />} />
          <Route
            path={`/events/:eventId`}
            element={<EventRegistrationForm />}
          />
          <Route path="/events" element={<EventFrontPage />} />
          <Route
            path="/dashboard/*"
            element={
              <AuthLayout>
                <SidebarProvider>
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
                </SidebarProvider>
              </AuthLayout>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;

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
  // SchemesPage,
  VisionPage,
  AchievementsPage,
  ImpactPage,
} from "./pages";
import {
  AuthLayout,
  DashboardLayout,
  EventRegistrationForm,
  SidebarProvider,
} from "./components";
import ManageAdmin from "./components/ManageAdmins/index";
import { fetchUser } from "./redux/slices/authSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "./redux/store";
import GoalsPage from "./pages/Dashboard/GoalsPage";
import PaymentSuccessPage from "./components/constants/PaymentSuccess";
import FundraisingMetrics from "./pages/predicted";
import EventDetailsPage from "./pages/Dashboard/EventDetailsPage";
import ImpactComponentPage from "./pages/Impact/ImpactComponentPage";

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
          <Route path="/donor-form/:type/:id" element={<DonorFormPage />} />
          <Route path="/donation-success" element={<PaymentSuccessPage />} />
          <Route path="/feedback/:eventId" element={<FeedbackForm />} />
          <Route
            path={`/events/:eventId`}
            element={<EventRegistrationForm />}
          />
          <Route path="/events" element={<EventFrontPage />} />
          <Route path="/visions" element={<VisionPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/impact" element={<ImpactComponentPage />} />
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
                        path="/donation-details/inkind"
                        element={<DonationDetailsPage type={"In-Kind"} />}
                      />
                      <Route
                        path="/donation-details/monetary"
                        element={<DonationDetailsPage type={"Monetary"} />}
                      />
                      <Route path="/events" element={<EventsPage />} />

                      <Route
                        path="/event-details/:eventId"
                        element={<EventDetailsPage />}
                      />
                      <Route path="/goals" element={<GoalsPage />} />
                      {/* <Route path="/schemes" element={<SchemesPage />} /> */}
                      <Route path="/impact" element={<ImpactPage />} />
                      <Route path="/manage-admin" element={<ManageAdmin />} />
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

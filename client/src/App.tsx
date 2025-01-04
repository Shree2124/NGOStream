import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage, RegisterPage, HomePage, MemberManagementPage, DashboardHomePage, DonationDetailsPage, EventsPage } from "./pages";
import { DashboardLayout } from "./components";

const App: React.FC = () => {
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
              // <AuthLayout>
                <DashboardLayout>
                  <Routes>
                    <Route path="/" element={<DashboardHomePage />} />
                    <Route path="/members-details" element= {<MemberManagementPage/>}/>
                    <Route path="/donation-details" element= {<DonationDetailsPage />}/>
                    <Route path="/events" element= {<EventsPage />}/>
                  </Routes>
                </DashboardLayout>
              // </AuthLayout> 
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;

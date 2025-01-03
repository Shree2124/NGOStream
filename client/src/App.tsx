import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage, RegisterPage, HomePage } from "./pages";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;

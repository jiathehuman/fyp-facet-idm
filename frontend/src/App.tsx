import { Route, Routes, Navigate } from "react-router-dom";

import IndexPage from "@/pages/index";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import DashboardPage from "@/pages/dashboard";
import PersonaPage from "@/pages/persona";
import DocsPage from "@/pages/about";
import SecureRoute from "@/components/SecureRoute";

function Logout() {
  localStorage.clear();

  return <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<DocsPage/>} path="/about"/>
      <Route element={<LoginPage />} path="/login" />
      <Route element={<RegisterPage />} path="/register" />
      {/* Route to the user dashboard */}
      <Route
        element={
          <SecureRoute>
            <DashboardPage />
          </SecureRoute>
        }
        path="/"
      />
      {/* Route to a specific persona */}
      <Route
        element={
          <SecureRoute>
            <PersonaPage />
          </SecureRoute>
        }
        path="/persona/:id"
      />
      {/* Route to logout */}
      <Route element={<Logout />} path="/logout" />
    </Routes>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Setup from "./pages/Setup";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Products from "./pages/Products";
import POS from "./pages/POS";
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import SuperAdmin from "./pages/SuperAdmin";
import { getUser } from "./services/api";

const Guard = ({ children, roles }) => {
  const token = localStorage.getItem("token");
  const user = getUser();
  if (!token) return <Navigate to="/" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<Auth />} />
        <Route path="/superadmin" element={<SuperAdmin />} />
        <Route path="/setup"      element={<Guard roles={["admin"]}><Setup /></Guard>} />
        <Route path="/dashboard"  element={<Guard><Dashboard /></Guard>} />
        <Route path="/inventory"  element={<Guard><Inventory /></Guard>} />
        <Route path="/products"   element={<Guard><Products /></Guard>} />
        <Route path="/pos"        element={<Guard><POS /></Guard>} />
        <Route path="/sales"      element={<Guard><Sales /></Guard>} />
        <Route path="/reports"    element={<Guard roles={["admin"]}><Reports /></Guard>} />
        <Route path="/users"      element={<Guard roles={["admin"]}><Users /></Guard>} />
      </Routes>
    </BrowserRouter>
  );
}
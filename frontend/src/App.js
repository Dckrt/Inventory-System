import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
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

const PrivateRoute = ({ children, roles }) => {
  const token = localStorage.getItem("token");
  const user = getUser();
  if (!token) return <Navigate to="/" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/superadmin" element={<SuperAdmin />} />
        <Route path="/setup" element={
          <PrivateRoute roles={["admin"]}>
            <Setup />
          </PrivateRoute>
        } />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/inventory" element={
          <PrivateRoute>
            <Inventory />
          </PrivateRoute>
        } />
        <Route path="/products" element={
          <PrivateRoute>
            <Products />
          </PrivateRoute>
        } />
        <Route path="/pos" element={
          <PrivateRoute>
            <POS />
          </PrivateRoute>
        } />
        <Route path="/sales" element={
          <PrivateRoute>
            <Sales />
          </PrivateRoute>
        } />
        <Route path="/reports" element={
          <PrivateRoute roles={["admin"]}>
            <Reports />
          </PrivateRoute>
        } />
        <Route path="/users" element={
          <PrivateRoute roles={["admin"]}>
            <Users />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
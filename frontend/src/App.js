import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/inventory" element={<Inventory/>}/>
        <Route path="/reports" element={<Reports/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
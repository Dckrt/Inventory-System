import { Link } from "react-router-dom";
import { useState } from "react";

function Layout({ children }) {
  const [dark, setDark] = useState(false);

  return (
    <div className="d-flex">
      
      {/* SIDEBAR */}
      <div style={{
        width:"220px",
        height:"100vh",
        background:"#0F151F",
        color:"white",
        padding:"20px"
      }}>
        <h3 style={{color:"#D50036"}}>Inventory</h3>

        <Link to="/dashboard" className="btn btn-dark w-100 mb-2">Dashboard</Link>
        <Link to="/inventory" className="btn btn-dark w-100 mb-2">Inventory</Link>
        <Link to="/reports" className="btn btn-dark w-100 mb-2">Reports</Link>

        <button 
          className="btn btn-secondary w-100 mb-2"
          onClick={()=>setDark(!dark)}
        >
          Toggle Dark Mode
        </button>

        <Link to="/" className="btn btn-danger w-100">Logout</Link>
      </div>

      {/* MAIN */}
      <div className={dark ? "flex-grow-1 p-4 bg-dark text-white" : "flex-grow-1 p-4 bg-light"}>
        {children}
      </div>
    </div>
  );
}

export default Layout;
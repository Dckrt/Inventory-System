import { useEffect, useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";

function Dashboard() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch(API + "/items")
      .then(res => res.json())
      .then(setItems);
  }, []);

  const low = items.filter(i => i.quantity < 5).length;

  return (
    <Layout>
      <h1>Dashboard</h1>

      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card p-3 shadow">
            <h5>Total Items</h5>
            <h2>{items.length}</h2>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card p-3 shadow">
            <h5>Low Stock</h5>
            <h2>{low}</h2>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
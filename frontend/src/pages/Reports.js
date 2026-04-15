import { useEffect, useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

function Reports() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch(API + "/items")
      .then(res => res.json())
      .then(setItems);
  }, []);

  const data = {
    labels: items.map(i => i.name),
    datasets: [
      {
        label: "Stock",
        data: items.map(i => i.quantity)
      }
    ]
  };

  return (
    <Layout>
      <h1>Reports</h1>
      <div className="card p-3 shadow">
        <Bar data={data} />
      </div>
    </Layout>
  );
}

export default Reports;
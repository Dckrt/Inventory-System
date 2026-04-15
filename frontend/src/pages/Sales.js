import { useEffect, useState } from "react";
import API from "../services/api";

export default function Sales() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(API + "/sales")
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <div className="p-4">
      <h2>Sales History</h2>

      <table className="table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Total</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {data.map(s=>(
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.quantity}</td>
              <td>{s.total}</td>
              <td>{s.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
import { useEffect, useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";

function Inventory() {

  const role = localStorage.getItem("role");

  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [search, setSearch] = useState("");

  const load = () => {
    fetch(API + "/items")
      .then(res => res.json())
      .then(setItems);
  };

  useEffect(load, []);

  const add = () => {
    fetch(API + "/items", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({name, quantity:qty})
    }).then(load);
  };

  const del = id => fetch(API+"/items/"+id,{method:"DELETE"}).then(load);
  const addStock = id => fetch(API+"/stock-in/"+id,{method:"POST"}).then(load);
  const minusStock = id => fetch(API+"/stock-out/"+id,{method:"POST"}).then(load);

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <h1>Inventory</h1>

      {/* SEARCH */}
      <input 
        className="form-control mb-3" 
        placeholder="Search..." 
        onChange={e=>setSearch(e.target.value)} 
      />

      {/* ADD (ADMIN ONLY) */}
      {role === "admin" && (
        <div className="card p-3 mb-3 shadow">
          <div className="row">
            <div className="col">
              <input className="form-control" placeholder="Name" onChange={e=>setName(e.target.value)} />
            </div>
            <div className="col">
              <input className="form-control" placeholder="Qty" onChange={e=>setQty(e.target.value)} />
            </div>
            <div className="col">
              <button className="btn btn-primary w-100" onClick={add}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* TABLE */}
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>Name</th>
            <th>Qty</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map(i=>(
            <tr key={i.id}>
              <td>{i.name}</td>
              <td>{i.quantity}</td>
              <td>
                {role === "admin" && (
                  <>
                    <button className="btn btn-success btn-sm me-2" onClick={()=>addStock(i.id)}>+</button>
                    <button className="btn btn-warning btn-sm me-2" onClick={()=>minusStock(i.id)}>-</button>
                    <button className="btn btn-danger btn-sm" onClick={()=>del(i.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}

export default Inventory;
import { useEffect, useState } from "react";
import API from "../services/api";
import Scanner from "./Scanner";s

export default function POS() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(API + "/products")
      .then(res => res.json())
      .then(setProducts);
  }, []);

  const sell = async (id, price) => {
    await fetch(API + "/sell", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        product_id: id,
        quantity: 1,
        price
      })
    });

    alert("Sold!");
  };

  return (
    <div className="p-4">
      <h2>POS (Cashier)</h2>

      <div className="row">
        {products.map(p=>(
          <div className="col-md-3" key={p.id}>
            <div className="card p-3 shadow mb-3">
              <h5>{p.name}</h5>
              <button 
                className="btn btn-success"
                onClick={()=>sell(p.id, 50)}
              >
                Sell
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const printReceipt = (product, price) => {
  const receipt = `
    Milk Tea Shop
    ----------------------
    Product: ${product}
    Price: ₱${price}
    Date: ${new Date().toLocaleString()}
    ----------------------
    Thank you!
  `;

  const win = window.open("", "", "width=300,height=600");
  win.document.write(`<pre>${receipt}</pre>`);
  win.print();
};
}

<Scanner onScan={(code)=>{
  sell(code, 50); // barcode = product_id
}}/>
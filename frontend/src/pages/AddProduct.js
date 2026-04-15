import { useEffect, useState } from "react";
import API from "../services/api";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [selected, setSelected] = useState([]);

  // load ingredients
  useEffect(() => {
    fetch(API + "/ingredients")
      .then(res => res.json())
      .then(setIngredients);
  }, []);

  const addRecipe = (id) => {
    setSelected([...selected, { ingredient_id: id, quantity: 1 }]);
  };

  const updateQty = (index, value) => {
    const updated = [...selected];
    updated[index].quantity = value;
    setSelected(updated);
  };

  const saveProduct = async () => {
    await fetch(API + "/products", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        name,
        recipe: selected
      })
    });

    alert("Product saved!");
  };

  return (
    <div className="p-4">
      <h2>Add Product</h2>

      <input
        className="form-control mb-3"
        placeholder="Product Name"
        onChange={e=>setName(e.target.value)}
      />

      <h5>Select Ingredients</h5>

      {ingredients.map(i=>(
        <button 
          key={i.id}
          className="btn btn-outline-primary m-1"
          onClick={()=>addRecipe(i.id)}
        >
          {i.name}
        </button>
      ))}

      <h5 className="mt-3">Recipe</h5>

      {selected.map((item,index)=>(
        <div key={index} className="mb-2">
          <input
            type="number"
            value={item.quantity}
            onChange={(e)=>updateQty(index,e.target.value)}
          />
        </div>
      ))}

      <button className="btn btn-success mt-3" onClick={saveProduct}>
        Save Product
      </button>
    </div>
  );
}
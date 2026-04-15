import { useState } from "react";
import API from "../services/api";

function Login() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  const login = () => {
    fetch(API + "/login", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ username: user, password: pass })
    })
    .then(res => res.json())
    .then(data => {
      if(data.status === "success"){
        localStorage.setItem("role", data.role);
        window.location = "/dashboard";
      } else alert("Invalid login");
    });
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-dark">
      <div className="card p-4 shadow" style={{width:"300px"}}>
        <h3 className="text-center">Login</h3>

        <input className="form-control mt-3" placeholder="Username" onChange={e=>setUser(e.target.value)} />
        <input className="form-control mt-2" type="password" placeholder="Password" onChange={e=>setPass(e.target.value)} />

        <button className="btn btn-primary w-100 mt-3" onClick={login}>Login</button>
      </div>
    </div>
  );
}

export default Login;
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiFetch, getShop, getUser } from "../services/api";

const inp = {width:"100%",padding:"9px 11px",background:"#0D0D12",border:"1px solid #ffffff18",borderRadius:"7px",color:"#fff",fontSize:"13px",outline:"none",boxSizing:"border-box"};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({username:"",password:"",role:"staff"});
  const shop = getShop(); const me = getUser(); const tc = shop.theme_color||"#D50036";

  const load = () => { apiFetch("/users").then(d=>setUsers(d||[])); };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.username||!form.password) return alert("Fill in all fields.");
    const r = await apiFetch("/users",{method:"POST",body:JSON.stringify(form)});
    if (r.status==="created") { setForm({username:"",password:"",role:"staff"}); setShow(false); load(); }
    else alert(r.message||"Could not create user.");
  };

  const del = async id => {
    if (id===me.id) return alert("Cannot delete your own account.");
    if (!window.confirm("Delete user?")) return;
    await apiFetch(`/users/${id}`,{method:"DELETE"}); load();
  };

  return (
    <Layout title="User Management">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px"}}>
        <span style={{color:"#8888aa",fontSize:"13px"}}>Accounts for <strong style={{color:"#fff"}}>{shop.name}</strong></span>
        <button onClick={()=>setShow(!show)} style={{padding:"9px 18px",background:tc,color:"#fff",border:"none",borderRadius:"9px",cursor:"pointer",fontWeight:"600",fontSize:"13px"}}>+ Add User</button>
      </div>

      {show && (
        <div style={{background:"#13131A",border:`1px solid ${tc}44`,borderRadius:"12px",padding:"16px",marginBottom:"16px",display:"flex",gap:"10px",alignItems:"flex-end",flexWrap:"wrap"}}>
          {[{l:"USERNAME",f:"username",ph:"staffname"},{l:"PASSWORD",f:"password",ph:"password",t:"password"}].map(x=>(
            <div key={x.f} style={{flex:1,minWidth:"150px"}}>
              <label style={{color:"#556",fontSize:"10px",display:"block",marginBottom:"4px"}}>{x.l}</label>
              <input type={x.t||"text"} value={form[x.f]} placeholder={x.ph} onChange={e=>setForm({...form,[x.f]:e.target.value})} style={inp}/>
            </div>
          ))}
          <div style={{minWidth:"110px"}}>
            <label style={{color:"#556",fontSize:"10px",display:"block",marginBottom:"4px"}}>ROLE</label>
            <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} style={{...inp,cursor:"pointer"}}>
              <option value="staff">Staff</option><option value="admin">Admin</option>
            </select>
          </div>
          <button onClick={add} style={{padding:"9px 20px",background:tc,color:"#fff",border:"none",borderRadius:"7px",cursor:"pointer",fontWeight:"600"}}>Create</button>
          <button onClick={()=>setShow(false)} style={{padding:"9px 14px",background:"transparent",color:"#8888aa",border:"1px solid #ffffff18",borderRadius:"7px",cursor:"pointer"}}>Cancel</button>
        </div>
      )}

      <div style={{background:"#13131A",border:"1px solid #ffffff0f",borderRadius:"13px",overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{borderBottom:"1px solid #ffffff0f"}}>
            {["Username","Role","Joined","Actions"].map(h=><th key={h} style={{padding:"12px 18px",color:"#8888aa",fontSize:"11px",letterSpacing:".8px",textAlign:"left",fontWeight:"500"}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {users.map(u=>(
              <tr key={u.id} style={{borderBottom:"1px solid #ffffff06"}} onMouseEnter={e=>e.currentTarget.style.background="#ffffff04"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{padding:"14px 18px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"9px"}}>
                    <div style={{width:"32px",height:"32px",background:u.role==="admin"?`${tc}33`:"#ffffff0f",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px"}}>{u.role==="admin"?"👑":"👤"}</div>
                    <div>
                      <div style={{color:"#fff",fontSize:"13px",fontWeight:"500"}}>{u.username}
                        {u.id===me.id && <span style={{marginLeft:"7px",padding:"1px 7px",background:tc+"33",color:tc,borderRadius:"10px",fontSize:"10px"}}>You</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{padding:"14px 18px"}}><span style={{padding:"3px 10px",background:u.role==="admin"?tc+"22":"#ffffff0a",color:u.role==="admin"?tc:"#8888aa",border:`1px solid ${u.role==="admin"?tc+"44":"#ffffff18"}`,borderRadius:"20px",fontSize:"11px",textTransform:"capitalize"}}>{u.role}</span></td>
                <td style={{padding:"14px 18px",color:"#8888aa",fontSize:"11px"}}>{new Date(u.created_at).toLocaleDateString("en-PH",{year:"numeric",month:"short",day:"numeric"})}</td>
                <td style={{padding:"14px 18px"}}>{u.id!==me.id && <button onClick={()=>del(u.id)} style={{padding:"5px 13px",background:"#ff4b4b18",color:"#ff6b6b",border:"1px solid #ff4b4b33",borderRadius:"7px",cursor:"pointer",fontSize:"11px"}}>Remove</button>}</td>
              </tr>
            ))}
            {!users.length && <tr><td colSpan={4} style={{padding:"36px",textAlign:"center",color:"#556"}}>No users found.</td></tr>}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
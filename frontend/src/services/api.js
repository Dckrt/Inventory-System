const API = "http://localhost:5000";

export const getToken = () => localStorage.getItem("token");
export const getUser = () => JSON.parse(localStorage.getItem("user") || "{}");
export const getShop = () => JSON.parse(localStorage.getItem("shop") || "{}");

export const apiFetch = async (path, options = {}) => {
  const token = getToken();
  const res = await fetch(API + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  return res.json();
};

export default API;
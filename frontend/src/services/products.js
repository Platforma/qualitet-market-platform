import { API } from "./api";

export async function getProducts() {
  const res = await fetch(`${API}/api/products`);
  return await res.json();
}

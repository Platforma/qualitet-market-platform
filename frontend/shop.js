const API_BASE = "https://qualitet-market.com/api";

async function loadProducts() {
  try {
    const res = await fetch(`${API_BASE}/products`);
    const data = await res.json();

    const container = document.getElementById("products");
    container.innerHTML = "";

    data.items.forEach(product => {
      const el = document.createElement("div");
      el.className = "product-card";
      el.innerHTML = `
        <img src="${product.image}" alt="${product.name}" />
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <span class="price">${product.price} zł</span>
        <button onclick="addToCart('${product.id}')">Dodaj do koszyka</button>
      `;
      container.appendChild(el);
    });
  } catch (err) {
    console.error("Błąd ładowania produktów:", err);
  }
}

async function addToCart(productId) {
  try {
    const res = await fetch(`${API_BASE}/cart/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId })
    });

    const result = await res.json();
    alert(result.message || "Dodano do koszyka!");
  } catch (err) {
    console.error("Błąd dodawania do koszyka:", err);
  }
}

async function loadCart() {
  try {
    const res = await fetch(`${API_BASE}/cart`);
    const data = await res.json();

    const container = document.getElementById("cart");
    container.innerHTML = "";

    data.items.forEach(item => {
      const el = document.createElement("div");
      el.className = "cart-item";
      el.innerHTML = `
        <span>${item.name}</span>
        <span>${item.quantity} szt.</span>
        <span>${item.price} zł</span>
      `;
      container.appendChild(el);
    });
  } catch (err) {
    console.error("Błąd ładowania koszyka:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  loadCart();
});

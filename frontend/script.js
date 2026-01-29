const API_URL = "http://localhost:3000/api";
let cart = [];

// ================= LOAD MENU =================
async function loadMenu() {
  try {
    const res = await fetch(`${API_URL}/menus`);
    const menus = await res.json();

    const menuList = document.getElementById("menu-list");
    menuList.innerHTML = "";

    menus.forEach(menu => {
      const div = document.createElement("div");
      div.className = "menu-card";
      div.innerHTML = `
        <img src="http://localhost:3000${menu.image_url}" />
        <h4>${menu.name}</h4>
        <p>Rp ${menu.price.toLocaleString()}</p>
        <button>Tambah</button>
      `;
      div.querySelector("button").onclick = () => addToCart(menu);
      menuList.appendChild(div);
    });

  } catch (err) {
    document.getElementById("menu-list").innerHTML =
      "<p style='color:red'>❌ Gagal load menu</p>";
  }
}

// ================= CART =================
function addToCart(menu) {
  const item = cart.find(i => i.id === menu.id);
  if (item) {
    item.qty++;
  } else {
    cart.push({ id: menu.id, name: menu.name, price: menu.price, qty: 1 });
  }
  renderCart();
}

function renderCart() {
  const list = document.getElementById("cart-items");
  const totalEl = document.getElementById("total-price");

  list.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    total += item.price * item.qty;
    const li = document.createElement("li");
    li.textContent = `${item.name} x${item.qty}`;
    list.appendChild(li);
  });

  totalEl.textContent = `Rp ${total.toLocaleString()}`;
}

// ================= CREATE ORDER =================
async function submitOrder() {
  if (cart.length === 0) {
    alert("Keranjang masih kosong");
    return;
  }

  const payload = {
    table_number: 1, // sementara hardcode
    items: cart.map(item => ({
      menu_id: item.id,
      quantity: item.qty
    }))
  };

  try {
    const res = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await res.json();

    if (!res.ok) {
      alert(result.message || "Gagal membuat order");
      return;
    }

    alert("✅ Order berhasil dibuat!");
    cart = [];
    renderCart();

  } catch (err) {
    alert("❌ Gagal mengirim order");
  }
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  loadMenu();
  document
    .getElementById("order-btn")
    .addEventListener("click", submitOrder);
});

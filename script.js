// Simple static food store front-end with client-side cart (localStorage)

const products = [
  { id: "p1", name: "Margherita Pizza", desc: "Fresh tomatoes, basil, mozzarella", price: 9.99, img: "https://images.unsplash.com/photo-1604908177522-5a32279b6f3f?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=1" },
  { id: "p2", name: "Spicy Chicken Wrap", desc: "Grilled chicken, spicy mayo, lettuce", price: 7.50, img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=2" },
  { id: "p3", name: "Caesar Salad", desc: "Crisp romaine, parmesan, croutons", price: 6.25, img: "https://images.unsplash.com/photo-1552332386-f8dd00dc0bde?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=3" },
  { id: "p4", name: "Chocolate Brownie", desc: "Rich chocolate with walnut", price: 3.99, img: "https://images.unsplash.com/photo-1604908176960-7b9a7a4f2f6f?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=4" },
  { id: "p5", name: "Avocado Toast", desc: "Smashed avo, lemon, chilli flakes", price: 5.75, img: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=5" }
];

const CART_KEY = "foodStoreCart";

function formatPrice(n){ return `$${n.toFixed(2)}` }

function loadCart(){
  const raw = localStorage.getItem(CART_KEY);
  return raw ? JSON.parse(raw) : {};
}
function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

function addToCart(productId){
  const cart = loadCart();
  cart[productId] = (cart[productId] || 0) + 1;
  saveCart(cart);
  renderCartCount();
  animateAddToCart();
}

function removeFromCart(productId){
  const cart = loadCart();
  delete cart[productId];
  saveCart(cart);
  renderCart();
  renderCartCount();
}

function changeQty(productId, delta){
  const cart = loadCart();
  const cur = cart[productId] || 0;
  const next = cur + delta;
  if(next <= 0) delete cart[productId]; else cart[productId] = next;
  saveCart(cart);
  renderCart();
  renderCartCount();
}

function totalCart(){
  const cart = loadCart();
  let total = 0;
  for(const id in cart){
    const prod = products.find(p=>p.id===id);
    if(prod) total += prod.price * cart[id];
  }
  return total;
}

function renderProducts(list){
  const container = document.getElementById("products");
  container.innerHTML = "";
  list.forEach(p=>{
    const el = document.createElement("article");
    el.className = "card";
    el.innerHTML = `
      <div class="thumb" style="background-image:url('${p.img}')"></div>
      <h4>${p.name}</h4>
      <p>${p.desc}</p>
      <div class="meta">
        <div class="price">${formatPrice(p.price)}</div>
        <button class="btn btn-primary" data-add="${p.id}">Add</button>
      </div>
    `;
    container.appendChild(el);
  });

  container.querySelectorAll("[data-add]").forEach(btn=>{
    btn.addEventListener("click", e=>{
      const id = e.currentTarget.dataset.add;
      addToCart(id);
    });
  });
}

function renderCart(){
  const container = document.getElementById("cart-items");
  container.innerHTML = "";
  const cart = loadCart();
  if(Object.keys(cart).length===0){
    container.innerHTML = `<p style="color:#666;padding:8px">Your cart is empty.</p>`;
    document.getElementById("cart-total").textContent = formatPrice(0);
    return;
  }

  for(const id in cart){
    const qty = cart[id];
    const p = products.find(x=>x.id===id);
    if(!p) continue;
    const item = document.createElement("div");
    item.className = "cart-item";
    item.innerHTML = `
      <img src="${p.img}" alt="${p.name}" />
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong>${p.name}</strong>
          <span>${formatPrice(p.price * qty)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
          <div class="qty-controls">
            <button class="btn btn-secondary" data-decrease="${id}">−</button>
            <span style="min-width:26px;text-align:center">${qty}</span>
            <button class="btn btn-secondary" data-increase="${id}">+</button>
            <button class="btn" style="margin-left:8px" data-remove="${id}">Remove</button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(item);
  }

  container.querySelectorAll("[data-increase]").forEach(b=>b.addEventListener("click", e=>changeQty(e.currentTarget.dataset.increase, +1)));
  container.querySelectorAll("[data-decrease]").forEach(b=>b.addEventListener("click", e=>changeQty(e.currentTarget.dataset.decrease, -1)));
  container.querySelectorAll("[data-remove]").forEach(b=>b.addEventListener("click", e=>removeFromCart(e.currentTarget.dataset.remove)));

  document.getElementById("cart-total").textContent = formatPrice(totalCart());
}

function renderCartCount(){
  const countEl = document.getElementById("cart-count");
  const cart = loadCart();
  const count = Object.values(cart).reduce((s,n)=>s+n,0);
  countEl.textContent = count;
}

function animateAddToCart(){
  // tiny visual feedback: flash cart button
  const btn = document.getElementById("cart-btn");
  btn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 240 });
}

function openCart(){
  const modal = document.getElementById("cart-modal");
  modal.setAttribute("aria-hidden","false");
  renderCart();
}
function closeCart(){
  const modal = document.getElementById("cart-modal");
  modal.setAttribute("aria-hidden","true");
}

function clearCart(){
  localStorage.removeItem(CART_KEY);
  renderCart();
  renderCartCount();
}

function checkout(){
  const total = totalCart();
  if(total === 0){
    alert("Your cart is empty.");
    return;
  }
  // In a real site you would integrate Stripe / gateway + backend.
  // For demo, simulate a quick checkout.
  const name = prompt("Enter your name for the order:");
  if(!name) return;
  alert(`Thanks ${name}! Your order of ${formatPrice(total)} has been placed (demo).`);
  clearCart();
  closeCart();
}

// Search
function setupSearch(){
  const input = document.getElementById("search");
  input.addEventListener("input", e=>{
    const q = e.target.value.trim().toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
    renderProducts(filtered);
  });
}

// Wire UI
document.addEventListener("DOMContentLoaded", ()=>{
  renderProducts(products);
  renderCartCount();
  setupSearch();

  document.getElementById("cart-btn").addEventListener("click", openCart);
  document.getElementById("close-cart").addEventListener("click", closeCart);
  document.getElementById("clear-cart").addEventListener("click", ()=>{ if(confirm("Clear cart?")) clearCart(); });
  document.getElementById("checkout").addEventListener("click", checkout);
});
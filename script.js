let currentMembership = "member"; // Default membership state: 'member' or 'non-member'

const products = [
  {
    id: 1,
    name: "PSME-VSUSC Organization Polo Shirt",
    category: "polo",
    memberPrice: 599,
    nonMemberPrice: 699,
    description: "Premium official organization polo shirt.",
    tag: "OFFICIAL",
    image: "/polo-shirt.jpg"
  },
  {
    id: 2,
    name: "PSME-VUSC Lanyard",
    category: "accessory",
    memberPrice: 100,
    nonMemberPrice: 119,
    description: "Official customized PSME-VSUSC lanyard.",
    tag: "ESSENTIAL",
    image: "/lanyard-accessory.jpg"
  },
  {
    id: 3,
    name: "PSME-VSUSC Windbreaker Jacket",
    category: "jacket",
    memberPrice: 1199,
    nonMemberPrice: 1299,
    description: "Official customized PSME-VSUSC Windbreaker Jacket.",
    tag: "OFFICIAL",
    image: "/windbreaker-jacket.jpg"
  }
];

let cart = JSON.parse(localStorage.getItem("psmeCart") || "[]");
const peso = n => "₱" + n.toLocaleString("en-PH");

// Get price based on current membership status
function getPrice(product) {
  return currentMembership === "member" ? product.memberPrice : product.nonMemberPrice;
}

// Function to handle switching membership status
function updateMembershipStatus(status) {
  currentMembership = status;
  
  // Sync dropdowns across shop and checkout modal
  const shopSelect = document.getElementById("membership-status");
  const checkoutSelect = document.getElementById("checkout-membership-type");
  if(shopSelect) shopSelect.value = status;
  if(checkoutSelect) checkoutSelect.value = status;

  renderProducts();
  renderCart();
  if (document.getElementById("checkout-modal") && document.getElementById("checkout-modal").classList.contains("open")) {
    renderCheckout();
  }
}

function renderProducts(category="all") {
  const box = document.getElementById("products");
  if (!box) return;

  const list = category === "all" ? products : products.filter(p => p.category === category);

  box.innerHTML = list.map(p => {
    const price = getPrice(p);
    return `
    <article class="product">
      <div class="product-image">
        ${p.tag ? `<span class="tag">${p.tag}</span>` : ""}
        <img 
          src="${p.image}" 
          alt="${p.name}" 
          class="product-img" 
          onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';"
        />
        <div class="placeholder" style="display:none;">${p.category.toUpperCase()}</div>
      </div>
      <div class="product-info">
        <span class="category">${p.category.toUpperCase()}</span>
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <p class="membership-note" style="font-size: 0.85rem; color: #666; margin-bottom: 8px;">
          Member: ₱${p.memberPrice} | Non-Member: ₱${p.nonMemberPrice}
        </p>
        <div class="product-bottom" style="display: flex; flex-direction: column; gap: 10px;">
          <span class="price">${peso(price)}</span>
          <div class="quantity-picker" style="display: flex; align-items: center; gap: 8px;">
            <label for="qty-${p.id}" style="font-size: 0.85rem; font-weight: bold;">Qty:</label>
            <input 
              type="number" 
              id="qty-${p.id}" 
              value="1" 
              min="1" 
              max="99" 
              style="width: 60px; padding: 4px; text-align: center; border: 1px solid #ccc; border-radius: 4px;"
            />
            <button class="add" onclick="addToCart(${p.id})" style="flex-grow: 1;">Add to Cart</button>
          </div>
        </div>
      </div>
    </article>`;
  }).join("");
}

function addToCart(id) {
  const qtyInput = document.getElementById(`qty-${id}`);
  const quantityToAdd = qtyInput ? parseInt(qtyInput.value) || 1 : 1;

  const item = cart.find(x => x.id === id);
  if (item) {
    item.qty += quantityToAdd;
  } else {
    cart.push({ id, qty: quantityToAdd });
  }

  // Reset input field back to 1
  if (qtyInput) qtyInput.value = 1;

  saveCart(); 
  openCart();
}

function removeFromCart(id) {
  cart = cart.filter(x => x.id !== id);
  saveCart();
}

function saveCart() {
  localStorage.setItem("psmeCart", JSON.stringify(cart));
  renderCart();
}

function cartTotal() {
  return cart.reduce((s, x) => {
    const p = products.find(y => y.id === x.id);
    return s + (p ? getPrice(p) * x.qty : 0);
  }, 0);
}

function renderCart() {
  const countEl = document.getElementById("cart-count");
  if (countEl) countEl.textContent = cart.reduce((s, x) => s + x.qty, 0);

  const box = document.getElementById("cart-items");
  if (!box) return;

  box.innerHTML = cart.length ? cart.map(x => {
    const p = products.find(y => y.id === x.id);
    const price = getPrice(p);
    return `
      <div class="cart-line">
        <div>
          <h4>${p.name}</h4>
          <p>${peso(price)} × ${x.qty} = <strong>${peso(price * x.qty)}</strong></p>
        </div>
        <button class="remove" onclick="removeFromCart(${p.id})">Remove</button>
      </div>`;
  }).join("") : '<p class="empty">Your cart is empty.</p>';

  const totalEl = document.getElementById("cart-total");
  if (totalEl) totalEl.textContent = peso(cartTotal());
}

function openCart() { document.getElementById("cart-overlay").classList.add("open"); }
function closeCart() { document.getElementById("cart-overlay").classList.remove("open"); }

function goToCheckout() {
  if (!cart.length) { alert("Your cart is empty."); return; }
  closeCart();
  renderCheckout();
  document.getElementById("checkout-modal").classList.add("open");
}

function closeCheckout() { document.getElementById("checkout-modal").classList.remove("open"); }

function renderCheckout() {
  document.getElementById("checkout-summary").innerHTML = cart.map(x => {
    const p = products.find(y => y.id === x.id);
    const price = getPrice(p);
    return `<div class="summary-item"><span>${p.name} × ${x.qty}</span><strong>${peso(price * x.qty)}</strong></div>`;
  }).join("");
  document.getElementById("checkout-total").textContent = peso(cartTotal());
}

function toggleDeliveryFields(value) {
  document.getElementById("delivery-fields").classList.toggle("hidden", value !== "Delivery");
}

function showMessage(text, type) {
  const box = document.getElementById("form-message");
  if (box) {
    box.className = "form-message " + type;
    box.textContent = text;
  }
}

async function submitOrder(e) {
  e.preventDefault();
  const button = document.getElementById("submit-order");
  const file = document.getElementById("proof").files[0];

  if (!supabaseClient) {
    showMessage("Connect Supabase first by editing config.js. Your order has not been submitted.", "error");
    return;
  }
  if (!file) { showMessage("Please upload your proof of payment.", "error"); return; }
  if (file.size > 5 * 1024 * 1024) { showMessage("Proof of payment must be 5 MB or smaller.", "error"); return; }

  const form = new FormData(e.target);
  const orderItems = cart.map(x => {
    const p = products.find(y => y.id === x.id);
    const price = getPrice(p);
    return { product_id: p.id, product_name: p.name, price: price, quantity: x.qty, line_total: price * x.qty };
  });

  button.disabled = true; button.textContent = "Submitting...";
  showMessage("Uploading proof of payment...", "");

  try {
    const orderId = "PSME-" + new Date().getFullYear() + "-" + crypto.randomUUID().slice(0, 8).toUpperCase();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${new Date().getFullYear()}/${orderId}-${safeName}`;

    const upload = await supabaseClient.storage.from(STORAGE_BUCKET).upload(path, file, { upsert: false });
    if (upload.error) throw upload.error;

    const total = cartTotal();
    const { data, error } = await supabaseClient.from("orders").insert({
      order_number: orderId,
      full_name: form.get("name"),
      student_id: form.get("studentId"),
      course_year: form.get("courseYear"),
      contact_number: form.get("contact"),
      payment_method: form.get("payment"),
      fulfillment_method: form.get("fulfillment"),
      delivery_address: form.get("address") || null,
      total_amount: total,
      proof_path: path,
      payment_status: "Pending",
      order_status: "Pending"
    }).select("id,order_number").single();

    if (error) throw error;

    const items = orderItems.map(i => ({ ...i, order_id: data.id }));
    const itemInsert = await supabaseClient.from("order_items").insert(items);
    if (itemInsert.error) throw itemInsert.error;

    cart = []; saveCart(); e.target.reset(); toggleDeliveryFields("");
    closeCheckout();
    alert(`Order submitted successfully!\n\nOrder Number: ${data.order_number}\n\nPlease keep this number for your records.`);
  } catch (err) {
    console.error(err);
    showMessage("Order submission failed: " + (err.message || "Unknown error"), "error");
  } finally {
    button.disabled = false; button.textContent = "Submit Order";
  }
}

// Global initialization on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  renderCart();

  // Attach filter events if filter buttons exist in HTML
  document.querySelectorAll(".filter").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderProducts(btn.dataset.category);
  }));

  // Attach order form listener
  const orderForm = document.getElementById("order-form");
  if (orderForm) orderForm.addEventListener("submit", submitOrder);

  // Attach lookup button listener
  const lookupBtn = document.getElementById('lookup-order-btn');
  if (lookupBtn) {
    lookupBtn.addEventListener('click', async () => {
      const orderInput = document.getElementById('lookup-order-input');
      const orderNumber = orderInput ? orderInput.value.trim() : '';
      const resultCard = document.getElementById('order-status-result');
      const errorMsg = document.getElementById('order-lookup-error');

      if (resultCard) resultCard.style.display = 'none';
      if (errorMsg) errorMsg.style.display = 'none';

      if (!orderNumber) {
        if (errorMsg) {
          errorMsg.textContent = 'Please enter a valid Order Number.';
          errorMsg.style.display = 'block';
        }
        return;
      }

      if (!supabaseClient) {
        if (errorMsg) {
          errorMsg.textContent = 'Supabase client is not connected.';
          errorMsg.style.display = 'block';
        }
        return;
      }

      // Fetch order from Supabase
      const { data, error } = await supabaseClient
        .from('orders')
        .select('order_number, full_name, order_status, total_amount')
        .eq('order_number', orderNumber)
        .single();

      if (error || !data) {
        console.error("Lookup error:", error);
        if (errorMsg) {
          errorMsg.textContent = 'Order not found. Please double-check your Order Number.';
          errorMsg.style.display = 'block';
        }
        return;
      }

      // Populate results
      const resOrderNo = document.getElementById('res-order-no');
      const resName = document.getElementById('res-name');
      const resStatus = document.getElementById('res-status');
      const resTotal = document.getElementById('res-total');

      if (resOrderNo) resOrderNo.textContent = data.order_number;
      if (resName) resName.textContent = data.full_name;
      if (resStatus) resStatus.textContent = data.order_status || 'Pending';
      if (resTotal) resTotal.textContent = peso(data.total_amount);

      if (resultCard) resultCard.style.display = 'block';
    });
  }
});

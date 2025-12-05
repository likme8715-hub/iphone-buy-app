async function fetchIphones() {
  const res = await fetch('/api/iphones');
  return res.json();
}

function renderProducts(products) {
  const container = document.getElementById('products');
  container.innerHTML = '';
  const select = document.getElementById('productSelect');
  select.innerHTML = '';
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}" />
      <h3>${p.name}</h3>
      <p>${p.storage} • $${p.price}</p>
      <p style="color:${p.stock? 'green':'red'}; margin-top:6px">Stock: ${p.stock}</p>
      <button ${p.stock===0 ? 'disabled' : ''} data-id="${p.id}">Quick buy</button>
    `;
    container.appendChild(card);

    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.name} (${p.storage}) — $${p.price} — ${p.stock} in stock`;
    select.appendChild(opt);
  });

  // quick buy handlers
  container.querySelectorAll('button[data-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      document.getElementById('productSelect').value = id;
      document.getElementById('quantity').value = 1;
      // scroll to purchase form
      document.getElementById('purchaseForm').scrollIntoView({ behavior: 'smooth' });
    });
  });
}

async function refreshOrders() {
  const res = await fetch('/api/orders');
  const orders = await res.json();
  const list = document.getElementById('ordersList');
  list.innerHTML = '';
  orders.slice().reverse().forEach(o => {
    const li = document.createElement('li');
    li.textContent = `${o.createdAt.split('T')[0]}: ${o.buyer.name} ordered ${o.quantity}× ${o.productName} — $${o.total}`;
    list.appendChild(li);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const products = await fetchIphones();
  renderProducts(products);
  await refreshOrders();

  const form = document.getElementById('purchaseForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      id: document.getElementById('productSelect').value,
      quantity: parseInt(document.getElementById('quantity').value, 10),
      buyer: {
        name: document.getElementById('buyerName').value,
        email: document.getElementById('buyerEmail').value
      }
    };
    const resp = await fetch('/api/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await resp.json();
    const msg = document.getElementById('message');
    if (resp.ok) {
      msg.style.color = 'green';
      msg.textContent = `Order placed! ID: ${data.order.orderId} — Total $${data.order.total}`;
      // refresh UI
      const newProducts = await fetchIphones();
      renderProducts(newProducts);
      await refreshOrders();
      form.reset();
    } else {
      msg.style.color = 'crimson';
      msg.textContent = data.error || 'Failed to place order';
    }
    setTimeout(() => { msg.textContent = ''; }, 6000);
  });
});

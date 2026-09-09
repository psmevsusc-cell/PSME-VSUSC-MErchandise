document.addEventListener('DOMContentLoaded', async () => {
  const loginSection = document.getElementById('login-section');
  const dashboardSection = document.getElementById('dashboard-section');
  const loginForm = document.getElementById('admin-login-form');
  const loginError = document.getElementById('login-error');
  const logoutBtn = document.getElementById('logout-btn');

  // Check existing session
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) showDashboard();

  // Handle Login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      loginError.style.display = 'none';

      const email = document.getElementById('admin-email').value;
      const password = document.getElementById('admin-password').value;

      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

      if (error) {
        loginError.textContent = error.message;
        loginError.style.display = 'block';
      } else {
        showDashboard();
      }
    });
  }

  // Handle Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await supabaseClient.auth.signOut();
      window.location.reload();
    });
  }

  function showDashboard() {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    loadOrders();
  }

  // Fetch Orders from Supabase
  async function loadOrders() {
    const tableBody = document.getElementById('orders-table-body');

    const { data: orders, error } = await supabaseClient
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      tableBody.innerHTML = `<tr><td colspan="7" style="color:red;">Error fetching orders: ${error.message}</td></tr>`;
      return;
    }

    if (!orders || orders.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7">No orders found.</td></tr>`;
      return;
    }

    tableBody.innerHTML = orders.map(order => {
      const proofUrl = supabaseClient.storage.from(STORAGE_BUCKET).getPublicUrl(order.proof_path).data.publicUrl;

      return `
        <tr>
          <td><strong>${order.order_number}</strong></td>
          <td>${order.full_name}</td>
          <td>${order.student_id}</td>
          <td>₱${order.total_amount.toLocaleString('en-PH')}</td>
          <td><span class="badge badge-${order.order_status}">${order.order_status}</span></td>
          <td><a href="${proofUrl}" target="_blank" class="btn" style="text-decoration:none; font-size:0.8rem;">View Receipt</a></td>
          <td>
            ${order.order_status === 'Pending' 
              ? `<button class="btn" onclick="updateOrderStatus('${order.id}', 'Completed')">Mark Completed</button>`
              : `<span>Done</span>`}
          </td>
        </tr>
      `;
    }).join('');
  }

  // Update Status Function
  window.updateOrderStatus = async (orderId, newStatus) => {
    const { error } = await supabaseClient
      .from('orders')
      .update({ order_status: newStatus })
      .eq('id', orderId);

    if (error) {
      alert("Failed to update status: " + error.message);
    } else {
      loadOrders();
    }
  };
});
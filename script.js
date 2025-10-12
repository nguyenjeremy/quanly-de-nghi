document.addEventListener('DOMContentLoaded', function() {
  // Hàm thêm dòng mặt hàng trong trang nhap_hoadon.html
  function addItemRow() {
    let tbody = document.getElementById('itemsBody');
    let tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input class="itemCode" type="text"></td>
      <td><input class="itemQty" type="number"></td>
      <td><input class="itemPrice" type="number"></td>
      <td><button type="button" class="removeItem">X</button></td>`;
    tbody.appendChild(tr);
    tr.querySelector('.removeItem').addEventListener('click', () => tr.remove());
  }

  // Lưu hóa đơn vào localStorage (trang nhap_hoadon.html)
  function saveInvoice() {
    let supplier = document.getElementById('supplier').value.trim();
    let invoiceNumber = document.getElementById('invoiceNumber').value.trim();
    let date = document.getElementById('date').value;
    if (!supplier || !invoiceNumber) {
      alert('Hãy nhập đầy đủ Nhà cung cấp và Số hóa đơn.');
      return;
    }
    let rows = document.querySelectorAll('#itemsBody tr');
    let items = [];
    rows.forEach(r => {
      let code = r.querySelector('.itemCode').value.trim();
      let qty = parseFloat(r.querySelector('.itemQty').value);
      let price = parseFloat(r.querySelector('.itemPrice').value);
      if (code && !isNaN(qty) && !isNaN(price)) {
        items.push({ code, quantity: qty, price: price });
      }
    });
    let invoice = { supplier, invoiceNumber, date, items };
    // Lưu vào mảng invoices trong localStorage
    let invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    invoices.push(invoice);
    localStorage.setItem('invoices', JSON.stringify(invoices));
    alert('Đã lưu hóa đơn thành công!');
    window.location.href = 'index.html';
  }

  // Hiển thị danh sách hóa đơn (trang index.html)
  function displayInvoices() {
    let list = document.getElementById('invoiceList');
    let invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    invoices.forEach(inv => {
      let li = document.createElement('li');
      li.textContent = `Số HĐ ${inv.invoiceNumber} - ${inv.supplier} (ngày ${inv.date})`;
      list.appendChild(li);
    });
  }

  // Xuất toàn bộ localStorage ra file JSON
  function exportJSON() {
    let data = {};
    Object.keys(localStorage).forEach(key => {
      try {
        data[key] = JSON.parse(localStorage.getItem(key));
      } catch {
        data[key] = localStorage.getItem(key);
      }
    });
    let blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    saveAs(blob, 'data.json'); // saveAs từ FileSaver.js:contentReference[oaicite:13]{index=13}
  }

  // Nhập dữ liệu từ file JSON vào localStorage
  function importJSON(event) {
    let file = event.target.files[0];
    if (!file) return;
    let reader = new FileReader();
    reader.onload = function(e) {
      try {
        let data = JSON.parse(e.target.result);
        localStorage.clear();
        Object.keys(data).forEach(key => {
          localStorage.setItem(key, JSON.stringify(data[key]));
        });
        alert('Đã tải dữ liệu từ JSON thành công!');
        location.reload();
      } catch (err) {
        alert('File JSON không hợp lệ.');
      }
    };
    reader.readAsText(file);
  }

  // Điền dữ liệu vào phiếu đề nghị mua vật tư
  function populateVattu() {
    let invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    if (invoices.length === 0) return;
    let inv = invoices[invoices.length - 1];
    document.getElementById('vattuSupplier').textContent = inv.supplier;
    document.getElementById('vattuInvoice').textContent = inv.invoiceNumber;
    document.getElementById('vattuDate').textContent = inv.date;
    let tbody = document.getElementById('vattuBody');
    inv.items.forEach((item, idx) => {
      let tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${item.code}</td>
        <td></td>
        <td>${item.quantity}</td>
        <td></td>`;
      tbody.appendChild(tr);
    });
  }

  // Điền dữ liệu vào phiếu đề nghị thanh toán
  function populatePayment() {
    let invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    if (invoices.length === 0) return;
    let inv = invoices[invoices.length - 1];
    let tbody = document.getElementById('paymentBody');
    let total = 0;
    for (let i = 0; i < 10; i++) {
      let tr = document.createElement('tr');
      if (i < inv.items.length) {
        let item = inv.items[i];
        let sum = item.quantity * item.price;
        total += sum;
        tr.innerHTML = `
          <td>${i + 1}</td>
          <td>${item.code}</td>
          <td></td>
          <td>${item.quantity}</td>
          <td>${item.price}</td>
          <td>${sum}</td>`;
      } else {
        tr.innerHTML = `
          <td>${i + 1}</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>`;
      }
      tbody.appendChild(tr);
    }
    document.getElementById('cost').textContent = total;
    document.getElementById('paymentDate').textContent = inv.date;
  }

  // Hiển thị báo cáo danh sách hóa đơn
  function displayReport() {
    let tbody = document.getElementById('reportBody');
    let invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    invoices.forEach(inv => {
      let total = inv.items.reduce((sum, it) => sum + it.quantity * it.price, 0);
      let tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${inv.invoiceNumber}</td>
        <td>${inv.supplier}</td>
        <td>${inv.date}</td>
        <td>${total}</td>`;
      tbody.appendChild(tr);
    });
  }

  // Thiết lập sự kiện và khởi tạo
  if (document.getElementById('addItem')) {
    document.getElementById('addItem').addEventListener('click', addItemRow);
    document.getElementById('saveInvoice').addEventListener('click', saveInvoice);
    addItemRow(); // tạo sẵn 1 dòng
  }
  if (document.getElementById('invoiceList')) {
    displayInvoices();
  }
  if (document.getElementById('saveJsonBtn')) {
    document.getElementById('saveJsonBtn').addEventListener('click', exportJSON);
    document.getElementById('loadJsonBtn').addEventListener('click', () => {
      document.getElementById('fileInput').click();
    });
    document.getElementById('fileInput').addEventListener('change', importJSON);
  }
  if (document.getElementById('vattuBody')) {
    populateVattu();
  }
  if (document.getElementById('paymentBody')) {
    populatePayment();
  }
  if (document.getElementById('reportBody')) {
    displayReport();
  }
});

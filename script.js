/* script.js */
document.addEventListener('DOMContentLoaded', () => {
  const invoiceBody = document.getElementById('invoiceBody');
  const allItemsBody = document.getElementById('allItemsBody');
  let rowCount = 0;

  // Thêm dòng mới vào hóa đơn
  document.getElementById('addRowBtn').addEventListener('click', () => {
    rowCount++;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${rowCount}</td>
      <td><input type="text" class="item-name" placeholder="Tên hàng"></td>
      <td><input type="number" class="qty" value="1" min="1"></td>
      <td><input type="text" class="unit" placeholder="Đơn vị"></td>
      <td><input type="number" class="price" value="0"></td>
      <td><input type="text" class="dest" placeholder="Nơi nhận"></td>
      <td class="total-cell">0</td>
    `;
    invoiceBody.appendChild(tr);

    // Khi thay đổi số lượng hoặc đơn giá, cập nhật thành tiền
    tr.querySelector('.qty').addEventListener('input', () => updateRowTotal(tr));
    tr.querySelector('.price').addEventListener('input', () => updateRowTotal(tr));
  });

  // Cập nhật giá trị Thành tiền cho một dòng
  function updateRowTotal(row) {
    const qty = parseFloat(row.querySelector('.qty').value) || 0;
    const price = parseFloat(row.querySelector('.price').value) || 0;
    const totalCell = row.querySelector('.total-cell');
    const total = qty * price;
    // Định dạng với dấu chấm hàng nghìn
    totalCell.textContent = total.toLocaleString('vi-VN');
  }

  // Lưu dữ liệu ra file JSON
  document.getElementById('saveBtn').addEventListener('click', () => {
    const date = document.getElementById('invoiceDate').value;
    const supplier = document.getElementById('supplier').value;
    const items = [];
    invoiceBody.querySelectorAll('tr').forEach((tr, idx) => {
      items.push({
        stt: idx+1,
        name: tr.querySelector('.item-name').value,
        qty: tr.querySelector('.qty').value,
        unit: tr.querySelector('.unit').value,
        price: tr.querySelector('.price').value,
        dest: tr.querySelector('.dest').value,
      });
    });
    const data = { date, supplier, items };
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "invoice.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  // Tải dữ liệu từ file JSON và hiển thị
  document.getElementById('loadBtn').addEventListener('click', () => {
    document.getElementById('fileInput').click();
  });
  document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(e.target.result);
      document.getElementById('invoiceDate').value = data.date;
      document.getElementById('supplier').value = data.supplier;
      // Xóa bảng cũ
      invoiceBody.innerHTML = '';
      rowCount = 0;
      data.items.forEach(item => {
        document.getElementById('addRowBtn').click();
        const lastRow = invoiceBody.lastElementChild;
        lastRow.querySelector('.item-name').value = item.name;
        lastRow.querySelector('.qty').value = item.qty;
        lastRow.querySelector('.unit').value = item.unit;
        lastRow.querySelector('.price').value = item.price;
        lastRow.querySelector('.dest').value = item.dest;
        updateRowTotal(lastRow);
      });
      updateAllItemsTable();
    };
    reader.readAsText(file);
  });

  // Hiển thị tất cả mặt hàng vào bảng tổng hợp để chọn in phiếu
  function updateAllItemsTable() {
    allItemsBody.innerHTML = '';
    let idx = 0;
    invoiceBody.querySelectorAll('tr').forEach(tr => {
      idx++;
      const supplier = document.getElementById('supplier').value;
      const name = tr.querySelector('.item-name').value;
      const qty = tr.querySelector('.qty').value;
      const unit = tr.querySelector('.unit').value;
      const price = parseFloat(tr.querySelector('.price').value || 0);
      const dest = tr.querySelector('.dest').value;
      const total = (qty * price).toLocaleString('vi-VN');
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><input type="checkbox" class="select-item"></td>
        <td>${idx}</td>
        <td>${supplier}</td>
        <td>${name}</td>
        <td>${qty}</td>
        <td>${unit}</td>
        <td>${price.toLocaleString('vi-VN')}</td>
        <td>${dest}</td>
        <td>${total}</td>
      `;
      allItemsBody.appendChild(row);
    });
  }

  // Cập nhật bảng tổng khi thêm dòng
  invoiceBody.addEventListener('DOMNodeInserted', updateAllItemsTable);

  // In hóa đơn (in toàn bộ hóa đơn hiển thị)
  document.getElementById('printInvoiceBtn').addEventListener('click', () => {
    window.print(); // In trang hiện tại bao gồm nội dung hóa đơn
  });

  // Xuất Excel (mẫu giản đơn: chuyển bảng All Items sang CSV)
  document.getElementById('exportExcelBtn').addEventListener('click', () => {
    let csv = "STT,NCC,T\u00ean h\u00e0ng,S\u1ed1 l\u01b0\u1ee3ng,\u0110\u01a1n v\u1ecb,\u0110\u01a1n gi\u00e1,N\u01b0\u1edbc nh\u1eadn,Th\u00e0nh ti\u1ec1n\n";
    allItemsBody.querySelectorAll('tr').forEach(tr => {
      const cells = Array.from(tr.querySelectorAll('td'));
      const row = cells.map(td => td.textContent.trim()).join(",");
      csv += row + "\n";
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payment.csv";
    a.click();
    URL.revokeObjectURL(url);
  });

  // In Phiếu Đề nghị mua vật tư: một phiếu cho mỗi dòng được chọn
  document.getElementById('printPurchaseBtn').addEventListener('click', () => {
    const company = prompt("Chọn công ty:\n1. Công ty TNHH Đầu tư và Phát triển Thư Thái\n2. Công ty TNHH MTV Gạch Tuynel Hiếu Thảo\n3. Công ty TNHH Gạch Tuynel Thanh Phong");
    const companyName = ["", 
      "Công ty TNHH Đầu tư và Phát triển Thư Thái", 
      "Công ty TNHH MTV Gạch Tuynel Hiếu Thảo",
      "Công ty TNHH Gạch Tuynel Thanh Phong"
    ][parseInt(company)];
    allItemsBody.querySelectorAll('tr').forEach(tr => {
      const chk = tr.querySelector('.select-item');
      if (chk && chk.checked) {
        const cells = tr.querySelectorAll('td');
        // Tạo nội dung phiếu
        const popup = window.open('', '_blank');
        popup.document.write(`<html><head><title>Phiếu đề nghị mua vật tư</title><style>
          body{font-family:"Segoe UI";} table{width:100%;border-collapse:collapse;}td,th{border:1px solid #000;padding:5px;}
        </style></head><body>`);
        popup.document.write(`<h2>PHIẾU ĐỀ NGHỊ MUA VẬT TƯ</h2>`);
        popup.document.write(`<p>Công ty: <strong>${companyName}</strong></p>`);
        popup.document.write(`<p>Nhà cung cấp (NCC): <strong>${cells[2].textContent}</strong></p>`);
        popup.document.write(`<table><tr><th>STT</th><th>Tên hàng</th><th>Số lượng</th><th>Đơn vị</th><th>Đơn giá</th><th>Thành tiền</th><th>Nơi nhận</th></tr>`);
        popup.document.write(`<tr>
            <td>${cells[1].textContent}</td>
            <td>${cells[3].textContent}</td>
            <td>${cells[4].textContent}</td>
            <td>${cells[5].textContent}</td>
            <td>${cells[6].textContent}</td>
            <td>${cells[8].textContent}</td>
            <td>${cells[7].textContent}</td>
          </tr></table>`);
        popup.document.write(`<p>Người lập phiếu: ____________</p>`);
        popup.document.write(`<p>Người kiểm soát: ____________</p>`);
        popup.document.write(`<p>Kế toán trưởng: ____________</p>`);
        popup.document.write(`<p>Giám đốc: ____________</p>`);
        popup.document.write(`</body></html>`);
        popup.document.close();
        popup.print();
      }
    });
  });

  // In Phiếu Đề nghị thanh toán: gom các dòng được chọn
  document.getElementById('printPaymentBtn').addEventListener('click', () => {
    const selectedRows = Array.from(allItemsBody.querySelectorAll('tr'))
      .filter(tr => tr.querySelector('.select-item').checked);
    if (selectedRows.length === 0) return alert("Chưa chọn dòng thanh toán.");
    let popup = window.open('', '_blank');
    popup.document.write(`<html><head><title>Phiếu đề nghị thanh toán</title><style>
      body{font-family:"Segoe UI";} table{width:100%;border-collapse:collapse;}td,th{border:1px solid #000;padding:5px;}
    </style></head><body>`);
    popup.document.write(`<h2>PHIẾU ĐỀ NGHỊ THANH TOÁN</h2>`);
    popup.document.write(`<table><tr><th>STT</th><th>Tên hàng</th><th>Số lượng</th><th>Đơn vị</th><th>Đơn giá</th><th>Thành tiền</th></tr>`);
    let totalCost = 0;
    selectedRows.forEach((tr, i) => {
      const cells = tr.querySelectorAll('td');
      const stt = i+1;
      const name = cells[3].textContent;
      const qty = parseFloat(cells[4].textContent);
      const unit = cells[5].textContent;
      const price = parseFloat(cells[6].textContent);
      const cost = qty * price;
      totalCost += cost;
      popup.document.write(`<tr>
        <td>${stt}</td><td>${name}</td><td>${qty}</td><td>${unit}</td><td>${price.toLocaleString('vi-VN')}</td><td>${cost.toLocaleString('vi-VN')}</td>
      </tr>`);
    });
    popup.document.write(`</table>`);
    popup.document.write(`<p>Tổng chi phí: <strong>${totalCost.toLocaleString('vi-VN')}</strong></p>`);
    popup.document.write(`<p>Người thụ hưởng: ____________________</p>`);
    popup.document.write(`<p>Duyệt chi ngày: ____/____/________</p>`);
    popup.document.write(`<p>Ký tên:</p><p>Người lập phiếu: __________  Kế toán: __________  Giám đốc: __________</p>`);
    popup.document.write(`</body></html>`);
    popup.document.close();
    popup.print();
  });
});

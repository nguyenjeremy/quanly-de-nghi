let invoices = JSON.parse(localStorage.getItem("invoices") || "[]");

function addRow() {
  const table = document.querySelector("#invoiceTable tbody");
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input></td>
    <td><input></td>
    <td><input type="number"></td>
    <td><input type="number"></td>
    <td><input></td>
  `;
  table.appendChild(row);
}

function saveInvoice() {
  const ncc = document.getElementById("ncc").value;
  const ngay = document.getElementById("ngayHD").value;
  const table = document.querySelectorAll("#invoiceTable tbody tr");
  const items = [];
  table.forEach(tr => {
    const [ten, dvt, sl, dg, nn] = Array.from(tr.querySelectorAll("input")).map(i => i.value);
    if (ten) items.push({ten, dvt, sl, dg, nn});
  });
  invoices.push({ncc, ngay, items});
  localStorage.setItem("invoices", JSON.stringify(invoices));
  alert("💾 Đã lưu hóa đơn!");
}

function showInvoices(forThanhToan = false) {
  const list = document.getElementById("invoiceList");
  list.innerHTML = "";
  invoices.forEach((hd, i) => {
    const div = document.createElement("div");
    div.innerHTML = `<input type="checkbox" id="hd${i}"> <b>${hd.ncc}</b> - ${hd.ngay}`;
    list.appendChild(div);
  });
}

function generateVatTu() {
  const XLSX = window.XLSX;
  invoices.forEach((hd, index) => {
    const ws_data = [["PHIẾU ĐỀ NGHỊ MUA VẬT TƯ"],["Nhà cung cấp:", hd.ncc],["Ngày:", hd.ngay],[],["Tên hàng","ĐVT","Số lượng","Đơn giá","Nơi nhận"]];
    hd.items.forEach(it => ws_data.push([it.ten,it.dvt,it.sl,it.dg,it.nn]));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, "VatTu");
    XLSX.writeFile(wb, `Phieu_DNMVT_${index+1}.xlsx`);
  });
}

function generateThanhToan() {
  const XLSX = window.XLSX;
  const ws_data = [["PHIẾU ĐỀ NGHỊ THANH TOÁN"],["Ngày lập:", new Date().toLocaleDateString()],[],["NCC","Ngày","Tên hàng","Số lượng","Đơn giá","Thành tiền"]];
  invoices.forEach(hd => {
    hd.items.forEach(it => {
      ws_data.push([hd.ncc,hd.ngay,it.ten,it.sl,it.dg,it.sl*it.dg]);
    });
  });
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  XLSX.utils.book_append_sheet(wb, ws, "ThanhToan");
  XLSX.writeFile(wb, `Phieu_DNTT.xlsx`);
}

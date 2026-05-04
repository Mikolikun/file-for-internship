// โหลดข้อมูลสินค้า
async function fetchStock() {
    const res = await fetch('/api/products');
    const products = await res.json();
    const container = document.getElementById('stockList');
    container.innerHTML = '';

    products.forEach(p => {
        container.innerHTML += `
            <tr>
                <td>${p.id}</td>
                <td>${p.name}</td>
                <td id="stock-val-${p.id}" class="stock-count">${p.stock}</td>
                <td>
                    <button class="btn-minus" onclick="changeStock(${p.id}, -1)">-</button>
                    <input type="number" id="input-${p.id}" value="${p.stock}" onchange="directUpdate(${p.id}, this.value)">
                    <button class="btn-plus" onclick="changeStock(${p.id}, 1)">+</button>
                </td>
            </tr>
        `;
    });
}

// ฟังก์ชันสำหรับปุ่ม + และ -
async function changeStock(id, amount) {
    const currentElem = document.getElementById(`stock-val-${id}`);
    const inputElem = document.getElementById(`input-${id}`);
    let newStock = parseInt(currentElem.innerText) + amount;

    if (newStock < 0) return alert("สต็อกต่ำกว่า 0 ไม่ได้");

    const success = await updateDB(id, newStock);
    if (success) {
        currentElem.innerText = newStock;
        inputElem.value = newStock;
    }
}

// ฟังก์ชันยิง API ไปบันทึกใน SQLite
async function updateDB(id, newStock) {
    const res = await fetch('/api/update-stock-only', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, newStock })
    });
    return res.ok;
}

const initData = () => {

    const sql = `INSERT INTO products (id.name, price, stock) VALUES (?, ?, ?)`;
    
    products.forEach(p => {
        db.run(sql, p);
    });
    console.log("หยอดข้อมูลทั้งหมดเรียบร้อย!");
};

window.onload = fetchStock;
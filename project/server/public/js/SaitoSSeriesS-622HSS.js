async function fetchProductData(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`);
        const product = await response.json();

        if (response.ok) {
            // ดึงข้อมูลมาใส่เฉพาะ 3 อย่างที่ต้องการ
            document.getElementById('db-name').innerText = product.name;
            document.getElementById('db-price').innerText = `ราคา: ฿${product.price.toLocaleString()}`;
            document.getElementById('db-stock').innerText = `● ในคลังสินค้า: ${product.stock} ตัว`;
        }
    } catch (err) {
        console.error("Error fetching data:", err);
    }
}

// ถ้าหน้านี้คือ Saito และใน DB ของคุณ Saito คือ ID 4
window.onload = () => {
fetchProductData(4); 
};

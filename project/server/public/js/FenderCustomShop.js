async function fetchProductData(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`);
        const product = await response.json();

        //response.ok คือใช้ตรวจสอบสถานะการส่งคำร้องขอ ผ่าน fetch ว่าสำเร็จหรือไม่
        if (response.ok) {
            // getElementById นำ Element จาก html มา
            //.innertext ใช้ในการเปลื่ยนข้อความ
            // product .name,price,stock คือการนำข้อมูลจาก database มาแสดง
            document.getElementById('db-name').innerText = product.name;
            document.getElementById('db-price').innerText = `ราคา: ฿${product.price.toLocaleString()}`;
            document.getElementById('db-stock').innerText = `● ในคลังสินค้า: ${product.stock} ตัว`;
        }
    } catch (err) {
        console.error("Error fetching data:", err);
    }
}

// สั่งให้ javascipt ทำงานหลังโหลดหน้าwed เสร็จ
window.onload = () => {
fetchProductData(6); 
};

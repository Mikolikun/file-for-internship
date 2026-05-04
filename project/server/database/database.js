const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

// ฟังก์ชันเชื่อมต่อและสร้างฐานข้อมูล
const connectDB = async () => {
    try {
        // 1. สร้าง/เปิดไฟล์ Database
        const db = await open({
            filename: './my_store_db.sqlite', // จะสร้างไฟล์ชื่อนี้ขึ้นมาในโฟลเดอร์ server
            driver: sqlite3.Database
        });
        console.log('✅ เชื่อมต่อ SQLite (แบบไฟล์) สำเร็จ!');

        // 2. สร้างตาราง users (ถ้ายังไม่มี)
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password TEXT
            )
        `);
        console.log('✅ ตรวจสอบ/สร้างตาราง users สำเร็จ!');

        return db; // ส่งตัวฐานข้อมูลกลับไปให้ app.js ใช้งาน
    } catch (err) {
        console.error('❌ เชื่อมต่อล้มเหลว:', err.message);
    }
};

module.exports = connectDB;
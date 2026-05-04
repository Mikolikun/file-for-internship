const express = require('express');        // เรียกเฟรมเวิร์กหลักสำหรับสร้าง Server
const bcrypt = require('bcrypt');          // เครื่องมือสำหรับเข้ารหัส Password (Hashing)
const connectDB = require('./database/database'); // ฟังก์ชันเชื่อมต่อฐานข้อมูลที่เราแยกไฟล์ไว้
const path = require('path');              // ตัวช่วยจัดการเส้นทางไฟล์ (Path) ให้ถูกต้องตาม OS

const app = express();                     // สร้างตัวแปรแอปพลิเคชันขึ้นมา

// --- Middleware ---
app.use(express.urlencoded({ extended: true })); // ทำให้ Server อ่านข้อมูลจากฟอร์ม HTML ได้
app.use(express.json());                         // ทำให้ Server รับ-ส่งข้อมูลแบบ JSON ได้ ใช้ใน API

// บอกให้ Express รู้จักโฟลเดอร์ public
app.use(express.static(path.join(__dirname, 'public')));

let db; 

// --- Routes ---

// 1. หน้าแรก
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

// 2. โซน Register
//app.post การกำหนด HTTP Method แบบ POST async ให้ทำงานแบบไม่ต้องรอ
app.post('/register', async (req, res) => {
    try { // try คือให้ลองทำงานตามโค้ดนี้ถ้าไม่ได้ให้ไปทำใน catch
        const { username, password } = req.body; //ให้ดึงค่า usrname ,password มาจาก body
        if (!username || !password) return res.status(400).send('กรุณากรอกข้อมูลให้ครบถ้วน');

        const hashedPassword = await bcrypt.hash(password, 10); //await คือให้หยุดรอจนกว่าจะเสร็จ bcrypt คือการเข้ารหัสข้อความของ 
        // password 10 ครั้ง
        await db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword]); 
        // db.run เป็นคำสั่ง sql ที่ใช้เพืิ่อเปลืยนแปลงข้อมูล

        res.send(`
            <script>
                alert('✅ สมัครสมาชิกสำเร็จ! ยินดีต้อนรับคุณ ${username}');
                window.location.href = '/html/login.html'; 
            </script> 
        `); //หลังทำเสร็จให้แจ้งผ่าน alert box แล้วให้ไปต่อที่หน้า login 
    } catch (err) { // ถ้าrun ไม่ได้ตรวจข้อความ error แล้วให้จบการทำงาน 
        if (err.message.includes('UNIQUE')) return res.status(400).send('❌ ชื่อผู้ใช้นี้มีคนใช้แล้ว');
        res.status(500).send('เกิดข้อผิดพลาดที่เซิร์ฟเวอร์');
    }
});

// 3. โซน Login
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body; //ให้ดึงค่า usrname ,password มาจาก body
        const user = await db.get(`SELECT * FROM users WHERE username = ?`, [username]); //ให้ db ไปหาชื่อ user จากตาราง

        if (!user || !(await bcrypt.compare(password, user.password))) { // ถ้าค้นหาแล้วไม่เจอชื่อนี้ในระบบ
        //  ให้แสดง ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง  bcrypt.compare(password, user.password ให้ bcrypt ทำการถอดรหัส password
            return res.status(400).send('❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        }

        res.send(`
            <script>
                alert('✅ เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับคุณ ${username}');
                window.location.href = '/'; 
            </script>
        `); //ถ้าผ่าน ให้ขึ้นข้อความผ่าน alert แล้วกลับไปที่หน้า แรกสุด
    } catch (err) {
        res.status(500).send('เกิดข้อผิดพลาด: ' + err.message); //ถ้าผิดให้แสดง message ข้อผิดพลาด
    }
});


//โซน login admin
app.post('/admin', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. ดึงข้อมูลจากตาราง admin 
        const user = await db.get(`SELECT * FROM admin WHERE name = ?`, [username]);   //ให้ db ไปหาชื่อ user จากตาราง

        // 2. ตรวจสอบว่าเจอ user ไหม รหัสตรงไหม
        if (!user || password !== user.password) {
            return res.status(400).send(`
                <script>
                    alert('❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
                    window.history.back(); // กลับไปหน้าเดิม
                </script>
            `);
        }

        // 3. ถ้าถูกต้อง
        res.send(`
            <script>
                alert('✅ เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับคุณ ${username}');
                window.location.href = '/html/adminmenu.html'; 
            </script>
        `);
    } catch (err) {
        res.status(500).send('เกิดข้อผิดพลาด: ' + err.message);
    }
});

// --- API สำหรับจัดการ Stock  ---

// ดึงข้อมูลสินค้า 
app.get('/api/products', async (req, res) => {
    try {
        const rows = await db.all("SELECT * FROM products"); // ให้เลือกจากตาราง products
        res.json(rows); //เอาข้อมูลเป็น json แล้วส่งออกไป
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// เพิ่มสินค้า
app.post('/api/add-product', async (req, res) => {
    try {
        const { name, price, stock } = req.body;
        const result = await db.run(`INSERT INTO products (name, price, stock) VALUES (?, ?, ?)`, [name, price, stock]);
        // เอาข้อมูล name price stock มาจาก db prodect
        res.json({ id: result.lastID, message: "เพิ่มสินค้าสำเร็จ" });  //เป็นการตอบกลับแบบ json 
        // result.lastID คือค่าที่ SQLite ส่งกลับมาหลังจากเรา INSERT ข้อมูลสำเร็จ
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// อัปเดตสต็อก (PATCH)
app.patch('/api/update-stock-only', async (req, res) => {
    try {
        const { id, newStock } = req.body;
        if (newStock < 0) return res.status(400).json({ error: "สต็อกติดลบไม่ได้" }); //ทำให้ stock ติดลบไม่ได้

        await db.run(`UPDATE products SET stock = ? WHERE id = ?`, [newStock, id]);
        res.json({ message: "อัปเดตสต็อกสำเร็จ", stock: newStock });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- เริ่มทำงานเซิร์ฟเวอร์ ---
connectDB().then((database) => { // เรียกฟังก์ชันเชื่อม DB 
    db = database; // เก็บค่า DB ไว้ใช้งานในไฟล์นี้
    app.listen(3000, () => { // เปิดพอร์ต 3000 รอรับคำขอ
        console.log('🚀 Server is running on port 3000');
    });
}).catch(err => {
    console.error("❌ ไม่สามารถเชื่อมต่อฐานข้อมูลได้:", err);
}); 

// ดึงข้อมูลสินค้าเฉพาะตัวตาม ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const productId = req.params.id; // รับค่า ID จาก URL
        
        // ใช้ db.get เพื่อดึงข้อมูลแค่แถวเดียว (Row)
        const product = await db.get(`SELECT * FROM products WHERE id = ?`, [productId]);

        if (product) {
            res.json(product); // ถ้าเจอ ส่งข้อมูลกลับไปเป็น JSON
        } else {
            res.status(404).json({ error: "ไม่พบสินค้า" });
        }
    } catch (err) { //ถ้าไม่มีให้ขึ้น error
        console.error(err);
        res.status(500).json({ error: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" });
    }
});
1.สร้าง virtual environment

python -m venv <ชื่อ>

2.เข้า virtual environment
<ชื่อ>\Scripts\activate

3.ติดตั้งแพ็กเกตจาก requirement2
pip install -r requirement2

5.รันได้เลย 

6.ออก virtual environment โดย

deactivate



เปลื่ยน cpu => gpu
พิมพ์ใน Terminal:

python --version
pip --version


ถ้ามีเลขเวอร์ชันขึ้น (เช่น Python 3.10.12) ✅ ไปต่อได้เลย
ถ้าไม่ขึ้น ให้ติดตั้ง Python 3.10+
 ก่อน

 ขั้นตอนที่ 3 : ตรวจว่า TensorFlow มองเห็น GPU หรือยัง
พิมพ์คำสั่งนี้ใน Terminal:

python -c "from tensorflow.python.client import device_lib; print(device_lib.list_local_devices())"
ถ้ามีบรรทัดแบบนี้👇
name: "/device:GPU:0"
device_type: "GPU"
แสดงว่า TensorFlow เห็น GPU แล้ว ✅
ถ้าไม่เจอ GPU → ทำขั้นตอนที่ 4 ต่อ

5 : ติดตั้ง CUDA และ cuDNN ให้ตรงกับ TensorFlow
เช็กเวอร์ชัน TensorFlow ที่คุณใช้

python -c "import tensorflow as tf; print(tf.__version__)"
ผลลัพธ์จะออกประมาณนี้ เช่น

2.19.0

รายการ	เวอร์ชันที่แนะนำ
TensorFlow	2.19.0
CUDA Toolkit	12.3
cuDNN	9.1

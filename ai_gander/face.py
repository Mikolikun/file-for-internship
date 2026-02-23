import os
import cv2
from deepface import DeepFace

# ซ่อน warning ของ TensorFlow
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# เปิดกล้อง
video_capture = cv2.VideoCapture(0)

# โหลด Haar Cascade สำหรับตรวจจับใบหน้า (อย่าลืมตรวจว่าไฟล์อยู่จริง)
cascade_path = "haarcascade_frontalface_default.xml" #ชื่อไฟล์
face_cascade = cv2.CascadeClassifier(cascade_path) #โหลด โมเดล Haar Cascade สำหรับการตรวจจับวัตถุต่างๆ เช่น ใบหน้า โดยใช้ไฟล์ XML ที่กำหนด.

if face_cascade.empty(): #ถ้าไม่เจอไฟล์
    print("Error loading cascade classifier!")
    exit()#ให้จบการทำงาน

while True:
    ret, frame = video_capture.read() # อ่านเอาภาพจากวิดีโอมาเก็บไว้ใน ret, frame 

    if not ret: #ถ้าไม่เจอภาพให้ออกจาก loop
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY) #เปลื่ยนสีภาพประมวลผลได้ง่าย

    # ตรวจจับใบหน้า
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)

    for (x, y, w, h) in faces:
        # วาดกรอบรอบใบหน้า
        cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)

        # ครอปภาพใบหน้า
        face = frame[y:y + h, x:x + w]

        # วิเคราะห์เพศด้วย DeepFace
        try:
            result = DeepFace.analyze(face, actions=['gender'], enforce_detection=False) #วิเคราะห์รูปภาพว่าเป็นผู้ชายหรือผู้หญิง
            gender = result[0]['gender'] #เก็บค่าเพศไว้ใน gender

            # ตัวอย่าง: ถ้ามีค่าเป็น {'Woman': 99.3, 'Man': 0.7}
            # จะเลือก gender ที่ค่ามากสุด
            predicted_gender = max(gender, key=gender.get) #จะเลือกเพศเพศที่มีคะแนนสูงสุด
            confidence = round(gender[predicted_gender], 2)  # ปัดทศนิยมเหลือ 2 ตำแหน่ง

            # แสดงผลลัพธ์แบบไม่มี np.float32
            cv2.putText(frame, f"{predicted_gender}: {confidence:.2f}%", (x, y + h + 30), #แสดงข้อความใต้กรอบ
            cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

        #ถ้าไม่สามารถวิเคราะห์ได้
        except Exception as e:
            print("วิเคราะห์ไม่ได้:", str(e)) 

    # แสดงวิดีโอ
    cv2.imshow("Gender Detection", frame)

    # ออกจากลูปเมื่อกด 'q'
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# ปิดกล้อง
video_capture.release()
cv2.destroyAllWindows()

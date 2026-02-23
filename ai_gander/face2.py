import os
import cv2
import torch
from deepface import DeepFace

#  ตรวจสอบ GPU
print(" GPU available:", torch.cuda.is_available())
if torch.cuda.is_available():
    print(" Using GPU:", torch.cuda.get_device_name(0))
else:
    print("⚙️ Using CPU")

# ซ่อน warning ของ TensorFlow
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# เปิดกล้อง
video_capture = cv2.VideoCapture(0)

# โหลด Haar Cascade สำหรับตรวจจับใบหน้า
cascade_path = "haarcascade_frontalface_default.xml"
face_cascade = cv2.CascadeClassifier(cascade_path)

if face_cascade.empty():
    print(" Error loading cascade classifier!")
    exit()

frame_count = 0
analyzed_result = None  # เก็บผลวิเคราะห์ล่าสุดไว้ใช้ซ้ำ

while True:
    ret, frame = video_capture.read()
    if not ret:
        break

    frame_count += 1
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)

    # วิเคราะห์เฉพาะบางเฟรม เช่น ทุก 10 เฟรม
    if frame_count % 10 == 0:
        for (x, y, w, h) in faces:
            face = frame[y:y + h, x:x + w]

            #  ย่อขนาดภาพก่อนวิเคราะห์
            face = cv2.resize(face, (200, 200))

            try:
                analyzed_result = DeepFace.analyze(
                    face,
                    actions=['gender'],
                    enforce_detection=False,
                    detector_backend='opencv'
                )

            except Exception as e:
                print(" วิเคราะห์ไม่ได้:", str(e))
                analyzed_result = None

    # แสดงผลวิเคราะห์ล่าสุดบนจอ
    for (x, y, w, h) in faces:
        cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)

        if analyzed_result:
            gender = analyzed_result[0]['gender']
            predicted_gender = max(gender, key=gender.get)
            confidence = round(gender[predicted_gender], 2)

            cv2.putText(frame,
                        f"{predicted_gender}: {confidence:.2f}%",
                        (x, y + h + 30),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.9,
                        (0, 255, 0),
                        2)

    cv2.imshow("Gender Detection (Optimized)", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

video_capture.release()
cv2.destroyAllWindows()

#define BLYNK_PRINT Serial
#define BLYNK_TEMPLATE_ID "TMPL6NKzpYiII"
#define BLYNK_TEMPLATE_NAME "Joji"
#define BLYNK_AUTH_TOKEN "RTwRhHg1cY7RsCQyAFLw1C686JMgq_oT"
#include <ESP8266WiFi.h>
#include <BlynkSimpleEsp8266.h>
#include <DHT.h> // วัดความชื่น
#include <Wire.h> // ใช้สำหรับการสื่อสารผ่าน I2C
#include <BH1750.h> // ตรวจแสง
#include <Adafruit_Sensor.h> // ความดัน
#include <Adafruit_BMP085_U.h> // ความดัน

char auth[] = BLYNK_AUTH_TOKEN;
char ssid[] = "Loop";
char pass[] = "00000000";
#define DHTTYPE DHT22
#define DHTPIN D5
#define HUMIDSOIL_PIN A0 // กำหนดพอร์ตสำหรับการอ่านค่าความชื้นในดิน
DHT dht(DHTPIN, DHTTYPE);

float startTime = 0; // ตัวแปรสำหรับบันทึกเวลาเริ่มต้น
unsigned long lastWateringTime = 0;  //ตรวจแปลของเวลาของปุ่ม
unsigned long wateringInterval = 2000; //ตรวจแปลของเวลาของปุ่ม

float h, t;
float lux, soil = 0, humidsoli;
float total;
float pressure;
BlynkTimer timer; // ให้ blynktimer เรียกว่า timer
Adafruit_BMP085_Unified bmp180; // ความดัน

void sendDHTdata() { // รับค่า Dht แล้วส่งไป Blynk
  h = dht.readHumidity();
  t = dht.readTemperature();

  if (isnan(h) || isnan(t)) { //ตรวจสอบว่า t เป็น "NaN" ไหม
    Serial.println("Failed to read from DHT sensor!");
    return; //ออกจาก fauction ที่ทำงานอยู่ทันที
  }
  Serial.print("Humidity: ");
  Serial.print(h);
  Serial.print("% | ");
  Serial.print("Temperature: ");
  Serial.print(t);
  Serial.println("C");
  Blynk.virtualWrite(V0, t); //ส่งค่า t ไปที่ virtualWrite ขา V0
  Blynk.virtualWrite(V1, h); //ส่งค่า h ไปที่ virtualWrite ขา V1
}

BH1750 lightMeter; // กำหนดตัวแปร lightmeter

void sendlight() { //รับค่าแสงแล้วส่งไปที่ Blynk
  Wire.begin(D2, D1); // อ่านค่าที่ขา
  lightMeter.begin(); // เริ่มต้นทำงานของ light sensor
  lux = lightMeter.readLightLevel(); // readLightLevel คำสั่งอ่านค่าแสง
  Serial.print("Light : ");
  Serial.print(lux);
  Serial.println("lu");
  Blynk.virtualWrite(V2, lux); //ส่งค่า lux ไปที่ virtualWrite ขา V2
}

void soilHumid() { // รับค่า soil แล้วส่งไป Blynk
  soil = analogRead(HUMIDSOIL_PIN); // ใช้พอร์ต HUMIDSOIL_PIN ประกาศอยู่ด้านบน
  Serial.print("humid in soil : ");
  Serial.println(soil);
  Blynk.virtualWrite(V4, soil); //ส่งค่า soil ไปที่ virtualWrite ขา V4
}

void autosoil() { //ให้รดน้ำ
  if (soil > 600){
    digitalWrite(D7, HIGH);
    Serial.println("กำลังรดน้ำ");
    delay(5000);
    digitalWrite(D7,LOW);
  }
  else{
    digitalWrite(D7,LOW);
    Serial.println("ไม่รดน้ำ");
  }
}

void pressures() { // รับค่าความกดอากาศแล้วส่งไป Blnyk
  Wire.begin(D6, D3); // อ่านที่ขา 
  if (!bmp180.begin()) { // เครื่องหมาย ! จะตรวจสอบค่า boolean ว่าฟังก์ชัน bmp180.begin() ผลลัพธ์เป็น false ไหม (หมายถึงไม่สามารถเชื่อมต่อกับเซ็นเซอร์ได้).
    Serial.println("Error - please check the BMP180 board!");
    while (1); //โปรแกรมหยุดทำงาน
  }
  sensors_event_t event; // ให้ sensors_event_t = event
  bmp180.getEvent(&event); // อ่านข้อมูลจากเซ็นเซอร์และเก็บข้อมูลเหล่านั้นลงในตัวแปร event
  pressure = event.pressure / 100.0; // แปลงจาก Pa เป็น hPa
  Serial.print("Pressure: ");
  Serial.print(pressure);
  Serial.println(" hPa");
  Blynk.virtualWrite(V6, pressure);
}

void displayer() { // แสดง Display ใน Blynk
  // pressure, lux, Humid, temp
  if (h > 80 && t < 25 && pressure < 1000 && lux < 2000) {
    Serial.println("โอกาสที่ฝนจะสูง");
    Blynk.virtualWrite(V5, "โอกาสที่ฝนจะสูง");
  } else if (h >= 60 && h <= 80 && t >= 25 && t <= 30 && pressure >= 1000 && pressure <= 1010 && lux >= 2000 && lux <= 5000) {
    Serial.println("โอกาสที่ฝนจะตกปานกลาง");
    Blynk.virtualWrite(V5, "โอกาสที่ฝนจะตกปานกลาง");
  } else {
    Serial.println("โอกาสที่ฝนจะตกน้อย");
    Blynk.virtualWrite(V5, "โอกาสที่ฝนจะตกน้อย");
  }
}

BLYNK_WRITE(V3) { 
  int pinValue = param.asInt();

  if (pinValue == 1) {  // หากปุ่มถูกกด
    Serial.println("Button Pressed!");
    if (millis() - lastWateringTime > wateringInterval) { //คำนวณ ระยะเวลา ที่ผ่านไปตั้งแต่การกระทำล่าสุด ถ้าเวลาที่ผ่านไปมากกว่า 2000ms เงื่อนไข if จะเป็นจริง ง่ายๆคือ delay 2 วิ
      digitalWrite(D7, HIGH);  // เปิดปั๊มน้ำ
      lastWateringTime = millis();
    }
  } else {  // หากปุ่มปล่อย
    Serial.println("Button Released!");
    if (millis() - lastWateringTime > wateringInterval) {
      digitalWrite(D7, LOW);  // ปิดปั๊มน้ำ
      lastWateringTime = millis();
    }
  }
}

void checkAndWaterPlants() { //ดูว่าฝนจะตกไหม
  int currentTime = millis(); // เวลาปัจจุบัน
  if (currentTime - startTime >= 3600000) { // ผ่านไป 1 ชั่วโมง (3600000 ms)
    // ตรวจสอบโอกาสฝนตก
    if (h < 60  && pressure > 1010 && lux > 5000) { // เงื่อนไขโอกาสฝนตกต่ำ
      Serial.println("โอกาสฝนตกต่ำ รดน้ำต้นไม้...");
      digitalWrite(D7, HIGH); // เปิดปั๊มน้ำ
      delay(10000); // รดน้ำเป็นเวลา 10 วินาที
      digitalWrite(D7, LOW); // ปิดปั๊มน้ำ
    } else {
      Serial.println("ยังมีโอกาสฝนตก ไม่รดน้ำต้นไม้");
    }
    startTime = currentTime; // รีเซ็ตเวลาเริ่มต้นใหม่
  }
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(D7, OUTPUT);
  Blynk.begin(auth, ssid, pass);
  startTime = millis(); // ตั้งเวลาเริ่มต้น
  timer.setInterval(5000, sendDHTdata); // ให้ทำซ่ำทุกๆ 5 วินาที
  timer.setInterval(5000, sendlight);
  timer.setInterval(5000, soilHumid);
  timer.setInterval(5000, pressures);
  timer.setInterval(5000, displayer);
  timer.setInterval(15000, autosoil);
}

void loop() {
  Blynk.run();
  timer.run();
  checkAndWaterPlants();
}

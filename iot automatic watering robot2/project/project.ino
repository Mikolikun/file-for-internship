 #define BLYNK_PRINT Serial
 #define BLYNK_TEMPLATE_ID "TMPL6NKzpYiII"
 #define BLYNK_TEMPLATE_NAME "Joji"
 #define BLYNK_AUTH_TOKEN "RTwRhHg1cY7RsCQyAFLw1C686JMgq_oT"
 #include <ESP8266WiFi.h>
 #include <BlynkSimpleEsp8266.h> 
 #include <DHT.h> // วัดความชื่น
 #include <Wire.h> //ตรวจแสง
 #include <BH1750.h> //ตรวจแสง
 char auth[] = BLYNK_AUTH_TOKEN;
 char ssid[] = "Loop";
 char pass[] = "00000000";
 #define DHTTYPE DHT22
 #define DHTPIN D5
 #define LEDPIN D4
 DHT dht(DHTPIN, DHTTYPE);
 float h;
 float t;
 float lux,soli = 0,humidsoli;
 BlynkTimer timer;

 void sendDHTdata() {
  h = dht.readHumidity();
  t = dht.readTemperature();

 if (isnan(h) || isnan(t)) {
 Serial.println("Failed to read from DHT sensor!");
 return;
 }
 Serial.print("Humidity: ");
 Serial.print(h);
 Serial.print("% | ");
 Serial.print("Temperature: ");
 Serial.print(t);
 Serial.println("C");
 Blynk.virtualWrite(V0, t);
 Blynk.virtualWrite(V1, h);
 }
 
BH1750 lightMeter; // กำหนดตัวแปร lightmeter

 void sendlight (){
  Wire.begin(D2,D1);
  lightMeter.begin();
  lux = lightMeter.readLightLevel();
  Serial.print("Light : ");
  Serial.print(lux);
  Serial.print("lu");
  Blynk.virtualWrite(V2, lux);
 }

 void soliHumid(){
  soli  = analogRead(humidsoli);
  Serial.print("humid in soli : ");
  Serial.println(soli);
  Blynk.virtualWrite(V4, soli);
 }
 //ทำให้แสดงในบอร์ดด้วย
 void displayer(){
  String displayy = "Hello world";
  Blynk.virtualWrite(V5, displayy);
 }

 BLYNK_WRITE(V0) // รับค่าจาก blynk
 {
 int pinValue = param.asInt();
 Serial.print("V1 Slider value is: ");
 Serial.println(pinValue);
 analogWrite (LEDPIN,pinValue);
 }
 void setup() {
 Serial.begin(115200);
 dht.begin();
 pinMode(LEDPIN,OUTPUT);
 Blynk.begin(auth, ssid, pass);
 timer.setInterval(5000, sendDHTdata);
 timer.setInterval(5000, sendlight);
 timer.setInterval(5000, soliHumid);
 timer.setInterval(5000, displayer);

 }
 
 void loop() {
  Blynk.run();
  timer.run();
 }

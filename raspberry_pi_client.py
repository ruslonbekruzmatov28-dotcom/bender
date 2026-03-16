import asyncio
import websockets
import json
import RPi.GPIO as GPIO
import time
import random

# --- GPIO SOZLAMALARI ---
LIGHT_PIN = 21
RGB_R, RGB_G, RGB_B = 17, 27, 22
DOOR_PIN = 23
FAN_PIN = 24

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
GPIO.setup([LIGHT_PIN, RGB_R, RGB_G, RGB_B, DOOR_PIN, FAN_PIN], GPIO.OUT, initial=GPIO.LOW)

# --- WEB APP URL ---
SERVER_URL = "wss://ramazon-taqvim-2026-9d69-forever21s-projects.vercel.app"

async def send_sensor_data(websocket):
    while True:
        try:
            # Haqiqiy sensor bo'lsa, shu yerdan o'qiladi. Hozircha simulyatsiya:
            cpu_usage = random.randint(10, 40)
            ram_usage = random.randint(30, 60)
            temp = random.randint(20, 26)
            hum = random.randint(40, 50)
            
            payload = {
                'cpu': cpu_usage,
                'ram': ram_usage,
                'temp': temp,
                'hum': hum
            }
            
            await websocket.send(json.dumps({
                'type': 'sensor_data',
                'payload': payload
            }))
        except Exception as e:
            print(f"Sensor xatosi: {e}")
            break
        await asyncio.sleep(5)

async def connect_to_server():
    print(f"Serverga ulanilmoqda: {SERVER_URL}")
    try:
        async with websockets.connect(SERVER_URL, extra_headers={"User-Agent": "Python-RaspberryPi"}) as websocket:
            print("Serverga muvaffaqiyatli ulandi!")
            
            # Sensor ma'lumotlarini yuborish uchun alohida task
            asyncio.create_task(send_sensor_data(websocket))
            
            while True:
                message = await websocket.recv()
                data = json.loads(message)
                command = data.get('command')
                payload = data.get('payload', {})
                
                print(f"Buyruq keldi: {command}, Payload: {payload}")
                
                if command == 'set_light':
                    state = payload.get('state')
                    GPIO.output(LIGHT_PIN, GPIO.HIGH if state else GPIO.LOW)
                    print(f"Chiroq {'yoqildi' if state else 'o\'chirildi'}")
                    
                elif command == 'set_door':
                    state = payload.get('state')
                    # state = true (qulflangan), false (ochiq)
                    GPIO.output(DOOR_PIN, GPIO.LOW if state else GPIO.HIGH)
                    print(f"Eshik {'qulflandi' if state else 'ochildi'}")
                    
                elif command == 'set_fan':
                    state = payload.get('state')
                    GPIO.output(FAN_PIN, GPIO.HIGH if state else GPIO.LOW)
                    print(f"Ventilyator {'yoqildi' if state else 'o\'chirildi'}")
                    
                elif command == 'set_rgb':
                    color = payload.get('color')
                    GPIO.output([RGB_R, RGB_G, RGB_B], GPIO.LOW)
                    
                    if color == 'red':
                        GPIO.output(RGB_R, GPIO.HIGH)
                    elif color == 'green':
                        GPIO.output(RGB_G, GPIO.HIGH)
                    elif color == 'blue':
                        GPIO.output(RGB_B, GPIO.HIGH)
                    elif color == 'white':
                        GPIO.output([RGB_R, RGB_G, RGB_B], GPIO.HIGH)
                    print(f"RGB rang o'zgartirildi: {color}")
                    
                elif command == 'take_photo':
                    print("Rasmga olinmoqda...")
                    
                elif command == 'chat_message':
                    text = payload.get('text')
                    print(f"Foydalanuvchi yozdi: {text}")

    except Exception as e:
        print(f"Ulanishda xatolik: {e}")
        print("5 soniyadan so'ng qayta urinib ko'riladi...")
        await asyncio.sleep(5)
        await connect_to_server()

if __name__ == "__main__":
    try:
        asyncio.run(connect_to_server())
    except KeyboardInterrupt:
        print("Dastur to'xtatildi.")
        GPIO.cleanup()

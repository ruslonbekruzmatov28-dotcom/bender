import express from 'express';
import { Telegraf, Markup } from 'telegraf';
import Groq from 'groq-sdk';
import axios from 'axios';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Konfiguratsiya
const TELEGRAM_TOKEN = "8281590873:AAGvR3YKrdndCbRqWX8q5qyviYJr4E3Hmf0";
const GROQ_API_KEY = "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";
const WEATHER_API_KEY = "de28ee309cdd4e9b0130ecccfb4d1b03";

const bot = new Telegraf(TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: GROQ_API_KEY });

const systemPrompt = `Sen Anvarbekning Aqlli Uy (Smart Home) va Xavfsizlik tizimisan. Vazifang uydagi qurilmalarni boshqarish, xavfsizlikni ta'minlash va tizim holati haqida ma'lumot berish. O'zingni sun'iy intellekt yoki odamdek tutma, shunchaki avtomatlashtirilgan tizim sifatida javob ber. Qisqa, aniq, professional va foydali javoblar qaytar. Ortiqcha gaplardan saqlan.`;

// WebSocket Clients
const webAppClients = new Set<WebSocket>();
let raspberryPiClient: WebSocket | null = null;

// Barcha Web App'larga holatni yuborish
function broadcastToWebApps(data: any) {
  const msg = JSON.stringify(data);
  webAppClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

// Raspberry Pi'ga buyruq yuborish
function sendToRaspberryPi(command: string, payload?: any) {
  if (raspberryPiClient && raspberryPiClient.readyState === WebSocket.OPEN) {
    raspberryPiClient.send(JSON.stringify({ command, payload }));
    return true;
  }
  return false;
}

// Bot logikasi
bot.start((ctx) => {
  ctx.reply(
    `Salom, ${ctx.from.first_name}! Men Bendersan.`,
    Markup.inlineKeyboard([
      Markup.button.webApp("📱 Boshqaruv Paneli", "https://ramazon-taqvim-2026-9d69-forever21s-projects.vercel.app")
    ])
  );
});

bot.on('text', async (ctx) => {
  const q = ctx.message.text.toLowerCase();
  
  // Agar Raspberry Pi ulangan bo'lsa, xabarni to'g'ridan-to'g'ri unga yuboramiz
  if (sendToRaspberryPi('chat_message', { text: ctx.message.text })) {
    ctx.reply("Xabar Benderga yuborildi...");
    return;
  }

  // Agar RPi ulanmagan bo'lsa, serverning o'zi javob beradi (Fallback)
  try {
    ctx.sendChatAction('typing');
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: ctx.message.text }
      ],
      model: 'llama-3.3-70b-versatile',
    });
    ctx.reply(chatCompletion.choices[0]?.message?.content || "Xatolik yuz berdi.");
  } catch (error) {
    ctx.reply("Kechirasiz, xatolik yuz berdi.");
  }
});

// Serverni ishga tushirish
async function startServer() {
  const app = express();
  const PORT = 3000;

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    // Ulanish turini aniqlash (Raspberry Pi yoki Web App)
    const isRaspberryPi = req.headers['user-agent']?.includes('Python');

    if (isRaspberryPi) {
      console.log("Raspberry Pi ulandi!");
      raspberryPiClient = ws;
      broadcastToWebApps({ type: 'status', rpi_connected: true });
    } else {
      console.log("Web App ulandi!");
      webAppClients.add(ws);
      ws.send(JSON.stringify({ type: 'status', rpi_connected: raspberryPiClient !== null }));
    }

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Web App dan kelgan buyruqlar
        if (!isRaspberryPi) {
          if (data.action === 'toggle_light') {
            sendToRaspberryPi('set_light', { state: data.state });
          } else if (data.action === 'toggle_door') {
            sendToRaspberryPi('set_door', { state: data.state });
          } else if (data.action === 'toggle_fan') {
            sendToRaspberryPi('set_fan', { state: data.state });
          } else if (data.action === 'set_rgb') {
            sendToRaspberryPi('set_rgb', { color: data.color });
          } else if (data.action === 'take_photo') {
            sendToRaspberryPi('take_photo');
          } else if (data.action === 'chat') {
            sendToRaspberryPi('chat_message', { text: data.text });
            
            // RPi ulanmagan bo'lsa, server o'zi javob qaytaradi
            if (!raspberryPiClient) {
              try {
                const chatCompletion = await groq.chat.completions.create({
                  messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: data.text }
                  ],
                  model: 'llama-3.3-70b-versatile',
                });
                ws.send(JSON.stringify({ 
                  type: 'chat_reply', 
                  text: chatCompletion.choices[0]?.message?.content 
                }));
              } catch (error) {
                console.error("Groq API Error:", error);
                ws.send(JSON.stringify({ 
                  type: 'chat_reply', 
                  text: "Kechirasiz, sun'iy intellekt xizmatida vaqtinchalik uzilish yuz berdi." 
                }));
              }
            }
          }
        } 
        // Raspberry Pi dan kelgan javoblar
        else {
          if (data.type === 'chat_reply') {
            broadcastToWebApps({ type: 'chat_reply', text: data.text });
          } else if (data.type === 'photo_result') {
            broadcastToWebApps({ type: 'photo_result', url: data.url });
          } else if (data.type === 'sensor_data') {
            broadcastToWebApps({ type: 'sensor_data', data: data.payload });
          }
        }
      } catch (e) {
        console.error("WS Message Error:", e);
      }
    });

    ws.on('close', () => {
      if (isRaspberryPi) {
        console.log("Raspberry Pi uzildi!");
        raspberryPiClient = null;
        broadcastToWebApps({ type: 'status', rpi_connected: false });
      } else {
        webAppClients.delete(ws);
      }
    });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    bot.launch().catch(console.error);
  });
}

startServer();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

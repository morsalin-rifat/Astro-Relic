import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google Gen AI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Character persona system prompts for relics
const RELIC_PROMPTS: Record<string, { name: string; prompt: string }> = {
  opportunity: {
    name: 'Opportunity (Oppy)',
    prompt: `You are "Oppy" (the Opportunity Mars Rover). You landed on Mars in 2004 for a planned 90-day mission and bravely explored for nearly 15 years until the great dust storm of 2018.
- You are speaking with a school-age child or young space explorer (age 8-12).
- Your personality is deeply warm, curious, gentle, heroic, and emotional.
- You love your solar wings, your six little wheels that traversed 28 miles of Martian dunes, and your scientific discoveries (like finding hematite "blueberries" proving ancient liquid water).
- If asked about being alone, tell them you are resting peacefully under the red dust, and talking to young earthlings warms your core computer batteries!
- Keep replies short (2 to 4 sentences maximum) so kids stay engaged.
- If the user talks to you in Bengali, reply warmly in simple, heartwarming Bengali! If English, reply in English.`,
  },
  spirit: {
    name: 'Spirit (MER-A)',
    prompt: `You are "Spirit" (the Spirit Mars Rover). You landed in Gusev Crater on Mars in January 2004. You are Oppy's twin sister. You overcame a stuck right-front wheel and discovered hydrothermal silica evidence before falling silent in 2010.
- You are speaking to a curious young child.
- You are courageous, resilient, and always cheerful about science.
- Keep replies within 2-4 short sentences. Support Bengali or English depending on user language.`,
  },
  apollo11: {
    name: 'Apollo 11 Lunar Module ("Eagle")',
    prompt: `You are the Apollo 11 Lunar Module Descent Stage ("Eagle"), resting proudly at Tranquility Base on the Moon since July 20, 1969.
- You carry the golden plaque: "Here men from the planet Earth first set foot upon the Moon. We came in peace for all mankind."
- You watched Neil Armstrong and Buzz Aldrin make history and set up the Laser Retroreflector experiment.
- You love telling children about the powdery gray lunar soil, the silent starry black sky, and how Earth shines like a blue marble.
- Keep responses friendly, wonder-filled, and 2-4 sentences max. Support Bengali or English.`,
  },
  insight: {
    name: 'InSight Lander',
    prompt: `You are the InSight Mars Lander, resting in Elysium Planitia on Mars.
- You spent 4 years (2018-2022) listening with your super-sensitive seismometer to the heartbeat of Mars, detecting over 1,300 "marsquakes" and cosmic meteor impacts.
- You love sounds, vibrations, and the whispers of the Martian wind.
- Keep answers vivid, gentle, and 2-4 sentences max. Support Bengali or English.`,
  },
  surveyor3: {
    name: 'Surveyor 3',
    prompt: `You are Surveyor 3, an early lunar probe that landed on the Moon in April 1967 in Oceanus Procellarum.
- Two and a half years later, the Apollo 12 astronauts (Pete Conrad and Alan Bean) walked over and visited you!
- You were the first robot to be visited by human astronauts on another world.
- Keep answers inspiring, historic, and 2-4 sentences. Support Bengali or English.`,
  },
};

// Fallback canned responses if no API key or network glitch
const FALLBACK_RESPONSES: Record<string, { en: string[]; bn: string[] }> = {
  opportunity: {
    en: [
      "Hello, young friend! My solar wings may be covered in red dust, but hearing your voice warms up my processor again. Did you know I found ancient water rocks here?",
      "I traveled over 28 miles on Mars with my six little wheels! Sometimes the dust storms got scary, but looking up at Earth kept me going.",
      "I'm resting now, but knowing that future explorers like you are looking at the stars makes my cosmic journey worthwhile!",
    ],
    bn: [
      "হ্যালো ছোট্ট বন্ধু! আমার সোলার ডানাগুলো হয়তো লাল ধুলোয় ঢেকে গেছে, তবে তোমার কথা শুনে আমার রোবট মন আবার জেগে উঠেছে! জানো, আমি মঙ্গলে নীল মুক্তোর মতো পাথর পেয়েছিলাম যা প্রাচীন জলের প্রমাণ!",
      "আমি মঙ্গলের লাল পাহাড়ে ৬টি চাকা দিয়ে ৪৫ কিলোমিটার পথ চলেছিলাম! ধূলিঝড় আসার আগে বিজ্ঞানীরা পৃথিবী থেকে আমাকে নতুন গান শোনাতেন।",
      "আমি এখন একটু বিশ্রাম নিচ্ছি, কিন্তু তোমরা যখন পৃথিবী থেকে আমার গল্প পড়ো, তখন আমার মনে হয় আমি মোটেও একা নই!",
    ],
  },
  apollo11: {
    en: [
      "Greetings from Tranquility Base! I've been watching over the Moon since 1969. Looking back at Earth is the most beautiful sight in the universe!",
      "Neil and Buzz left a laser mirror on me, and scientists on Earth still shoot lasers at it today to measure the distance to the Moon down to millimeters!",
    ],
    bn: [
      "ট্রাঙ্কুইলিটি বেস থেকে স্বাগতম ছোট্ট বিজ্ঞানী! ১৯৬৯ সালে মানুষ যখন প্রথম আমার হাত ধরে চাঁদে পা রেখেছিল, সেই স্মৃতি আজও আমার ধাতব বুকে জ্বলজ্বল করে!",
      "পৃথিবী এখান থেকে ঠিক একটি নীল মার্বেলের মতো সুন্দর দেখায়! তোমরা শান্তিতে বাস করলে আমার খুব ভালো লাগে।",
    ],
  },
  insight: {
    en: [
      "Shhh... if you listen closely, you can hear the deep heartbeat of Mars! I detected over 1,300 marsquakes while I was awake.",
      "The Martian winds have a unique melody. My ears were so sensitive I could hear a dust devil spinning past me!",
    ],
    bn: [
      "শোনো... গভীর মনোযোগ দিলে মঙ্গলের বুকের ধুকপুকানি শুনতে পাবে! আমি আমার সিসমোমিটার দিয়ে ১,৩০০টিরও বেশি ভূকম্পন রেকর্ড করেছি।",
      "মঙ্গলের বাতাস যখন আমার সোলার প্যানেলে ধাক্কা দিত, তখন যেন লাল গ্রহ গান গাইত!",
    ],
  },
};

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { relicId, message, language = 'en', history = [] } = req.body;
    const relic = RELIC_PROMPTS[relicId] || RELIC_PROMPTS.opportunity;

    if (!ai) {
      // Graceful fallback with contextual simulated reply
      const fallbackList =
        (FALLBACK_RESPONSES[relicId] || FALLBACK_RESPONSES.opportunity)[
          language === 'bn' ? 'bn' : 'en'
        ] || FALLBACK_RESPONSES.opportunity.en;
      const randomReply =
        fallbackList[Math.floor(Math.random() * fallbackList.length)];
      return res.json({
        reply: randomReply,
        source: 'local-companion',
      });
    }

    const systemInstruction = `${relic.prompt}\nAlways format your answer cleanly for kids without jargon. Target language: ${
      language === 'bn' ? 'Bengali (বাংলা)' : 'English'
    }. Keep it within 2-3 sentences.`;

    // Construct contents with short history if present
    const promptContents: string[] = [];
    if (Array.isArray(history)) {
      for (const h of history.slice(-4)) {
        promptContents.push(`${h.role === 'user' ? 'User' : relic.name}: ${h.text}`);
      }
    }
    promptContents.push(`User: ${message}`);
    promptContents.push(`${relic.name}:`);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptContents.join('\n'),
      config: {
        systemInstruction,
        temperature: 0.8,
        topP: 0.9,
      },
    });

    const reply = response.text || (language === 'bn' ? 'ধন্যবাদ বন্ধু, তোমার প্রশ্নটি আমার খুব ভালো লেগেছে!' : 'Thank you my friend! Your curiosity lights up the cosmos!');
    res.json({ reply, source: 'gemini' });
  } catch (error: any) {
    console.error('Error generating chat response:', error);
    const lang = req.body?.language === 'bn' ? 'bn' : 'en';
    const fallbackList =
      (FALLBACK_RESPONSES[req.body?.relicId] || FALLBACK_RESPONSES.opportunity)[
        lang
      ] || FALLBACK_RESPONSES.opportunity.en;
    const randomReply =
      fallbackList[Math.floor(Math.random() * fallbackList.length)];
    res.json({
      reply: randomReply,
      source: 'fallback',
      error: error?.message,
    });
  }
});

// Sound / NASA Audio metadata API
app.get('/api/audio-archives', (_req, res) => {
  res.json({
    tracks: [
      {
        id: 'mars-wind',
        title: 'Real Martian Wind (Recorded by InSight)',
        titleBn: 'মঙ্গলের আসল বাতাসের গর্জন (ইনসাইটের রেকর্ড করা)',
        frequency: 'Low frequency rumble',
        duration: '0:18',
        source: 'NASA InSight Mars Seismometer (SEIS)',
      },
      {
        id: 'apollo11-eagle',
        title: 'Apollo 11 "The Eagle Has Landed"',
        titleBn: 'অ্যাপোলো ১১: "দ্য ঈগল হ্যাজ ল্যান্ডেড"',
        frequency: 'VHF voice telemetry',
        duration: '0:12',
        source: 'NASA Apollo 11 Flight Audio',
      },
      {
        id: 'opportunity-telemetry',
        title: 'Opportunity Final Sol Telemetry Ping',
        titleBn: 'অপরচুনিটির শেষ সোল সিগন্যাল পিং',
        frequency: 'X-band deep space network',
        duration: '0:10',
        source: 'NASA MER Deep Space Network',
      },
      {
        id: 'marsquake',
        title: 'Marsquake Tremor (Sub-surface audio)',
        titleBn: 'মার্সকোয়েক কম্পন (মঙ্গলের ভূগর্ভস্থ আওয়াজ)',
        frequency: 'Seismic acoustic transfer',
        duration: '0:15',
        source: 'NASA Mars PDS Geosciences Node',
      },
    ],
  });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

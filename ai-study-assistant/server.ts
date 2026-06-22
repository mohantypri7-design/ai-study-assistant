// import express from "express";
// import path from "path";
// import dotenv from "dotenv";
// import { createServer as createViteServer } from "vite";
// import { GoogleGenAI, Type } from "@google/genai";

// dotenv.config();

// const app = express();
// const PORT = 3000;

// // Set up JSON body payload limits for large PDFs (25MB)
// app.use(express.json({ limit: "25mb" }));
// app.use(express.urlencoded({ limit: "25mb", extended: true }));

// // Lazy initializer for Google Gemini Client
// let geminiClient: GoogleGenAI | null = null;

// function getGeminiClient(): GoogleGenAI {
//   if (!geminiClient) {
//     const apiKey = process.env.GEMINI_API_KEY;
//     if (!apiKey) {
//       throw new Error("GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.");
//     }
//     geminiClient = new GoogleGenAI({
//       apiKey,
//       httpOptions: {
//         headers: {
//           "User-Agent": "aistudio-build",
//         },
//       },
//     });
//   }
//   return geminiClient;
// }

// // Function to safely strip markdown wrapper block from LLM responses if present
// function cleanJsonResponse(rawText: string): string {
//   let cleaned = rawText.trim();
//   if (cleaned.startsWith("```")) {
//     cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
//   }
//   return cleaned;
// }

// // REST api routes
// app.get("/api/health", (req, res) => {
//   res.json({ status: "ok", time: new Date().toISOString() });
// });

// // Endpoint to generate study aids (Summary, Flashcards, MCQs, Exam Questions, Q&A Chat)




// app.post("/api/study/generate", async (req, res) => {
//   try {
//     console.log("================================");
//     console.log("REQUEST RECEIVED");
//     console.log("Type:", req.body?.type);
//     console.log("DocType:", req.body?.docType);
//     console.log("================================");

//     const { type, docType, data, mimeType, userMessage, chatHistory } = req.body;

//     if (!type || !docType || !data) {
//       return res.status(400).json({
//         error: "Missing required fields: type, docType, data",
//       });
//     }

//     const ai = getGeminiClient();

//     let contentsParts: any[] = [];

//     if (docType === "pdf") {
//       contentsParts.push({
//         inlineData: {
//           mimeType: mimeType || "application/pdf",
//           data,
//         },
//       });
//     } else {
//       const trimmedData = data.slice(0, 12000);

//       contentsParts.push({

//         text: `--- Study Materials (trimmed) ---\n${trimmedData}\n-----------------------`,
//       });


//       // contentsParts.push({
//       //   text: `--- Study Materials ---\n${data}\n-----------------------`,
//       // });
//     }

//     let promptText = "";
//     let config: any = {};

//     switch (type) {
//       case "summary":
//         promptText = `

//         Summarize the study material into a structured revision guide.
//         Include:
//         1. Core Concepts
//         2. Definitions
//         3. Key Topics
//         4. Examples
//         5. Main Takeaways
//         Return Markdown only.
//       `;
//         contentsParts.push({ text: promptText });
//         break;

//       case "flashcards":
//         promptText =
//           "Generate 6-10 flashcards. Return JSON array only.";
//         contentsParts.push({ text: promptText });

//         config = {
//           responseMimeType: "application/json",
//           responseSchema: {
//             type: Type.ARRAY,
//             items: {
//               type: Type.OBJECT,
//               properties: {
//                 q: { type: Type.STRING },
//                 a: { type: Type.STRING },
//               },
//               required: ["q", "a"],
//             },
//           },
//         };
//         break;

//         case "mcqs":
//           promptText = `
//         Generate 5 multiple choice questions (MCQs).
//         IMPORTANT:
//         - ALWAYS generate NEW questions (no repetition from previous calls)
//         - Use DIFFERENT topics each time
//         - Change wording style every time
//         - Avoid repeating structure like "What is..." repeatedly
//         - Randomize difficulty (easy/medium/hard mix)

//         Make questions diverse across the entire document.

//         Return JSON ONLY:
//         [
//           {
//             "question": "...",
//             "options": ["A", "B", "C", "D"],
//             "answerIndex": 0,
//             "explanation": "..."
//           }
//         ]
//         `;    
        
        
//           contentsParts.push({ text: promptText });
        
//           config = {
//             responseMimeType: "application/json",
//             responseSchema: {
//               type: Type.ARRAY,
//               items: {
//                 type: Type.OBJECT,
//                 properties: {
//                   question: { type: Type.STRING },
//                   options: {
//                     type: Type.ARRAY,
//                     items: { type: Type.STRING }
//                   },
//                   answerIndex: { type: Type.INTEGER },
//                   explanation: { type: Type.STRING }
//                 },
//                 required: ["question", "options", "answerIndex", "explanation"],
//               },
//             },
//           };
//           break;  

//       case "questions":
//         promptText =
//           "Generate 5 important exam questions with model answers.";
//         contentsParts.push({ text: promptText });
//         break;

//       case "chat":
//         promptText = `
// You are a helpful AI Study Tutor.

// History:
// ${JSON.stringify(chatHistory || [])}

// Student Question:
// ${userMessage}
// `;
//         contentsParts.push({ text: promptText });
//         break;

//       default:
//         return res.status(400).json({
//           error: `Unsupported generation type: ${type}`,
//         });
//     }

//     console.log("Calling Gemini...");


//     let geminiResponse;
    

// try {
//   console.log("Calling Gemini...");

//   async function callGeminiWithRetry(payload: any, retries = 3) {
//     for (let i = 0; i < retries; i++) {
//       try {
//         return await ai.models.generateContent(payload);
//       } catch (err) {
//         if (i === retries - 1) throw err;
//         await new Promise(r => setTimeout(r, 1000 * (i + 1)));
//       }
//     }
//   }



//   console.log("Gemini success");

// } catch (err: any) {
//   console.error("Gemini failed:", err);

//   return res.status(503).json({
//     error: "Gemini temporarily overloaded. Please try again."
//   });
// }
//     console.log("Gemini response received");

//     const rawText = geminiResponse.text || "";

//     if (!rawText.trim()) {
//       return res.status(500).json({ error: "Empty response from Gemini" });
//     }

//     const cleaned = cleanJsonResponse(rawText);


//     if (type === "mcqs") {
//       const parsed = JSON.parse(cleaned);
    
//       const shuffled = parsed.map((q: any) => {
//         const originalOptions = [...q.options];
//         const correct = originalOptions[q.answerIndex];
    
//         const shuffledOptions = [...originalOptions].sort(() => Math.random() - 0.5);
//         const newIndex = shuffledOptions.indexOf(correct);
    
//         return {
//           ...q,
//           options: shuffledOptions,
//           answerIndex: newIndex
//         };
//       });
    
//       return res.json({ result: shuffled });
//     }
//     if (type === "flashcards") {
//       return res.json({
//         result: JSON.parse(cleaned)
//       });
//     }
//     if (type === "questions") {
//       return res.json({
//         result: JSON.parse(cleaned)
//       });
//     }


//     if (["flashcards"].includes(type)) {
//       try {
//         const parsed = JSON.parse(cleanJsonResponse(rawText));
//         return res.json({ result: parsed });
//       } catch (e) {
//         console.error("JSON parse failed:", e);
//         return res.status(500).json({
//           error: "Failed to parse JSON response",
//           rawText,
//         });
//       }
//     }

//     return res.json({
//       result: rawText,
//     });
//   } catch (error: any) {
//     console.error("========== FULL ERROR ==========");
//     console.error(error);
//     console.error("================================");

//     return res.status(500).json({
//       error: error?.message || "AI Engine Error",
//     });
//   }
// });

// async function startServer() {
//   if (process.env.NODE_ENV !== "production") {
//     const vite = await createViteServer({
//       server: { middlewareMode: true },
//       appType: "spa",
//     });
//     app.use(vite.middlewares);
//   } else {
//     const distPath = path.join(process.cwd(), "dist");
//     app.use(express.static(distPath));
//     app.get("*", (req, res) => {
//       res.sendFile(path.join(distPath, "index.html"));
//     });
//   }

//   app.listen(PORT, "0.0.0.0", () => {
//     console.log(`AI Study Assistant server running on http://localhost:${PORT}`);
//   });
// }

// startServer();
 



import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3001);
const GEMINI_MODELS = [
  "gemini-1.5-flash",
  "gemini-2.5-flash",
  "gemini-3.5-flash",
  "gemini-flash-latest",
];

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    geminiClient = new GoogleGenAI({
      apiKey,
    });
  }
  return geminiClient;
}

// remove ```json wrappers safely
function cleanJsonResponse(raw: string): string {
  let cleaned = raw.trim();
  const fencedMatch = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fencedMatch) {
    return fencedMatch[1].trim();
  }
  const firstArray = cleaned.indexOf("[");
  const lastArray = cleaned.lastIndexOf("]");
  const firstObject = cleaned.indexOf("{");
  const lastObject = cleaned.lastIndexOf("}");
  if (firstArray !== -1 && lastArray > firstArray) {
    return cleaned.slice(firstArray, lastArray + 1).trim();
  }
  if (firstObject !== -1 && lastObject > firstObject) {
    return cleaned.slice(firstObject, lastObject + 1).trim();
  }
  return cleaned.trim();
}

function getErrorStatus(err: any): number | undefined {
  const status = err?.status || err?.statusCode || err?.code || err?.error?.code;
  const numericStatus = Number(status);
  return Number.isFinite(numericStatus) ? numericStatus : undefined;
}

function getFriendlyGeminiMessage(status?: number): string {
  if (status === 429) {
    return "Gemini quota is temporarily exhausted. Please wait a moment and try again.";
  }
  if (status === 503) {
    return "Gemini is temporarily overloaded. Please try again shortly.";
  }
  if (status === 404) {
    return "No supported Gemini Flash model is currently available for this API key.";
  }
  return "The AI service could not complete the request. Please try again.";
}

function extractResponseText(response: any): string {
  return (
    (typeof response?.text === "string" ? response.text : "") ||
    response?.candidates?.[0]?.content?.parts
      ?.map((part: any) => part?.text || "")
      .join("") ||
    ""
  );
}

async function delay(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithGeminiFallback(
  ai: GoogleGenAI,
  contents: any[],
  config: any
) {
  let lastErr: any;

  for (const model of GEMINI_MODELS) {
    const payload = {
      model,
      contents: [{ role: "user", parts: contents }],
      ...(Object.keys(config).length ? { config } : {}),
    };

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`Calling Gemini model: ${model}`);
        return await ai.models.generateContent(payload);
      } catch (err: any) {
        lastErr = err;
        const status = getErrorStatus(err);

        if (status === 404) {
          console.warn(`Gemini model unavailable: ${model}`);
          break;
        }

        if ((status === 429 || status === 503) && attempt === 0) {
          await delay(status === 503 ? 1500 : 1000);
          continue;
        }

        break;
      }
    }
  }

  throw lastErr;
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/study/generate", async (req, res) => {
  try {
    const { type, docType, data, mimeType, userMessage, chatHistory } = req.body;

    if (!type || !docType || typeof data !== "string" || !data.trim()) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let ai: GoogleGenAI;
    try {
      ai = getGeminiClient();
    } catch (err: any) {
      return res.status(503).json({
        error: err.message || "Gemini is not configured.",
      });
    }

    const parts: any[] = [];

    // input data
    if (docType === "pdf") {
      parts.push({
        inlineData: {
          mimeType: mimeType || "application/pdf",
          data,
        },
      });
    } else {
      parts.push({
        text: data.slice(0, 12000),
      });
    }

    // prompt
    let config: any = {};
    let prompt = "";

    switch (type) {
      case "summary":
        prompt = `
Summarize into:
- Core Concepts
- Definitions
- Key Topics
- Examples
- Takeaways
Return Markdown only.
        `;
        break;

      case "flashcards":
        prompt = "Generate 6-10 flashcards JSON only.";
        config = {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                q: { type: Type.STRING },
                a: { type: Type.STRING },
              },
              required: ["q", "a"],
            },
          },
        };
        break;

      case "mcqs":
        prompt = `
Generate 5 MCQs.
Return JSON only:
[{
  "question": "...",
  "options": ["A","B","C","D"],
  "answerIndex": 0,
  "explanation": "..."
}]
        `;
        config = {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                answerIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
              },
              required: ["question", "options", "answerIndex", "explanation"],
            },
          },
        };
        break;

      case "questions":
        prompt = `
Generate 5 exam practice questions. Return JSON only:
[{
  "question": "...",
  "points": "Short Answer",
  "answer": "..."
}]
        `;
        config = {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                points: { type: Type.STRING },
                answer: { type: Type.STRING },
              },
              required: ["question", "points", "answer"],
            },
          },
        };
        break;

      case "chat":
        if (typeof userMessage !== "string" || !userMessage.trim()) {
          return res.status(400).json({ error: "Missing chat message" });
        }
        prompt = `
History:
${JSON.stringify(chatHistory || [])}

User:
${userMessage}
        `;
        break;

      default:
        return res.status(400).json({ error: "Invalid type" });
    }

    parts.push({ text: prompt });

    let response;
    try {
      response = await generateWithGeminiFallback(ai, parts, config);
    } catch (err: any) {
      console.error("Gemini failed:", err);
      const status = getErrorStatus(err);
      return res.status(status === 429 ? 429 : 503).json({
        error: getFriendlyGeminiMessage(status),
      });
    }

    const rawText = extractResponseText(response);

    if (!rawText) {
      return res.status(500).json({
        error: "Empty response from AI",
      });
    }

    const cleaned = cleanJsonResponse(rawText);

    // JSON parsing safely
    if (["mcqs", "flashcards", "questions"].includes(type)) {
      try {
        return res.json({
          result: JSON.parse(cleaned),
        });
      } catch (e) {
        return res.status(500).json({
          error: "JSON parse failed",
          rawText: cleaned,
        });
      }
    }

    return res.json({ result: cleaned });
  } catch (err: any) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({
      error: err.message || "Server error",
    });
  }
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }
  if (err?.type === "entity.parse.failed" || err instanceof SyntaxError) {
    return res.status(400).json({
      error: "Invalid JSON request body.",
    });
  }
  console.error("Unhandled request error:", err);
  return res.status(500).json({
    error: "Server error",
  });
});

// start server
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      configFile: false,
      root: process.cwd(),
      resolve: {
        alias: [
          {
            find: /^@\//,
            replacement: `${process.cwd()}/`,
          },
        ],
      },
      server: { middlewareMode: true },
      optimizeDeps: {
        noDiscovery: true,
        include: [],
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const dist = path.join(process.cwd(), "dist");
    app.use(express.static(dist));
    app.get("*", (_, res) => {
      res.sendFile(path.join(dist, "index.html"));
    });
  }

  app.listen(PORT, "127.0.0.1", () => {
    console.log(`Server running http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

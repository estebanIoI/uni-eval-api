/**
 * AI Provider adapter - supports Ollama (local), OpenAI, and Google Gemini.
 * All existing code that does require('@config/ollama_config') continues to work.
 */

const { Ollama } = require('ollama');
const { getConfig } = require('./ai-config');

// ─────────────────────────────────────────────
// Ollama (local)
// ─────────────────────────────────────────────
async function _ollamaSummarize(text, systemPrompt, userPrompt, cfg) {
  const host = (cfg && cfg.host) || process.env.OLLAMA_HOST || 'http://localhost:11434';
  const model = (cfg && cfg.model) || process.env.LLM_MODEL || 'llama3.1:8b';
  const client = new Ollama({ host });
  const res = await client.chat({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `${userPrompt}\n\n<<<COMENTARIOS>>>\n${text}` },
    ],
    options: { temperature: 0.3 },
    stream: false,
  });
  return res.message.content;
}

// ─────────────────────────────────────────────
// OpenAI
// ─────────────────────────────────────────────
async function _openaiSummarize(text, systemPrompt, userPrompt, cfg) {
  if (!cfg || !cfg.api_key) throw new Error('OpenAI API key no configurada. Configúrala en Informes → Configuración de IA.');
  // Dynamic import to avoid hard dependency
  let OpenAI;
  try {
    OpenAI = require('openai').default || require('openai');
  } catch {
    throw new Error('Paquete openai no instalado. Ejecuta: npm install openai en uni-eval-api');
  }
  const client = new OpenAI({ apiKey: cfg.api_key, baseURL: cfg.base_url || undefined });
  const res = await client.chat.completions.create({
    model: cfg.model || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `${userPrompt}\n\n<<<COMENTARIOS>>>\n${text}` },
    ],
    temperature: 0.3,
  });
  return res.choices[0] && res.choices[0].message ? res.choices[0].message.content : '';
}

// ─────────────────────────────────────────────
// Google Gemini (AI Studio)
// ─────────────────────────────────────────────
async function _geminiSummarize(text, systemPrompt, userPrompt, cfg) {
  if (!cfg || !cfg.api_key) throw new Error('Gemini API key no configurada. Configúrala en Informes → Configuración de IA.');
  let GoogleGenerativeAI;
  try {
    GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
  } catch {
    throw new Error('Paquete @google/generative-ai no instalado. Ejecuta: npm install @google/generative-ai en uni-eval-api');
  }
  const genAI = new GoogleGenerativeAI(cfg.api_key);
  const model = genAI.getGenerativeModel({
    model: cfg.model || 'gemini-1.5-flash',
    systemInstruction: systemPrompt,
  });
  const result = await model.generateContent(`${userPrompt}\n\n<<<COMENTARIOS>>>\n${text}`);
  return result.response.text();
}

// ─────────────────────────────────────────────
// Public API (same signature as before)
// ─────────────────────────────────────────────
async function summarizeChunk(text, systemPrompt, userPrompt) {
  const config = getConfig();
  const provider = config.provider || 'ollama';

  const effectiveSystem = config.prompt_override
    ? systemPrompt + ' ' + config.prompt_override
    : systemPrompt;

  switch (provider) {
    case 'openai':
      return _openaiSummarize(text, effectiveSystem, userPrompt, config.openai);
    case 'gemini':
      return _geminiSummarize(text, effectiveSystem, userPrompt, config.gemini);
    default:
      return _ollamaSummarize(text, effectiveSystem, userPrompt, config.ollama);
  }
}

module.exports = { summarizeChunk };

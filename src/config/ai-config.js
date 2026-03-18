const path = require('path');
const fs = require('fs');

const CONFIG_PATH = path.join(__dirname, '../../data/ai-config.json');

const DEFAULT_CONFIG = {
  provider: 'ollama',
  ollama: {
    host: process.env.OLLAMA_HOST || 'http://localhost:11434',
    model: process.env.LLM_MODEL || 'llama3.1:8b',
  },
  openai: {
    api_key: '',
    model: 'gpt-4o-mini',
    base_url: 'https://api.openai.com/v1',
  },
  gemini: {
    api_key: '',
    model: 'gemini-1.5-flash',
  },
  prompt_override: '',
};

function deepMerge(target, source) {
  const out = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      out[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      out[key] = source[key];
    }
  }
  return out;
}

function getConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const saved = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      return deepMerge(DEFAULT_CONFIG, saved);
    }
  } catch {}
  return { ...DEFAULT_CONFIG };
}

function saveConfig(updates) {
  const current = getConfig();
  const next = deepMerge(current, updates);
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(next, null, 2));
  return next;
}

function getSafeConfig() {
  const cfg = getConfig();
  const safe = JSON.parse(JSON.stringify(cfg));
  if (safe.openai && safe.openai.api_key) {
    safe.openai.api_key = safe.openai.api_key.slice(0, 8) + '••••••••';
  }
  if (safe.gemini && safe.gemini.api_key) {
    safe.gemini.api_key = safe.gemini.api_key.slice(0, 8) + '••••••••';
  }
  return safe;
}

module.exports = { getConfig, saveConfig, getSafeConfig, DEFAULT_CONFIG };

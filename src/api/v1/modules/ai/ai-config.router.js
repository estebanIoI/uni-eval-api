const express = require('express');
const { getConfig, saveConfig, getSafeConfig } = require('@config/ai-config');

const router = express.Router();

/**
 * GET /api/v1/ai/config
 * Returns current AI provider config with API keys masked.
 */
router.get('/', (req, res) => {
  try {
    const data = getSafeConfig();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/v1/ai/config
 * Updates AI provider config. Accepts partial body.
 */
router.post('/', (req, res) => {
  try {
    const updates = req.body;

    if (updates.provider && !['ollama', 'openai', 'gemini'].includes(updates.provider)) {
      return res.status(400).json({ success: false, message: 'Proveedor inválido. Opciones: ollama, openai, gemini' });
    }

    // Don't overwrite existing API key if masked value is sent back
    const current = getConfig();
    if (updates.openai && updates.openai.api_key && updates.openai.api_key.includes('••••')) {
      updates.openai.api_key = current.openai ? current.openai.api_key || '' : '';
    }
    if (updates.gemini && updates.gemini.api_key && updates.gemini.api_key.includes('••••')) {
      updates.gemini.api_key = current.gemini ? current.gemini.api_key || '' : '';
    }

    saveConfig(updates);
    res.json({ success: true, data: { message: 'Configuración de IA actualizada correctamente' } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

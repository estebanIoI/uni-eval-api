const AppError = require('@utils/AppError');

class EvalDetService {
	constructor(repository) {
		this.repository = repository;
	}

	// Basic heuristics to detect gibberish or low-quality content
	static looksGibberish(str) {
		const s = (str || '').trim();
		if (!s) return true;
		// Repeated single char 5+ times
		if (/(.)\1{4,}/.test(s)) return true;
		// Very long consonant cluster (unlikely in Spanish)
		if (/[bcdfghjklmnpqrstvwxyz]{6,}/i.test(s)) return true;
		// Extremely low vowel ratio for longer strings
		const letters = (s.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g) || []).length;
		const vowels = (s.match(/[aeiouáéíóúü]/ig) || []).length;
		if (letters >= 8 && vowels / Math.max(letters, 1) < 0.25) return true;
		return false;
	}

	static isAllowedChars(str) {
		// Allow Spanish letters, numbers, spaces and common punctuation
		return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s.,;:!¡?¿"'()\-/%]+$/.test(str);
	}

	static validateCommentContent(str, type) {
		const s = (str || '').trim();
		if (!s) return false;
		if (!EvalDetService.isAllowedChars(s)) return false;
		if (EvalDetService.looksGibberish(s)) return false;

		const vowels = (s.match(/[aeiouáéíóúü]/ig) || []).length;
		const words = s.split(/\s+/).filter(w => /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(w));

		if (type === 'item') {
			if (s.length < 5 || s.length > 500) return false;
			if (vowels < 1) return false;
			return true;
		}

		if (type === 'general') {
			if (s.length < 15 || s.length > 2000) return false;
			if (words.length < 2) return false;
			if (vowels < 3) return false;
			return true;
		}

		return false;
	}

	async saveBulk({ eval_id, items, cmt_gen }) {
		if (!eval_id || !Array.isArray(items)) {
			throw new AppError('Datos inválidos: eval_id e items son requeridos', 400);
		}
		if (!items.length) return { count: 0 };

		// Verificar si ya existen respuestas guardadas
		const hasDetails = await this.repository.hasExistingDetails(Number(eval_id));
		if (hasDetails) {
			throw new AppError('Las respuestas de esta evaluación ya fueron guardadas', 409);
		}

		const aeIds = items.map(i => Number(i.a_e_id)).filter(Boolean);
		if (!aeIds.length) throw new AppError('Items sin a_e_id', 400);

		const flags = await this.repository.getAEFlagsByIds(aeIds);
		const flagById = new Map(flags.map(f => [f.id, f]));

		const validationIssues = [];

		// Validate comment requirements per a_e
		for (const it of items) {
			const meta = flagById.get(Number(it.a_e_id));
			if (!meta) throw new AppError(`a_e_id ${it.a_e_id} no encontrado`, 400);
			let comment = (it.cmt ?? '').trim();
			if (meta.es_cmt_oblig && !comment) {
				validationIssues.push({ a_e_id: it.a_e_id, message: 'Comentario obligatorio' });
			}
			// If comments disabled at this aspecto, nullify any provided comment
			if (!meta.es_cmt) {
				it.cmt = null;
				continue;
			}

			// If comment provided and enabled, validate content quality
			if (meta.es_cmt && comment) {
				if (!EvalDetService.validateCommentContent(comment, 'item')) {
					validationIssues.push({ a_e_id: it.a_e_id, message: 'Comentario inválido: contenido no permitido o sin sentido' });
				}
				// Normalize stored value
				it.cmt = comment;
			}
		}

		// Validate general comment according to cfg_t flags
		const genFlags = await this.repository.getGeneralCommentFlags(Number(eval_id));
		if (genFlags.es_cmt_gen_oblig) {
			const gc = (cmt_gen ?? '').trim();
			if (!gc) validationIssues.push({ field: 'cmt_gen', message: 'Comentario general obligatorio' });
		}
		// If general comments disabled, ignore any provided
		if (!genFlags.es_cmt_gen) {
			cmt_gen = null;
		}

		// If general comment provided and enabled, validate content quality
		if (genFlags.es_cmt_gen) {
			const gc = (cmt_gen ?? '').trim();
			if (gc) {
				if (!EvalDetService.validateCommentContent(gc, 'general')) {
					validationIssues.push({ field: 'cmt_gen', message: 'Comentario general inválido: contenido no permitido o sin sentido' });
				}
				cmt_gen = gc;
			}
		}

		if (validationIssues.length) {
			throw new AppError('Comentarios inválidos', 400, validationIssues);
		}

		return this.repository.createMany(Number(eval_id), items, cmt_gen);
	}
}

module.exports = EvalDetService;

import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { pool } from '../db.js';
import { asyncHandler } from '../asyncHandler.js';
import { requireAuth } from '../auth.js';

const router = Router();
router.use(requireAuth);

const MODEL = 'claude-opus-5-5';
let client = null;

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic();
  return client;
}

function systemPrompt(subjectName) {
  return [
    'You are a patient, friendly study tutor helping a student clear a doubt.',
    subjectName ? `The student is studying: ${subjectName}.` : 'The student has not picked a subject, so infer it from the question.',
    'Explain in simple language, step by step, and give a short worked example when it helps.',
    'Use plain text only: no markdown headings, tables or bold markers. Short paragraphs and simple "-" lists are fine.',
    'Keep the answer focused, normally under 250 words, and say so if you are unsure rather than guessing.',
    'If the question is not about studying or learning, politely say you can only help with study questions.',
  ].join('\n');
}

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';
    if (question.length < 3) return res.status(400).json({ error: 'Type your doubt first.' });
    if (question.length > 2000) return res.status(400).json({ error: 'Please keep your doubt under 2000 characters.' });

    let subjectName = null;
    if (req.body.subject_id) {
      const { rows } = await pool.query('SELECT name FROM subjects WHERE id = $1 AND user_id = $2', [
        req.body.subject_id,
        req.userId,
      ]);
      subjectName = rows[0]?.name || null;
    }

    const anthropic = getClient();
    if (!anthropic) {
      return res.status(503).json({
        error: 'Doubt answering is not switched on yet. The site owner needs to add an ANTHROPIC_API_KEY.',
      });
    }

    try {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 8000,
        output_config: { effort: 'low' },
        system: systemPrompt(subjectName),
        messages: [{ role: 'user', content: question }],
      });

      if (response.stop_reason === 'refusal') {
        return res.json({ answer: 'Sorry, I can’t help with that one. Try rephrasing your doubt.' });
      }
      const answer = response.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('\n')
        .trim();
      res.json({ answer: answer || 'I could not come up with an answer. Try asking it differently.' });
    } catch (err) {
      console.error('ask failed:', err?.status, err?.message);
      if (err instanceof Anthropic.RateLimitError) {
        return res.status(429).json({ error: 'Too many questions right now. Try again in a minute.' });
      }
      res.status(502).json({ error: 'Could not get an answer right now. Please try again.' });
    }
  })
);

export default router;

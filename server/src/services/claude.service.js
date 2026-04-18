import axios from 'axios';
import { buildClaudePrompts } from '../utils/prompt.js';
import { AppError } from '../utils/errors.js';
import { validateQuizSchema } from '../utils/validators.js';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-latest';

const getClaudeTextContent = (payload) => {
  if (!payload || !Array.isArray(payload.content)) {
    return '';
  }

  return payload.content
    .filter((item) => item?.type === 'text' && typeof item.text === 'string')
    .map((item) => item.text)
    .join('\n')
    .trim();
};

const parseJsonFromClaudeOutput = (rawText) => {
  const trimmed = rawText.trim();

  if (!trimmed) {
    throw new Error('Empty Claude response.');
  }

  const withoutCodeFence = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  const directCandidates = [trimmed, withoutCodeFence];

  for (const candidate of directCandidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // Continue.
    }
  }

  const firstBraceIndex = withoutCodeFence.indexOf('{');
  const lastBraceIndex = withoutCodeFence.lastIndexOf('}');

  if (firstBraceIndex === -1 || lastBraceIndex === -1 || lastBraceIndex <= firstBraceIndex) {
    throw new Error('No JSON object detected in Claude response.');
  }

  const extracted = withoutCodeFence.slice(firstBraceIndex, lastBraceIndex + 1);
  return JSON.parse(extracted);
};

const callClaude = async (jobDescription, retry = false) => {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    throw new AppError(500, 'CLAUDE_API_KEY is missing on the server.');
  }

  const { systemPrompt, userPrompt } = buildClaudePrompts(jobDescription, retry);

  try {
    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: DEFAULT_MODEL,
        max_tokens: 2500,
        temperature: 0.2,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const text = getClaudeTextContent(response.data);
    const parsed = parseJsonFromClaudeOutput(text);
    return validateQuizSchema(parsed);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      if (status === 429) {
        throw new AppError(429, 'Please wait and try again shortly.');
      }

      if (status && status >= 400 && status < 500) {
        throw new Error('Claude API rejected the request.');
      }

      if (error.code === 'ECONNABORTED') {
        throw new Error('Claude request timed out.');
      }
    }

    if (error instanceof AppError) {
      throw error;
    }

    throw new Error(error.message || 'Claude request failed.');
  }
};

export const generateQuizWithRetry = async (jobDescription) => {
  let lastError = null;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const quiz = await callClaude(jobDescription, attempt === 2);
      return quiz;
    } catch (error) {
      if (error instanceof AppError && error.statusCode === 429) {
        throw error;
      }

      lastError = error;
    }
  }

  throw new AppError(500, 'Failed to generate quiz. Please try again.', {
    cause: lastError?.message || null,
  });
};
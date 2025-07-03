import { Injectable, HttpException } from '@nestjs/common';

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: {
        text?: string;
      }[];
    };
  }[];
}

@Injectable()
export class GeminiService {
  private readonly API_KEY = process.env.GEMINI_API_KEY;
  private readonly API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.API_KEY}`;

  async envoyerMessage(message: string): Promise<string> {
    if (!this.API_KEY) {
      throw new HttpException('Configuration error with AI service.', 500);
    }

    const body = {
      contents: [
        {
          parts: [
            {
              text: `Tu es un assistant IA professionnel pour une plateforme de gestion documentaire appelée Secure Docs. Tu aides les utilisateurs avec leurs questions sur la gestion de documents, la sécurité, l'organisation de fichiers, et toute question générale. Réponds en français de manière claire, utile et professionnelle. Question de l'utilisateur: ${message}`,
            },
          ],
        },
      ],
    };

    try {
      const res = await fetch(this.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new HttpException(
          `Error communicating with AI service: ${res.status}`,
          res.status,
        );
      }

      const data = (await res.json()) as GeminiResponse;
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        return 'Désolé, je ne peux pas répondre à cette question pour le moment.';
      }

      return text;
    } catch {
      throw new HttpException('Failed to communicate with AI service.', 503);
    }
  }
}

import { Injectable, HttpException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

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

    const readmePath = path.join(__dirname, 'context.txt');
    let readmeContent = '';

    try {
      readmeContent = fs.readFileSync(readmePath, 'utf-8');
    } catch {
      console.warn(
        'Context file not found, proceeding without project context',
      );
    }

    const body = {
      contents: [
        {
          parts: [
            {
              text: `CONTEXTE DU PROJET:\n${readmeContent}`,
            },
            {
              text: `INSTRUCTIONS: Tu es un assistant IA professionnel pour une plateforme de gestion documentaire appelée Secure Docs. Tu aides les utilisateurs avec leurs questions sur la gestion de documents, la sécurité, l'organisation de fichiers, et toute question générale. Utilise le contexte du projet fourni ci-dessus pour donner des réponses précises et pertinentes. Réponds en français de manière claire, utile et professionnelle.`,
            },
            {
              text: `QUESTION DE L'UTILISATEUR: ${message}`,
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

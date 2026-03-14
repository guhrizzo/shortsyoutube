// lib/downloader.ts
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";
import fs from "fs";

const execFileAsync = promisify(execFile);

/**
 * Faz download do áudio de um vídeo do YouTube usando yt-dlp.
 * Retorna o caminho do arquivo .mp3 temporário.
 *
 * PRÉ-REQUISITO: yt-dlp instalado no servidor.
 * - Local/Dev:  pip install yt-dlp
 * - Vercel:     NÃO suporta yt-dlp. Use Railway, Fly.io ou VPS.
 * - Docker:     RUN pip install yt-dlp no Dockerfile
 */
export async function downloadAudio(url: string): Promise<string> {
  const tmpDir = os.tmpdir();
  const filename = `clipai-${randomUUID()}`;
  const outputTemplate = path.join(tmpDir, `${filename}.%(ext)s`);
  const expectedPath = path.join(tmpDir, `${filename}.mp3`);

  // Verifica se yt-dlp está instalado
  try {
    await execFileAsync("yt-dlp", ["--version"]);
  } catch {
    throw new Error(
      "yt-dlp não encontrado. Instale com: pip install yt-dlp"
    );
  }

const args = [
  url,
  "--extract-audio",
  "--audio-format", "mp3",
  "--audio-quality", "5",
  "--output", outputTemplate,
  "--no-playlist",
  "--max-filesize", "50m",
  "--no-warnings",
  "--quiet",
  "--cookies-from-browser", "chrome",  // ← adicione esta linha
  "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
];

  try {
    await execFileAsync("yt-dlp", args, { timeout: 60_000 }); // timeout 60s
  } catch (err: any) {
    throw new Error(`Falha no download: ${err.message}`);
  }

  if (!fs.existsSync(expectedPath)) {
    throw new Error("Arquivo de áudio não foi gerado. Verifique o link.");
  }

  // NOTA: Whisper API aceita até 25MB.
  // Para vídeos longos, implemente chunking (ver lib/chunker.ts).
  const stats = fs.statSync(expectedPath);
  const fileSizeMB = stats.size / (1024 * 1024);
  if (fileSizeMB > 24) {
    fs.unlinkSync(expectedPath);
    throw new Error(
      `Áudio muito grande (${fileSizeMB.toFixed(1)}MB). Use vídeos de até ~60min ou implemente chunking.`
    );
  }

  return expectedPath;
}
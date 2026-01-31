"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setResultUrl(null);
    if (!file) {
      setMessage({ type: "err", text: "กรุณาเลือกไฟล์" });
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error ?? "อัปโหลดไม่สำเร็จ" });
        return;
      }
      setMessage({ type: "ok", text: "อัปโหลดสำเร็จ" });
      setResultUrl(data.url ?? null);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch {
      setMessage({ type: "err", text: "ไม่สามารถติดต่อเซิร์ฟเวอร์ได้" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-900">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
          >
            ← กลับหน้าแรก
          </Link>
        </div>
        <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          อัปโหลดไฟล์ (รูป / วิดีโอ)
        </h1>
        <p className="mb-6 text-zinc-600 dark:text-zinc-400">
          รองรับ JPEG, PNG, GIF, WebP, MP4, WebM สูงสุด 50 MB
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*,video/mp4,video/webm"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-zinc-600 file:mr-4 file:rounded file:border-0 file:bg-zinc-200 file:px-4 file:py-2 file:text-zinc-800 dark:text-zinc-400 dark:file:bg-zinc-700 dark:file:text-zinc-200"
            />
            {file && (
              <p className="mt-2 text-sm text-zinc-500">
                เลือกแล้ว: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !file}
            className="rounded-lg bg-zinc-900 px-4 py-3 font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {loading ? "กำลังอัปโหลด..." : "อัปโหลด"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 rounded-lg p-3 text-sm ${
              message.type === "ok"
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
            }`}
          >
            {message.text}
          </p>
        )}

        {resultUrl && (
          <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              ลิงก์ไฟล์:
            </p>
            <a
              href={resultUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              {resultUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

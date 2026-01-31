"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type GalleryItem = { key: string; url: string };

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchList() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/upload");
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "โหลดไม่สำเร็จ");
          setItems([]);
          return;
        }
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch {
        setError("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    fetchList();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-900">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
          >
            ← กลับหน้าแรก
          </Link>
          <Link
            href="/upload"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            อัปโหลดรูป
          </Link>
        </div>
        <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          แกลเลอรี่ (รูปจาก S3)
        </h1>
        <p className="mb-6 text-zinc-600 dark:text-zinc-400">
          รูปที่อัปโหลดไป S3 แสดงด้วย presigned URL
        </p>

        {loading && (
          <p className="text-zinc-500 dark:text-zinc-400">กำลังโหลด...</p>
        )}
        {error && (
          <p className="rounded-lg bg-red-100 p-4 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </p>
        )}
        {!loading && !error && items.length === 0 && (
          <p className="rounded-lg border border-zinc-200 bg-white p-6 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
            ยังไม่มีรูป — ไปอัปโหลดที่ <Link href="/upload" className="text-blue-600 underline dark:text-blue-400">/upload</Link>
          </p>
        )}
        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {items.map((item) => (
              <a
                key={item.key}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800"
              >
                <img
                  src={item.url}
                  alt={item.key}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

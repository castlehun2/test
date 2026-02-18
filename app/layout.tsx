import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AI 모닝클럽 사전진단',
  description: '점수화 설문 및 관리자 대시보드',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <h1 className="text-lg font-semibold">AI 모닝클럽 사전진단</h1>
            <nav className="flex gap-4 text-sm">
              <Link href="/survey" className="hover:underline">
                설문
              </Link>
              <Link href="/admin" className="hover:underline">
                관리자
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}

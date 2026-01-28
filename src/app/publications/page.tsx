'use client';

import dynamic from 'next/dynamic';

const PublicationsHub = dynamic(
  () => import('@/features/publications/components/PublicationsHub'),
  { ssr: false }
);

export default function PublicationsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <PublicationsHub />
    </main>
  );
}

import { notFound } from 'next/navigation';
import { getServerSections } from '@/lib/server-api';
import Link from 'next/link';
import type { Section } from '@/lib/types';

export async function generateMetadata() {
  return {
    title: 'All Sections - AI Portal Blog',
    description: 'Browse all sections of our AI blog including research, safety, product updates, and more.',
    openGraph: {
      title: 'All Sections - AI Portal Blog',
      description: 'Browse all sections of our AI blog including research, safety, product updates, and more.',
      type: 'website',
    },
  };
}

export default async function SectionsPage() {
  let sections: Section[] = [];
  
  try {
    sections = await getServerSections();
  } catch (error) {
    console.error('Error fetching sections:', error);
    notFound();
  }

  if (sections.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto py-16 px-4">
          <h1 className="text-4xl font-bold mb-8">Sections</h1>
          <p className="text-gray-400">No sections available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-16 px-4">
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-4">All Sections</h1>
          <p className="text-gray-400 text-lg">
            Explore our content organized by topic and interest areas.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <Link
              key={section.id}
              href={`/sections/${section.attributes.slug}`}
              className="group block p-6 rounded-xl border border-white/10 bg-gray-900/50 hover:bg-gray-800/50 hover:border-white/20 transition-all duration-300 hover:scale-105"
            >
              <h2 className="text-xl font-semibold mb-3 group-hover:text-blue-400 transition-colors">
                {section.attributes.name}
              </h2>
              {section.attributes.description && (
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {section.attributes.description}
                </p>
              )}
              <div className="flex items-center text-blue-400 text-sm group-hover:translate-x-1 transition-transform">
                <span>Explore section</span>
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

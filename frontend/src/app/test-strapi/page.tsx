// frontend/src/app/test-strapi/page.tsx
import StrapiTest from '@/components/StrapiTest';

export default function TestStrapiPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Strapi SDK Integration Test
        </h1>
        <StrapiTest />
      </div>
    </div>
  );
}

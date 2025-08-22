import Layout from '@/components/Layout';

export default function Home() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            AI Portal Blog
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Exploring the latest developments in artificial intelligence, 
            machine learning, and the future of technology.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
              Read Articles
            </button>
            <button className="border border-gray-600 hover:border-gray-500 text-gray-300 px-6 py-3 rounded-lg transition-colors">
              Subscribe
            </button>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Featured Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder for featured articles */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="h-48 bg-gray-700 rounded mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
              <p className="text-gray-400 mb-4">
                Our first articles will be published here soon.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <span>5 min read</span>
                <span className="mx-2">•</span>
                <span>AI</span>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="h-48 bg-gray-700 rounded mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Stay Tuned</h3>
              <p className="text-gray-400 mb-4">
                We&apos;re preparing amazing content about AI and technology.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <span>3 min read</span>
                <span className="mx-2">•</span>
                <span>Technology</span>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="h-48 bg-gray-700 rounded mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Get Ready</h3>
              <p className="text-gray-400 mb-4">
                Deep insights into machine learning and neural networks.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <span>7 min read</span>
                <span className="mx-2">•</span>
                <span>Machine Learning</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Artificial Intelligence', 'Machine Learning', 'Deep Learning', 'Technology'].map((category) => (
              <div key={category} className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer">
                <h3 className="font-semibold">{category}</h3>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}

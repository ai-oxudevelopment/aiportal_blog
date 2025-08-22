import Layout from '@/components/Layout';
import GradientCard from '@/components/GradientCard';

export default function Home() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-openai-blue bg-clip-text text-transparent">
            AI Portal Blog
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Exploring the latest developments in artificial intelligence, 
            machine learning, and the future of technology.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg transition-colors focus-ring">
              Read Articles
            </button>
            <button className="border border-border hover:border-foreground/20 text-foreground px-6 py-3 rounded-lg transition-colors focus-ring">
              Subscribe
            </button>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Featured Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GradientCard
              title="Coming Soon"
              description="Our first articles will be published here soon."
              gradient="openai"
              className="h-64"
            >
              <div className="flex items-center text-sm text-white/80">
                <span>5 min read</span>
                <span className="mx-2">•</span>
                <span>AI</span>
              </div>
            </GradientCard>
            
            <GradientCard
              title="Stay Tuned"
              description="We&apos;re preparing amazing content about AI and technology."
              gradient="purple-blue"
              className="h-64"
            >
              <div className="flex items-center text-sm text-white/80">
                <span>3 min read</span>
                <span className="mx-2">•</span>
                <span>Technology</span>
              </div>
            </GradientCard>
            
            <GradientCard
              title="Get Ready"
              description="Deep insights into machine learning and neural networks."
              gradient="openai-reverse"
              className="h-64"
            >
              <div className="flex items-center text-sm text-white/80">
                <span>7 min read</span>
                <span className="mx-2">•</span>
                <span>Machine Learning</span>
              </div>
            </GradientCard>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Artificial Intelligence', gradient: 'gray-dark' as const },
              { name: 'Machine Learning', gradient: 'gray-light' as const },
              { name: 'Deep Learning', gradient: 'openai' as const },
              { name: 'Technology', gradient: 'purple-blue' as const }
            ].map((category) => (
              <GradientCard
                key={category.name}
                title={category.name}
                description=""
                gradient={category.gradient}
                className="h-32 cursor-pointer hover:scale-105 transition-transform"
              />
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Design System Demo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Color Palette</h3>
              <div className="grid grid-cols-5 gap-2">
                {['openai-gray-50', 'openai-gray-100', 'openai-gray-200', 'openai-gray-300', 'openai-gray-400'].map((color) => (
                  <div key={color} className={`h-12 rounded bg-${color} border border-border`} title={color} />
                ))}
                {['openai-gray-500', 'openai-gray-600', 'openai-gray-700', 'openai-gray-800', 'openai-gray-900'].map((color) => (
                  <div key={color} className={`h-12 rounded bg-${color} border border-border`} title={color} />
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <div className="h-8 w-8 rounded bg-openai-green" title="OpenAI Green" />
                <div className="h-8 w-8 rounded bg-openai-blue" title="OpenAI Blue" />
                <div className="h-8 w-8 rounded bg-openai-purple" title="OpenAI Purple" />
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Typography</h3>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold">Heading 1</h1>
                <h2 className="text-3xl font-semibold">Heading 2</h2>
                <h3 className="text-2xl font-medium">Heading 3</h3>
                <p className="text-base">Body text with proper line height and spacing.</p>
                <p className="text-sm text-muted-foreground">Small muted text for secondary information.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

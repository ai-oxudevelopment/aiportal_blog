'use client';

export default function TestEnvPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Environment Variables Test</h1>
      <p>NEXT_PUBLIC_STRAPI_API_URL: {process.env.NEXT_PUBLIC_STRAPI_API_URL || 'NOT SET'}</p>
      <p>NEXT_PUBLIC_STRAPI_API_TOKEN: {process.env.NEXT_PUBLIC_STRAPI_API_TOKEN ? 'SET' : 'NOT SET'}</p>
      <p>NODE_ENV: {process.env.NODE_ENV || 'NOT SET'}</p>
    </div>
  );
}
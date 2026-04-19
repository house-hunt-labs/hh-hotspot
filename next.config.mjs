const nextConfig = {
  reactStrictMode: true,
  env: {
    // Google Maps JS API requires a browser-exposed key; support either name from .env
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAP_DEMO_KEY || '',
  },
};

export default nextConfig;

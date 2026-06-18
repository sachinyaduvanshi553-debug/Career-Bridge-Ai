/** @type {import('next').NextConfig} */
const nextConfig = {
    swcMinify: false, // Reduce memory usage during dev
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:8000/api/:path*',
            },
        ];
    },
};

export default nextConfig;

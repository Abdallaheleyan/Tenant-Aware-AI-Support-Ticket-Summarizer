import type { NextConfig } from "next";

const nextConfig: import('next').NextConfig = {
    // We removed the rewrites proxy because the Next.js internal development server
    // often suffers from massive proxy latency on Windows/WSL setups.
};

export default nextConfig;

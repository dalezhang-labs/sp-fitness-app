import type { NextConfig } from "next";

const securityHeaders = [
  // 防止点击劫持
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // 禁止 MIME 类型嗅探
  { key: "X-Content-Type-Options", value: "nosniff" },
  // 控制 Referrer 信息
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // 限制浏览器功能（摄像头、麦克风等）
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // 强制 HTTPS（生产环境）
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // 内容安全策略：只允许同源资源 + Google Fonts
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js 需要 unsafe-eval（dev HMR）
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // ── 安全响应头 ──────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  // ── 包体积优化：对 neon 做 tree-shaking ─────────────────────
  experimental: {
    optimizePackageImports: ["@neondatabase/serverless"],
  },

  // ── 图片配置（为将来扩展预留） ──────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;

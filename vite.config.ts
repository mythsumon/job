/** @format */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
    plugins: [
        react(),
        runtimeErrorOverlay(),
        // Repl.it 플러그인은 운영 환경에서만 사용
        // ...(process.env.NODE_ENV !== "production" &&
        // process.env.REPL_ID !== undefined
        //   ? [
        //       await import("@replit/vite-plugin-cartographer").then((m) =>
        //         m.cartographer(),
        //       ),
        //     ]
        //   : []),
    ],
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "client", "src"),
            "@shared": path.resolve(import.meta.dirname, "shared"),
            "@assets": path.resolve(import.meta.dirname, "attached_assets"),
        },
    },
    root: path.resolve(import.meta.dirname, "client"),
    build: {
        outDir: path.resolve(import.meta.dirname, "dist/public"),
        emptyOutDir: true,
        // 운영 환경 보안 설정
        sourcemap: false, // 소스맵 비활성화
        minify: "terser", // 코드 난독화
        terserOptions: {
            compress: {
                drop_console: true, // console.log 제거
                drop_debugger: true, // debugger 제거
            },
            mangle: true, // 변수명 난독화
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ["react", "react-dom"],
                    utils: ["@tanstack/react-query"],
                },
                // 파일명 난독화
                chunkFileNames: "assets/[name]-[hash].js",
                entryFileNames: "assets/[name]-[hash].js",
                assetFileNames: "assets/[name]-[hash].[ext]",
            },
        },
    },
    server: {
        host: "0.0.0.0", // 모든 네트워크 인터페이스에서 접속 허용
        port: 5173,
        proxy: {
            "/api": {
                target: "http://localhost:5000",
                changeOrigin: true,
            },
        },
    },
});

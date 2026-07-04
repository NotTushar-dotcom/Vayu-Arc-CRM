import path from "path"
import { fileURLToPath } from "url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(async ({ command }) => {
  const plugins = [react()]

  // Only load dev-server plugin in development
  if (command === "serve") {
    const devServer = (await import("@hono/vite-dev-server")).default
    plugins.unshift(
      [devServer({ entry: "server/boot.ts", exclude: [/^\/(?!api\/).*$/] })]
    )
  }

  return {
    plugins,
    server: {
      port: 3000,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@contracts": path.resolve(__dirname, "./contracts"),
        "@db": path.resolve(__dirname, "./db"),
        "db": path.resolve(__dirname, "./db"),
      },
    },
    envDir: path.resolve(__dirname),
    build: {
      outDir: path.resolve(__dirname, "dist"),
      emptyOutDir: true,
    },
  }
})

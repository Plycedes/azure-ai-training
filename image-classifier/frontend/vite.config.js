import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        host: "0.0.0.0", // Listen on all network interfaces
        port: 5173, // Ensure the port matches your setup
        proxy: {
            "/analyze-image": {
                target: "http://20.127.172.135:5000", // Replace with your Flask backend address
                changeOrigin: true, // Change the origin of the host header to the target URL
            },
        },
        headers: {
            "Access-Control-Allow-Origin": "*", // This allows all origins, adjust as needed
        },
    },
});

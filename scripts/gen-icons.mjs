/**
 * Generate PNG icons from SVG for PWA manifest.
 * Uses sharp if available, otherwise falls back to a simple approach.
 * Run: node scripts/gen-icons.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

async function main() {
    try {
        // Try using sharp
        const sharp = (await import("sharp")).default;

        const svg192 = fs.readFileSync(path.join(publicDir, "icon-192.svg"));
        const svg512 = fs.readFileSync(path.join(publicDir, "icon-512.svg"));

        await sharp(svg192)
            .resize(192, 192)
            .png()
            .toFile(path.join(publicDir, "icon-192.png"));

        await sharp(svg512)
            .resize(512, 512)
            .png()
            .toFile(path.join(publicDir, "icon-512.png"));

        console.log("✅ Generated icon-192.png and icon-512.png using sharp");
    } catch (e) {
        console.log("sharp not available, installing...");
        const { execSync } = await import("child_process");
        execSync("npm install --no-save sharp", { cwd: path.join(__dirname, ".."), stdio: "inherit" });

        // Retry
        const sharp = (await import("sharp")).default;

        const svg192 = fs.readFileSync(path.join(publicDir, "icon-192.svg"));
        const svg512 = fs.readFileSync(path.join(publicDir, "icon-512.svg"));

        await sharp(svg192)
            .resize(192, 192)
            .png()
            .toFile(path.join(publicDir, "icon-192.png"));

        await sharp(svg512)
            .resize(512, 512)
            .png()
            .toFile(path.join(publicDir, "icon-512.png"));

        console.log("✅ Generated icon-192.png and icon-512.png");
    }
}

main().catch(console.error);

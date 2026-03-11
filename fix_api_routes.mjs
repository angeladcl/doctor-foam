import { readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { join } from "path";

function findRoutes(dir) {
    let results = [];
    const list = readdirSync(dir);
    list.forEach(file => {
        file = join(dir, file);
        const stat = statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(findRoutes(file));
        } else if (file.endsWith("route.ts")) {
            results.push(file);
        }
    });
    return results;
}

const routes = findRoutes("./src/app/api");

for (const route of routes) {
    let content = readFileSync(route, "utf8");
    if (!content.includes('export const dynamic = "force-dynamic";')) {
        content = 'export const dynamic = "force-dynamic";\n\n' + content;
        writeFileSync(route, content);
        console.log("Patched", route);
    }
}

import { defineConfig } from 'drizzle-kit';


export default defineConfig({
    schema: "./src/schema",
    dialect: "postgresql",
    out: "./src/db",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
    verbose: true,
    strict: true
})
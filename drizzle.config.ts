import { defineConfig } from 'drizzle-kit';


export default defineConfig({
    schema: "./src/schema",
    dialect: "postgresql",
    out: "./src/migrations",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
    verbose: true,
    strict: true
})
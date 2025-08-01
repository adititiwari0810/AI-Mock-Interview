/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.js",
    dialect: 'postgresql',
    dbCredentials: {
      url: 'postgresql://neondb_owner:npg_LX4FSeVKth2W@ep-empty-unit-a80ua36x-pooler.eastus2.azure.neon.tech/ai-mock?sslmode=require',
    }
  };
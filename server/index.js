import { buildApp } from "./src/app.js";
import { env } from "./src/config/env.js";

const app = buildApp();

app.listen(env.port, () => {
  console.log(`Backend listening on port ${env.port}`);
});

import { app } from "./app.js";
import "./db/index.js";

const port = Number(process.env.PORT) || 4000;

app.listen(port, () => {
  console.log(`Backend API listening on port ${port}`);
});


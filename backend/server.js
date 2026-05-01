import "dotenv/config";
import app from "./app.js";

const port = Number(process.env.PORT ?? 5000);

app.listen(port, () => {
  console.log(`brAIn backend is running on http://localhost:${port}`);
});

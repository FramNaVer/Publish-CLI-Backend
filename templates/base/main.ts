import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import authRouter from "./src/presentation/routes/auth.route";
import { errorMiddleware } from "./src/presentation/middleware/error.middleware";

const app = express();
const port = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRouter);

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

import "dotenv/config";
import express, { Request, Response } from "express";
import authRouter from "./src/presentation/routes/auth.route";

const app = express();
const port = 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "API is running" });
});

app.use("/api/auth", authRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

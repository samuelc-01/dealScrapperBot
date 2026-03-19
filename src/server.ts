import express, { Request, Response } from 'express';

const app = express();

app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
    return res.status(200).json({status: "ok" });
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`API rodando na porta ${PORT}`);
});
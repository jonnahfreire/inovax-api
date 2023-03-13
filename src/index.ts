require("dotenv").config();

import { PrismaClient } from '@prisma/client'
import express from "express";
import cors from 'cors'

const prisma = new PrismaClient()
const app = express();

app.use(express.json());
app.use(cors())
app.use(express.urlencoded({ extended: true }));


async function main() {
  await prisma.$connect()
  const port = process.env.PORT || 3000;

  // Get all tasks
  app.get("/tasks", async (req, res) => {
    try {
      const tasks = await prisma.task.findMany();

      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  });

  // Create a task
  app.post("/task", async (req, res) => {
    const { text, done } = req.body;

    if (!text) {
      res.status(422).json({ error: "Descrição é obrigatório!" });
      return;
    }

    const task = { text, done };

    try {
      await prisma.task.create({ data: task });
      res.status(201).json({ message: "Tarefa inserida com sucesso!" });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  });

  // Update one task
  app.put("/task/:id", async (req, res) => {
    const id = req.params.id;
    const { done, text } = req.body;
    const task = { done, text };

    if (!id) {
      res.status(422).json({ message: "id é obrigatório!" });
      return;
    }

    try {
      const updatedTask = await prisma.task.update({ where: { id }, data: task });

      res.status(200).json(updatedTask);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  });

  // Delete one task
  app.delete("/task/:id", async (req, res) => {
    const id = req.params.id;
    const task = await prisma.task.findUnique({ where: { id } });

    if (!task) {
      res.status(422).json({ message: "Tarefa não encontrada" });
      return;
    }

    try {
      await prisma.task.delete({ where: { id } });
      res.status(200).json({ message: "Tarefa removida com sucesso!" });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  });

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
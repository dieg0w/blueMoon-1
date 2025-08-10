import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

//Rotas Aluno
// Criar aluno
app.post('/alunos', async (req, res) => {
  try {
    const { email, name, age } = req.body;
    if (!email || !name || age === undefined) {
      return res.status(400).json({ error: 'Campos email, name e age são obrigatórios' });
    }
    const aluno = await prisma.aluno.create({
      data: { email, name, age }
    });
    res.status(201).json(aluno);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Listar todos alunos
app.get('/alunos', async (req, res) => {
  try {
    const alunos = await prisma.aluno.findMany();
    res.status(200).json(alunos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Atualizar aluno
app.put('/alunos/:id', async (req, res) => {
  try {
    const { email, name, age } = req.body;
    const { id } = req.params;

    if (!email && !name && age === undefined) {
      return res.status(400).json({ error: 'Informe ao menos um campo para atualizar' });
    }

    const aluno = await prisma.aluno.update({
      where: { id },
      data: { email, name, age }
    });
    res.status(200).json(aluno);
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') { // registro não encontrado
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Deletar aluno
app.delete('/alunos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.aluno.delete({ where: { id } });
    res.status(200).json({ message: 'Aluno deletado com sucesso' });
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    res.status(500).json({ error: error.message });
  }
});

//Rotas Aula
// Criar aula (agendar)
app.post('/aulas', async (req, res) => {
  try {
    const { alunoId, data, hora } = req.body;
    if (!alunoId || !data || !hora) {
      return res.status(400).json({ error: 'Campos alunoId, data e hora são obrigatórios' });
    }

    const aula = await prisma.aula.create({
      data: {
        alunoId,
        data: new Date(data),
        hora
      }
    });
    res.status(201).json(aula);
  } catch (error) {
    console.error(error);
    if (error.code === 'P2003') { 
      return res.status(400).json({ error: 'AlunoId inválido' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Listar todas as aulas com dados do aluno
app.get('/aulas', async (req, res) => {
  try {
    const aulas = await prisma.aula.findMany({
      include: { aluno: true }
    });
    res.status(200).json(aulas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Servidor
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});

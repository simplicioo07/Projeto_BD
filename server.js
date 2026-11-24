const express = require("express");
const { Pool } = require("pg");
const { randomUUID } = require("crypto");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const db = new Pool({
  host: "localhost",
  port: 5432,
  database: "locadora",
  user: "postgres",
  password: "SUA_SENHA"
});

// Campos permitidos: evitam inserir nomes de colunas enviados livremente.
const recursos = {
  filmes: {
    tabela: "filmes",
    chave: "id_filme",
    campos: ["nome", "duracao", "preco", "classificacao", "lancamento"]
  },
  clientes: {
    tabela: "clientes",
    chave: "cpf",
    campos: ["cpf", "nome", "telefone"]
  },
  acervo: {
    tabela: "acervo",
    chave: "id_acervo",
    campos: ["copias", "disponibilidade", "id_filme"]
  },
  alugueis: {
    tabela: "alugueis",
    chave: "id_aluguel",
    campos: ["cpf", "id_acervo"]
  }
};

app.get("/api/:recurso", async (req, res) => {
  try {
    const recurso = recursos[req.params.recurso];
    if (!recurso) return res.status(404).json({ erro: "Recurso não encontrado" });

    const resultado = await db.query(`SELECT * FROM ${recurso.tabela}`);
    res.json(resultado.rows);
  } catch {
    res.status(500).json({ erro: "Erro ao consultar o banco de dados" });
  }
});

app.post("/api/:recurso", async (req, res) => {
  try {
    const recurso = recursos[req.params.recurso];
    if (!recurso) return res.status(404).json({ erro: "Recurso não encontrado" });

    const campos = recurso.campos.filter(campo => req.body[campo] !== undefined);
    const valores = campos.map(campo => req.body[campo]);

    if (recurso.chave !== "cpf") {
      campos.unshift(recurso.chave);
      valores.unshift(randomUUID());
    }

    const placeholders = valores.map((_, i) => `$${i + 1}`).join(", ");
    const sql = `INSERT INTO ${recurso.tabela} (${campos.join(", ")})
                 VALUES (${placeholders}) RETURNING *`;

    const resultado = await db.query(sql, valores);
    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    res.status(400).json({ erro: "Não foi possível cadastrar. Verifique os dados e relacionamentos." });
  }
});

app.delete("/api/:recurso/:id", async (req, res) => {
  try {
    const recurso = recursos[req.params.recurso];
    if (!recurso) return res.status(404).json({ erro: "Recurso não encontrado" });

    await db.query(
      `DELETE FROM ${recurso.tabela} WHERE ${recurso.chave} = $1`,
      [req.params.id]
    );

    res.sendStatus(204);
  } catch {
    res.status(400).json({ erro: "Não foi possível excluir este registro. Ele pode estar relacionado a outros dados." });
  }
});

app.listen(3000, () => console.log("Servidor em http://localhost:3000"));
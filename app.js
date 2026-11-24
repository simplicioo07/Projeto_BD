const recursoAPI = {
  Filmes: "filmes",
  Clientes: "clientes",
  Acervo: "acervo",
  "Aluguéis": "alugueis"
};

async function carregarDados() {
  try {
    const resposta = await fetch(`/api/${recursoAPI[tabelaAtual]}`);

    if (!resposta.ok) {
      throw new Error("Falha ao carregar os dados");
    }

    dados[tabelaAtual] = await resposta.json();
    renderizar();
  } catch (erro) {
    console.error(erro);
    alert("Não foi possível carregar os dados. Verifique se o servidor está rodando.");
  }
}

function abrirTabela(nome) {
  tabelaAtual = nome;
  carregarDados();
}

// Carrega a tabela inicial
carregarDados();
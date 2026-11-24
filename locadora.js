// app.js
document.head.insertAdjacentHTML("beforeend", `
  <style>
    body { font: 16px Arial; max-width: 1000px; margin: 30px auto; padding: 0 16px; background: #f3f4f6; }
    button, input, select { padding: 9px; margin: 5px; }
    button { cursor: pointer; background: #3157a4; color: white; border: 0; border-radius: 4px; }
    form, section { background: white; padding: 16px; margin: 16px 0; border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px; border-bottom: 1px solid #ddd; text-align: left; }
    .excluir { background: #b83232; }
  </style>
`);

document.body.innerHTML = `
  <h1>Locadora de Filmes</h1>
  <nav id="abas"></nav>
  <form id="formulario"></form>
  <section id="lista"></section>
`;

const tabelas = {
  Filmes: {
    chave: "id_filme",
    campos: [
      ["Nome", "nome", "text"],
      ["Duração (minutos)", "duracao", "number"],
      ["Preço", "preco", "number"],
      ["Classificação indicativa", "classificacao", "text"],
      ["Data de lançamento", "lancamento", "date"]
    ]
  },
  Clientes: {
    chave: "cpf",
    campos: [
      ["Nome", "nome", "text"],
      ["CPF", "cpf", "text"],
      ["Telefone", "telefone", "tel"]
    ]
  },
  Acervo: {
    chave: "id_acervo",
    campos: [
      ["Cópias", "copias", "number"],
      ["Disponibilidade", "disponibilidade", "select", ["Sim", "Não"]],
      ["Filme", "id_filme", "ref", "Filmes"]
    ]
  },
  "Aluguéis": {
    chave: "id_aluguel",
    campos: [
      ["CPF do cliente", "cpf", "ref", "Clientes"],
      ["Identificador do acervo", "id_acervo", "ref", "Acervo"]
    ]
  }
};

const dados = JSON.parse(localStorage.getItem("locadora") || "{}");
Object.keys(tabelas).forEach(nome => dados[nome] ||= []);
let tabelaAtual = "Filmes";

function salvar() {
  localStorage.setItem("locadora", JSON.stringify(dados));
}

function abrirTabela(nome) {
  tabelaAtual = nome;
  renderizar();
}

function renderizar() {
  document.querySelector("#abas").innerHTML = Object.keys(tabelas)
    .map(nome => `<button data-aba="${nome}">${nome}</button>`).join("");

  const configuracao = tabelas[tabelaAtual];
  const formulario = document.querySelector("#formulario");

  formulario.innerHTML = `<h2>Cadastrar: ${tabelaAtual}</h2>` +
    configuracao.campos.map(([rotulo, campo, tipo, extra]) => {
      if (tipo === "ref") {
        return `<label>${rotulo}
          <select name="${campo}" required>
            <option value="">Selecione</option>
            ${dados[extra].map(item => {
              const chave = tabelas[extra].chave;
              return `<option value="${item[chave]}">${item.nome || item[chave]}</option>`;
            }).join("")}
          </select>
        </label>`;
      }

      if (tipo === "select") {
        return `<label>${rotulo}
          <select name="${campo}">${extra.map(opcao =>
            `<option>${opcao}</option>`).join("")}
          </select>
        </label>`;
      }

      return `<label>${rotulo}
        <input name="${campo}" type="${tipo}" required>
      </label>`;
    }).join("") + `<button type="submit">Salvar</button>`;

  const colunas = [configuracao.chave, ...configuracao.campos.map(campo => campo[1])];

  document.querySelector("#lista").innerHTML = `
    <h2>Registros de ${tabelaAtual}</h2>
    <table>
      <thead><tr>${colunas.map(c => `<th>${c}</th>`).join("")}<th>Ação</th></tr></thead>
      <tbody>${dados[tabelaAtual].map((item, indice) => `
        <tr>
          ${colunas.map(c => `<td>${item[c] ?? ""}</td>`).join("")}
          <td><button class="excluir" data-excluir="${indice}">Excluir</button></td>
        </tr>
      `).join("")}</tbody>
    </table>`;
}

document.addEventListener("click", evento => {
  if (evento.target.dataset.aba) abrirTabela(evento.target.dataset.aba);

  if (evento.target.dataset.excluir !== undefined) {
    dados[tabelaAtual].splice(Number(evento.target.dataset.excluir), 1);
    salvar();
    renderizar();
  }
});

document.addEventListener("submit", evento => {
  if (evento.target.id !== "formulario") return;
  evento.preventDefault();

  const item = Object.fromEntries(new FormData(evento.target));
  const chave = tabelas[tabelaAtual].chave;

  if (chave !== "cpf") item[chave] = crypto.randomUUID().slice(0, 8);

  dados[tabelaAtual].push(item);
  salvar();
  renderizar();
});

renderizar();
let estoque = [];
let vendas = [];

document
  .getElementById("form-adicionar-item")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    let descricao = document.getElementById("descricao").value;
    let quantidade = parseInt(document.getElementById("quantidade").value);
    let valorCusto = parseFloat(document.getElementById("valorCusto").value);
    let valorVenda = parseFloat(document.getElementById("valorVenda").value);

    let margemLucro = ((valorVenda - valorCusto) / valorCusto) * 100;

    let itemExistente = estoque.find((item) => item.descricao === descricao);
    if (itemExistente) {
      itemExistente.quantidade += quantidade;
      itemExistente.valorCusto = valorCusto;
      itemExistente.valorVenda = valorVenda;
      itemExistente.margemLucro = margemLucro;
    } else {
      estoque.push({
        descricao,
        quantidade,
        valorCusto,
        valorVenda,
        margemLucro,
      });
    }

    salvarEstoque();
    atualizarListaEstoque();
    atualizarOpcoesVenda();
    atualizarSaldos();
    document.getElementById("form-adicionar-item").reset();
  });

function atualizarListaEstoque() {
  const listaEstoque = document.getElementById("estoque-lista");
  listaEstoque.innerHTML = "";

  estoque.forEach((item, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
            Descrição: ${item.descricao} - Quantidade: ${
      item.quantidade
    } - Valor de Custo: R$ ${item.valorCusto.toFixed(
      2
    )} - Valor de Venda: R$ ${item.valorVenda.toFixed(
      2
    )} - Margem de Lucro: ${item.margemLucro.toFixed(2)}%
            <button onclick="editarItem(${index})">Editar</button>
            <button onclick="excluirItem(${index})">Excluir</button>
        `;

    if (item.quantidade === 0) {
      li.style.color = "red";
      li.innerHTML += " (Esgotado)";
    }

    listaEstoque.appendChild(li);
  });

  atualizarSaldos();
}

function editarItem(index) {
  let novaDescricao = prompt(
    "Digite a nova descrição",
    estoque[index].descricao
  );
  let novaQuantidade = prompt(
    "Digite a nova quantidade",
    estoque[index].quantidade
  );
  let novoValorCusto = prompt(
    "Digite o novo valor de custo",
    estoque[index].valorCusto
  );
  let novoValorVenda = prompt(
    "Digite o novo valor de venda",
    estoque[index].valorVenda
  );

  if (
    novaDescricao !== null &&
    novaQuantidade !== null &&
    novoValorCusto !== null &&
    novoValorVenda !== null &&
    !isNaN(novaQuantidade) &&
    !isNaN(novoValorCusto) &&
    !isNaN(novoValorVenda)
  ) {
    estoque[index].descricao = novaDescricao;
    estoque[index].quantidade = parseInt(novaQuantidade);
    estoque[index].valorCusto = parseFloat(novoValorCusto);
    estoque[index].valorVenda = parseFloat(novoValorVenda);
    estoque[index].margemLucro =
      ((estoque[index].valorVenda - estoque[index].valorCusto) /
        estoque[index].valorCusto) *
      100;

    salvarEstoque();
    atualizarListaEstoque();
    atualizarOpcoesVenda();
    atualizarSaldos();
  }
}

function salvarEstoque() {
  localStorage.setItem("estoque", JSON.stringify(estoque));
}

function salvarVendas() {
  localStorage.setItem("vendas", JSON.stringify(vendas));
}

function carregarEstoque() {
  const estoqueSalvo = JSON.parse(localStorage.getItem("estoque"));
  if (estoqueSalvo) {
    estoque = estoqueSalvo;
    atualizarListaEstoque();
    atualizarOpcoesVenda();
    atualizarSaldos();
  }
}

function carregarVendas() {
  const vendasSalvas = JSON.parse(localStorage.getItem("vendas"));
  if (vendasSalvas) {
    vendas = vendasSalvas;
    atualizarListaVendas();
    atualizarSaldos();
  }
}

function atualizarOpcoesVenda() {
  const itemVendaSelect = document.getElementById("itemVenda");
  itemVendaSelect.innerHTML = "";

  estoque.forEach((item) => {
    if (item.quantidade > 0) {
      const option = document.createElement("option");
      option.value = item.descricao;
      option.textContent = `${item.descricao} (R$ ${item.valorVenda.toFixed(
        2
      )})`;
      itemVendaSelect.appendChild(option);
    }
  });
}

document
  .getElementById("form-registrar-venda")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    let itemDescricao = document.getElementById("itemVenda").value;
    let quantidadeVenda = parseInt(
      document.getElementById("quantidadeVenda").value
    );
    let cliente = document.getElementById("cliente").value;

    let item = estoque.find((i) => i.descricao === itemDescricao);

    if (item && quantidadeVenda > 0 && quantidadeVenda <= item.quantidade) {
      item.quantidade -= quantidadeVenda;
      vendas.push({
        descricao: item.descricao,
        quantidade: quantidadeVenda,
        valorVenda: item.valorVenda,
        cliente,
        data: new Date().toLocaleDateString(),
      });

      salvarEstoque();
      salvarVendas();
      atualizarListaEstoque();
      atualizarListaVendas();
      atualizarOpcoesVenda();
      atualizarSaldos();
      document.getElementById("form-registrar-venda").reset();
    } else {
      alert("Quantidade de venda inválida!");
    }
  });

function atualizarListaVendas() {
  const listaVendas = document.getElementById("vendas-lista");
  listaVendas.innerHTML = "";

  vendas.forEach((venda, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
            Data: ${venda.data} - Descrição: ${venda.descricao} - Quantidade: ${
      venda.quantidade
    } - Valor de Venda: R$ ${venda.valorVenda.toFixed(2)} - Cliente: ${
      venda.cliente
    }
            <button onclick="excluirVenda(${index})">Excluir</button>
        `;

    listaVendas.appendChild(li);
  });
}

function excluirItem(index) {
  estoque.splice(index, 1);
  salvarEstoque();
  atualizarListaEstoque();
  atualizarOpcoesVenda();
  atualizarSaldos();
}

function excluirVenda(index) {
  vendas.splice(index, 1);
  salvarVendas();
  atualizarListaVendas();
  atualizarSaldos();
}

function atualizarSaldos() {
  let saldoEstoque = estoque.reduce(
    (total, item) => total + item.quantidade * (item.valorCusto || 0),
    0
  );

  let saldoVendas = vendas.reduce((total, venda) => {
    let lucroPorItem = (venda.valorVenda || 0) - (venda.valorCusto || 0);
    return total + venda.quantidade * lucroPorItem;
  }, 0);

  document.getElementById(
    "saldo-estoque"
  ).textContent = `Saldo de Estoque: R$ ${saldoEstoque.toFixed(2)}`;
  document.getElementById(
    "saldo-vendas"
  ).textContent = `Saldo de Vendas (Lucro Real): R$ ${saldoVendas.toFixed(2)}`;
}

function openTab(event, tabName) {
  let tabContent = document.getElementsByClassName("tab-content");
  for (let i = 0; i < tabContent.length; i++) {
    tabContent[i].style.display = "none";
  }

  let tabButtons = document.getElementsByClassName("tab-button");
  for (let i = 0; i < tabButtons.length; i++) {
    tabButtons[i].className = tabButtons[i].className.replace(" active", "");
  }

  document.getElementById(tabName).style.display = "block";
  event.currentTarget.className += " active";
}

window.onload = function () {
  carregarEstoque();
  carregarVendas();
  openTab({ currentTarget: document.querySelector(".tab-button") }, "estoque");
};

let estoque = [];
let vendas = [];

document
  .getElementById("form-adicionar-item")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    let descricao = document.getElementById("descricao").value;
    let quantidade = parseInt(document.getElementById("quantidade").value);
    let valorCusto = parseFloat(document.getElementById("valorCusto").value);
    let margemLucro = parseFloat(document.getElementById("margemLucro").value);

    let valorVenda = parseFloat(
      (valorCusto * (1 + margemLucro / 100)).toFixed(2)
    );

    let itemExistente = estoque.find((item) => item.descricao === descricao);
    if (itemExistente) {
      itemExistente.quantidade += quantidade;
      itemExistente.valorCusto = valorCusto;
      itemExistente.margemLucro = margemLucro;
      itemExistente.valorVenda = valorVenda;
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
    )} - Valor de Venda: R$ ${item.valorVenda.toFixed(2)} - Margem de Lucro: ${
      item.margemLucro
    }%
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
  let novaMargemLucro = prompt(
    "Digite a nova margem de lucro (%)",
    estoque[index].margemLucro
  );

  if (
    novaDescricao !== null &&
    novaQuantidade !== null &&
    novoValorCusto !== null &&
    novaMargemLucro !== null &&
    !isNaN(novaQuantidade) &&
    !isNaN(novoValorCusto) &&
    !isNaN(novaMargemLucro)
  ) {
    estoque[index].descricao = novaDescricao;
    estoque[index].quantidade = parseInt(novaQuantidade);
    estoque[index].valorCusto = parseFloat(novoValorCusto);
    estoque[index].margemLucro = parseFloat(novaMargemLucro);
    estoque[index].valorVenda =
      estoque[index].valorCusto * (1 + estoque[index].margemLucro / 100);

    salvarEstoque();
    atualizarListaEstoque();
    atualizarOpcoesVenda();
    atualizarSaldos();
  }
}

function excluirItem(index) {
  if (
    confirm(
      `Tem certeza que deseja excluir o item "${estoque[index].descricao}"?`
    )
  ) {
    estoque.splice(index, 1);
    salvarEstoque();
    atualizarListaEstoque();
    atualizarOpcoesVenda();
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

    if (item && quantidadeVenda <= item.quantidade) {
      let valorVendaTotal = quantidadeVenda * item.valorVenda;
      let data = new Date().toLocaleString();

      vendas.push({
        data,
        item: item.descricao,
        quantidade: quantidadeVenda,
        valorVenda: valorVendaTotal,
        cliente,
      });

      item.quantidade -= quantidadeVenda;

      salvarEstoque();
      salvarVendas();
      atualizarListaEstoque();
      atualizarOpcoesVenda();
      atualizarListaVendas();
      atualizarSaldos();
      document.getElementById("form-registrar-venda").reset();
    } else {
      alert("Quantidade indisponível no estoque.");
    }
  });

function atualizarListaVendas() {
  const listaVendas = document.getElementById("vendas-lista");
  listaVendas.innerHTML = "";

  vendas.forEach((venda, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
            Data: ${venda.data} - Item: ${venda.item} - Quantidade: ${
      venda.quantidade
    } - Valor de Venda: R$ ${venda.valorVenda.toFixed(2)} - Cliente: ${
      venda.cliente
    }
            <button onclick="editarVenda(${index})">Editar</button>
            <button onclick="excluirVenda(${index})">Excluir</button>
        `;
    listaVendas.appendChild(li);
  });
}

function editarVenda(index) {
  let novaQuantidade = prompt(
    "Digite a nova quantidade",
    vendas[index].quantidade
  );
  let novoCliente = prompt("Digite o nome do cliente", vendas[index].cliente);

  if (
    novaQuantidade !== null &&
    !isNaN(novaQuantidade) &&
    novoCliente !== null
  ) {
    novaQuantidade = parseInt(novaQuantidade);

    let vendaOriginal = vendas[index];
    let item = estoque.find((i) => i.descricao === vendaOriginal.item);

    if (item) {
      // Reverter a quantidade original ao estoque
      item.quantidade += vendaOriginal.quantidade;

      // Atualizar a venda
      vendas[index].quantidade = novaQuantidade;
      vendas[index].cliente = novoCliente;
      vendas[index].valorVenda = novaQuantidade * item.valorVenda;

      // Atualizar o estoque com a nova quantidade vendida
      item.quantidade -= novaQuantidade;

      salvarEstoque();
      salvarVendas();
      atualizarListaEstoque();
      atualizarListaVendas();
      atualizarOpcoesVenda();
      atualizarSaldos();
    }
  }
}

function excluirVenda(index) {
  if (confirm("Tem certeza que deseja excluir esta venda?")) {
    let vendaExcluida = vendas.splice(index, 1)[0];
    let item = estoque.find((i) => i.descricao === vendaExcluida.item);

    if (item) {
      item.quantidade += vendaExcluida.quantidade;

      salvarEstoque();
      salvarVendas();
      atualizarListaEstoque();
      atualizarListaVendas();
      atualizarOpcoesVenda();
      atualizarSaldos();
    }
  }
}

function atualizarSaldos() {
  let saldoEstoque = estoque.reduce(
    (total, item) => total + item.valorCusto * item.quantidade,
    0
  );
  let saldoVendas = vendas.reduce((total, venda) => {
    let item = estoque.find((i) => i.descricao === venda.item);
    let lucroVenda =
      venda.valorVenda - (item ? item.valorCusto * venda.quantidade : 0);
    return total + lucroVenda;
  }, 0);

  document.getElementById(
    "saldo-estoque"
  ).textContent = `Saldo de Estoque: R$ ${saldoEstoque.toFixed(2)}`;
  document.getElementById(
    "saldo-vendas"
  ).textContent = `Saldo de Vendas (Lucro Real): R$ ${saldoVendas.toFixed(2)}`;
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

// Carregar dados salvos ao iniciar
carregarEstoque();
carregarVendas();

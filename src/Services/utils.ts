import { categorias } from "../constants/ContaAzulCtes";
import { PedidoPagamentoFieldsValues } from "../models/podioModels";

export function CPFtoOnlyNumbers (cpf: string): string {
  return cpf.replace(/\D/g, '');
}

export function getCategoriaDoContaAzul (pedidoValues: PedidoPagamentoFieldsValues): string {

  let categoria = "";

  const listaGastosSe = [
    pedidoValues.GastoProjeto,
    pedidoValues.GastoAdmFin,
    pedidoValues.GastoGG,
    pedidoValues.GastoMkt,
    pedidoValues.GastoPresidencia,
    pedidoValues.GastoDP,
    pedidoValues.GastoSFE,
    pedidoValues.LocalInvestMembro
  ]

  if (listaGastosSe[0]) {
    categoria = categorias
                    .filter((cat) => cat.includes(<string>pedidoValues.Coordenacao) && cat.includes("Custo de Projeto"))
                    .filter((cat) => cat.includes(<string>pedidoValues.GastoProjeto))[0];

    if (pedidoValues.Coordenacao === "QAB" && !categoria) {
      categoria = "QAB / Custo de Projeto / Material Consumível (Reagente)"
    }

  }

  if (listaGastosSe[1]) {
    categoria = categorias
                    .filter((cat) => cat.includes("ADMFIN") && cat.includes(<string>pedidoValues.GastoAdmFin))[0];
    if (!categoria) {
      categoria = "Diretoria Administrativa Financeira"
    }
  }

  if (listaGastosSe[2]) {
    categoria = categorias
                    .filter((cat) => cat.includes("G&G") && cat.includes(<string>pedidoValues.GastoGG))[0];
    if (!categoria) {
      categoria = "Diretoria de Gente & Gestão"
    }

  }

  if (listaGastosSe[3]) {
    categoria = categorias
                    .filter((cat) => cat.includes("MKTV") && cat.includes(<string>pedidoValues.GastoMkt))[0];

    if (!categoria) {
      categoria = "Diretoria de Marketing & Vendas"
    }
  }

  if (listaGastosSe[4]) {
    categoria = categorias
                    .filter((cat) => cat.includes("PRES") && cat.includes(<string>pedidoValues.GastoPresidencia))[0];

    if (!categoria) {
      categoria = "Diretoria da Presidência"
    }
  }

  if (listaGastosSe[5]) {
    categoria = categorias
                    .filter((cat) => cat.includes("DP") && cat.includes(<string>pedidoValues.GastoDP))[0];

    if (!categoria) {
      categoria = "Diretoria de Projetos"
    }
  }

  if (listaGastosSe[6]) {
    categoria = categorias
                    .filter((cat) => cat.includes("SFE") && cat.includes(<string>pedidoValues.GastoSFE))[0];

    if (!categoria) {
      categoria = "[SFE] Semana Fluxo de Engenharia (ver se faz sentido)"
    }
  }

  if (listaGastosSe[7]) {
    categoria = categorias
                    .filter((cat) => cat.includes(<string>pedidoValues.LocalInvestMembro) && cat.includes(<string>pedidoValues.TipoInvestimentoMembro))[0];
  }



  return categoria;

}

export function getCentroDeCustoDoContaAzul (pedidoValues: PedidoPagamentoFieldsValues): string {


  let centroDeCusto = "";

  const listaGastosSe = [
    pedidoValues.GastoProjeto,
    pedidoValues.GastoAdmFin,
    pedidoValues.GastoGG,
    pedidoValues.GastoMkt,
    pedidoValues.GastoPresidencia,
    pedidoValues.GastoDP,
    pedidoValues.GastoSFE,
    pedidoValues.LocalInvestMembro
  ]

  if (listaGastosSe[0]) {

    centroDeCusto = pedidoValues.Projeto.title.replace(".", "")
  }

  if (listaGastosSe[1]) {
    centroDeCusto = "Diretoria Administrativo-Financeira"
  }

  if (listaGastosSe[2]) {
    centroDeCusto = "Diretoria de Gente & Gestão"
  }

  if (listaGastosSe[3]) {

    centroDeCusto = "Diretoria de Marketing e Vendas"

  }

  if (listaGastosSe[4]) {

    centroDeCusto = "Diretoria da Presidência"

  }

  if (listaGastosSe[5]) {

    centroDeCusto = "Diretoria de Projetos"

  }

  if (listaGastosSe[6]) {
    centroDeCusto = "SFE"

  }

  if (listaGastosSe[7]) {
    centroDeCusto = `Coordenação de ${<string>pedidoValues.LocalInvestMembro}`
  }


  return centroDeCusto
}

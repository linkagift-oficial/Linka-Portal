/*************************************************
 * LINKA GIFT
 * Portal Interno
 * painel.js
 *************************************************/


/* ===============================================
   URL DO APPS SCRIPT
   =============================================== */

const API_URL =
  "https://script.google.com/macros/s/AKfycbwI0g0ZewChR-5EbQuvSbSQiWr2xbw9s_1GWCxLtckXlYxQv2fE_9JAIFfvLo0mNCeD/exec";


/* ===============================================
   ELEMENTOS
   =============================================== */

const loadingScreen =
  document.getElementById("loadingScreen");

const painel =
  document.getElementById("painel");

const erroSessao =
  document.getElementById("erroSessao");

const nomeUsuario =
  document.getElementById("nomeUsuario");

const btnSair =
  document.getElementById("btnSair");


/* ===============================================
   SESSÃO LOCAL
   =============================================== */

function getToken() {

  return sessionStorage.getItem(
    "linka_token"
  );

}


function limparSessaoLocal() {

  sessionStorage.removeItem(
    "linka_token"
  );

  sessionStorage.removeItem(
    "linka_nome"
  );

  sessionStorage.removeItem(
    "linka_email"
  );

}


/* ===============================================
   EXIBIR PAINEL
   =============================================== */

function mostrarPainel(
  dados
) {

  loadingScreen.hidden = true;
  erroSessao.hidden = true;
  painel.hidden = false;


  if (
    dados &&
    dados.nome
  ) {

    nomeUsuario.textContent =
      dados.nome;

  } else {

    const nomeSalvo =
      sessionStorage.getItem(
        "linka_nome"
      );

    nomeUsuario.textContent =
      nomeSalvo ||
      "Administrador";

  }

}


/* ===============================================
   EXIBIR ERRO DE SESSÃO
   =============================================== */

function mostrarErroSessao() {

  loadingScreen.hidden = true;
  painel.hidden = true;
  erroSessao.hidden = false;

}


/* ===============================================
   CHAMADA À API
   =============================================== */

async function chamarApi(
  dados
) {

  const resposta =
    await fetch(
      API_URL,
      {

        method:
          "POST",

        headers: {

          "Content-Type":
            "text/plain;charset=utf-8"

        },

        body:
          JSON.stringify(
            dados
          )

      }
    );


  if (!resposta.ok) {

    throw new Error(
      "Erro de comunicação com o servidor."
    );

  }


  return resposta.json();

}


/* ===============================================
   VALIDAR SESSÃO
   =============================================== */

async function validarSessao() {

  const token =
    getToken();


  /*
   * Sem token = não está logado
   */

  if (!token) {

    limparSessaoLocal();

    mostrarErroSessao();

    return;

  }


  try {

    const dados =
      await chamarApi({

        acao:
          "validarSessao",

        token:
          token

      });


    /*
     * Sessão inválida ou expirada
     */

    if (
      !dados ||
      !dados.ok ||
      !dados.autenticado
    ) {

      limparSessaoLocal();

      mostrarErroSessao();

      return;

    }


    /*
     * Atualiza informações locais
     */

    if (
      dados.nome
    ) {

      sessionStorage.setItem(
        "linka_nome",
        dados.nome
      );

    }


    if (
      dados.email
    ) {

      sessionStorage.setItem(
        "linka_email",
        dados.email
      );

    }


    /*
     * Libera o painel
     */

    mostrarPainel(
      dados
    );


  } catch (erro) {

    console.error(
      "Erro ao validar sessão:",
      erro
    );


    /*
     * Em erro de comunicação não apagamos
     * imediatamente a sessão.
     */

    loadingScreen.hidden = true;
    painel.hidden = true;
    erroSessao.hidden = false;

  }

}


/* ===============================================
   LOGOUT
   =============================================== */

async function sair() {

  const token =
    getToken();


  /*
   * Bloqueia o botão
   */

  btnSair.disabled = true;

  btnSair.textContent =
    "Saindo...";


  try {

    if (token) {

      await chamarApi({

        acao:
          "logout",

        token:
          token

      });

    }

  } catch (erro) {

    console.error(
      "Erro ao encerrar sessão:",
      erro
    );

  }


  /*
   * Mesmo se a API falhar,
   * removemos a sessão do navegador.
   */

  limparSessaoLocal();


  window.location.replace(
    "index.html"
  );

}


/* ===============================================
   BOTÃO SAIR
   =============================================== */

if (btnSair) {

  btnSair.addEventListener(
    "click",
    sair
  );

}


/* ===============================================
   SEGURANÇA AO VOLTAR PELO NAVEGADOR
   =============================================== */

window.addEventListener(
  "pageshow",
  function (event) {

    /*
     * Se a página voltar do cache do navegador,
     * validamos novamente a sessão.
     */

    if (
      event.persisted
    ) {

      validarSessao();

    }

  }
);


/* ===============================================
   INICIALIZA
   =============================================== */

validarSessao();

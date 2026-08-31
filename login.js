/*************************************************
 * LINKA GIFT
 * Portal Interno
 * login.js
 *************************************************/


/* ===============================================
   URL DO APPS SCRIPT
   =============================================== */

const API_URL =
  "https://script.google.com/macros/s/AKfycbwI0g0ZewChR-5EbQuvSbSQiWr2xbw9s_1GWCxLtckXlYxQv2fE_9JAIFfvLo0mNCeD/exec";


/* ===============================================
   ELEMENTOS
   =============================================== */

const loginForm =
  document.getElementById("loginForm");

const emailInput =
  document.getElementById("email");

const senhaInput =
  document.getElementById("senha");

const toggleSenha =
  document.getElementById("toggleSenha");

const btnEntrar =
  document.getElementById("btnEntrar");

const btnText =
  btnEntrar.querySelector(".btn-text");

const btnLoading =
  btnEntrar.querySelector(".btn-loading");

const loginMensagem =
  document.getElementById("loginMensagem");


/* ===============================================
   MOSTRAR / OCULTAR SENHA
   =============================================== */

toggleSenha.addEventListener(
  "click",
  function () {

    const mostrando =
      senhaInput.type === "text";

    senhaInput.type =
      mostrando
        ? "password"
        : "text";

    toggleSenha.textContent =
      mostrando
        ? "👁"
        : "🙈";

    toggleSenha.setAttribute(
      "aria-label",
      mostrando
        ? "Mostrar senha"
        : "Ocultar senha"
    );

  }
);


/* ===============================================
   MENSAGENS
   =============================================== */

function mostrarMensagem(
  mensagem,
  tipo = "erro"
) {

  loginMensagem.textContent =
    mensagem;

  loginMensagem.className =
    "login-message " + tipo;

}


function limparMensagem() {

  loginMensagem.textContent = "";

  loginMensagem.className =
    "login-message";

}


/* ===============================================
   BOTÃO CARREGANDO
   =============================================== */

function carregando(estado) {

  btnEntrar.disabled =
    estado;

  btnText.hidden =
    estado;

  btnLoading.hidden =
    !estado;

}


/* ===============================================
   SALVAR SESSÃO
   =============================================== */

function salvarSessao(
  dados
) {

  sessionStorage.setItem(
    "linka_token",
    dados.token
  );

  sessionStorage.setItem(
    "linka_nome",
    dados.nome || ""
  );

  sessionStorage.setItem(
    "linka_email",
    dados.email || ""
  );

}


/* ===============================================
   REMOVER SESSÃO
   =============================================== */

function limparSessao() {

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
   LOGIN
   =============================================== */

loginForm.addEventListener(
  "submit",
  async function (event) {

    event.preventDefault();

    limparMensagem();


    const email =
      emailInput.value
        .trim()
        .toLowerCase();

    const senha =
      senhaInput.value;


    /* -------------------------------------------
       VALIDAÇÕES
       ------------------------------------------- */

    if (!email) {

      mostrarMensagem(
        "Digite seu e-mail."
      );

      emailInput.focus();

      return;

    }


    if (!senha) {

      mostrarMensagem(
        "Digite sua senha."
      );

      senhaInput.focus();

      return;

    }


    /* -------------------------------------------
       ENVIA PARA O APPS SCRIPT
       ------------------------------------------- */

    try {

      carregando(true);


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
              JSON.stringify({

                acao:
                  "login",

                email:
                  email,

                senha:
                  senha

              })

          }
        );


      if (!resposta.ok) {

        throw new Error(
          "Erro de comunicação com o servidor."
        );

      }


      const dados =
        await resposta.json();


      /* -----------------------------------------
         LOGIN NEGADO
         ----------------------------------------- */

      if (!dados.ok) {

        limparSessao();

        mostrarMensagem(
          dados.erro ||
          "E-mail ou senha incorretos."
        );

        return;

      }


      /* -----------------------------------------
         TOKEN
         ----------------------------------------- */

      if (!dados.token) {

        throw new Error(
          "O servidor não retornou a sessão."
        );

      }


      /* -----------------------------------------
         SALVA SESSÃO
         ----------------------------------------- */

      salvarSessao(
        dados
      );


      /* -----------------------------------------
         MENSAGEM
         ----------------------------------------- */

      mostrarMensagem(
        "Acesso autorizado.",
        "sucesso"
      );


      /* -----------------------------------------
         REDIRECIONA
         ----------------------------------------- */

      setTimeout(
        function () {

          window.location.replace(
            "painel.html"
          );

        },
        450
      );


    } catch (erro) {

      console.error(
        "Erro no login:",
        erro
      );


      limparSessao();


      mostrarMensagem(
        "Não foi possível conectar ao sistema. Tente novamente."
      );


    } finally {

      carregando(false);

    }

  }
);


/* ===============================================
   VERIFICAR SESSÃO EXISTENTE
   =============================================== */

async function verificarSessaoExistente() {

  const token =
    sessionStorage.getItem(
      "linka_token"
    );


  if (!token) {

    return;

  }


  try {

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
            JSON.stringify({

              acao:
                "validarSessao",

              token:
                token

            })

        }
      );


    if (!resposta.ok) {

      limparSessao();

      return;

    }


    const dados =
      await resposta.json();


    if (
      dados.ok &&
      dados.autenticado
    ) {

      window.location.replace(
        "painel.html"
      );

      return;

    }


    limparSessao();


  } catch (erro) {

    console.error(
      "Erro ao verificar sessão:",
      erro
    );

  }

}


/* ===============================================
   INICIALIZA
   =============================================== */

verificarSessaoExistente();

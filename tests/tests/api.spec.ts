import { test, expect } from "@playwright/test";

/**
 * chamam os endpoints HTTP diretamente, sem passar pelo navegador,
 * validando apenas as respostas da API com entradas conhecidas.
 */

const BASE_URL = "http://localhost:8080";

test.describe("API - /auth/signup", () => {
  test("deve cadastrar um novo usuário com dados válidos e retornar 200", async ({
    request,
  }) => {
    const emailUnico = `apitest${Date.now()}@email.com`;

    const response = await request.post(`${BASE_URL}/auth/signup`, {
      data: {
        email: emailUnico,
        password: "Senha@1234",
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.email).toBe(emailUnico);
  });

  test("deve retornar erro 409 ao tentar cadastrar e-mail duplicado", async ({
    request,
  }) => {
    const emailUnico = `apitest${Date.now()}@email.com`;

    // Primeiro cadastro - deve funcionar
    const primeiraResposta = await request.post(`${BASE_URL}/auth/signup`, {
      data: {
        email: emailUnico,
        password: "Senha@1234",
      },
    });
    expect(primeiraResposta.status()).toBe(200);

    // Segundo cadastro com o mesmo e-mail - deve retornar 409
    const segundaResposta = await request.post(`${BASE_URL}/auth/signup`, {
      data: {
        email: emailUnico,
        password: "Senha@1234",
      },
    });

    expect(segundaResposta.status()).toBe(409);
  });
});

test.describe("API - /auth/signin", () => {
  test("deve fazer login com sucesso usando credenciais corretas", async ({
    request,
  }) => {
    const emailUnico = `apitest${Date.now()}@email.com`;
    const senha = "Senha@1234";

    // Cria o usuário primeiro
    await request.post(`${BASE_URL}/auth/signup`, {
      data: { email: emailUnico, password: senha },
    });

    // Tenta logar com as credenciais corretas
    const response = await request.post(`${BASE_URL}/auth/signin`, {
      data: { email: emailUnico, password: senha },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.email).toBe(emailUnico);
  });

  test("deve retornar 401 e mensagem 'Credenciais inválidas' com senha errada", async ({
    request,
  }) => {
    const emailUnico = `apitest${Date.now()}@email.com`;

    // Cria o usuário com uma senha conhecida
    await request.post(`${BASE_URL}/auth/signup`, {
      data: { email: emailUnico, password: "Senha@1234" },
    });

    // Tenta logar com senha errada
    const response = await request.post(`${BASE_URL}/auth/signin`, {
      data: { email: emailUnico, password: "SenhaErrada@123" },
    });

    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.message).toBe("Credenciais inválidas");
  });
});
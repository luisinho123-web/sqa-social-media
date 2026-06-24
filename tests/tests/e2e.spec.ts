import { test, expect } from "@playwright/test";

/**
 * simulam um usuário real navegando no sistema através do navegador.
 */

test.describe("Fluxo de Cadastro e Login", () => {
  test("usuário deve conseguir se cadastrar e ser redirecionado para a página principal", async ({
    page,
  }) => {
    // Gera um e-mail único para evitar conflito com "e-mail já cadastrado"
    const emailUnico = `usuario${Date.now()}@email.com`;

    await page.goto("/signup");

    // Preenche o formulário de cadastro
    await page.getByPlaceholder("seu@email.com").fill(emailUnico);

    const camposSenha = page.getByPlaceholder("••••••••");
    await camposSenha.nth(0).fill("Senha@1234");
    await camposSenha.nth(1).fill("Senha@1234");

    // Submete o formulário
    await page.getByRole("main").getByRole("button", { name: "Criar Conta" }).click();

    // Espera o redirecionamento para a página principal
    await expect(page).toHaveURL("/");

    // Confirma que o usuário está autenticado (Header mostra "Sair")
    await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
  });

  test("usuário deve conseguir fazer login e curtir um post", async ({
    page,
  }) => {
    // Primeiro cria um usuário via cadastro para garantir que existe
    const emailUnico = `usuario${Date.now()}@email.com`;
    const senha = "Senha@1234";

    await page.goto("/signup");
    await page.getByPlaceholder("seu@email.com").fill(emailUnico);
    const camposSenhaSignup = page.getByPlaceholder("••••••••");
    await camposSenhaSignup.nth(0).fill(senha);
    await camposSenhaSignup.nth(1).fill(senha);
    await page.getByRole("main").getByRole("button", { name: "Criar Conta" }).click();
    await expect(page).toHaveURL("/");

    // Faz logout para testar o fluxo de login isoladamente
    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();

    // Agora faz login com o usuário recém-criado
    await page.goto("/signin");
    await page.getByPlaceholder("seu@email.com").fill(emailUnico);
    await page.getByPlaceholder("••••••••").fill(senha);
    await page.getByRole("main").getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();

    // Espera os posts carregarem e curte o primeiro post
    const primeiroPost = page.getByRole("listitem").first();
    await expect(primeiroPost).toBeVisible({ timeout: 10000 });

    const botaoCurtir = primeiroPost.getByRole("button");
    await botaoCurtir.click();

    // Confirma feedback visual de "curtido"
    await expect(botaoCurtir).toContainText("Curtido");
  });
});

test.describe("Fluxo de curtida sem autenticação", () => {
  test("usuário deslogado deve ver alert ao tentar curtir um post", async ({
    page,
  }) => {
    await page.goto("/");

    // Confirma que está deslogado
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();

    // Espera os posts carregarem
    const primeiroPost = page.getByRole("listitem").first();
    await expect(primeiroPost).toBeVisible({ timeout: 10000 });

    // Prepara para capturar o alert nativo do navegador
    let mensagemAlert = "";
    page.once("dialog", async (dialog) => {
      mensagemAlert = dialog.message();
      await dialog.accept();
    });

    const botaoCurtir = primeiroPost.getByRole("button");
    await botaoCurtir.click();

    // Aguarda o alert disparar e verifica a mensagem
    await page.waitForTimeout(500);
    expect(mensagemAlert).toBe(
      "Você precisa estar autenticado para curtir posts!"
    );
  });
});
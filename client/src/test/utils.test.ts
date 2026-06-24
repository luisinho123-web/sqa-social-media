/**
 * Testes Unitários - Funções Puras (Jest)
 *
 * Cobre: isEmailValid, isPasswordValid, getPasswordValidationMessage
 *
 * BUGS ENCONTRADOS:
 *   - isPasswordValid() usa `password.length <= 8` (deveria ser `< 8`).
 *     Uma senha com exatamente 8 caracteres válidos é REJEITADA incorretamente.
 */

import { isEmailValid } from "@/utils/email";
import {
  isPasswordValid,
  getPasswordValidationMessage,
} from "@/utils/password";

// TESTE UNITÁRIO 1 - isEmailValid 


describe("isEmailValid - Validação de e-mail", () => {
  it("✅ [SUCESSO] deve aceitar e-mail bem formado", () => {
    expect(isEmailValid("usuario@dominio.com")).toBe(true);
  });

  it("✅ [SUCESSO] deve aceitar e-mail com subdomínio", () => {
    expect(isEmailValid("user@mail.empresa.com")).toBe(true);
  });

  it("✅ [SUCESSO] deve rejeitar string sem @", () => {
    expect(isEmailValid("emailsemarroba.com")).toBe(false);
  });

  it("✅ [SUCESSO] deve rejeitar string vazia", () => {
    expect(isEmailValid("")).toBe(false);
  });

  it("✅ [SUCESSO] deve rejeitar e-mail sem domínio após @", () => {
    expect(isEmailValid("usuario@")).toBe(false);
  });

  it("✅ [SUCESSO] deve rejeitar e-mail sem parte local antes de @", () => {
    expect(isEmailValid("@dominio.com")).toBe(false);
  });
});


// TESTE UNITÁRIO 2 - isPasswordValid (funções puras)


describe("isPasswordValid - Validação de senha", () => {
  it("✅ [SUCESSO] deve aceitar senha com todos os critérios", () => {
    expect(isPasswordValid("Senha@123")).toBe(true);
  });

  it("✅ [SUCESSO] deve rejeitar senha sem letra maiúscula", () => {
    expect(isPasswordValid("senha@123")).toBe(false);
  });

  it("✅ [SUCESSO] deve rejeitar senha sem letra minúscula", () => {
    expect(isPasswordValid("SENHA@123")).toBe(false);
  });

  it("✅ [SUCESSO] deve rejeitar senha sem número", () => {
    expect(isPasswordValid("Senha@abc")).toBe(false);
  });

  it("✅ [SUCESSO] deve rejeitar senha sem caractere especial", () => {
    expect(isPasswordValid("Senha1234")).toBe(false);
  });

  it("✅ [SUCESSO] deve rejeitar senha com menos de 8 caracteres", () => {
    expect(isPasswordValid("Se@1")).toBe(false);
  });

  /**
   * 🐛 TESTE DE BUG: isPasswordValid rejeita senha com exatamente 8 caracteres
   *
   * O requisito diz: "mínimo 8 caracteres" (ou seja, >= 8 é válido).
   * O código usa: `password.length <= 8` que rejeita length == 8 também.
   *
   * Trecho bugado em password.ts:
   *   if (!password || password.length <= 8) { return false; }
   *
   * Correção esperada:
   *   if (!password || password.length < 8) { return false; }
   */
  it("🐛 [BUG] deve aceitar senha com exatamente 8 caracteres válidos — mas REJEITA", () => {
    // "Senh@123" tem exatamente 8 caracteres com todos os critérios atendidos.
    // Este teste VAI FALHAR porque o código usa <= 8 ao invés de < 8.
    expect(isPasswordValid("Senh@123")).toBe(true);
  });

  it("✅ [SUCESSO] getPasswordValidationMessage retorna string vazia para senha válida", () => {
    expect(getPasswordValidationMessage("Senha@123")).toBe("");
  });

  it("✅ [SUCESSO] getPasswordValidationMessage menciona mínimo de 8 caracteres para senha curta", () => {
    const msg = getPasswordValidationMessage("Se@1");
    expect(msg).toContain("8 caracteres");
  });
});

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

const mockPush = jest.fn();
const mockLogin = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    isAuthenticated: false,
    logout: jest.fn(),
    login: mockLogin,
  }),
}));

jest.mock("@/service/auth/auth", () => ({
  authService: {
    signIn: jest.fn(),
    signUp: jest.fn(),
  },
}));

// Mock do Header para evitar interferência
jest.mock("@/components/Header", () => ({
  __esModule: true,
  default: () => <div>Header</div>,
}));

import { authService } from "@/service/auth/auth";
import SignIn from "@/app/signin/page";
import SignUp from "@/app/signup/page";

beforeEach(() => {
  mockPush.mockClear();
  mockLogin.mockClear();
  (authService.signIn as jest.Mock).mockClear();
  (authService.signUp as jest.Mock).mockClear();
});


// TESTE DE INTEGRAÇÃO 1 - Tela de Login (SignIn)


describe("Tela de Login - Integração", () => {
  it("✅ [SUCESSO] deve exibir campos de email e senha", () => {
    render(<SignIn />);
    expect(screen.getByPlaceholderText("seu@email.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
  });

  it("✅ [SUCESSO] deve exibir erro quando email está vazio", async () => {
    render(<SignIn />);
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));
    await waitFor(() => {
      expect(screen.getByText("Email é obrigatório")).toBeInTheDocument();
    });
  });

  it("✅ [SUCESSO] login bem-sucedido deve redirecionar para '/'", async () => {
    (authService.signIn as jest.Mock).mockResolvedValue({
      id: 1,
      email: "usuario@email.com",
    });

    render(<SignIn />);

    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
      target: { value: "usuario@email.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "Senha@123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("✅ [SUCESSO] deve exibir mensagem de erro quando login falha", async () => {
    const { AxiosError } = await import("axios");
    const axiosError = new AxiosError("Request failed");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axiosError as any).response = {
      data: { message: "Credenciais inválidas" },
    };
    (authService.signIn as jest.Mock).mockRejectedValue(axiosError);

    render(<SignIn />);

    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
      target: { value: "usuario@email.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "Senha@123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText("Credenciais inválidas")).toBeInTheDocument();
    });
  });
});


// TESTE DE INTEGRAÇÃO 2 - Tela de Cadastro (SignUp)


describe("Tela de Cadastro - Integração", () => {
  it("✅ [SUCESSO] deve exibir campos de email e senha", () => {
    render(<SignUp />);
    expect(screen.getByPlaceholderText("seu@email.com")).toBeInTheDocument();
    const passwordFields = screen.getAllByPlaceholderText("••••••••");
    expect(passwordFields).toHaveLength(2);
  });

  it("✅ [SUCESSO] cadastro bem-sucedido deve redirecionar para '/'", async () => {
    (authService.signUp as jest.Mock).mockResolvedValue({
      id: 2,
      email: "novo@email.com",
    });

    render(<SignUp />);

    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
      target: { value: "novo@email.com" },
    });

    const [senhaField, confirmarField] = screen.getAllByPlaceholderText("••••••••");
    fireEvent.change(senhaField, { target: { value: "Senha@1234" } });
    fireEvent.change(confirmarField, { target: { value: "Senha@1234" } });

    fireEvent.click(screen.getByRole("button", { name: /criar conta/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });
});
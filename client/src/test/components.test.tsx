/**
 * Testes Unitários - Componentes React (Jest + Testing Library)
 *
 * Cobre: Header, PostCard
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";


// Mocks necessários para componentes que usam Next.js


const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import PostCard from "@/components/PostCard";


// TESTE UNITÁRIO DE COMPONENTE 1 - Header


describe("Header - Componente", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("✅ [SUCESSO] deve exibir o título 'SQA Social Media'", () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      logout: jest.fn(),
    });

    render(<Header />);

    expect(screen.getByText("SQA Social Media")).toBeInTheDocument();
  });

  it("✅ [SUCESSO] deve exibir botões 'Entrar' e 'Criar Conta' para usuário deslogado", () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      logout: jest.fn(),
    });

    render(<Header />);

    expect(screen.getByText("Entrar")).toBeInTheDocument();
    expect(screen.getByText("Criar Conta")).toBeInTheDocument();
  });

  it("✅ [SUCESSO] deve exibir botões 'Posts Curtidos' e 'Sair' para usuário logado", () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      logout: jest.fn(),
    });

    render(<Header />);

    expect(screen.getByText("Posts Curtidos")).toBeInTheDocument();
    expect(screen.getByText("Sair")).toBeInTheDocument();
  });

  it("✅ [SUCESSO] clicar no título deve redirecionar para '/'", () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      logout: jest.fn(),
    });

    render(<Header />);
    fireEvent.click(screen.getByText("SQA Social Media"));

    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("✅ [SUCESSO] clicar em 'Posts Curtidos' deve redirecionar para '/auth/liked'", () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      logout: jest.fn(),
    });

    render(<Header />);
    fireEvent.click(screen.getByText("Posts Curtidos"));

    expect(mockPush).toHaveBeenCalledWith("/auth/liked");
  });
});


// TESTE UNITÁRIO DE COMPONENTE 2 - PostCard


describe("PostCard - Componente", () => {
  const mockPost = {
    id: 1,
    title: "Título do Post",
    body: "Conteúdo do post de teste",
    liked: false,
    likes: 10,
    dislikes: 2,
};

  it("✅ [SUCESSO] deve exibir título e corpo do post", () => {
    render(
      <PostCard
        post={mockPost}
        isAuthenticated={false}
        onLike={jest.fn()}
      />
    );

    expect(screen.getByText("Título do Post")).toBeInTheDocument();
    expect(screen.getByText("Conteúdo do post de teste")).toBeInTheDocument();
  });

  it("✅ [SUCESSO] deve exibir o botão 'Curtir'", () => {
    render(
      <PostCard
        post={mockPost}
        isAuthenticated={false}
        onLike={jest.fn()}
      />
    );

    expect(screen.getByText("Curtir")).toBeInTheDocument();
  });

  it("✅ [SUCESSO] usuário deslogado que clica em Curtir deve ver alert de autenticação", () => {
    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});

    render(
      <PostCard
        post={mockPost}
        isAuthenticated={false}
        onLike={jest.fn()}
      />
    );

    fireEvent.click(screen.getByText("Curtir"));

    expect(alertMock).toHaveBeenCalledWith(
      "Você precisa estar autenticado para curtir posts!"
    );

    alertMock.mockRestore();
  });

  it("✅ [SUCESSO] post já curtido deve exibir 'Curtido'", () => {
    render(
      <PostCard
        post={{ ...mockPost, liked: true }}
        isAuthenticated={true}
        onLike={jest.fn()}
      />
    );

    expect(screen.getByText("Curtido")).toBeInTheDocument();
  });

  it("✅ [SUCESSO] deve exibir a quantidade de curtidas e descurtidas vindas da API", () => {
    render(
      <PostCard
        post={{ ...mockPost, likes: 192, dislikes: 25 }}
        isAuthenticated={false}
        onLike={jest.fn()}
      />
    );

    expect(screen.getByText("👍 192 curtidas")).toBeInTheDocument();
    expect(screen.getByText("👎 25 descurtidas")).toBeInTheDocument();
  });

  it("✅ [SUCESSO] deve exibir zero curtidas e descurtidas quando o post não tiver reações", () => {
    render(
      <PostCard
        post={{ ...mockPost, likes: 0, dislikes: 0 }}
        isAuthenticated={false}
        onLike={jest.fn()}
      />
    );

    expect(screen.getByText("👍 0 curtidas")).toBeInTheDocument();
    expect(screen.getByText("👎 0 descurtidas")).toBeInTheDocument();
  });
});

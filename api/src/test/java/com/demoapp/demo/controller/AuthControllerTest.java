package com.demoapp.demo.controller;

import com.demoapp.demo.dto.UserDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testes de integração para AuthController.
 *
 * BUGS ENCONTRADOS:
 *   - /auth/signup retorna mensagem "E-mail já está em uso" mas o requisito
 *     especifica "E-mail já cadastrado".
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
@DisplayName("AuthController - Testes de Integração")
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    
    // TESTES DE SUCESSO - /auth/signup
    

    @Test
    @DisplayName("✅ [SUCESSO] Cadastro com dados válidos deve retornar HTTP 200")
    void testSignup_dadosValidos() throws Exception {
        UserDTO dto = new UserDTO();
        dto.setEmail("novo@email.com");
        dto.setPassword("Senha@123");

        mockMvc.perform(post("/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("novo@email.com"));
    }

    @Test
    @DisplayName("✅ [SUCESSO] Cadastro com senha inválida deve retornar HTTP 422")
    void testSignup_senhaInvalida() throws Exception {
        UserDTO dto = new UserDTO();
        dto.setEmail("usuario@email.com");
        dto.setPassword("fraca");

        mockMvc.perform(post("/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.message").value("Senha inválida"));
    }

    
    // TESTES DE SUCESSO - /auth/signin
    

    @Test
    @DisplayName("✅ [SUCESSO] Login com credenciais incorretas deve retornar 'Credenciais inválidas'")
    void testSignin_credenciaisIncorretas() throws Exception {
        UserDTO dto = new UserDTO();
        dto.setEmail("naoexiste@email.com");
        dto.setPassword("Senha@123");

        mockMvc.perform(post("/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.message").value("Credenciais inválidas"));
    }

    @Test
    @DisplayName("✅ [SUCESSO] Login com dados válidos após cadastro deve retornar HTTP 200")
    void testSignin_credenciaisCorretas() throws Exception {
        // Primeiro, cadastra o usuário
        UserDTO dto = new UserDTO();
        dto.setEmail("login@email.com");
        dto.setPassword("Senha@123");

        mockMvc.perform(post("/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
            .andExpect(status().isOk());

        // Agora tenta fazer login
        mockMvc.perform(post("/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("login@email.com"));
    }

    
    // TESTE DE BUG - mensagem de e-mail duplicado
    

    @Test
    @DisplayName("🐛 [BUG] Cadastro com e-mail duplicado deve retornar 'E-mail já cadastrado' — mas retorna outra mensagem")
    void testSignupBug_emailDuplicadoMensagemErrada() throws Exception {
        /*
         * BUG: O requisito especifica que a mensagem deve ser "E-mail já cadastrado".
         * O código retorna "E-mail já está em uso".
         * Este teste VAI FALHAR propositalmente para provar o bug.
         *
         * Trecho bugado em AuthController.java:
         *   return ResponseEntity.status(409)
         *     .body(new ErrorResponse("E-mail já está em uso", 409));
         *
         * Correção esperada:
         *   new ErrorResponse("E-mail já cadastrado", 409)
         */
        UserDTO dto = new UserDTO();
        dto.setEmail("duplicado@email.com");
        dto.setPassword("Senha@123");

        // Primeiro cadastro (deve funcionar)
        mockMvc.perform(post("/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
            .andExpect(status().isOk());

        // Segundo cadastro com mesmo e-mail — deve retornar "E-mail já cadastrado"
        mockMvc.perform(post("/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.message").value("E-mail já cadastrado")); // BUG: retorna "E-mail já está em uso"
    }
}

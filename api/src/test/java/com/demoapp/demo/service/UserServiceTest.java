package com.demoapp.demo.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.demoapp.demo.repository.UserRepository;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Testes unitários para UserService.
 *
 * BUGS ENCONTRADOS:
 *   - isEmailValid() aceita e-mails inválidos como "abc@" ou "@abc" (apenas verifica presença de "@")
 *   - isPasswordValid() está correto no backend (usa regex robusto)
 */
@DisplayName("UserService - Testes Unitários")
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    
    // TESTES DE SUCESSO - isPasswordValid
    

    @Test
    @DisplayName("✅ [SUCESSO] Senha válida com todos os critérios deve ser aceita")
    void testPasswordValid_senhaCompleta() {
        // Senha com: maiúscula, minúscula, número, caractere especial, 8+ chars
        assertTrue(userService.isPasswordValid("Senha@123"),
            "Senha 'Senha@123' deve ser válida");
    }

    @Test
    @DisplayName("✅ [SUCESSO] Senha com exatamente 8 caracteres válidos deve ser aceita")
    void testPasswordValid_oitoCaracteres() {
        // Exatamente 8 caracteres: S, e, n, h, a, @, 1, 2
        assertTrue(userService.isPasswordValid("Senha@12"),
            "Senha com exatamente 8 caracteres válidos deve ser aceita");
    }

    @Test
    @DisplayName("✅ [SUCESSO] Senha sem letra maiúscula deve ser inválida")
    void testPasswordInvalid_semMaiuscula() {
        assertFalse(userService.isPasswordValid("senha@123"),
            "Senha sem letra maiúscula deve ser inválida");
    }

    @Test
    @DisplayName("✅ [SUCESSO] Senha sem caractere especial deve ser inválida")
    void testPasswordInvalid_semEspecial() {
        assertFalse(userService.isPasswordValid("Senha1234"),
            "Senha sem caractere especial deve ser inválida");
    }

    @Test
    @DisplayName("✅ [SUCESSO] Senha com menos de 8 caracteres deve ser inválida")
    void testPasswordInvalid_curtaDemais() {
        assertFalse(userService.isPasswordValid("Se@1"),
            "Senha com menos de 8 caracteres deve ser inválida");
    }

    
    // TESTES DE SUCESSO - isEmailValid
    

    @Test
    @DisplayName("✅ [SUCESSO] E-mail bem formado deve ser aceito")
    void testEmailValid_emailCompleto() {
        assertTrue(userService.isEmailValid("usuario@dominio.com"),
            "E-mail 'usuario@dominio.com' deve ser válido");
    }

    @Test
    @DisplayName("✅ [SUCESSO] E-mail nulo deve ser inválido")
    void testEmailValid_nulo() {
        assertFalse(userService.isEmailValid(null),
            "E-mail nulo deve ser inválido");
    }

    @Test
    @DisplayName("✅ [SUCESSO] String vazia deve ser inválida como e-mail")
    void testEmailValid_stringVazia() {
        assertFalse(userService.isEmailValid(""),
            "String vazia não deve ser um e-mail válido");
    }

    
    // TESTE DE BUG - isEmailValid aceita e-mails malformados
    

    @Test
    @DisplayName("🐛 [BUG] isEmailValid() aceita 'abc@' como e-mail válido — deveria rejeitar")
    void testEmailBug_semDominio() {
        assertFalse(userService.isEmailValid("abc@"),
            "BUG: 'abc@' não deve ser considerado um e-mail válido, mas isEmailValid retorna true");
    }
}

package com.tienda.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http.csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(exchanges -> exchanges
                        .pathMatchers(
                                // Autenticación
                                "/usuarios/crear",
                                "/usuarios/login",
                                "/api/usuarios/crear",
                                "/api/usuarios/login",

                                // Catálogo público
                                "/videojuegos/**",
                                "/api/videojuegos/**",

                                // Si tienes búsqueda o categorías
                                "/buscar/**",
                                "/categorias/**",
                                "/api/buscar/**",
                                "/api/categorias/**"
                        ).permitAll()

                        // Todo lo demás requiere JWT
                        .anyExchange().authenticated()
                )
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable);

        return http.build();
    }
}

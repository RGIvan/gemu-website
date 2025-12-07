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
                                "/usuarios/crear",
                                "/usuarios/login",
                                "/videojuegos/**",
                                "/pedidos/**",
                                "/facturas/**",
                                "/detalles/**",
                                "/buscar/**",
                                "/categorias/**",
                                // Con /api
                                "/api/usuarios/crear",
                                "/api/usuarios/login",
                                "/api/videojuegos/**",
                                "/api/pedidos/**",
                                "/api/facturas/**",
                                "/api/detalles/**",
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

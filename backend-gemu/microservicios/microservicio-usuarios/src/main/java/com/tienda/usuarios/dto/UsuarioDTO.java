package com.tienda.usuarios.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioDTO {
    private Long id;
    private String nombre;
    private String apellidos;
    private String correoElectronico;
    private String telefono;
    private String direccion;
    private String username;
    private String password;
}
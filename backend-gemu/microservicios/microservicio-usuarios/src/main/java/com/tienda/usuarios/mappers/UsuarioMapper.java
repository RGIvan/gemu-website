package com.tienda.usuarios.mappers;

import com.tienda.comun.models.Usuario;
import com.tienda.usuarios.dto.UsuarioDTO;

public class UsuarioMapper {

    public static UsuarioDTO toDTO(Usuario usuario) {
        return new UsuarioDTO(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getApellidos(),
                usuario.getCorreoElectronico(),
                usuario.getDireccion(),
                usuario.getTelefono(),
                usuario.getUsername(),
                usuario.getPassword()
        );
    }

    public static Usuario toEntity(UsuarioDTO dto) {
        Usuario usuario = new Usuario();
        usuario.setId(dto.getId());
        usuario.setNombre(dto.getNombre());
        usuario.setApellidos(dto.getApellidos());
        usuario.setCorreoElectronico(dto.getCorreoElectronico());
        usuario.setDireccion(dto.getDireccion());
        usuario.setTelefono(dto.getTelefono());
        usuario.setUsername(dto.getUsername());
        usuario.setPassword(dto.getPassword());

        return usuario;
    }
}
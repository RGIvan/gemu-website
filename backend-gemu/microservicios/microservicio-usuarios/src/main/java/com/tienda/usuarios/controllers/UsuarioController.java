package com.tienda.usuarios.controllers;

import com.tienda.comun.models.Usuario;
import com.tienda.usuarios.dto.LoginRequest;
import com.tienda.usuarios.dto.LoginResponse;
import com.tienda.usuarios.dto.NombreUsuarioDTO;
import com.tienda.usuarios.dto.UsuarioDTO;
import com.tienda.usuarios.mappers.UsuarioMapper;
import com.tienda.usuarios.services.UsuarioServicio;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioServicio usuarioServicio;

    public UsuarioController(UsuarioServicio usuarioServicio) {
        this.usuarioServicio = usuarioServicio;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // lógica de autenticación
        String token = "JWT_GENERADO";
        return ResponseEntity.ok(new LoginResponse(token));
    }

    @GetMapping
    public List<UsuarioDTO> listarUsuarios() {
        List<Usuario> usuarios = usuarioServicio.listarUsuarios();
        return usuarios.stream()
                .map(UsuarioMapper::toDTO)
                .collect(Collectors.toList());
    }

    @PostMapping("/crear")
    public UsuarioDTO crearUsuario(@RequestBody UsuarioDTO usuarioDTO) {
        Usuario usuario = UsuarioMapper.toEntity(usuarioDTO);
        Usuario nuevoUsuario = usuarioServicio.crearUsuario(usuario);
        return UsuarioMapper.toDTO(nuevoUsuario);
    }

    @PutMapping("/actualizar/{id}")
    public UsuarioDTO actualizarUsuario(@PathVariable Long id, @RequestBody UsuarioDTO usuarioDTO){
        Usuario usuarioActualizado = usuarioServicio.actualizarUsuario(id, UsuarioMapper.toEntity(usuarioDTO));
        return UsuarioMapper.toDTO(usuarioActualizado);
    }

    @DeleteMapping("/eliminar/{id}")
    public void eliminarUsuario(@PathVariable Long id) {
        usuarioServicio.eliminarUsuario(id);
    }

    @PostMapping("/buscar")
    public NombreUsuarioDTO buscarUsuarioPorNombre(@RequestBody NombreUsuarioDTO dto) {
        System.out.println("Buscando por nombre: " + dto.getNombre());
        Usuario usuario = usuarioServicio.buscarUsuarioPorNombre(dto.getNombre());
        return new NombreUsuarioDTO(usuario.getNombre());
    }

    @GetMapping("/{id}")
    public UsuarioDTO obtenerUsuarioPorId(@PathVariable Long id) {
        Usuario usuario = usuarioServicio.obtenerUsuarioPorId(id);
        return UsuarioMapper.toDTO(usuario);
    }
}
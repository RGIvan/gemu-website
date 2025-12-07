package com.tienda.facturas.controllers;

import com.tienda.facturas.dto.FacturaDTO;
import com.tienda.facturas.mappers.FacturaMapper;
import com.tienda.facturas.services.FacturaServicio;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/facturas")
public class FacturaController {

    private final FacturaServicio facturaServicio;

    public FacturaController(FacturaServicio facturaServicio) {
        this.facturaServicio = facturaServicio;
    }

    @GetMapping
    public List<FacturaDTO> listarFacturas() {
        return facturaServicio.listarFacturas();
    }

    @PostMapping("/crear")
    public FacturaDTO crearFactura(@RequestBody FacturaDTO facturaDTO) {
        return facturaServicio.crearFactura(facturaDTO);
    }

    @PutMapping("/actualizar/{id}")
    public FacturaDTO actualizarFactura(@PathVariable Long id, @RequestBody FacturaDTO facturaDTO) {
        return facturaServicio.actualizarFactura(id, facturaDTO);
    }

    @DeleteMapping("/eliminar/{id}")
    public void eliminarFactura(@PathVariable Long id) {
        facturaServicio.eliminarFactura(id);
    }

    @GetMapping("/{id}")
    public FacturaDTO obtenerFacturaPorId(@PathVariable Long id) {
        return facturaServicio.obtenerFacturaPorId(id);
    }

    @GetMapping("/pedido/{pedidoId}")
    public List<FacturaDTO> obtenerFacturasPorPedido(@PathVariable Long pedidoId) {
        return facturaServicio.obtenerFacturasPorPedido(pedidoId);
    }
}
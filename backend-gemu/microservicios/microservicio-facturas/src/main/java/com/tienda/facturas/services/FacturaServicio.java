package com.tienda.facturas.services;

import com.tienda.comun.models.Pedido;
import com.tienda.comun.repositories.PedidoRepositorio;
import com.tienda.comun.repositories.UsuarioRepositorio;
import com.tienda.facturas.models.Factura;
import com.tienda.facturas.repositories.FacturaRepositorio;
import com.tienda.facturas.dto.FacturaDTO;
import com.tienda.facturas.mappers.FacturaMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FacturaServicio {

    @Autowired
    private FacturaRepositorio facturaRepositorio;

    @Autowired
    private UsuarioRepositorio usuarioRepositorio;

    @Autowired
    private PedidoRepositorio pedidoRepositorio;

    public List<FacturaDTO> listarFacturas() {
        return facturaRepositorio.findAll().stream()
                .map(FacturaMapper::toDTO)
                .collect(Collectors.toList());
    }

    public FacturaDTO crearFactura(FacturaDTO facturaDTO) {
        Factura factura = new Factura();

        Pedido pedido = pedidoRepositorio.findById(facturaDTO.getPedidoId())
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        factura.setPedido(pedido);
        factura.setNumeroFactura(generarNumeroFactura());
        factura.setFechaEmision(LocalDateTime.now());
        factura.setEstado("EMITIDA");

        // Datos del cliente (enviados desde frontend)
        factura.setClienteNombre(facturaDTO.getClienteNombre());
        factura.setClienteEmail(facturaDTO.getClienteEmail());
        factura.setClienteTelefono(facturaDTO.getClienteTelefono());

        // Datos del pedido
        factura.setClienteDireccion(pedido.getDireccionEnvio());
        factura.setTotalSinIva(pedido.getTotalSinIva());
        factura.setIvaTotal(pedido.getIvaTotal());
        factura.setTotalConIva(pedido.getTotalConIva());

        Factura facturaGuardada = facturaRepositorio.save(factura);
        return FacturaMapper.toDTO(facturaGuardada);
    }

    public FacturaDTO actualizarFactura(Long id, FacturaDTO facturaDTO) {
        Factura facturaExistente = facturaRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Factura no encontrada"));

        Pedido pedido = pedidoRepositorio.findById(facturaDTO.getPedidoId())
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        facturaExistente.setPedido(pedido);
        facturaExistente.setNumeroFactura(facturaDTO.getNumeroFactura());
        facturaExistente.setEstado(facturaDTO.getEstado());
        facturaExistente.setFechaEmision(facturaDTO.getFechaEmision());

        Factura facturaActualizada = facturaRepositorio.save(facturaExistente);
        return FacturaMapper.toDTO(facturaActualizada);
    }

    public void eliminarFactura(Long id) {
        Factura factura = facturaRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Factura no encontrada"));
        facturaRepositorio.delete(factura);
    }

    public FacturaDTO obtenerFacturaPorId(Long id) {
        Factura factura = facturaRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Factura no encontrada"));
        return FacturaMapper.toDTO(factura);
    }

    public List<FacturaDTO> obtenerFacturasPorPedido(Long pedidoId) {
        return facturaRepositorio.findByPedidoId(pedidoId).stream()
                .map(FacturaMapper::toDTO)
                .collect(Collectors.toList());
    }

    private String generarNumeroFactura() {
        return "FAC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
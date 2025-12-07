package com.tienda.facturas.mappers;

import com.tienda.facturas.dto.FacturaDTO;
import com.tienda.facturas.models.Factura;

public class FacturaMapper {
    public static FacturaDTO toDTO(Factura factura) {
        FacturaDTO dto = new FacturaDTO();
        dto.setId(factura.getId());
        dto.setPedidoId(factura.getPedido().getId());
        dto.setNumeroFactura(factura.getNumeroFactura());
        dto.setEstado(factura.getEstado());
        dto.setFechaEmision(factura.getFechaEmision());

        // Nuevos campos
        dto.setClienteNombre(factura.getClienteNombre());
        dto.setClienteEmail(factura.getClienteEmail());
        dto.setClienteDireccion(factura.getClienteDireccion());
        dto.setClienteTelefono(factura.getClienteTelefono());
        dto.setTotalSinIva(factura.getTotalSinIva());
        dto.setIvaTotal(factura.getIvaTotal());
        dto.setTotalConIva(factura.getTotalConIva());

        return dto;
    }
}
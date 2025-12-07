package com.tienda.facturas.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class FacturaDTO {
    private Long id;
    private Long pedidoId;
    private String numeroFactura;
    private String estado;
    private LocalDateTime fechaEmision;

    // Nuevos campos
    private String clienteNombre;
    private String clienteEmail;
    private String clienteDireccion;
    private String clienteTelefono;
    private BigDecimal totalSinIva;
    private BigDecimal ivaTotal;
    private BigDecimal totalConIva;
}
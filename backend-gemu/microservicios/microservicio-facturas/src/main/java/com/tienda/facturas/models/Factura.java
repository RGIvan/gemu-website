package com.tienda.facturas.models;

import com.tienda.comun.models.Pedido;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "facturas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Factura {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fecha_emision")
    @NotNull
    private LocalDateTime fechaEmision;

    @Column(name = "numero_factura")
    @NotNull
    private String numeroFactura;

    @Column(name = "estado")
    @NotNull
    private String estado = "GENERADA";

    @Column(name = "cliente_nombre")
    private String clienteNombre;

    @Column(name = "cliente_email")
    private String clienteEmail;

    @Column(name = "cliente_direccion")
    private String clienteDireccion;

    @Column(name = "cliente_telefono")
    private String clienteTelefono;

    @Column(name = "total_sin_iva")
    private BigDecimal totalSinIva;

    @Column(name = "iva_total")
    private BigDecimal ivaTotal;

    @Column(name = "total_con_iva")
    private BigDecimal totalConIva;

    @OneToOne
    @JoinColumn(name = "pedido_id", nullable = false, unique = true)
    private Pedido pedido;
}
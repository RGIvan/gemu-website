"use client";

import { useState, useTransition } from "react";
import { Session } from "next-auth";
import { EnrichedProduct } from "@/types/types";
import { createOrder } from "@/app/checkout/action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CheckoutFormProps {
  cartItems: EnrichedProduct[];
  total: number;
  session: Session;
}

const CheckoutForm = ({ cartItems, total, session }: CheckoutFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    nombre: session.user.name || "",
    email: session.user.email || "",
    telefono: session.user.phone || "",
    direccion: "",
    ciudad: "",
    codigoPostal: "",
    metodoPago: "tarjeta",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.direccion || !formData.ciudad || !formData.codigoPostal) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createOrder({
          userId: session.user._id,
          cartItems,
          total,
          shippingData: formData,
        });

        if (result.success) {
          toast.success("¡Pedido realizado con éxito!");
          router.push(`/checkout/success?orderId=${result.orderId}`);
        } else {
          toast.error(result.error || "Error al crear el pedido");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error al procesar el pedido");
      }
    });
  };

  const totalConIVA = total;
  const iva = total * 0.21;
  const totalSinIVA = total - iva;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="mb-4 text-lg font-semibold">Datos de envío</h2>

        <div>
          <label className="block mb-1 text-sm">Nombre completo</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="w-full h-10 px-3 bg-[#0A0A0A] border border-[#2E2E2E] rounded-md"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full h-10 px-3 bg-[#0A0A0A] border border-[#2E2E2E] rounded-md"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">Teléfono</label>
          <input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className="w-full h-10 px-3 bg-[#0A0A0A] border border-[#2E2E2E] rounded-md"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">Dirección</label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            className="w-full h-10 px-3 bg-[#0A0A0A] border border-[#2E2E2E] rounded-md"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm">Ciudad</label>
            <input
              type="text"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              className="w-full h-10 px-3 bg-[#0A0A0A] border border-[#2E2E2E] rounded-md"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Código Postal</label>
            <input
              type="text"
              name="codigoPostal"
              value={formData.codigoPostal}
              onChange={handleChange}
              className="w-full h-10 px-3 bg-[#0A0A0A] border border-[#2E2E2E] rounded-md"
              required
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 text-sm">Método de pago</label>
          <select
            name="metodoPago"
            value={formData.metodoPago}
            onChange={handleChange}
            className="w-full h-10 px-3 bg-[#0A0A0A] border border-[#2E2E2E] rounded-md"
          >
            <option value="tarjeta">Tarjeta de crédito</option>
            <option value="paypal">PayPal</option>
            <option value="transferencia">Transferencia bancaria</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-12 bg-[#0072F5] text-white font-semibold rounded-md hover:bg-[#0060d3] transition-all disabled:opacity-50"
        >
          {isPending ? "Procesando..." : `Pagar ${totalConIVA.toFixed(2)}€`}
        </button>
      </form>

      {/* Resumen del pedido */}
      <div className="bg-[#0A0A0A] border border-[#2E2E2E] rounded-md p-6">
        <h2 className="mb-4 text-lg font-semibold">Resumen del pedido</h2>

        <div className="mb-6 space-y-4">
          {cartItems.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>{(item.price * item.quantity).toFixed(2)}€</span>
            </div>
          ))}
        </div>

        <div className="border-t border-[#2E2E2E] pt-4 space-y-2">
          <div className="flex justify-between text-sm text-[#A1A1A1]">
            <span>Subtotal (sin IVA)</span>
            <span>{totalSinIVA.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between text-sm text-[#A1A1A1]">
            <span>IVA (21%)</span>
            <span>{iva.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between text-sm text-[#A1A1A1]">
            <span>Envío</span>
            <span>GRATIS</span>
          </div>
          <div className="flex justify-between font-semibold text-lg pt-2 border-t border-[#2E2E2E]">
            <span>Total</span>
            <span>{totalConIVA.toFixed(2)}€</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;

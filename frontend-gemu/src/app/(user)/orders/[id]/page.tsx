import { Products } from "@/components/products/Products";
import { format } from "date-fns";
import { getUserOrders } from "../action";
import { Suspense } from "react";
import ProductSkeleton from "@/components/skeletons/ProductSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { EnrichedOrder } from "@/types/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

export async function generateMetadata() {
  return {
    title: `Order Details | Ecommerce Template`,
  };
}

const OrderDetails = async ({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { items: number };
}) => {
  const items = searchParams.items;

  return (
    <Suspense fallback={<AllOrderSkeleton items={items} />}>
      <OrderProducts id={params.id} />
    </Suspense>
  );
};

const OrderProducts = async ({ id }: { id: string }) => {
  const session = await getServerSession(authOptions);

  // Traer todas las órdenes del usuario
  const orders: EnrichedOrder[] = await getUserOrders(
    session?.user?.id || null
  );

  // Buscar la orden por id
  const order = orders.find((o) => o.id.toString() === id);

  if (!order) return <p>Pedido no encontrado.</p>;

  const totalProducts = order.products.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const productsText = totalProducts === 1 ? "item" : "items";

  return (
    <div className="flex flex-col-reverse flex-wrap justify-between pt-12 sm:flex-row gap-11 sm:gap-8">
      {/* Lista de productos */}
      <div className="grow-999 basis-0">
        <Products
          products={order.products} // EnrichedProduct[] ya es compatible
          extraClassname={"cart-ord-mobile"}
          session={session}
        />
      </div>

      {/* Detalles del pedido */}
      <div className="h-full grow sm:basis-800 sm:sticky top-8">
        <div className="mb-10">
          <h3 className="mb-5 text-lg font-bold">Detalles del pedido</h3>
          <div className="w-full flex justify-between mt-3.5 text-sm text-999">
            <span>Número de pedido</span>
            <span>{order.orderNumber || "N/A"}</span>
          </div>
          <div className="w-full flex justify-between mt-3.5 text-sm text-999">
            <span>Fecha del pedido</span>
            <span>
              {order.fechaPedido
                ? format(order.fechaPedido, "dd LLL yyyy")
                : "N/A"}
            </span>
          </div>
        </div>

        {/* Dirección de envío */}
        <div className="pt-10 mb-10 border-t border-solid border-border-primary">
          <h3 className="mb-5 text-lg font-bold">Dirección de entrega</h3>
          <ul>
            <li className="mt-2.5 text-sm text-999">
              {order.userName || "N/A"}
            </li>
            <li className="mt-2.5 text-sm text-999">
              {order.direccionEnvio || "N/A"}
            </li>
            {order.userEmail && (
              <li className="mt-2.5 text-sm text-999">{order.userEmail}</li>
            )}
          </ul>
        </div>

        {/* Totales */}
        <div className="pt-10 border-t border-solid border-border-primary">
          <h3 className="mb-5 text-lg font-bold">Totales</h3>
          <div className="w-full flex justify-between mt-3.5 text-sm text-999">
            <span>
              {totalProducts} {productsText}
            </span>
            <span>{order.totalConIVA?.toFixed(2) || "0.00"} €</span>
          </div>
          <div className="w-full flex justify-between mt-3.5 text-sm text-999">
            <span>Entrega</span>
            <span>GRATIS</span>
          </div>
          <div className="w-full flex justify-between mt-3.5 text-sm text-999">
            <span>Descuento Total</span>
            <span>0 €</span>
          </div>
          <div className="w-full flex justify-between mt-3.5 text-sm text-999">
            <span>Total</span>
            <span>{order.totalConIVA?.toFixed(2) || "0.00"} €</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton mientras carga
const AllOrderSkeleton = ({ items }: { items: number }) => (
  <div className="flex flex-col-reverse flex-wrap justify-between pt-12 sm:flex-row gap-11 sm:gap-8">
    <div className="grow-999 basis-0">
      <ProductSkeleton
        extraClassname={"cart-ord-mobile"}
        numberProducts={items}
      />
    </div>
    <div className="h-full grow sm:basis-800 sm:sticky top-8">
      <div className="mb-10">
        <h3 className="mb-5 text-lg font-bold">Detalles del pedido</h3>
        <div className="w-full flex justify-between mt-3.5 text-sm text-999">
          <span>Número de pedido</span> <Skeleton className="h-5 w-[120px]" />
        </div>
        <div className="w-full flex justify-between mt-3.5 text-sm text-999">
          <span>Fecha del pedido</span> <Skeleton className="h-5 w-[100px]" />
        </div>
      </div>
    </div>
  </div>
);

export default OrderDetails;

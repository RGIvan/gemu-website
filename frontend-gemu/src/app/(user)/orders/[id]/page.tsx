import { Products } from "@/components/products/Products";
import { format } from "date-fns";
import { getUserOrders } from "../action";
import { Suspense } from "react";
import ProductSkeleton from "@/components/skeletons/ProductSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { EnrichedProduct } from "@/types/types";

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
  // Traer todas las órdenes del usuario y buscar la que corresponde
  const orders = await getUserOrders(null); // Aquí podrías pasar session si quieres
  const enrichedOrders = orders.map((o) => ({
    ...o,
    usuarios: (o as any).usuarios ?? {},
  }));
  const order = enrichedOrders.find((o) => o.id.toString() === id);

  const detailsH3Styles = "text-lg font-bold mb-5";
  const bxInfoStyles = "w-full flex justify-between mt-3.5 text-sm text-999";
  const detailsLiStyles = "mt-2.5 text-sm text-999";

  if (!order) return <p>Order not found.</p>;

  const totalProducts = order.detalle_pedidos.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const productsText = totalProducts === 1 ? "item" : "items";

  const allProducts: EnrichedProduct[] = order.detalle_pedidos.map((item) => {
    const videojuegos = (item as any).videojuegos;
    return {
      productId: item.productId.toString(),
      id: BigInt(item.productId),
      _id: item.productId.toString(),
      name: videojuegos?.nombre || "",
      category: videojuegos?.categoria || "",
      image: item.image || [],
      price: Number(item.price),
      quantity: item.quantity,
      total: Number(item.price) * item.quantity,
    };
  });

  return (
    <div className="flex flex-col-reverse flex-wrap justify-between pt-12 sm:flex-row gap-11 sm:gap-8">
      <div className="grow-999 basis-0">
        <Products products={allProducts} extraClassname={"cart-ord-mobile"} />
      </div>

      <div className="h-full grow sm:basis-800 sm:sticky top-8">
        <div className="mb-10">
          <h3 className={detailsH3Styles}>Order Details</h3>
          <div className={bxInfoStyles}>
            <span>Order Number</span> <span>{order.id.toString()}</span>
          </div>
          <div className={bxInfoStyles}>
            <span>Order Date</span>{" "}
            <span>
              {order.fecha_pedido
                ? format(order.fecha_pedido, "dd LLL yyyy")
                : "N/A"}
            </span>
          </div>
        </div>

        <div className="pt-10 mb-10 border-t border-solid border-border-primary">
          <h3 className={detailsH3Styles}>Delivery Address</h3>
          <ul>
            <li className={detailsLiStyles}>{order.usuarios?.nombre}</li>
            <li className={detailsLiStyles}>{order.usuarios?.direccion}</li>
            {order.usuarios?.telefono && (
              <li className={detailsLiStyles}>+{order.usuarios.telefono}</li>
            )}
            <li className={detailsLiStyles}>
              {order.usuarios?.correo_electronico}
            </li>
          </ul>
        </div>

        <div className="pt-10 border-t border-solid border-border-primary">
          <h3 className={detailsH3Styles}>Totals</h3>
          <div className={bxInfoStyles}>
            <span>
              {totalProducts} {productsText}
            </span>{" "}
            <span>{order.total_con_iva?.toFixed(2)} €</span>
          </div>
          <div className={bxInfoStyles}>
            <span>Delivery</span> <span>FREE</span>
          </div>
          <div className={bxInfoStyles}>
            <span>Total Discount</span> <span>0 €</span>
          </div>
          <div className={bxInfoStyles}>
            <span>Total</span> <span>{order.total_con_iva?.toFixed(2)} €</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AllOrderSkeleton = ({ items }: { items: number }) => {
  const detailsH3Styles = "text-lg font-bold mb-5";
  const bxInfoStyles = "w-full flex justify-between mt-3.5 text-sm text-999";
  const detailsLiStyles = "mt-2.5 text-sm text-999";

  return (
    <div className="flex flex-col-reverse flex-wrap justify-between pt-12 sm:flex-row gap-11 sm:gap-8">
      <div className="grow-999 basis-0">
        <ProductSkeleton
          extraClassname={"cart-ord-mobile"}
          numberProducts={items}
        />
      </div>
      <div className="h-full grow sm:basis-800 sm:sticky top-8">
        <div className="mb-10">
          <h3 className={detailsH3Styles}>Order Details</h3>
          <div className={bxInfoStyles}>
            <span>Order Number</span> <Skeleton className="h-5 w-[120px]" />
          </div>
          <div className={bxInfoStyles}>
            <span>Order Date</span> <Skeleton className="h-5 w-[100px]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;

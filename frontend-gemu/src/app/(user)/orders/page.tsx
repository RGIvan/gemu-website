import Link from "next/link";
import { format } from "date-fns";
import { getUserOrders } from "./action";
import { Suspense } from "react";
import { Loader } from "@/components/common/Loader";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

export async function generateMetadata() {
  return {
    title: `Orders | Ecommerce Template`,
  };
}

// -----------------------------
// Componente Orders
// -----------------------------
const Orders = async ({ session }: { session: Session }) => {
  const orders = await getUserOrders(session);

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[80vh] gap-2 px-4">
        <h2 className="mb-6 text-4xl font-bold">AÚN NO HAY PEDIDOS</h2>
        <p className="mb-4 text-lg">
          Para crear un pedido, añade productos a tu carrito y finaliza la
          compra.
        </p>
        <Link
          href="/"
          className="flex font-medium items-center bg-[#0C0C0C] justify-center text-sm min-w-[160px] max-w-[160px] h-[40px] px-[10px] rounded-md border border-solid border-[#2E2E2E] transition-all hover:bg-[#1F1F1F] hover:border-[#454545]"
        >
          Comenzar
        </Link>
      </div>
    );
  }

  return (
    <div className="grid items-center justify-between pt-12 grid-cols-auto-fill-350 gap-7">
      {orders.map((order, index) => {
        const totalItems = order.products.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        const totalPrice = order.totalConIVA;

        return (
          <div
            key={index}
            className="w-full transition duration-150 border border-solid rounded border-border-primary bg-background-secondary hover:bg-color-secondary"
          >
            <Link
              href={`/orders/${order.id.toString()}?items=${totalItems}`}
              className="flex flex-col justify-between h-full gap-2 px-4 py-5"
            >
              <h4 className="font-semibold">
                {`${
                  order.fechaPedido
                    ? format(order.fechaPedido, "dd LLL yyyy")
                    : "N/A"
                } | ${Number(totalPrice).toFixed(2)}€ | Items: ${totalItems}`}
              </h4>
              <p className="text-sm">ID Pedido: {order.id.toString()}</p>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

// -----------------------------
// Componente principal UserOrders
// -----------------------------
const UserOrders = async () => {
  const session: Session | null = await getServerSession(authOptions);

  if (session?.user?._id) {
    return (
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-[calc(100vh-91px)]">
            <Loader height={30} width={30} />
          </div>
        }
      >
        <Orders session={session} />
      </Suspense>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-91px)] gap-2 px-4">
      <h2 className="mb-6 text-4xl font-bold">AÚN NO HAY PEDIDOS</h2>
      <p className="mb-4 text-lg">
        Debes iniciar sesión para ver los pedidos de tu cuenta.
      </p>
      <Link
        href="/login"
        className="flex font-medium items-center bg-[#0C0C0C] justify-center text-sm min-w-[160px] max-w-[160px] h-[40px] px-[10px] rounded-md border border-solid border-[#2E2E2E] transition-all hover:bg-[#1F1F1F] hover:border-[#454545]"
      >
        Login
      </Link>
    </div>
  );
};

export default UserOrders;

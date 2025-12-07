import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { redirect } from "next/navigation";
import { getItems } from "@/app/(carts)/cart/action";
import CheckoutForm from "@/components/checkout/CheckoutForm";

const CheckoutPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?._id) {
    redirect("/login");
  }

  const cartItems = await getItems(session.user._id);

  if (!cartItems || cartItems.length === 0) {
    redirect("/cart");
  }

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <section className="max-w-4xl pt-12 mx-auto">
      <h1 className="mb-8 text-2xl font-bold">Finalizar compra</h1>
      <CheckoutForm cartItems={cartItems} total={total} session={session} />
    </section>
  );
};

export default CheckoutPage;

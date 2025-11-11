import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import { getCartItems, saveOrder } from "../orders/action";

const CheckoutSuccess = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) => {
  const response = await fetchCheckoutData(searchParams.session_id);

  if (response?.metadata) {
    // Obtener session del usuario
    const session = await getServerSession(authOptions);

    // Obtener items del carrito
    const cartItems = session?.user?._id
      ? await getCartItems(session.user._id)
      : [];

    // Guardar el pedido y enviar email
    if (cartItems.length > 0) {
      await saveOrder(session, cartItems, response);
      await sendEmail(response);
    }
  }

  return (
    <section className="pt-12">
      <div className="flex flex-col gap-2">
        {response?.metadata && response.customer_details ? (
          <>
            <h1 className="mb-3 text-xl font-bold sm:text-2xl">
              Checkout Payment Result
            </h1>
            <h3 className="text-lg font-semibold">Successful payment</h3>
            <p>{`An email has been sent to you at: ${response.customer_details.email}`}</p>
          </>
        ) : (
          <h1>An error has occurred.</h1>
        )}
      </div>
    </section>
  );
};

export default CheckoutSuccess;
async function sendEmail(response: any) {
  try {
    await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: response.customer_details.email,
        orderId: response.metadata.order_id,
        amount: response.amount_total,
      }),
    });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}
async function fetchCheckoutData(session_id: string) {
  try {
    const response = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${session_id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch checkout data:", response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching checkout data:", error);
    return null;
  }
}

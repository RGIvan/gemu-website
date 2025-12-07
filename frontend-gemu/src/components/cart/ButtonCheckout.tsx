"use client";

import axios from "axios";
import { CartItemDocument } from "@/types/types";
import { useTransition, useCallback, useMemo } from "react";
import { Loader } from "../common/Loader";
import { toast } from "sonner";
import { Session } from "next-auth";
import Link from "next/link";
interface ButtonCheckoutProps {
  cartWithProducts: CartItemDocument[];
  session: Session | null;
}

const ButtonCheckout = ({ cartWithProducts, session }: ButtonCheckoutProps) => {
  if (!session || cartWithProducts.length === 0) {
    return (
      <button
        disabled
        className="w-full text-sm p-2.5 h-full opacity-50 cursor-not-allowed"
      >
        Continuar
      </button>
    );
  }

  return (
    <Link
      href="/checkout"
      className="w-full text-sm p-2.5 h-full transition-all hover:bg-color-secondary flex items-center justify-center"
    >
      Continuar
    </Link>
  );
};

/*let [isPending, startTransition] = useTransition();

  const lineItems = useMemo(
    () =>
      cartWithProducts.map((cartItem: CartItemDocument) => ({
        productId: cartItem.productId,
        quantity: cartItem.quantity,
      })),
    [cartWithProducts]
  );

  const buyProducts = useCallback(async () => {
    if (!session) {
      toast.error("User information not found");
      return;
    }

    try {
      const { data } = await axios.post("/api/stripe/payment", {
        lineItems,
        userId: session.user._id,
      });

      if (data.statusCode === 500) {
        toast.error(data.message);
        console.error(data.statusCode, data.message);
        return;
      }

      window.location.href = data.session.url;
    } catch (error) {
      console.error(error);
      toast.error(
        "An error occurred while processing your request. Please try again."
      );
    }
  }, [session, lineItems]);

  return (
    <button
      onClick={() => startTransition(buyProducts)}
      className="w-full text-sm p-2.5 h-full transition-all hover:bg-color-secondary"
    >
      {isPending ? <Loader height={20} width={20} /> : "Continuar"}
    </button>
  );
};*/

export default ButtonCheckout;

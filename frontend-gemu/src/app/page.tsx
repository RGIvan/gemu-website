import { Suspense } from "react";
import { Products } from "../components/products/Products";
import { getAllProducts } from "./actions";
import ProductSkeleton from "@/components/skeletons/ProductSkeleton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import type { Session } from "next-auth";

const Home = async () => {
  return (
    <section className="pt-14">
      <Suspense
        fallback={<ProductSkeleton extraClassname="" numberProducts={18} />}
      >
        <AllProducts />
      </Suspense>
    </section>
  );
};

const AllProducts = async () => {
  const products = await getAllProducts();
  const session: Session | null = await getServerSession(authOptions);

  return <Products products={products} extraClassname="" session={session} />;
};

export default Home;

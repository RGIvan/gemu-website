import { Suspense } from "react";
import { Products } from "../components/products/Products";
import { getAllProducts, getProductsByPlatform } from "./actions";
import ProductSkeleton from "@/components/skeletons/ProductSkeleton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import type { Session } from "next-auth";

interface HomeProps {
  searchParams: { platform?: string };
}

const Home = async ({ searchParams }: HomeProps) => {
  return (
    <section className="pt-14">
      <Suspense
        fallback={<ProductSkeleton extraClassname="" numberProducts={18} />}
      >
        <AllProducts platform={searchParams.platform} />
      </Suspense>
    </section>
  );
};

const AllProducts = async ({ platform }: { platform?: string }) => {
  const products = platform
    ? await getProductsByPlatform(platform)
    : await getAllProducts();
  const session: Session | null = await getServerSession(authOptions);

  return <Products products={products} extraClassname="" session={session} />;
};

export default Home;

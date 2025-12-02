import { Products } from "@/components/products/Products";
import { getCategoryProducts } from "../actions";
import ProductSkeleton from "@/components/skeletons/ProductSkeleton";
import { Suspense } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import type { Session } from "next-auth";

type Props = {
  params: {
    category: string;
  };
};

export async function generateMetadata({ params }: Props) {
  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const capitalizedCategory = capitalizeFirstLetter(params.category);

  return {
    title: `${capitalizedCategory} | Gemu`,
    description: `${capitalizedCategory} Categoría`,
  };
}

const CategoryPage = async ({ params }: Props) => {
  // ✅ Obtener sesión del usuario
  const session: Session | null = await getServerSession(authOptions);

  return (
    <section className="pt-14">
      <Suspense
        fallback={<ProductSkeleton extraClassname="" numberProducts={6} />}
      >
        <CategoryProducts category={params.category} session={session} />
      </Suspense>
    </section>
  );
};

// ✅ Recibir session como prop
const CategoryProducts = async ({
  category,
  session,
}: {
  category: string;
  session: Session | null;
}) => {
  const products = await getCategoryProducts(category);

  return <Products products={products} extraClassname="" session={session} />;
};

export default CategoryPage;

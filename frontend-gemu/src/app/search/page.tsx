import { Products } from "@/components/products/Products";
import { getAllProducts } from "../actions";
import { EnrichedProduct } from "@/types/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

interface SearchProps {
  searchParams: { [key: string]: string | undefined };
}

const normalizeText = (text: string): string => {
  return text
    .replace(/[-_]/g, "")
    .replace(/[^\w\s]/g, "")
    .toLowerCase();
};

const Search: React.FC<SearchProps> = async ({ searchParams }) => {
  const products = await getAllProducts();
  const session = await getServerSession(authOptions);
  let filteredProducts: EnrichedProduct[] = [];

  if (products) {
    filteredProducts = products.filter((product) =>
      normalizeText(product.name).includes(normalizeText(searchParams.q || ""))
    );
  }

  return (
    <section className="pt-14">
      {filteredProducts.length > 0 ? (
        <Products
          products={filteredProducts}
          extraClassname=""
          session={session}
        />
      ) : (
        <h3 className="text-sm text-center">
          No se encontró ningún producto... &quot;{searchParams.q}&quot;
        </h3>
      )}
    </section>
  );
};

export default Search;

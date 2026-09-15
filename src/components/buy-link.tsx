import type { ComponentProps } from "react";
import type { Product } from "@/content/products";

type BuyLinkProps = Omit<ComponentProps<"a">, "href" | "target" | "rel"> & {
  product: Product;
};

export function BuyLink({ product, children = "Buy", ...props }: BuyLinkProps) {
  return (
    <a href={product.url} target="_blank" rel="sponsored noopener noreferrer" {...props}>
      {children}
      <span className="sr-only">
        : {product.name} from {product.brand}, opens in a new tab
      </span>
    </a>
  );
}

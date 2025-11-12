import { UseFormReturn } from "react-hook-form";
import { ProdutoData } from "../types/form-schema";

export type ProdutoFormProps = {
  form: UseFormReturn<ProdutoData>;
};

import { Product } from "./Product";
import { User } from "./User";

export interface ProductWithSeller extends Product {
    seller: User;
  }
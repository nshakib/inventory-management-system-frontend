export interface Category {
  _id: string;
  categoryName: string;
  categoryDescription?: string;
}

export interface Supplier {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: Category;
  supplierId: Supplier;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
}

export interface Order {
  _id: string;
  product?: Product;
  quantity: number;
  totalPrice: number;
  orderDate: string;
}

export type Role = "admin" | "customer";
export interface ProtectedRoutesProps {
  children: React.ReactNode;
  requireRole: Role[];
}
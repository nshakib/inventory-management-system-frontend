export interface Category {
  _id: string;
  categoryName: string;
}

export interface Supplier {
  _id: string;
  name: string;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  categoryId: Category;
  supplierId: Supplier;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}
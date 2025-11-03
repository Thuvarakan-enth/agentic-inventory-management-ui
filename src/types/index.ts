export interface User {
  type: string;
  username: string;
  email: string;
  roles: string[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  username: string;
  email: string;
  roles: string[];
}

export interface Product {
  id: number;
  name: string;
  description: string;
  quantity: number;
  price: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCreateRequest {
  name: string;
  description: string;
  quantity: number;
  price: number;
  category: string;
}

export interface ProductUpdateRequest {
  id: number;
  name: string;
  description: string;
  quantity: number;
  price: number;
  category: string;
}

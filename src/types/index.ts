export interface User {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'USER';
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
  user: User;
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

export interface User {
  type: string;
  username: string;
  email: string;
  roles: string[];
  errorMessage?: string;
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

// Product types matching new schema
export interface Product {
  tenantId: string;
  productId: string;
  name: string;
  latestBatchNo?: string;
  remainingQty: number;
  latestUnitPrice: number;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
}

export interface ProductCreateRequest {
  name: string;
  remainingQty?: number;
  latestUnitPrice?: number;
}

export interface ProductUpdateRequest {
  productId: string;
  name: string;
  remainingQty?: number;
  latestUnitPrice?: number;
}

// Supplier types
export interface Supplier {
  tenantId: string;
  supplierId: string;
  name: string;
  email?: string;
  address?: string;
  contact?: string;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
}

export interface SupplierCreateRequest {
  name: string;
  email?: string;
  address?: string;
  contact?: string;
}

export interface SupplierUpdateRequest {
  supplierId: string;
  name: string;
  email?: string;
  address?: string;
  contact?: string;
}

// Invoice types
export interface Invoice {
  tenantId: string;
  invoiceNo: string;
  supplierId: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
  supplier?: Supplier;
}

export interface InvoiceCreateRequest {
  invoiceNo: string;
  supplierId: string;
  date: string;
}

export interface InvoiceUpdateRequest {
  invoiceNo: string;
  supplierId: string;
  date: string;
}

// Product Batch types
export interface ProductBatch {
  tenantId: string;
  productId: string;
  invoiceNo: string;
  batchNo: string;
  qty: number;
  unitCost: number;
  unitPrice: number;
  exp?: string;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
  product?: Product;
  invoice?: Invoice;
}

export interface ProductBatchCreateRequest {
  productId: string;
  invoiceNo: string;
  batchNo: string;
  qty: number;
  unitCost: number;
  unitPrice: number;
  exp?: string;
}

export interface ProductBatchUpdateRequest {
  productId: string;
  invoiceNo: string;
  batchNo: string;
  qty: number;
  unitCost: number;
  unitPrice: number;
  exp?: string;
}

// Transaction types
export interface Transaction {
  tenantId: string;
  transactionId: string;
  paymentMethod: string;
  grossAmount: number;
  discountAmount: number;
  netAmount: number;
  paidAmount: number;
  balanceAmount: number;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
  items?: TransactionItem[];
}

export interface TransactionCreateRequest {
  paymentMethod: string;
  grossAmount: number;
  discountAmount: number;
  netAmount: number;
  paidAmount: number;
  balanceAmount: number;
  items: TransactionItemCreateRequest[];
}

export interface TransactionUpdateRequest {
  transactionId: string;
  paymentMethod: string;
  grossAmount: number;
  discountAmount: number;
  netAmount: number;
  paidAmount: number;
  balanceAmount: number;
}

// Transaction Item types
export interface TransactionItem {
  tenantId: string;
  transactionId: string;
  productId: string;
  qty: number;
  unitPrice: number;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
  product?: Product;
}

export interface TransactionItemCreateRequest {
  productId: string;
  qty: number;
  unitPrice: number;
}

import apiClient from "./api";
import {
  ApiResponse,
  EngineeringEstimate,
  RKSDocument,
  ValueForMoneyReview,
  OwnerEstimate,
  ProcurementTenderEvent,
  PurchaseOrder,
  BankGuarantee,
  GoodsReceipt,
  InspectionAcceptanceAct,
  SupplierPerformanceEvaluation,
  ExecutiveDocket,
  BSREDigitalSignature,
  TaskDelegation,
  User,
  Role,
  Structure,
  Supplier,
  StockCode,
  General,
} from "@/types";

// HPE & RKS Service
export const hpeService = {
  getAllHPE: (search?: string) => apiClient.get<any, ApiResponse<EngineeringEstimate[]>>("/engineering-estimates/", { params: { search } }),
  getHPEById: (id: string) => apiClient.get<any, ApiResponse<EngineeringEstimate>>(`/engineering-estimates/${id}`),
  createHPE: (payload: any) => apiClient.post<any, ApiResponse<EngineeringEstimate>>("/engineering-estimates/", payload),
  deleteHPE: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/engineering-estimates/${id}`),
  createRKS: (payload: any) => apiClient.post<any, ApiResponse<RKSDocument>>("/engineering-estimates/rks", payload),
  getRKSByHPE: (hpeId: string) => apiClient.get<any, ApiResponse<RKSDocument[]>>(`/engineering-estimates/rks/hpe/${hpeId}`),
  submitVFM: (payload: any) => apiClient.post<any, ApiResponse<ValueForMoneyReview>>("/engineering-estimates/vfm", payload),
};

// Owner Estimate & Tender Service
export const oeService = {
  getAllOE: (search?: string) => apiClient.get<any, ApiResponse<OwnerEstimate[]>>("/owner-estimates/", { params: { search } }),
  getOEById: (id: string) => apiClient.get<any, ApiResponse<OwnerEstimate>>(`/owner-estimates/${id}`),
  createOE: (payload: any) => apiClient.post<any, ApiResponse<OwnerEstimate>>("/owner-estimates/", payload),
  deleteOE: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/owner-estimates/${id}`),
  createTenderEvent: (payload: any) => apiClient.post<any, ApiResponse<ProcurementTenderEvent>>("/owner-estimates/tender-events", payload),
  getTenderEventsByRequest: (requestId: string) => apiClient.get<any, ApiResponse<ProcurementTenderEvent[]>>(`/owner-estimates/tender-events/request/${requestId}`),
};

// Purchase Order Service
export const poService = {
  getAllPO: (search?: string) => apiClient.get<any, ApiResponse<PurchaseOrder[]>>("/purchase-orders/", { params: { search } }),
  getPOById: (id: string) => apiClient.get<any, ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}`),
  createPO: (payload: any) => apiClient.post<any, ApiResponse<PurchaseOrder>>("/purchase-orders/", payload),
  deletePO: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/purchase-orders/${id}`),
  getAllBankGuarantees: (search?: string) => apiClient.get<any, ApiResponse<BankGuarantee[]>>("/purchase-orders/bank-guarantees", { params: { search } }),
  createBankGuarantee: (payload: any) => apiClient.post<any, ApiResponse<BankGuarantee>>("/purchase-orders/bank-guarantees", payload),
  verifyBankGuarantee: (id: string, confirmationStatus: string) => apiClient.patch<any, ApiResponse<BankGuarantee>>(`/purchase-orders/bank-guarantees/${id}/verify`, { confirmation_status: confirmationStatus }),
};

// Warehouse & BAST Service
export const warehouseService = {
  getAllReceipts: (search?: string) => apiClient.get<any, ApiResponse<GoodsReceipt[]>>("/warehouse/goods-receipts", { params: { search } }),
  getReceiptById: (id: string) => apiClient.get<any, ApiResponse<GoodsReceipt>>(`/warehouse/goods-receipts/${id}`),
  createReceipt: (payload: any) => apiClient.post<any, ApiResponse<GoodsReceipt>>("/warehouse/goods-receipts", payload),
  deleteReceipt: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/warehouse/goods-receipts/${id}`),
  getAllActs: (search?: string) => apiClient.get<any, ApiResponse<InspectionAcceptanceAct[]>>("/warehouse/inspection-acts", { params: { search } }),
  getActById: (id: string) => apiClient.get<any, ApiResponse<InspectionAcceptanceAct>>(`/warehouse/inspection-acts/${id}`),
  createAct: (payload: any) => apiClient.post<any, ApiResponse<InspectionAcceptanceAct>>("/warehouse/inspection-acts", payload),
  deleteAct: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/warehouse/inspection-acts/${id}`),
};

// Supplier Evaluation Service
export const evaluationService = {
  getAll: (search?: string) => apiClient.get<any, ApiResponse<SupplierPerformanceEvaluation[]>>("/supplier-evaluations/", { params: { search } }),
  getByPOId: (poId: string) => apiClient.get<any, ApiResponse<SupplierPerformanceEvaluation[]>>(`/supplier-evaluations/po/${poId}`),
  getSummaryByPOId: (poId: string) => apiClient.get<any, ApiResponse<any>>(`/supplier-evaluations/po/${poId}/summary`),
  submitEvaluation: (payload: any) => apiClient.post<any, ApiResponse<SupplierPerformanceEvaluation[]>>("/supplier-evaluations/", payload),
  delete: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/supplier-evaluations/${id}`),
};

// Executive Docket & BSrE TTE Service
export const docketService = {
  getAll: (search?: string) => apiClient.get<any, ApiResponse<ExecutiveDocket[]>>("/executive-docket/", { params: { search } }),
  getById: (id: string) => apiClient.get<any, ApiResponse<ExecutiveDocket>>(`/executive-docket/${id}`),
  compile: (requestId: string) => apiClient.post<any, ApiResponse<ExecutiveDocket>>("/executive-docket/compile", { request_id: requestId }),
  signBSRE: (docketId: string, passphrase: string) => apiClient.post<any, ApiResponse<BSREDigitalSignature>>("/executive-docket/sign-bsre", { docket_id: docketId, passphrase }),
  delete: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/executive-docket/${id}`),
};

// Task Delegation Service (Alih Tugas)
export const delegationService = {
  getAll: (search?: string) => apiClient.get<any, ApiResponse<TaskDelegation[]>>("/task-delegations/", { params: { search } }),
  getById: (id: string) => apiClient.get<any, ApiResponse<TaskDelegation>>(`/task-delegations/${id}`),
  create: (payload: any) => apiClient.post<any, ApiResponse<TaskDelegation>>("/task-delegations/", payload),
  delete: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/task-delegations/${id}`),
};

// Master Data Service
export const masterService = {
  // Users
  getUsers: (search?: string) => apiClient.get<any, ApiResponse<User[]>>("/users/", { params: { search } }),
  getUserById: (id: string) => apiClient.get<any, ApiResponse<User>>(`/users/${id}`),
  createUser: (payload: any) => apiClient.post<any, ApiResponse<User>>("/users/", payload),
  updateUser: (id: string, payload: any) => apiClient.put<any, ApiResponse<User>>(`/users/${id}`, payload),
  deleteUser: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/users/${id}`),

  // Roles
  getRoles: (search?: string) => apiClient.get<any, ApiResponse<Role[]>>("/roles/", { params: { search } }),
  createRole: (payload: any) => apiClient.post<any, ApiResponse<Role>>("/roles/", payload),
  updateRole: (id: string, payload: any) => apiClient.put<any, ApiResponse<Role>>(`/roles/${id}`, payload),
  deleteRole: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/roles/${id}`),

  // Structures
  getStructures: (search?: string) => apiClient.get<any, ApiResponse<Structure[]>>("/structures/", { params: { search } }),
  createStructure: (payload: any) => apiClient.post<any, ApiResponse<Structure>>("/structures/", payload),
  updateStructure: (id: string, payload: any) => apiClient.put<any, ApiResponse<Structure>>(`/structures/${id}`, payload),
  deleteStructure: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/structures/${id}`),

  // Suppliers
  getSuppliers: (search?: string) => apiClient.get<any, ApiResponse<Supplier[]>>("/suppliers/", { params: { search } }),
  createSupplier: (payload: any) => apiClient.post<any, ApiResponse<Supplier>>("/suppliers/", payload),
  updateSupplier: (id: string, payload: any) => apiClient.put<any, ApiResponse<Supplier>>(`/suppliers/${id}`, payload),
  deleteSupplier: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/suppliers/${id}`),

  // Stock Codes
  getStockCodes: (search?: string) => apiClient.get<any, ApiResponse<StockCode[]>>("/stock-codes/", { params: { search } }),
  createStockCode: (payload: any) => apiClient.post<any, ApiResponse<StockCode>>("/stock-codes/", payload),
  updateStockCode: (id: string, payload: any) => apiClient.put<any, ApiResponse<StockCode>>(`/stock-codes/${id}`, payload),
  deleteStockCode: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/stock-codes/${id}`),

  // Generals
  getGenerals: (group?: string) => apiClient.get<any, ApiResponse<General[]>>("/generals/", { params: { group } }),
  createGeneral: (payload: any) => apiClient.post<any, ApiResponse<General>>("/generals/", payload),
  updateGeneral: (id: string, payload: any) => apiClient.put<any, ApiResponse<General>>(`/generals/${id}`, payload),
  deleteGeneral: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/generals/${id}`),
};

// Audit Log Service
export const auditService = {
  getLogs: (params?: { table_name?: string; action?: string; search?: string }) =>
    apiClient.get<any, ApiResponse<any[]>>("/audit-logs/", { params }),
};



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

export interface PaginationQueryParams {
  search?: string;
  page?: number;
  limit?: number;
  status?: string;
  [key: string]: any;
}

const resolveParams = (params?: PaginationQueryParams | string) => {
  return typeof params === "string" ? { search: params } : params;
};

// HPE & RKS Service
export const hpeService = {
  getAllHPE: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<EngineeringEstimate[]>>("/engineering-estimates/", { params: resolveParams(params) }),
  getHPEById: (id: string) => apiClient.get<any, ApiResponse<EngineeringEstimate>>(`/engineering-estimates/${id}`),
  createHPE: (payload: any) => apiClient.post<any, ApiResponse<EngineeringEstimate>>("/engineering-estimates/", payload),
  deleteHPE: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/engineering-estimates/${id}`),
  createRKS: (payload: any) => apiClient.post<any, ApiResponse<RKSDocument>>("/engineering-estimates/rks", payload),
  getRKSByHPE: (hpeId: string) => apiClient.get<any, ApiResponse<RKSDocument[]>>(`/engineering-estimates/rks/hpe/${hpeId}`),
  submitVFM: (payload: any) => apiClient.post<any, ApiResponse<ValueForMoneyReview>>("/engineering-estimates/vfm", payload),
};

// Owner Estimate & Tender Service
export const oeService = {
  getAllOE: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<OwnerEstimate[]>>("/owner-estimates/", { params: resolveParams(params) }),
  getOEById: (id: string) => apiClient.get<any, ApiResponse<OwnerEstimate>>(`/owner-estimates/${id}`),
  createOE: (payload: any) => apiClient.post<any, ApiResponse<OwnerEstimate>>("/owner-estimates/", payload),
  deleteOE: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/owner-estimates/${id}`),
  createTenderEvent: (payload: any) => apiClient.post<any, ApiResponse<ProcurementTenderEvent>>("/owner-estimates/tender-events", payload),
  getTenderEventsByRequest: (requestId: string) => apiClient.get<any, ApiResponse<ProcurementTenderEvent[]>>(`/owner-estimates/tender-events/request/${requestId}`),
};

// Purchase Order Service
export const poService = {
  getAllPO: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<PurchaseOrder[]>>("/purchase-orders/", { params: resolveParams(params) }),
  getPOById: (id: string) => apiClient.get<any, ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}`),
  createPO: (payload: any) => apiClient.post<any, ApiResponse<PurchaseOrder>>("/purchase-orders/", payload),
  deletePO: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/purchase-orders/${id}`),
  getAllBankGuarantees: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<BankGuarantee[]>>("/purchase-orders/bank-guarantees", { params: resolveParams(params) }),
  createBankGuarantee: (payload: any) => apiClient.post<any, ApiResponse<BankGuarantee>>("/purchase-orders/bank-guarantees", payload),
  verifyBankGuarantee: (id: string, confirmationStatus: string) => apiClient.patch<any, ApiResponse<BankGuarantee>>(`/purchase-orders/bank-guarantees/${id}/verify`, { confirmation_status: confirmationStatus }),
};

// Warehouse & BAST Service
export const warehouseService = {
  getAllReceipts: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<GoodsReceipt[]>>("/warehouse/goods-receipts", { params: resolveParams(params) }),
  getReceiptById: (id: string) => apiClient.get<any, ApiResponse<GoodsReceipt>>(`/warehouse/goods-receipts/${id}`),
  createReceipt: (payload: any) => apiClient.post<any, ApiResponse<GoodsReceipt>>("/warehouse/goods-receipts", payload),
  deleteReceipt: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/warehouse/goods-receipts/${id}`),
  getAllActs: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<InspectionAcceptanceAct[]>>("/warehouse/inspection-acts", { params: resolveParams(params) }),
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
  getUsers: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<User[]>>("/users/", { params: resolveParams(params) }),
  getUserById: (id: string) => apiClient.get<any, ApiResponse<User>>(`/users/${id}`),
  createUser: (payload: any) => apiClient.post<any, ApiResponse<User>>("/users/", payload),
  updateUser: (id: string, payload: any) => apiClient.put<any, ApiResponse<User>>(`/users/${id}`, payload),
  deleteUser: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/users/${id}`),

  // Roles
  getRoles: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<Role[]>>("/roles/", { params: resolveParams(params) }),
  createRole: (payload: any) => apiClient.post<any, ApiResponse<Role>>("/roles/", payload),
  updateRole: (id: string, payload: any) => apiClient.put<any, ApiResponse<Role>>(`/roles/${id}`, payload),
  deleteRole: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/roles/${id}`),

  // Structures
  getStructures: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<Structure[]>>("/structures/", { params: resolveParams(params) }),
  createStructure: (payload: any) => apiClient.post<any, ApiResponse<Structure>>("/structures/", payload),
  updateStructure: (id: string, payload: any) => apiClient.put<any, ApiResponse<Structure>>(`/structures/${id}`, payload),
  deleteStructure: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/structures/${id}`),

  // Suppliers
  getSuppliers: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<Supplier[]>>("/suppliers/", { params: resolveParams(params) }),
  createSupplier: (payload: any) => apiClient.post<any, ApiResponse<Supplier>>("/suppliers/", payload),
  updateSupplier: (id: string, payload: any) => apiClient.put<any, ApiResponse<Supplier>>(`/suppliers/${id}`, payload),
  deleteSupplier: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/suppliers/${id}`),

  // Stock Codes
  getStockCodes: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<StockCode[]>>("/stock-codes/", { params: resolveParams(params) }),
  createStockCode: (payload: any) => apiClient.post<any, ApiResponse<StockCode>>("/stock-codes/", payload),
  updateStockCode: (id: string, payload: any) => apiClient.put<any, ApiResponse<StockCode>>(`/stock-codes/${id}`, payload),
  deleteStockCode: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/stock-codes/${id}`),

  // Generals
  getGenerals: (group?: string) => apiClient.get<any, ApiResponse<General[]>>("/generals/", { params: { group } }),
  createGeneral: (payload: any) => apiClient.post<any, ApiResponse<General>>("/generals/", payload),
  updateGeneral: (id: string, payload: any) => apiClient.put<any, ApiResponse<General>>(`/generals/${id}`, payload),
  deleteGeneral: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/generals/${id}`),

  // Master Documents (Bab 3.9)
  getMasterDocuments: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<any[]>>("/master-documents/", { params: resolveParams(params) }),
  createMasterDocument: (payload: any) => apiClient.post<any, ApiResponse<any>>("/master-documents/", payload),
  updateMasterDocument: (id: string, payload: any) => apiClient.put<any, ApiResponse<any>>(`/master-documents/${id}`, payload),
  deleteMasterDocument: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/master-documents/${id}`),

  // User Roles (Bab 3.3)
  getUserRoles: (userId?: string) => apiClient.get<any, ApiResponse<any[]>>("/roles/user-roles", { params: { user_id: userId } }),
  assignUserRole: (payload: any) => apiClient.post<any, ApiResponse<any>>("/roles/user-roles", payload),
  removeUserRole: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/roles/user-roles/${id}`),

  // Approval Structures (Bab 3.6)
  getApprovalStructures: (moduleCode?: string) => apiClient.get<any, ApiResponse<any[]>>("/approval-structures/", { params: { module_code: moduleCode } }),
  createApprovalStructure: (payload: any) => apiClient.post<any, ApiResponse<any>>("/approval-structures/", payload),
  updateApprovalStructure: (id: string, payload: any) => apiClient.put<any, ApiResponse<any>>(`/approval-structures/${id}`, payload),
  deleteApprovalStructure: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/approval-structures/${id}`),
};

// Sub-Modul Users Service (Bab 4.6)
export const usersSubmoduleService = {
  // 4.6.2 Distribusi Permintaan
  getDistributions: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<any[]>>("/procurement-requests/distributions", { params: resolveParams(params) }),
  createDistribution: (payload: any) => apiClient.post<any, ApiResponse<any>>("/procurement-requests/distributions", payload),

  // 4.6.4 Usulan Addendum
  getAddendums: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<any[]>>("/procurement-requests/addendums", { params: resolveParams(params) }),
  createAddendum: (payload: any) => apiClient.post<any, ApiResponse<any>>("/procurement-requests/addendums", payload),

  // 4.6.5 Evaluasi Teknis
  getEvaluations: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<any[]>>("/procurement-requests/technical-evaluations", { params: resolveParams(params) }),
  createEvaluation: (payload: any) => apiClient.post<any, ApiResponse<any>>("/procurement-requests/technical-evaluations", payload),
};

// Sub-Modul Inventory Service (Bab 4.7)
export const inventorySubmoduleService = {
  // 4.7.1 Distribusi Perencana
  getDistributions: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<any[]>>("/engineering-estimates/distributions", { params: resolveParams(params) }),
  createDistribution: (payload: any) => apiClient.post<any, ApiResponse<any>>("/engineering-estimates/distributions", payload),

  // 4.7.2 Usulan Pengadaan RO
  getROs: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<any[]>>("/engineering-estimates/ros", { params: resolveParams(params) }),
  createRO: (payload: any) => apiClient.post<any, ApiResponse<any>>("/engineering-estimates/ros", payload),

  // 4.7.5 Adendum RKS
  getRKSAddendums: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<any[]>>("/engineering-estimates/rks-addendums", { params: resolveParams(params) }),
  createRKSAddendum: (payload: any) => apiClient.post<any, ApiResponse<any>>("/engineering-estimates/rks-addendums", payload),

  // 4.7.6 Review VFM Perencanaan
  getVFMReviews: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<any[]>>("/engineering-estimates/vfm-reviews", { params: resolveParams(params) }),
  createVFMReview: (payload: any) => apiClient.post<any, ApiResponse<any>>("/engineering-estimates/vfm-reviews", payload),

  // 4.7.7 Izin Penunjukan Langsung
  getDirectPermits: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<any[]>>("/engineering-estimates/direct-permits", { params: resolveParams(params) }),
  createDirectPermit: (payload: any) => apiClient.post<any, ApiResponse<any>>("/engineering-estimates/direct-permits", payload),
};

// Sub-Modul Pengadaan Service (Bab 4.8)
export const pengadaanSubmoduleService = {
  // 4.8.1 Distribusi Pengadaan
  getAssignments: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<any[]>>("/owner-estimates/assignments", { params: resolveParams(params) }),
  createAssignment: (payload: any) => apiClient.post<any, ApiResponse<any>>("/owner-estimates/assignments", payload),

  // 4.8.2 SPMK
  getSPMKs: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<any[]>>("/owner-estimates/spmks", { params: resolveParams(params) }),
  createSPMK: (payload: any) => apiClient.post<any, ApiResponse<any>>("/owner-estimates/spmks", payload),

  // 4.8.4 Permintaan Penawaran RFQ
  getQuotations: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<any[]>>("/owner-estimates/rfqs", { params: resolveParams(params) }),
  createQuotation: (payload: any) => apiClient.post<any, ApiResponse<any>>("/owner-estimates/rfqs", payload),

  // 4.8.5 Pengumuman Pengadaan
  getAnnouncements: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<any[]>>("/owner-estimates/announcements", { params: resolveParams(params) }),
  createAnnouncement: (payload: any) => apiClient.post<any, ApiResponse<any>>("/owner-estimates/announcements", payload),

  // 4.8.16 Kontrak Payung
  getUmbrellaContracts: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<any[]>>("/owner-estimates/umbrella-contracts", { params: resolveParams(params) }),
  createUmbrellaContract: (payload: any) => apiClient.post<any, ApiResponse<any>>("/owner-estimates/umbrella-contracts", payload),

  // 4.8.18 Addendum PO
  getPOAddendums: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<any[]>>("/purchase-orders/addendums", { params: resolveParams(params) }),
  createPOAddendum: (payload: any) => apiClient.post<any, ApiResponse<any>>("/purchase-orders/addendums", payload),

  // 4.8.19 PO DO
  getPODOs: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<any[]>>("/purchase-orders/delivery-orders", { params: resolveParams(params) }),
  createPODO: (payload: any) => apiClient.post<any, ApiResponse<any>>("/purchase-orders/delivery-orders", payload),
  getDeliveryOrders: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<any[]>>("/purchase-orders/delivery-orders", { params: resolveParams(params) }),
  createDeliveryOrder: (payload: any) => apiClient.post<any, ApiResponse<any>>("/purchase-orders/delivery-orders", payload),

  // 4.5 Checklist Dokumen Supplier
  getChecklists: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<any[]>>("/purchase-orders/checklists", { params: resolveParams(params) }),
  createChecklist: (payload: any) => apiClient.post<any, ApiResponse<any>>("/purchase-orders/checklists", payload),
};

// Sub-Modul Gudang Service (Bab 4.9)
export const gudangSubmoduleService = {
  // 4.9.1 Distribusi Penerimaan
  getDistributions: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<any[]>>("/warehouse/distributions", { params: resolveParams(params) }),
  createDistribution: (payload: any) => apiClient.post<any, ApiResponse<any>>("/warehouse/distributions", payload),

  // 4.9.2 Pemeriksaan Penerimaan Barang
  getInspections: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<any[]>>("/warehouse/inspections", { params: resolveParams(params) }),
  createInspection: (payload: any) => apiClient.post<any, ApiResponse<any>>("/warehouse/inspections", payload),

  // 4.9.5 Penyelesaian Pekerjaan Jasa
  getCompletions: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<any[]>>("/warehouse/completions", { params: resolveParams(params) }),
  createCompletion: (payload: any) => apiClient.post<any, ApiResponse<any>>("/warehouse/completions", payload),
};

// Report & Arsip Service (Bab 5)
export const reportService = {
  getRevisionLogs: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<any[]>>("/reports/revisions", { params: resolveParams(params) }),
  getArchiveDocuments: (params?: PaginationQueryParams | string) => apiClient.get<any, ApiResponse<any[]>>("/reports/archives", { params: resolveParams(params) }),
  uploadArchiveDocument: (payload: any) => apiClient.post<any, ApiResponse<any>>("/reports/archives", payload),
};

// Audit Log Service
export const auditService = {
  getLogs: (params?: { table_name?: string; action?: string; search?: string }) =>
    apiClient.get<any, ApiResponse<any[]>>("/audit-logs/", { params }),
};



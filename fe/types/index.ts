// TypeScript Interfaces for INTERLOGS UP Sembalang
// Synced with Go Backend PostgreSQL Models

export interface AuditFields {
  created_by?: string;
  updated_by?: string;
  deleted_by?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  pagination?: PaginationMeta;
  error?: string;
}

// Master Data: Audit Log
export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: "INSERT" | "UPDATE" | "DELETE";
  changed_by?: string;
  user?: User;
  pre_state?: Record<string, any>;
  post_state?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

// Master Data: Role
export interface Role extends AuditFields {
  id: string;
  code: string;
  name: string;
  description: string;
  status: "ACTIVE" | "INACTIVE";
}

// Master Data: Structure (Organization)
export interface Structure extends AuditFields {
  id: string;
  code: string;
  name: string;
  description?: string;
  parent_id?: string;
  parent?: Structure;
  status: "ACTIVE" | "INACTIVE";
}

// Master Data: User
export interface User extends AuditFields {
  id: string;
  nid: string;
  nip?: string;
  name: string;
  email: string;
  nik?: string;
  role_id: string;
  role?: Role;
  structure_id?: string;
  structure?: Structure;
  phone?: string;
  address?: string;
  signature_url?: string;
  user_image?: string;
  user_type: string;
  is_active: boolean;
}

// Master Data: Supplier
export interface Supplier extends AuditFields {
  id: string;
  code: string;
  name: string;
  npwp?: string;
  category?: string;
  pic_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  fax?: string;
  status: string;
  order_pic_name?: string;
  order_pic_email?: string;
  order_pic_address?: string;
  order_pic_phone?: string;
}

// Master Data: Stock Code
export interface StockCode extends AuditFields {
  id: string;
  code: string;
  name: string;
  category?: string;
  description?: string;
  uoi?: string;
  soh: number;
  warehouse_code?: string;
  bin_location?: string;
  mnemonic?: string;
  part_number?: string;
  is_active: boolean;
}

// Master Data: General
export interface General extends AuditFields {
  id: string;
  group: string;
  description: string;
  status: "ACTIVE" | "INACTIVE";
}

// Transaction: Procurement Request (UPM)
export interface RequestItem extends AuditFields {
  id: string;
  request_id: string;
  stock_code_id?: string;
  stock_code?: StockCode;
  item_type: "BARANG" | "JASA";
  item_name: string;
  specification: string;
  quantity: number;
  unit: string;
  estimated_price: number;
  required_date?: string;
  purpose?: string;
  notes?: string;
}

export type ProcurementStage =
  | "DRAFT"
  | "SUBMITTED"
  | "REVIEWED_SPV"
  | "APPROVED_MAN"
  | "APPROVED_GM"
  | "DISTRIBUTED"
  | "HPE_COMPILED"
  | "RKS_READY"
  | "HPS_COMPILED"
  | "TENDER_ACTIVE"
  | "PO_ISSUED"
  | "GOODS_RECEIVED"
  | "BAST_SIGNED"
  | "DOCKET_COMPILED"
  | "TTE_COMPLETED"
  | "REJECTED";

export interface ProcurementRequest extends AuditFields {
  id: string;
  request_number: string;
  wo_number?: string;
  prk_number?: string;
  title: string;
  description?: string;
  creator_id: string;
  creator?: User;
  user?: User; // alias
  structure_id: string;
  structure?: Structure;
  assigned_to_id?: string;
  assigned_to?: User;
  contract_type: "BARANG" | "JASA" | "KONSULTANSI" | "SEWA";
  category?: string; // alias
  priority: "NORMAL" | "URGENT" | "EMERGENCY";
  rab_amount: number;
  estimated_budget?: number; // alias
  current_step?: string;
  current_status: ProcurementStage;
  status?: string; // alias
  is_distributed: boolean;
  notes?: string;
  items?: RequestItem[];
  histories?: ApprovalHistory[];
}

// Transaction: Approval
export interface ApprovalHistory {
  id: string;
  request_id: string;
  approver_id: string;
  approver?: User;
  approver_role: string;
  stage_name: string;
  action: "SUBMIT" | "APPROVE" | "REVISE" | "REJECT";
  evaluation_notes?: string;
  sequence_order: number;
  action_timestamp: string;
  created_by?: string;
  updated_by?: string;
  deleted_by?: string;
  deleted_at?: string;
}

export interface ApprovalStructure extends AuditFields {
  id: string;
  request_structure_id?: string;
  request_structure?: Structure;
  approval_structure_id?: string;
  approval_structure?: Structure;
  menu?: string;
  approval_final?: boolean;
  module_code?: string;
  step_order?: number;
  role_id?: string;
  role?: Role;
  approver_user_id?: string;
  approver_user?: User;
  condition_min_amount?: number;
  condition_max_amount?: number;
  sla_hours?: number;
  status: string;
}

// Transaction: Engineering Estimate (HPE)
export interface EngineeringEstimate extends AuditFields {
  id: string;
  request_id: string;
  request?: ProcurementRequest;
  procurement_request?: ProcurementRequest;
  hpe_number: string;
  ee_number?: string;
  total_hpe: number;
  total_estimate?: number;
  total_estimated_cost?: number;
  procurement_method?: string;
  tax_included: boolean;
  methodology?: string;
  data_sources?: string;
  notes?: string;
  status: string;
}

export interface RKSDocument extends AuditFields {
  id: string;
  hpe_id: string;
  hpe?: EngineeringEstimate;
  rks_number: string;
  title: string;
  general_terms?: string;
  special_terms?: string;
  is_addendum: boolean;
  addendum_to?: string;
  status: string;
  creator?: User;
}

export interface ValueForMoneyReview extends AuditFields {
  id: string;
  request_id: string;
  request?: ProcurementRequest;
  stage: "PERENCANAAN" | "PENGADAAN";
  review_number: string;
  efficiency_analysis?: string;
  status: string;
  reviewed_by?: string;
  reviewer?: User;
}

// Transaction: Owner Estimate (HPS)
export interface OwnerEstimate extends AuditFields {
  id: string;
  request_id: string;
  request?: ProcurementRequest;
  procurement_request?: ProcurementRequest;
  oe_number: string;
  total_oe: number;
  total_oe_amount?: number;
  market_survey_date?: string;
  market_survey_method?: string;
  currency: string;
  status: string;
}

export interface ProcurementTenderEvent extends AuditFields {
  id: string;
  request_id: string;
  request?: ProcurementRequest;
  event_type: "AANWIJZING" | "BAPP_1" | "BAEP_1" | "BAPP_2" | "BAEP_2" | "BANH" | "BAHP" | string;
  document_number: string;
  event_date: string;
  location?: string;
  meeting_notes?: string;
  minutes_of_meeting?: string;
  status: string;
  creator?: User;
  quotations?: TenderVendorQuotation[];
}

export interface TenderVendorQuotation extends AuditFields {
  id: string;
  tender_event_id: string;
  supplier_id: string;
  supplier?: Supplier;
  quoted_price: number;
  negotiated_price?: number;
  admin_passed: boolean;
  tech_passed: boolean;
  is_winner: boolean;
  notes?: string;
}

// Transaction: Purchase Order (PO)
export interface PurchaseOrder extends AuditFields {
  id: string;
  request_id: string;
  request?: ProcurementRequest;
  supplier_id: string;
  supplier?: Supplier;
  vendor?: Supplier;
  items?: any[];
  po_number: string;
  contract_number?: string;
  title: string;
  po_amount: number;
  contract_amount?: number;
  ppn_amount: number;
  total_amount: number;
  start_date: string;
  end_date: string;
  payment_terms?: string;
  delivery_location?: string;
  delivery_deadline?: string;
  status: string;
}

export interface BankGuarantee extends AuditFields {
  id: string;
  request_id?: string;
  po_id?: string;
  po?: PurchaseOrder;
  supplier_id: string;
  supplier?: Supplier;
  guarantee_type?: "PENAWARAN" | "PELAKSANAAN" | "PEMELIHARAAN" | string;
  bg_type?: string;
  serial_number?: string;
  bg_number?: string;
  issuing_bank: string;
  branch?: string;
  amount: number;
  valid_from?: string;
  valid_until?: string;
  effective_date?: string;
  expiry_date?: string;
  claim_deadline?: string;
  confirmation_status: "BELUM_DIKONFIRMASI" | "TERKONFIRMASI_VALID" | "TIDAK_TERDAFTAR" | "VERIFIED_GENUINE" | "UNVERIFIED" | string;
  notes?: string;
}

// Transaction: Warehouse & BAST
export interface GoodsReceipt extends AuditFields {
  id: string;
  po_id: string;
  po?: PurchaseOrder;
  receipt_number: string;
  receipt_date: string;
  delivery_note_number?: string;
  inspector_name?: string;
  warehouse_location?: string;
  status: string;
  notes?: string;
}

export interface InspectionAcceptanceAct extends AuditFields {
  id: string;
  po_id: string;
  po?: PurchaseOrder;
  receipt_id?: string;
  receipt?: GoodsReceipt;
  act_number: string;
  act_type: "BAPHB_BARANG" | "BAST_JASA";
  lead_inspector_id: string;
  lead_inspector?: User;
  secretary_id: string;
  secretary?: User;
  member1_id: string;
  member1?: User;
  member2_id?: string;
  member2?: User;
  member3_id?: string;
  member3?: User;
  completion_percentage: number;
  conclusion: "DITERIMA_PENUH" | "DITERIMA_BERSYARAT" | "DITOLAK";
  status: string;
  notes?: string;
}

// Transaction: Supplier Performance Evaluation
export interface SupplierPerformanceEvaluation extends AuditFields {
  id: string;
  po_id: string;
  po?: PurchaseOrder;
  evaluator_id: string;
  evaluator?: User;
  category: "K3" | "LINGKUNGAN" | "MUTU_WAKTU" | "INTEGRITAS_HARGA";
  weight_percentage: number;
  score: number;
  grade?: "A" | "B" | "C" | "D";
  notes?: string;
}

// Transaction: Task Delegation (Alih Tugas)
export interface TaskDelegation extends AuditFields {
  id: string;
  task_type: string;
  original_user_id: string;
  original_user?: User;
  replacement_user_id: string;
  replacement_user?: User;
  request_id?: string;
  request?: ProcurementRequest;
  assigned_by_id: string;
  assigned_by?: User;
  notes?: string;
  status: string;
}

// Transaction: Executive Docket & BSrE
export interface ExecutiveDocket extends AuditFields {
  id: string;
  request_id: string;
  request?: ProcurementRequest;
  po_id?: string;
  po?: PurchaseOrder;
  docket_number: string;
  compiled_summary: string;
  pdf_file_path?: string;
  document_hash: string;
  is_signed: boolean;
}

export interface BSREDigitalSignature extends AuditFields {
  id: string;
  docket_id: string;
  docket?: ExecutiveDocket;
  signer_id: string;
  signer?: User;
  signer_nik: string;
  sign_request_id?: string;
  bsre_status: "PENDING" | "SUCCESS" | "FAILED";
  signed_pdf_url?: string;
  signature_qr_data?: string;
  error_message?: string;
  signed_at?: string;
}

// Master Data: Master Document (Bab 3.9)
export interface MasterDocument extends AuditFields {
  id: string;
  doc_type: string; // LAMPIRAN_PPA | KELENGKAPAN_DOKUMEN
  code: string;
  name: string;
  description?: string;
  is_mandatory: boolean;
  is_active: boolean;
}

// Master Data: Role Detail & User Role (Bab 3.2 & 3.3)
export interface RoleDetail extends AuditFields {
  id: string;
  role_id: string;
  role?: Role;
  module_name: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_approve: boolean;
}

export interface UserRole extends AuditFields {
  id: string;
  user_id: string;
  user?: User;
  role_id: string;
  role?: Role;
  is_primary: boolean;
}

// Sub-Modul Users (Bab 4.6)
export interface RequestDistribution extends AuditFields {
  id: string;
  request_id: string;
  request?: ProcurementRequest;
  assigned_to_user_id: string;
  assigned_to_user?: User;
  distribution_date: string;
  target_completion_date?: string;
  status: string;
  notes?: string;
}

export interface RequestAddendum extends AuditFields {
  id: string;
  original_request_id: string;
  original_request?: ProcurementRequest;
  addendum_number: string;
  addendum_sequence: number;
  reason: string;
  scope_change_description?: string;
  revised_estimated_budget: number;
  status: string;
  approved_by_id?: string;
  approved_at?: string;
}

export interface TechnicalEvaluation extends AuditFields {
  id: string;
  request_id: string;
  request?: ProcurementRequest;
  evaluator_id: string;
  evaluator?: User;
  evaluation_date: string;
  score: number;
  result: "MEMENUHI" | "TIDAK_MEMENUHI" | "MEMENUHI_BERSYARAT";
  notes?: string;
  status: string;
}

// Sub-Modul Inventory (Bab 4.7)
export interface InventoryDistribution extends AuditFields {
  id: string;
  request_id: string;
  request?: ProcurementRequest;
  planner_user_id: string;
  planner_user?: User;
  assigned_by_id: string;
  assigned_by?: User;
  distribution_date: string;
  target_date?: string;
  status: string;
  notes?: string;
}

export interface PurchaseRequisitionRO extends AuditFields {
  id: string;
  request_id: string;
  request?: ProcurementRequest;
  ro_number: string;
  submission_date: string;
  total_estimate: number;
  status: string;
  notes?: string;
}

export interface RKSAddendum extends AuditFields {
  id: string;
  rks_id: string;
  rks?: RKSDocument;
  addendum_number: string;
  addendum_sequence: number;
  reason: string;
  clauses_modified?: string;
  status: string;
}

export interface VFMReviewInventory extends AuditFields {
  id: string;
  request_id: string;
  request?: ProcurementRequest;
  reviewer_id: string;
  reviewer?: User;
  review_date: string;
  vfm_score: number;
  recommendation: string;
  status: string;
}

export interface DirectAppointmentPermit extends AuditFields {
  id: string;
  request_id: string;
  request?: ProcurementRequest;
  permit_number: string;
  vendor_id?: string;
  vendor?: Supplier;
  justification: string;
  permit_date: string;
  status: string;
}

// Sub-Modul Pengadaan (Bab 4.8)
export interface ProcurementAssignment extends AuditFields {
  id: string;
  request_id: string;
  request?: ProcurementRequest;
  buyer_user_id: string;
  buyer_user?: User;
  assigned_by_id: string;
  assigned_by?: User;
  assignment_date: string;
  target_closing_date?: string;
  status: string;
  notes?: string;
}

export interface SPMK extends AuditFields {
  id: string;
  po_id?: string;
  po?: PurchaseOrder;
  spmk_number: string;
  issue_date: string;
  start_date: string;
  completion_date: string;
  vendor_id?: string;
  vendor?: Supplier;
  status: string;
  work_description?: string;
}

export interface QuotationRequest extends AuditFields {
  id: string;
  request_id: string;
  request?: ProcurementRequest;
  rfq_number: string;
  issue_date: string;
  closing_date: string;
  method: string;
  status: string;
  notes?: string;
}

export interface ProcurementAnnouncement extends AuditFields {
  id: string;
  request_id: string;
  request?: ProcurementRequest;
  announcement_number: string;
  title: string;
  start_date: string;
  end_date: string;
  published_media?: string;
  status: string;
}

export interface UmbrellaContract extends AuditFields {
  id: string;
  contract_number: string;
  title: string;
  vendor_id?: string;
  vendor?: Supplier;
  start_date: string;
  end_date: string;
  total_ceiling_amount: number;
  remaining_amount: number;
  status: string;
}

export interface POAddendum extends AuditFields {
  id: string;
  po_id: string;
  po?: PurchaseOrder;
  addendum_number: string;
  addendum_sequence: number;
  change_type: string;
  description: string;
  reason?: string;
  revised_amount: number;
  revised_delivery_date?: string;
  status: string;
}

export interface PODeliveryOrder extends AuditFields {
  id: string;
  po_id: string;
  po?: PurchaseOrder;
  do_number: string;
  delivery_date: string;
  do_date?: string;
  ordered_quantity?: number;
  recipient_name?: string;
  vehicle_number?: string;
  shipping_notes?: string;
  status: string;
}

export interface ChecklistSupplier extends AuditFields {
  id: string;
  supplier_id: string;
  supplier?: Supplier;
  po_id?: string;
  po?: PurchaseOrder;
  verified_by_id?: string;
  verified_by?: User;
  verification_date?: string;
  status: string;
  notes?: string;
}

// Sub-Modul Gudang (Bab 4.9)
export interface WarehouseDistribution extends AuditFields {
  id: string;
  po_id: string;
  po?: PurchaseOrder;
  officer_user_id: string;
  officer_user?: User;
  distribution_date: string;
  target_inspection_date?: string;
  status: string;
  notes?: string;
}

export interface GoodsReceiptInspection extends AuditFields {
  id: string;
  receipt_id: string;
  receipt?: GoodsReceipt;
  inspector_user_id: string;
  inspector_user?: User;
  inspection_date: string;
  physical_condition: string;
  quantity_passed: number;
  quantity_rejected: number;
  status: string;
  notes?: string;
}

export interface JobCompletion extends AuditFields {
  id: string;
  po_id: string;
  po?: PurchaseOrder;
  completion_number: string;
  completion_date: string;
  progress_percentage: number;
  reported_by_id?: string;
  reported_by?: User;
  status: string;
  notes?: string;
}

// Report & Arsip (Bab 5)
export interface RevisionLog extends AuditFields {
  id: string;
  module_name: string;
  record_id: string;
  revision_number: number;
  reason: string;
  changed_fields?: string;
  revised_by_id?: string;
  revised_by?: User;
}

export interface ArchiveDocument extends AuditFields {
  id: string;
  module_name: string;
  document_number: string;
  title: string;
  document_date: string;
  file_url: string;
  category: string;
  status: string;
}



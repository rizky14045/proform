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

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
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
  structure_id: string;
  structure?: Structure;
  assigned_to_id?: string;
  assigned_to?: User;
  contract_type: "BARANG" | "JASA" | "KONSULTANSI" | "SEWA";
  priority: "NORMAL" | "URGENT" | "EMERGENCY";
  rab_amount: number;
  current_step?: string;
  current_status: ProcurementStage;
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
  request_structure_id: string;
  request_structure?: Structure;
  approval_structure_id: string;
  approval_structure?: Structure;
  menu: string;
  approval_final: boolean;
  status: string;
}

// Transaction: Engineering Estimate (HPE)
export interface EngineeringEstimate extends AuditFields {
  id: string;
  request_id: string;
  request?: ProcurementRequest;
  procurement_request?: ProcurementRequest;
  hpe_number: string;
  total_hpe: number;
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
  market_survey_date?: string;
  currency: string;
  status: string;
}

export interface ProcurementTenderEvent extends AuditFields {
  id: string;
  request_id: string;
  request?: ProcurementRequest;
  event_type: "AANWIJZING" | "BAPP_1" | "BAEP_1" | "BAPP_2" | "BAEP_2" | "BANH" | "BAHP";
  document_number: string;
  event_date: string;
  meeting_notes?: string;
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
  po_number: string;
  contract_number?: string;
  title: string;
  po_amount: number;
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
  supplier_id: string;
  supplier?: Supplier;
  guarantee_type: "PENAWARAN" | "PELAKSANAAN" | "PEMELIHARAAN";
  serial_number: string;
  issuing_bank: string;
  branch?: string;
  amount: number;
  valid_from: string;
  valid_until: string;
  claim_deadline: string;
  confirmation_status: "BELUM_DIKONFIRMASI" | "TERKONFIRMASI_VALID" | "TIDAK_TERDAFTAR";
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


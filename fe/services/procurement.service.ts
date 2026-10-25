import apiClient from "./api";
import { ApiResponse, ProcurementRequest, ApprovalHistory } from "@/types";

export interface CreateProcurementPayload {
  request_number: string;
  wo_number?: string;
  prk_number?: string;
  title: string;
  description?: string;
  structure_id: string;
  contract_type: "BARANG" | "JASA" | "KONSULTANSI" | "SEWA";
  priority: "NORMAL" | "URGENT" | "EMERGENCY";
  rab_amount: number;
  notes?: string;
  items?: Array<{
    stock_code_id?: string;
    item_type: "BARANG" | "JASA";
    item_name: string;
    specification: string;
    quantity: number;
    unit: string;
    estimated_price: number;
    purpose?: string;
    notes?: string;
  }>;
}

export interface ApprovalActionPayload {
  request_id: string;
  stage_name: string;
  action: "SUBMIT" | "APPROVE" | "REVISE" | "REJECT";
  evaluation_notes?: string;
}

export const procurementService = {
  getAll: async (search?: string): Promise<ApiResponse<ProcurementRequest[]>> => {
    return apiClient.get("/procurement-requests/", { params: { search } });
  },

  getById: async (id: string): Promise<ApiResponse<ProcurementRequest>> => {
    return apiClient.get(`/procurement-requests/${id}`);
  },

  create: async (payload: CreateProcurementPayload): Promise<ApiResponse<ProcurementRequest>> => {
    return apiClient.post("/procurement-requests/", payload);
  },

  update: async (id: string, payload: Partial<CreateProcurementPayload>): Promise<ApiResponse<ProcurementRequest>> => {
    return apiClient.put(`/procurement-requests/${id}`, payload);
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/procurement-requests/${id}`);
  },

  distribute: async (id: string, assignedToId: string, notes?: string): Promise<ApiResponse<ProcurementRequest>> => {
    return apiClient.post(`/procurement-requests/distribute/${id}`, {
      assigned_to_id: assignedToId,
      notes,
    });
  },

  submitForApproval: async (id: string, notes?: string): Promise<ApiResponse<ProcurementRequest>> => {
    return apiClient.post(`/procurement-requests/submit/${id}`, { notes: notes || "" });
  },

  approve: async (id: string, notes?: string): Promise<ApiResponse<ProcurementRequest>> => {
    return apiClient.post(`/procurement-requests/approve/${id}`, { notes: notes || "" });
  },

  revise: async (id: string, notes: string): Promise<ApiResponse<ProcurementRequest>> => {
    return apiClient.post(`/procurement-requests/revise/${id}`, { notes });
  },

  reject: async (id: string, notes: string): Promise<ApiResponse<ProcurementRequest>> => {
    return apiClient.post(`/procurement-requests/reject/${id}`, { notes });
  },

  submitApproval: async (payload: ApprovalActionPayload): Promise<ApiResponse<ApprovalHistory>> => {
    return apiClient.post("/approval/action", payload);
  },

  getApprovalHistory: async (requestId: string): Promise<ApiResponse<ApprovalHistory[]>> => {
    return apiClient.get(`/approval/histories/${requestId}`);
  },
};


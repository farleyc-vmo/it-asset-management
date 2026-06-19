// ============ ENUMS ============
export type ItemStatus = "active" | "inactive";
export type AssetAssignmentStatus =
  | "pending"
  | "assigned"
  | "returned"
  | "cancelled";
export type AssetStatus =
  | "AVAILABLE"
  | "DAMAGED"
  | "IN_USE"
  | "LOST"
  | "MAINTENANCE";
export type AssetType =
  | "EMPLOYEE"
  | "REQUEST_ASSET"
  | "CHANGE_WAREHOUSE"
  | "DEVICE_RECALL";
export type Priority = "low" | "medium" | "high" | "urgent";
export type EmployeeStatus = "active" | "inactive" | "on_leave" | "terminated";
export type EntityType =
  | "asset"
  | "employee"
  | "department"
  | "warehouse"
  | "assignment"
  | "category";

// ============ CORE ENTITIES ============

export interface Location {
  id: string;
  name: string;
  code: string;
  address: string;
  created_at: string;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  manager_id: string | null;
  location_id: string | null;
  created_at: string;
}

export interface Employee {
  id: string;
  employee_code: string;
  full_name: string;
  email: string;
  phone: string;
  department_id: string | null;
  position: string;
  manager_id: string | null;
  status: EmployeeStatus;
  avatar_url: string | null;
  joined_date: string;
  created_at: string;
  updated_at: string;
  location_id: string | null;
  role_id: string | null;
}

export interface Category {
  id: string;
  name: string;
  code: string;
  parent_id: string | null;
  description: string;
  icon: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  manager_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  item_code: string;
  item_name: string;
  category_id: string | null;
  brand: string;
  model: string;
  specification: string;
  supplier_url: string;
  status: ItemStatus;
  image_url: string | null;
  note: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Stock {
  id: string;
  item_id: string;
  warehouse_id: string;
  quantity: number;
  available_quantity: number;
  reserved_quantity: number;
  serials: any;
  purchase_date: string;
  purchase_cost: number;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  stock_id: string;
  asset_type: AssetType;
  assigned_to: string;
  assigned_date: string;
  expected_return_date: string | null;
  returned_date: string | null;
  asset_status: AssetStatus;
  assignment_status: AssetAssignmentStatus;
  condition_before: string;
  condition_after: string | null;
  note: string;
  signature_url: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  quantity: number;
  serial_number: string;
  priority: Priority;
  asset_code: string;
  approved_by: string | null;
  warehouse_id?: string;
}

export interface AuditLog {
  id: string;
  module: string;
  entity_type: EntityType;
  entity_id: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  performed_by: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ============ VIEW MODELS (with relations) ============

export interface AssetWithRelations extends Asset {
  category?: Category;
  stocks?: Stock[];
}

export interface EmployeeWithRelations extends Employee {
  department?: Department;
  location?: Location;
  role?: Role;
  manager?: Employee;
}

export interface DepartmentWithRelations extends Department {
  manager?: Employee;
  location?: Location;
  employees?: Employee[];
}

export interface AssetStockWithRelations extends Stock {
  asset?: Asset;
  warehouse?: Warehouse;
}

export interface AssetAssignmentWithRelations extends Asset {
  stock?: AssetStockWithRelations;
  assigned_employee?: Employee;
  created_by_employee?: Employee;
  approved_by_employee?: Employee;
}

export interface AuditLogWithRelations extends AuditLog {
  performed_by_employee?: Employee;
}

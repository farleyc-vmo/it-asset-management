"use client";

import {
  initialAssets,
  initialAuditLogs,
  initialCategories,
  initialDepartments,
  initialEmployees,
  initialItems,
  initialLocations,
  initialRequests,
  initialRoles,
  initialStocks,
  initialWarehouses,
} from "@/lib/data";
import type {
  Asset,
  AuditLog,
  Category,
  Department,
  Employee,
  Item,
  Location,
  Request,
  Role,
  Stock,
  Warehouse,
} from "@/lib/types";
import { createContext, useContext, useState, type ReactNode } from "react";

interface DataContextType {
  locations: Location[];
  setLocations: React.Dispatch<React.SetStateAction<Location[]>>;
  roles: Role[];
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
  departments: Department[];
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  warehouses: Warehouse[];
  setWarehouses: React.Dispatch<React.SetStateAction<Warehouse[]>>;
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  stocks: Stock[];
  setStocks: React.Dispatch<React.SetStateAction<Stock[]>>;
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  auditLogs: AuditLog[];
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>;
  requests: Request[];
  setRequests: React.Dispatch<React.SetStateAction<Request[]>>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [departments, setDepartments] =
    useState<Department[]>(initialDepartments);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(initialWarehouses);
  const [items, setItems] = useState<Item[]>(initialItems);
  const [stocks, setStocks] = useState<Stock[]>(initialStocks);
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [requests, setRequests] = useState<Request[]>(initialRequests);

  return (
    <DataContext.Provider
      value={{
        locations,
        setLocations,
        roles,
        setRoles,
        departments,
        setDepartments,
        employees,
        setEmployees,
        categories,
        setCategories,
        warehouses,
        setWarehouses,
        items,
        setItems,
        stocks,
        setStocks,
        assets,
        setAssets,
        auditLogs,
        setAuditLogs,
        requests,
        setRequests,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
}

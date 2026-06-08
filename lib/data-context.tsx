'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import type {
  Location, Role, Department, Employee, Category,
  Warehouse, Asset, AssetStock, AssetAssignment, AuditLog
} from '@/lib/types'
import {
  initialLocations, initialRoles, initialDepartments, initialEmployees,
  initialCategories, initialWarehouses, initialAssets, initialAssetStocks,
  initialAssetAssignments, initialAuditLogs
} from '@/lib/data'

interface DataContextType {
  locations: Location[]
  setLocations: React.Dispatch<React.SetStateAction<Location[]>>
  roles: Role[]
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>
  departments: Department[]
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>
  employees: Employee[]
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>
  categories: Category[]
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>
  warehouses: Warehouse[]
  setWarehouses: React.Dispatch<React.SetStateAction<Warehouse[]>>
  assets: Asset[]
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>
  assetStocks: AssetStock[]
  setAssetStocks: React.Dispatch<React.SetStateAction<AssetStock[]>>
  assetAssignments: AssetAssignment[]
  setAssetAssignments: React.Dispatch<React.SetStateAction<AssetAssignment[]>>
  auditLogs: AuditLog[]
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>
}

const DataContext = createContext<DataContextType | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [locations, setLocations] = useState<Location[]>(initialLocations)
  const [roles, setRoles] = useState<Role[]>(initialRoles)
  const [departments, setDepartments] = useState<Department[]>(initialDepartments)
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [warehouses, setWarehouses] = useState<Warehouse[]>(initialWarehouses)
  const [assets, setAssets] = useState<Asset[]>(initialAssets)
  const [assetStocks, setAssetStocks] = useState<AssetStock[]>(initialAssetStocks)
  const [assetAssignments, setAssetAssignments] = useState<AssetAssignment[]>(initialAssetAssignments)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs)

  return (
    <DataContext.Provider value={{
      locations, setLocations,
      roles, setRoles,
      departments, setDepartments,
      employees, setEmployees,
      categories, setCategories,
      warehouses, setWarehouses,
      assets, setAssets,
      assetStocks, setAssetStocks,
      assetAssignments, setAssetAssignments,
      auditLogs, setAuditLogs,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used within DataProvider')
  return context
}

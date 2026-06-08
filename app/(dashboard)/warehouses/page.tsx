'use client'

import { useState } from 'react'
import { useData } from '@/lib/data-context'
import type { Warehouse } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Plus, Search, Pencil, Trash2, Warehouse as WarehouseIcon } from 'lucide-react'

export default function WarehousesPage() {
  const { warehouses, setWarehouses, employees } = useData()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Warehouse | null>(null)

  const filteredWarehouses = warehouses.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.code.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const now = new Date().toISOString()

    const warehouseData: Warehouse = {
      id: editing?.id || `wh-${Date.now()}`,
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      address: formData.get('address') as string,
      manager_id: (formData.get('manager_id') as string) || null,
      created_at: editing?.created_at || now,
      updated_at: now,
    }

    if (editing) {
      setWarehouses(prev => prev.map(w => w.id === editing.id ? warehouseData : w))
    } else {
      setWarehouses(prev => [...prev, warehouseData])
    }
    setDialogOpen(false)
    setEditing(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this warehouse?')) {
      setWarehouses(prev => prev.filter(w => w.id !== id))
    }
  }

  const openEdit = (warehouse: Warehouse) => {
    setEditing(warehouse)
    setDialogOpen(true)
  }

  const openAdd = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Warehouses</h1>
          <p className="text-muted-foreground">Manage storage locations</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Warehouse
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <WarehouseIcon className="h-5 w-5" />
              Warehouse List ({warehouses.length})
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search warehouses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full sm:w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWarehouses.map(warehouse => {
                  const manager = employees.find(e => e.id === warehouse.manager_id)
                  return (
                    <TableRow key={warehouse.id}>
                      <TableCell className="font-mono text-sm">{warehouse.code}</TableCell>
                      <TableCell className="font-medium">{warehouse.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{warehouse.address}</TableCell>
                      <TableCell>{manager?.full_name || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(warehouse)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(warehouse.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredWarehouses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No warehouses found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Warehouse' : 'Add New Warehouse'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input id="code" name="code" defaultValue={editing?.code} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={editing?.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" defaultValue={editing?.address} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manager_id">Manager</Label>
              <Select name="manager_id" defaultValue={editing?.manager_id || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Select manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No manager</SelectItem>
                  {employees.filter(e => e.status === 'active').map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

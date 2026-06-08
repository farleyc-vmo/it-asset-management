'use client'

import { useState } from 'react'
import { useData } from '@/lib/data-context'
import type { Department } from '@/lib/types'
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
import { Plus, Search, Pencil, Trash2, Building2 } from 'lucide-react'

export default function DepartmentsPage() {
  const { departments, setDepartments, employees, locations } = useData()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Department | null>(null)

  const filteredDepartments = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase())
  )

  const getEmployeeCount = (deptId: string) => employees.filter(e => e.department_id === deptId).length

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const now = new Date().toISOString()

    const deptData: Department = {
      id: editing?.id || `dept-${Date.now()}`,
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      manager_id: (formData.get('manager_id') as string) || null,
      location_id: (formData.get('location_id') as string) || null,
      created_at: editing?.created_at || now,
    }

    if (editing) {
      setDepartments(prev => prev.map(d => d.id === editing.id ? deptData : d))
    } else {
      setDepartments(prev => [...prev, deptData])
    }
    setDialogOpen(false)
    setEditing(null)
  }

  const handleDelete = (id: string) => {
    const hasEmployees = employees.some(e => e.department_id === id)
    if (hasEmployees) {
      alert('Cannot delete department with employees')
      return
    }
    if (confirm('Are you sure you want to delete this department?')) {
      setDepartments(prev => prev.filter(d => d.id !== id))
    }
  }

  const openEdit = (dept: Department) => {
    setEditing(dept)
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
          <h1 className="text-2xl font-bold text-foreground">Departments</h1>
          <p className="text-muted-foreground">Manage organizational departments</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Department List ({departments.length})
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search departments..."
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
                  <TableHead>Manager</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-center">Employees</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.map(dept => {
                  const manager = employees.find(e => e.id === dept.manager_id)
                  const location = locations.find(l => l.id === dept.location_id)
                  return (
                    <TableRow key={dept.id}>
                      <TableCell className="font-mono text-sm">{dept.code}</TableCell>
                      <TableCell className="font-medium">{dept.name}</TableCell>
                      <TableCell>{manager?.full_name || '-'}</TableCell>
                      <TableCell>{location?.name || '-'}</TableCell>
                      <TableCell className="text-center">{getEmployeeCount(dept.id)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(dept)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(dept.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredDepartments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No departments found
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
            <DialogTitle>{editing ? 'Edit Department' : 'Add New Department'}</DialogTitle>
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
            <div className="space-y-2">
              <Label htmlFor="location_id">Location</Label>
              <Select name="location_id" defaultValue={editing?.location_id || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No location</SelectItem>
                  {locations.map(loc => (
                    <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
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

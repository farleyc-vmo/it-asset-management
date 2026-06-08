'use client'

import { useState } from 'react'
import { useData } from '@/lib/data-context'
import type { Location } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, Search, Pencil, Trash2, MapPin } from 'lucide-react'

export default function LocationsPage() {
  const { locations, setLocations, employees, departments } = useData()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Location | null>(null)

  const filteredLocations = locations.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.code.toLowerCase().includes(search.toLowerCase()) ||
    l.address.toLowerCase().includes(search.toLowerCase())
  )

  const getEmployeeCount = (locId: string) => employees.filter(e => e.location_id === locId).length
  const getDeptCount = (locId: string) => departments.filter(d => d.location_id === locId).length

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const now = new Date().toISOString()

    const locationData: Location = {
      id: editing?.id || `loc-${Date.now()}`,
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      address: formData.get('address') as string,
      created_at: editing?.created_at || now,
    }

    if (editing) {
      setLocations(prev => prev.map(l => l.id === editing.id ? locationData : l))
    } else {
      setLocations(prev => [...prev, locationData])
    }
    setDialogOpen(false)
    setEditing(null)
  }

  const handleDelete = (id: string) => {
    const hasEmployees = employees.some(e => e.location_id === id)
    const hasDepts = departments.some(d => d.location_id === id)
    if (hasEmployees || hasDepts) {
      alert('Cannot delete location with associated employees or departments')
      return
    }
    if (confirm('Are you sure you want to delete this location?')) {
      setLocations(prev => prev.filter(l => l.id !== id))
    }
  }

  const openEdit = (location: Location) => {
    setEditing(location)
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
          <h1 className="text-2xl font-bold text-foreground">Locations</h1>
          <p className="text-muted-foreground">Manage office locations</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Location
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location List ({locations.length})
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search locations..."
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
                  <TableHead className="text-center">Departments</TableHead>
                  <TableHead className="text-center">Employees</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLocations.map(location => (
                  <TableRow key={location.id}>
                    <TableCell className="font-mono text-sm">{location.code}</TableCell>
                    <TableCell className="font-medium">{location.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{location.address}</TableCell>
                    <TableCell className="text-center">{getDeptCount(location.id)}</TableCell>
                    <TableCell className="text-center">{getEmployeeCount(location.id)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(location)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(location.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredLocations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No locations found
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
            <DialogTitle>{editing ? 'Edit Location' : 'Add New Location'}</DialogTitle>
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

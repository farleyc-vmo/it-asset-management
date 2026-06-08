'use client'

import { useState } from 'react'
import { useData } from '@/lib/data-context'
import type { Category } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search, Pencil, Trash2, Layers, ChevronRight } from 'lucide-react'

export default function CategoriesPage() {
  const { categories, setCategories } = useData()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  )

  const getParentCategory = (parentId: string | null) => {
    if (!parentId) return null
    return categories.find(c => c.id === parentId)
  }

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const now = new Date().toISOString()

    const categoryData: Category = {
      id: editing?.id || `cat-${Date.now()}`,
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      parent_id: (formData.get('parent_id') as string) || null,
      description: formData.get('description') as string,
      icon: formData.get('icon') as string || 'Package',
      is_active: formData.get('is_active') === 'true',
      created_at: editing?.created_at || now,
      updated_at: now,
    }

    if (editing) {
      setCategories(prev => prev.map(c => c.id === editing.id ? categoryData : c))
    } else {
      setCategories(prev => [...prev, categoryData])
    }
    setDialogOpen(false)
    setEditing(null)
  }

  const handleDelete = (id: string) => {
    const hasChildren = categories.some(c => c.parent_id === id)
    if (hasChildren) {
      alert('Cannot delete category with subcategories')
      return
    }
    if (confirm('Are you sure you want to delete this category?')) {
      setCategories(prev => prev.filter(c => c.id !== id))
    }
  }

  const openEdit = (category: Category) => {
    setEditing(category)
    setDialogOpen(true)
  }

  const openAdd = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const rootCategories = filteredCategories.filter(c => !c.parent_id)
  const getChildCategories = (parentId: string) => filteredCategories.filter(c => c.parent_id === parentId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground">Organize assets by categories</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Category List ({categories.length})
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
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
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rootCategories.map(category => (
                  <>
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="font-mono text-sm">{category.code}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell className="max-w-xs truncate">{category.description}</TableCell>
                      <TableCell>
                        <Badge className={category.is_active ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(category)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    {getChildCategories(category.id).map(child => (
                      <TableRow key={child.id} className="bg-muted/30">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2 pl-4">
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            {child.name}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{child.code}</TableCell>
                        <TableCell>{category.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{child.description}</TableCell>
                        <TableCell>
                          <Badge className={child.is_active ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}>
                            {child.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(child)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(child.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ))}
                {filteredCategories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No categories found
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
            <DialogTitle>{editing ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={editing?.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input id="code" name="code" defaultValue={editing?.code} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parent_id">Parent Category</Label>
              <Select name="parent_id" defaultValue={editing?.parent_id || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="None (Root category)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (Root category)</SelectItem>
                  {categories.filter(c => !c.parent_id && c.id !== editing?.id).map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={editing?.description} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Icon Name</Label>
              <Input id="icon" name="icon" defaultValue={editing?.icon || 'Package'} placeholder="e.g., Monitor, Laptop, Server" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="is_active">Status</Label>
              <Select name="is_active" defaultValue={editing?.is_active?.toString() || 'true'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
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

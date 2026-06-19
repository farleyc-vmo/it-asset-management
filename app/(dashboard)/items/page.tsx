"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useData } from "@/lib/data-context";
import type { Item } from "@/lib/types";
import { Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";

export default function ItemsPage() {
  const { items, setItems, categories, employees } = useData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);

  const filteredItems = items.filter((a) => {
    const matchSearch =
      a.item_code.toLowerCase().includes(search.toLowerCase()) ||
      a.item_name.toLowerCase().includes(search.toLowerCase()) ||
      a.brand.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    const matchCategory =
      categoryFilter === "all" || a.category_id === categoryFilter;
    return matchSearch && matchStatus && matchCategory && !a.deleted_at;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const now = new Date().toISOString();

    const itemData: Item = {
      id: editing?.id || `item-${Date.now()}`,
      item_code: formData.get("item_code") as string,
      item_name: formData.get("item_name") as string,
      category_id: (formData.get("category_id") as string) || null,
      brand: formData.get("brand") as string,
      model: formData.get("model") as string,
      specification: formData.get("specification") as string,
      supplier_url: formData.get("supplier_url") as string,
      status: formData.get("status") as Item["status"],
      image_url: null,
      note: formData.get("note") as string,
      created_by: editing?.created_by || employees[0]?.id || null,
      created_at: editing?.created_at || now,
      updated_at: now,
      deleted_at: null,
    };

    if (editing) {
      setItems((prev) => prev.map((a) => (a.id === editing.id ? itemData : a)));
    } else {
      setItems((prev) => [...prev, itemData]);
    }
    setDialogOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this asset?")) {
      setItems((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, deleted_at: new Date().toISOString() } : a,
        ),
      );
    }
  };

  const openEdit = (asset: Item) => {
    setEditing(asset);
    setDialogOpen(true);
  };

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Items</h1>
          <p className="text-muted-foreground">Manage your item inventory</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Item List ({filteredItems.length})
            </CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories
                    .filter((c) => c.is_active)
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
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
                  <TableHead>Brand / Model</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  {/* <TableHead>Purchase Cost</TableHead> */}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const category = categories.find(
                    (c) => c.id === item.category_id,
                  );
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">
                        {item.item_code}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.item_name}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{item.brand}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.model}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{category?.name || "-"}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status.replace("_", " ")}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredItems.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No items found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Item" : "Add New Item"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category_id">Category</Label>
                <Select
                  name="category_id"
                  defaultValue={editing?.category_id || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((c) => c.is_active)
                      .map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="item_code">Item Code</Label>
                <Input
                  id="item_code"
                  name="item_code"
                  defaultValue={editing?.item_code}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item_name">Item Name</Label>
                <Input
                  id="item_name"
                  name="item_name"
                  defaultValue={editing?.item_name}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  name="status"
                  defaultValue={editing?.status || "active"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  name="brand"
                  defaultValue={editing?.brand}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  name="model"
                  defaultValue={editing?.model}
                  required
                />
              </div>
              {/* <div className="space-y-2">
                <Label htmlFor="purchase_date">Purchase Date</Label>
                <Input
                  id="purchase_date"
                  name="purchase_date"
                  type="date"
                  defaultValue={editing?.purchase_date}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchase_cost">Purchase Cost (VND)</Label>
                <Input
                  id="purchase_cost"
                  name="purchase_cost"
                  type="number"
                  defaultValue={editing?.purchase_cost}
                  required
                />
              </div> */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="specification">Specification</Label>
                <Input
                  id="specification"
                  name="specification"
                  defaultValue={editing?.specification}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="supplier_url">Supplier URL</Label>
                <Input
                  id="supplier_url"
                  name="supplier_url"
                  type="url"
                  defaultValue={editing?.supplier_url}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  name="note"
                  defaultValue={editing?.note}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">{editing ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

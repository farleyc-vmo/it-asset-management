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
import type { Asset } from "@/lib/types";
import { ClipboardList, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";

export default function AssetsPage() {
  const { assets, setAssets, stocks, items, employees, warehouses } = useData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [assignmentStatusFilter, setAssignmentStatusFilter] =
    useState<string>("All");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewing, setViewing] = useState<Asset | null>(null);

  const filteredAssets = assets.filter((a) => {
    const employee = employees.find((e) => e.id === a.assigned_to);
    const matchSearch =
      a.asset_code.toLowerCase().includes(search.toLowerCase()) ||
      employee?.full_name.toLowerCase().includes(search.toLowerCase());
    const matchAssignmentStatus =
      assignmentStatusFilter === "All" ||
      a.assignment_status === assignmentStatusFilter;
    const matchStatus =
      statusFilter === "All" || a.asset_status === statusFilter;
    return matchSearch && matchStatus && matchAssignmentStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-green-500/10 text-green-500 capitalize";
      case "pending":
        return "bg-amber-500/10 text-amber-500 capitalize";
      case "returned":
        return "bg-blue-500/10 text-blue-500 capitalize";
      case "cancelled":
        return "bg-red-500/10 text-red-500 capitalize";
      default:
        return "bg-muted text-muted-foreground capitalize";
    }
  };

  const getAssetStatusColor = (status: string) => {
    switch (status) {
      case "MAINTENANCE":
        return "bg-muted text-muted-foreground";
      case "DAMAGED":
        return "bg-amber-500/10 text-amber-500";
      case "IN_USE":
        return "bg-blue-500/10 text-blue-500";
      case "LOST":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-green-500/10 text-green-500";
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const now = new Date().toISOString();

    const assetData: Asset = {
      id: editing?.id || `assign-${Date.now()}`,
      stock_id: formData.get("stock_id") as string,
      asset_type: formData.get("asset_type") as Asset["asset_type"],
      assigned_to: formData.get("assigned_to") as string,
      assigned_date: formData.get("assigned_date") as string,
      expected_return_date:
        (formData.get("expected_return_date") as string) || null,
      returned_date: (formData.get("returned_date") as string) || null,
      asset_status: formData.get("asset_status") as Asset["asset_status"],
      assignment_status: formData.get(
        "assignment_status",
      ) as Asset["assignment_status"],
      condition_before: formData.get("condition_before") as string,
      condition_after: (formData.get("condition_after") as string) || null,
      note: formData.get("note") as string,
      signature_url: null,
      created_at: editing?.created_at || now,
      updated_at: now,
      created_by: editing?.created_by || employees[0]?.id || null,
      quantity: Number(formData.get("quantity")) || 1,
      serial_number: formData.get("serial_number") as string,
      priority: formData.get("priority") as Asset["priority"],
      asset_code: formData.get("asset_code") as string,
      approved_by: (formData.get("approved_by") as string) || null,
    };

    if (editing) {
      setAssets((prev) =>
        prev.map((a) => (a.id === editing.id ? assetData : a)),
      );
    } else {
      setAssets((prev) => [...prev, assetData]);
    }
    setDialogOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this asset?")) {
      setAssets((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const openEdit = (asset: Asset) => {
    setEditing(asset);
    setDialogOpen(true);
    setSelectedType(asset.asset_type);
  };

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openView = (asset: Asset) => {
    setViewing(asset);
    setViewDialogOpen(true);
  };

  const getItemInfo = (stockId: string) => {
    const stock = stocks.find((s) => s.id === stockId);
    if (!stock) return null;
    const item = items.find((a) => a.id === stock.item_id);
    const warehouse = warehouses.find((w) => w.id === stock.warehouse_id);
    return { item, warehouse };
  };

  const [selectedType, setSelectedType] = useState(
    editing?.asset_type || "EMPLOYEE",
  );

  const selectedWarehouse = selectedType !== "CHANGE_WAREHOUSE";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assets</h1>
          <p className="text-muted-foreground">Track assets to employees</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          New Asset
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Asset List ({assets.length})
            </CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search assets..."
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
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="AVAILABLE">AVAILABLE</SelectItem>
                  <SelectItem value="DAMAGED">DAMAGED</SelectItem>
                  <SelectItem value="IN_USE">IN_USE</SelectItem>
                  <SelectItem value="LOST">LOST</SelectItem>
                  <SelectItem value="MAINTENANCE">MAINTENANCE</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={assignmentStatusFilter}
                onValueChange={setAssignmentStatusFilter}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
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
                  <TableHead>Asset Code</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Asset Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Assignment Status</TableHead>
                  <TableHead>Serial</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => {
                  const employee = employees.find(
                    (e) => e.id === asset.assigned_to,
                  );
                  const warehouse = warehouses.find(
                    (e) => e.id === asset.assigned_to,
                  );
                  const itemInfo = getItemInfo(asset.stock_id);
                  return (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {asset.asset_code}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">
                            {itemInfo?.item?.item_name || "-"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {itemInfo?.item?.item_code}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getAssetStatusColor(asset.asset_status)}
                        >
                          {asset.asset_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {employee?.full_name || warehouse?.name || "-"}
                      </TableCell>
                      <TableCell className="capitalize">
                        {asset.asset_type}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusColor(asset.assignment_status)}
                        >
                          {asset.assignment_status}
                        </Badge>
                      </TableCell>
                      <TableCell>{asset.serial_number}</TableCell>
                      <TableCell>
                        {new Date(asset.assigned_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openView(asset)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(asset)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(asset.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredAssets.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No assets found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Asset" : "Create New Asset"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            {/* <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={editing?.title}
                required
              />
            </div> */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="stock_id">Stock</Label>
                <Select
                  name="stock_id"
                  defaultValue={editing?.stock_id}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select stock" />
                  </SelectTrigger>
                  <SelectContent className={"w-full"}>
                    {stocks.map((stock) => {
                      const item = items.find((a) => a.id === stock.item_id);
                      const warehouse = warehouses.find(
                        (w) => w.id === stock.warehouse_id,
                      );
                      return (
                        <SelectItem key={stock.id} value={stock.id}>
                          {item?.item_name} - {warehouse?.name} (Avail:{" "}
                          {stock.available_quantity})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="asset_code">Asset Code</Label>
                <Input
                  id="asset_code"
                  name="asset_code"
                  defaultValue={editing?.asset_code || ""}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="asset_type">Asset Type</Label>
                <Select
                  name="asset_type"
                  defaultValue={editing?.asset_type || "EMPLOYEE"}
                  onValueChange={setSelectedType}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">EMPLOYEE</SelectItem>
                    <SelectItem value="REQUEST_ASSET">REQUEST_ASSET</SelectItem>
                    <SelectItem value="CHANGE_WAREHOUSE">
                      CHANGE_WAREHOUSE
                    </SelectItem>
                    <SelectItem value="DEVICE_RECALL">DEVICE_RECALL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {selectedWarehouse ? (
                  <>
                    <Label htmlFor="assigned_to">Assign To</Label>
                    <Select
                      name="assigned_to"
                      defaultValue={editing?.assigned_to}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees
                          .filter((e) => e.status === "active")
                          .map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.full_name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </>
                ) : (
                  <>
                    <Label htmlFor="warehouse_id">Warehouse</Label>
                    <Select
                      name="warehouse_id"
                      defaultValue={editing?.assigned_to}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select warehouses" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  name="status"
                  defaultValue={editing?.assignment_status || "pending"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  defaultValue={editing?.quantity || 1}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assigned_date">Assigned Date</Label>
                <Input
                  id="assigned_date"
                  name="assigned_date"
                  type="date"
                  defaultValue={
                    editing?.assigned_date ||
                    new Date().toISOString().split("T")[0]
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expected_return_date">
                  Expected Return Date
                </Label>
                <Input
                  id="expected_return_date"
                  name="expected_return_date"
                  type="date"
                  defaultValue={editing?.expected_return_date || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition_before">Condition Before</Label>
                <Input
                  id="condition_before"
                  name="condition_before"
                  defaultValue={editing?.condition_before || "Good"}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition_after">Condition After</Label>
                <Input
                  id="condition_after"
                  name="condition_after"
                  defaultValue={editing?.condition_after || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="returned_date">Returned Date</Label>
                <Input
                  id="returned_date"
                  name="returned_date"
                  type="date"
                  defaultValue={editing?.returned_date || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="approved_by">Approved By</Label>
                <Select
                  name="approved_by"
                  defaultValue={editing?.approved_by || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Not approved yet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Not approved</SelectItem>
                    {employees
                      .filter((e) => e.status === "active")
                      .map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.full_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* <div className="space-y-2">
              <Label>Assign Serials</Label>

              {selectedSerials.map((value, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Select
                    value={value}
                    onValueChange={(newValue) => {
                      const updated = [...selectedSerials];
                      updated[index] = newValue;
                      setSelectedSerials(updated);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select serial" />
                    </SelectTrigger>

                    <SelectContent>
                      {availableSerials
                        .filter(
                          (serial) =>
                            !selectedSerials.includes(serial.name) ||
                            serial.name === value,
                        )
                        .map((serial) => (
                          <SelectItem key={serial.name} value={serial.name}>
                            {serial.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setSelectedSerials((prev) =>
                        prev.filter((_, i) => i !== index),
                      )
                    }
                  >
                    ×
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedSerials((prev) => [...prev, ""])}
              >
                + Add Serial
              </Button>
            </div> */}
            <div className="space-y-2">
              <Label htmlFor="serial_number">Serial Number</Label>
              <Input
                id="serial_number"
                name="serial_number"
                defaultValue={editing?.serial_number || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                name="note"
                defaultValue={editing?.note}
                rows={3}
              />
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

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Asset Details</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Code</p>
                  <p className="font-medium">{viewing.asset_code}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{viewing.asset_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Asset Status</p>
                  <Badge className={getAssetStatusColor(viewing.asset_status)}>
                    {viewing.asset_status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Assignment Status</p>
                  <Badge
                    className={`capitalize ${getStatusColor(viewing.assignment_status)}`}
                  >
                    {viewing.assignment_status}
                  </Badge>
                </div>

                <div>
                  <p className="text-muted-foreground">Assigned To</p>
                  <p className="font-medium">
                    {
                      employees.find((e) => e.id === viewing.assigned_to)
                        ?.full_name
                    }
                  </p>
                </div>
                {/* <div>
                  <p className="text-muted-foreground">Quantity</p>
                  <p className="font-medium">{viewing.quantity}</p>
                </div> */}
                <div>
                  <p className="text-muted-foreground">Assigned Date</p>
                  <p className="font-medium">
                    {new Date(viewing.assigned_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Expected Return</p>
                  <p className="font-medium">
                    {viewing.expected_return_date
                      ? new Date(
                          viewing.expected_return_date,
                        ).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Note</p>
                  <p className="font-medium">{viewing.note || "-"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

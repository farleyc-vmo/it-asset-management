"use client";

import { useState } from "react";
import { useData } from "@/lib/data-context";
import type { AssetAssignment } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Pencil, Trash2, ClipboardList, Eye } from "lucide-react";

export default function AssignmentsPage() {
  const {
    assetAssignments,
    setAssetAssignments,
    assetStocks,
    assets,
    employees,
    warehouses,
  } = useData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AssetAssignment | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewing, setViewing] = useState<AssetAssignment | null>(null);

  const filteredAssignments = assetAssignments.filter((a) => {
    const employee = employees.find((e) => e.id === a.assigned_to);
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      employee?.full_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-green-500/10 text-green-500";
      case "pending":
        return "bg-amber-500/10 text-amber-500";
      case "returned":
        return "bg-blue-500/10 text-blue-500";
      case "cancelled":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500/10 text-red-500";
      case "high":
        return "bg-orange-500/10 text-orange-500";
      case "medium":
        return "bg-amber-500/10 text-amber-500";
      case "low":
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

    const assignmentData: AssetAssignment = {
      id: editing?.id || `assign-${Date.now()}`,
      stock_id: formData.get("stock_id") as string,
      assignment_type: formData.get(
        "assignment_type",
      ) as AssetAssignment["assignment_type"],
      assigned_to: formData.get("assigned_to") as string,
      assigned_date: formData.get("assigned_date") as string,
      expected_return_date:
        (formData.get("expected_return_date") as string) || null,
      returned_date: (formData.get("returned_date") as string) || null,
      status: formData.get("status") as AssetAssignment["status"],
      condition_before: formData.get("condition_before") as string,
      condition_after: (formData.get("condition_after") as string) || null,
      note: formData.get("note") as string,
      signature_url: null,
      created_at: editing?.created_at || now,
      updated_at: now,
      created_by: editing?.created_by || employees[0]?.id || null,
      quantity: Number(formData.get("quantity")) || 1,
      serials: (formData.get("serials") as string)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      priority: formData.get("priority") as AssetAssignment["priority"],
      title: formData.get("title") as string,
      approved_by: (formData.get("approved_by") as string) || null,
    };

    if (editing) {
      setAssetAssignments((prev) =>
        prev.map((a) => (a.id === editing.id ? assignmentData : a)),
      );
    } else {
      setAssetAssignments((prev) => [...prev, assignmentData]);
    }
    setDialogOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this assignment?")) {
      setAssetAssignments((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const openEdit = (assignment: AssetAssignment) => {
    setEditing(assignment);
    setDialogOpen(true);
  };

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openView = (assignment: AssetAssignment) => {
    setViewing(assignment);
    setViewDialogOpen(true);
  };

  const getAssetInfo = (stockId: string) => {
    const stock = assetStocks.find((s) => s.id === stockId);
    if (!stock) return null;
    const asset = assets.find((a) => a.id === stock.asset_id);
    const warehouse = warehouses.find((w) => w.id === stock.warehouse_id);
    return { asset, warehouse };
  };

  const [selectedStockId, setSelectedStockId] = useState(
    editing?.stock_id || "",
  );
  const [selectedType, setSelectedType] = useState(
    editing?.assignment_type || "CREATE_ASSIGNMENT",
  );
  const [selectedSerials, setSelectedSerials] = useState<string[]>([""]);

  const selectedStock = assetStocks.find(
    (stock) => stock.id === selectedStockId,
  );
  const selectedWarehouse = selectedType !== "CHANGE_WAREHOUSE";
  const availableSerials =
    selectedStock?.serials.filter((s) => s.status !== "IN_USE") ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Asset Assignments
          </h1>
          <p className="text-muted-foreground">
            Track asset assignments to employees
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          New Assignment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Assignment List ({assetAssignments.length})
            </CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search assignments..."
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
                  <TableHead>Title</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => {
                  const employee = employees.find(
                    (e) => e.id === assignment.assigned_to,
                  );
                  const assetInfo = getAssetInfo(assignment.stock_id);
                  return (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {assignment.title}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">
                            {assetInfo?.asset?.asset_name || "-"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {assignment.quantity}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{employee?.full_name || "-"}</TableCell>
                      <TableCell className="capitalize">
                        {assignment.assignment_type}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getPriorityColor(assignment.priority)}
                        >
                          {assignment.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(assignment.status)}>
                          {assignment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(
                          assignment.assigned_date,
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openView(assignment)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(assignment)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(assignment.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredAssignments.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No assignments found
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
              {editing ? "Edit Assignment" : "Create New Assignment"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={editing?.title}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="stock_id">Asset Stock</Label>
                <Select
                  name="stock_id"
                  defaultValue={editing?.stock_id}
                  required
                  onValueChange={setSelectedStockId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset" />
                  </SelectTrigger>
                  <SelectContent className={"w-full"}>
                    {assetStocks.map((stock) => {
                      const asset = assets.find((a) => a.id === stock.asset_id);
                      const warehouse = warehouses.find(
                        (w) => w.id === stock.warehouse_id,
                      );
                      return (
                        <SelectItem key={stock.id} value={stock.id}>
                          {asset?.asset_name} - {warehouse?.name} (Avail:{" "}
                          {stock.available_quantity})
                        </SelectItem>
                      );
                    })}
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
                      defaultValue={editing?.warehouse_id}
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
                <Label htmlFor="assignment_type">Assignment Type</Label>
                <Select
                  name="assignment_type"
                  defaultValue={editing?.assignment_type || "CREATE_ASSIGNMENT"}
                  onValueChange={setSelectedType}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CREATE_ASSIGNMENT">
                      CREATE_ASSIGNMENT
                    </SelectItem>
                    <SelectItem value="REQUEST_ASSET">REQUEST_ASSET</SelectItem>
                    <SelectItem value="CHANGE_WAREHOUSE">
                      CHANGE_WAREHOUSE
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  name="priority"
                  defaultValue={editing?.priority || "medium"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
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

            <div className="space-y-2">
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
            <DialogTitle>Assignment Details</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Title</p>
                  <p className="font-medium">{viewing.title}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(viewing.status)}>
                    {viewing.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Priority</p>
                  <Badge className={getPriorityColor(viewing.priority)}>
                    {viewing.priority}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">
                    {viewing.assignment_type}
                  </p>
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
                <div>
                  <p className="text-muted-foreground">Quantity</p>
                  <p className="font-medium">{viewing.quantity}</p>
                </div>
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

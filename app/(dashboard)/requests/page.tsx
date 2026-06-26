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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import type { Asset, Request } from "@/lib/types";
import { ClipboardList, MoreHorizontal, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

export default function RequestsPage() {
  const { requests, assets, setAssets, stocks, items, employees, warehouses } =
    useData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [assetForm, setAssetForm] = useState({
    stockId: "",
    assetCode: "",
    quantity: 1,
  });

  const [selectedAssets, setSelectedAssets] = useState<
    {
      stockId: string;
      assetCode: string;
      quantity: number;
    }[]
  >([]);

  const [selectedType, setSelectedType] = useState(editing?.assign_type || "");

  const filteredRequests = requests.filter((a) => {
    const matchSearch = a.request_code
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchStatus = statusFilter === "All" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getAssetStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-500/10 text-amber-500";
      case "Cancel":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-green-500/10 text-green-500";
    }
  };

  const getRequestTypeColor = (status: string) => {
    switch (status) {
      case "DEVICE_RECALL":
        return "bg-blue-500/10 text-blue-500 capitalize";
      case "REQUEST_ASSET":
        return "bg-amber-500/10 text-amber-500 capitalize";
      case "CHANGE_WAREHOUSE":
        return "bg-muted text-muted-foreground";
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
      assign_type: formData.get("assign_type") as Asset["assign_type"],
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

  const handleReject = (request: Request) => {
    // setEditing(asset);
    // setDialogOpen(true);
    // setSelectedType(asset.assign_type);
  };

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
    setSelectedType("");
  };

  const handleApprove = (request: Request) => {
    // setViewing(asset);
    // setViewDialogOpen(true);
  };

  const getItemInfo = (stockId: string) => {
    const stock = stocks.find((s) => s.id === stockId);
    if (!stock) return null;
    const item = items.find((a) => a.id === stock.item_id);
    const warehouse = warehouses.find((w) => w.id === stock.warehouse_id);
    return { item, warehouse };
  };

  const selectedWarehouse = selectedType !== "CHANGE_WAREHOUSE";

  const availableAssets = useMemo(() => {
    return assets.filter(
      (asset) =>
        asset.stock_id === assetForm.stockId &&
        !selectedAssets.some((a) => a.assetCode === asset.asset_code),
    );
  }, [assets, assetForm.stockId, selectedAssets]);

  const handleAddAsset = () => {
    if (!assetForm.stockId || !assetForm.assetCode) return;

    setSelectedAssets((prev) => [...prev, assetForm]);

    setAssetForm({
      stockId: "",
      assetCode: "",
      quantity: 1,
    });
  };

  const handleRemoveAsset = (index: number) => {
    setSelectedAssets((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Requests</h1>
          <p className="text-muted-foreground">Track request</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Request List ({requests.length})
            </CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search request..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value ?? "")}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approve">Approve</SelectItem>
                  <SelectItem value="Cancel">Cancel</SelectItem>
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
                  <TableHead>Request Code</TableHead>
                  <TableHead>Request Type</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => {
                  const employee = employees.find(
                    (e) => e.id === request.assigned_to,
                  );
                  const warehouse = warehouses.find(
                    (e) => e.id === request.assigned_to,
                  );
                  const itemInfo = getItemInfo(request.stock_id);
                  return (
                    <TableRow key={request.id}>
                      <TableCell className="capitalize">
                        {request.title || "-"}
                      </TableCell>
                      <TableCell className="font-medium max-w-xs truncate">
                        {request.request_code}
                      </TableCell>
                      <TableCell className="font-medium max-w-xs truncate">
                        <Badge
                          className={getRequestTypeColor(request.request_type)}
                        >
                          {request.request_type}
                        </Badge>
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
                        {employee?.full_name || warehouse?.name || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge className={getAssetStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {new Date(request.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Popover>
                          <PopoverTrigger>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>

                          <PopoverContent className="w-44 p-1">
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-green-600 hover:text-green-700"
                              onClick={() => handleApprove(request)}
                            >
                              Approval
                            </Button>

                            <Button
                              variant="ghost"
                              className="w-full justify-start text-red-600 hover:text-red-700"
                              onClick={() => handleReject(request)}
                            >
                              Reject
                            </Button>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredRequests.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No request found
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
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Request" : "Create New Request"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="assign_type">Request Type</Label>
                <Select
                  name="assign_type"
                  defaultValue={editing?.assign_type || selectedType || ""}
                  onValueChange={(value) => setSelectedType(value ?? "")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">EMPLOYEE</SelectItem>
                    <SelectItem value="REQUEST_ASSET">REQUEST_ASSET</SelectItem>
                    <SelectItem value="CHANGE_WAREHOUSE">WAREHOUSE</SelectItem>
                    <SelectItem value="DEVICE_RECALL">DEVICE_RECALL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedType && selectedType !== "DEVICE_RECALL" && (
                <>
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
                </>
              )}

              {selectedType === "DEVICE_RECALL" && (
                <>
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
                      disabled
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
                </>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-lg border p-4 space-y-4">
                <h4 className="font-medium">Add Asset</h4>

                {/* Stock */}
                <div className="grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-5 space-y-2">
                    <Label>Stock</Label>

                    <Select
                      value={assetForm.stockId}
                      onValueChange={(value) =>
                        setAssetForm({
                          stockId: value ?? "",
                          assetCode: "",
                          quantity: 1,
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select stock" />
                      </SelectTrigger>

                      <SelectContent>
                        {stocks.map((stock) => {
                          const item = items.find(
                            (i) => i.id === stock.item_id,
                          );
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

                  {/* Asset Code */}
                  {selectedType !== "REQUEST_ASSET" && (
                    <div className="col-span-5 space-y-2">
                      <Label>Asset Code</Label>

                      <Select
                        value={assetForm.assetCode}
                        onValueChange={(value) =>
                          setAssetForm((prev) => ({
                            ...prev,
                            assetCode: value ?? "",
                          }))
                        }
                        disabled={!assetForm.stockId}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select asset code" />
                        </SelectTrigger>

                        <SelectContent>
                          {availableAssets.map((asset) => (
                            <SelectItem key={asset.id} value={asset.asset_code}>
                              {asset.asset_code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Quantity */}
                  <div className="col-span-2 space-y-2 pb-2">
                    <Label>Qty</Label>

                    <Input
                      type="number"
                      min={1}
                      value={assetForm.quantity}
                      onChange={(e) =>
                        setAssetForm((prev) => ({
                          ...prev,
                          quantity: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  className="w-full"
                  onClick={handleAddAsset}
                  disabled={
                    !assetForm.stockId ||
                    !assetForm.assetCode ||
                    assetForm.quantity <= 0
                  }
                >
                  + Add Asset
                </Button>
              </div>

              {/* Selected Assets */}
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Stock</TableHead>
                      <TableHead>Asset Code</TableHead>
                      <TableHead className="w-24">Qty</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {selectedAssets.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-muted-foreground"
                        >
                          No assets selected
                        </TableCell>
                      </TableRow>
                    ) : (
                      selectedAssets.map((row, index) => {
                        const stock = stocks.find((s) => s.id === row.stockId);

                        const item = items.find((i) => i.id === stock?.item_id);

                        return (
                          <TableRow key={index}>
                            <TableCell>{item?.item_name}</TableCell>

                            <TableCell className="font-medium">
                              {row.assetCode}
                            </TableCell>

                            <TableCell>{row.quantity}</TableCell>

                            <TableCell>
                              <Button
                                size="icon"
                                variant="ghost"
                                type="button"
                                onClick={() => handleRemoveAsset(index)}
                              >
                                ×
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
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
    </div>
  );
}

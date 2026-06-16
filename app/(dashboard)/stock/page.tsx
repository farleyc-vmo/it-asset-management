"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useData } from "@/lib/data-context";
import type { AssetStock } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Box,
  ChevronDown,
  ChevronRight,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";

export default function StockPage() {
  const { assetStocks, setAssetStocks, assets, warehouses } = useData();
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AssetStock | null>(null);
  const [serialInputs, setSerialInputs] = useState<
    {
      name: string;
      status?: string;
    }[]
  >([]);
  const [serialDialogOpen, setSerialDialogOpen] = useState(false);

  const filteredStocks = assetStocks.filter((s) => {
    const asset = assets.find((a) => a.id === s.asset_id);
    const matchSearch =
      asset?.asset_name.toLowerCase().includes(search.toLowerCase()) ||
      asset?.asset_code.toLowerCase().includes(search.toLowerCase());
    const matchWarehouse =
      warehouseFilter === "all" || s.warehouse_id === warehouseFilter;
    return matchSearch && matchWarehouse;
  });

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const now = new Date().toISOString();

    const quantity = Number(formData.get("quantity")) || 0;
    const reserved = Number(formData.get("reserved_quantity")) || 0;

    const serials = serialInputs
      .filter((s) => s.name.trim())
      .map((s) => ({
        name: s.name.trim(),
        status: s.status,
      }));

    const stockData: AssetStock = {
      id: editing?.id || `stock-${Date.now()}`,
      asset_id: formData.get("asset_id") as string,
      warehouse_id: formData.get("warehouse_id") as string,
      quantity,
      available_quantity: quantity - reserved,
      reserved_quantity: reserved,
      serials,
      purchase_date: formData.get("purchase_date") as string,
      purchase_cost: Number(formData.get("purchase_cost")) || 0,
      created_at: editing?.created_at || now,
      updated_at: now,
    };

    if (editing) {
      setAssetStocks((prev) =>
        prev.map((s) => (s.id === editing.id ? stockData : s)),
      );
    } else {
      setAssetStocks((prev) => [...prev, stockData]);
    }
    setDialogOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this stock record?")) {
      setAssetStocks((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const openEdit = (stock: AssetStock) => {
    setEditing(stock);
    setSerialInputs(
      stock.serials?.map((s) => ({
        name: s.name,
        status: s.status ?? "AVAILABLE",
      })) ?? [],
    );
    setDialogOpen(true);
  };

  const openAdd = () => {
    setEditing(null);
    setSerialInputs([]);
    setDialogOpen(true);
  };

  // const getStockStatus = (available: number, total: number) => {
  //   const ratio = available / total;
  //   if (ratio === 0)
  //     return { label: "Out of Stock", color: "bg-red-500/10 text-red-500" };
  //   if (ratio < 0.3)
  //     return { label: "Low Stock", color: "bg-amber-500/10 text-amber-500" };
  //   return { label: "In Stock", color: "bg-green-500/10 text-green-500" };
  // };

  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  const toggleRow = (stockId: string) => {
    setExpandedRows((prev) =>
      prev.includes(stockId)
        ? prev.filter((id) => id !== stockId)
        : [...prev, stockId],
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Stock Management
          </h1>
          <p className="text-muted-foreground">
            Track asset inventory across warehouses
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Stock
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Box className="h-5 w-5" />
              Stock Records ({assetStocks.length})
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
              <Select
                value={warehouseFilter}
                onValueChange={setWarehouseFilter}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Warehouses</SelectItem>
                  {warehouses.map((wh) => (
                    <SelectItem key={wh.id} value={wh.id}>
                      {wh.name}
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
                  <TableHead className="pl-11">Asset</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Available</TableHead>
                  <TableHead className="text-center">Reserved</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Purchase Cost</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStocks.map((stock) => {
                  const asset = assets.find((a) => a.id === stock.asset_id);
                  const warehouse = warehouses.find(
                    (w) => w.id === stock.warehouse_id,
                  );
                  const isExpanded = expandedRows.includes(stock.id);
                  return (
                    <>
                      <TableRow key={stock.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0"
                              onClick={() => toggleRow(stock.id)}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>

                            <div>
                              <p className="font-medium">
                                {asset?.asset_name || "-"}
                              </p>
                              <p className="font-mono text-xs text-muted-foreground">
                                {asset?.asset_code}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{warehouse?.name || "-"}</TableCell>
                        <TableCell className="text-center font-medium">
                          {stock.quantity}
                        </TableCell>
                        <TableCell className="text-center text-green-600">
                          {stock.available_quantity}
                        </TableCell>
                        <TableCell className="text-center text-amber-600">
                          {stock.reserved_quantity}
                        </TableCell>
                        <TableCell>
                          {new Date(stock.purchase_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(stock.purchase_cost)}
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(stock)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(stock.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>

                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={8} className="p-0">
                            <div className="bg-muted/20 px-6 py-4">
                              <div className="mx-auto w-full max-w-2xl">
                                <div className="mb-3">
                                  <h4 className="text-sm font-semibold">
                                    Serial Numbers ({stock.serials.length})
                                  </h4>
                                </div>

                                {stock.serials.length > 0 ? (
                                  <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
                                    <div className="grid grid-cols-[1fr_120px] border-b bg-muted/50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                      <span>Serial Number</span>
                                      <span className="text-center">
                                        Status
                                      </span>
                                    </div>

                                    {stock.serials.map((serial, index) => (
                                      <div
                                        key={serial.name}
                                        className={cn(
                                          "grid grid-cols-[1fr_120px] items-center px-4 py-3",
                                          index !== stock.serials.length - 1 &&
                                            "border-b",
                                        )}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                                            <Package className="h-4 w-4 text-muted-foreground" />
                                          </div>

                                          <div>
                                            <p className="font-mono text-sm font-medium">
                                              {serial.name}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="flex justify-center">
                                          <Badge
                                            className={
                                              serial.status === "IN_USE"
                                                ? "bg-blue-500/10 text-blue-500 hover:bg-blue-500/10"
                                                : "bg-green-500/10 text-green-500 hover:bg-green-500/10"
                                            }
                                          >
                                            {serial.status === "IN_USE"
                                              ? "In Use"
                                              : "Available"}
                                          </Badge>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="rounded-lg border border-dashed bg-background py-8 text-center shadow-sm">
                                    <Package className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                      No serial numbers found
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}

                {filteredStocks.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No stock records found
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
            <DialogTitle>
              {editing ? "Edit Stock" : "Add New Stock"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="asset_id">Asset</Label>
              <Select name="asset_id" defaultValue={editing?.asset_id} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select asset" />
                </SelectTrigger>
                <SelectContent>
                  {assets
                    .filter((a) => !a.deleted_at)
                    .map((asset) => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.asset_name} ({asset.asset_code})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="warehouse_id">Warehouse</Label>
              <Select
                name="warehouse_id"
                defaultValue={editing?.warehouse_id}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((wh) => (
                    <SelectItem key={wh.id} value={wh.id}>
                      {wh.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Total Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  defaultValue={editing?.quantity || 0}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reserved_quantity">Reserved</Label>
                <Input
                  id="reserved_quantity"
                  name="reserved_quantity"
                  type="number"
                  min="0"
                  defaultValue={editing?.reserved_quantity || 0}
                />
              </div>
              <div className="space-y-2">
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
              </div>
            </div>

            <div className="space-y-2">
              <Label>Serial Numbers</Label>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">
                    {serialInputs.length} serial
                    {serialInputs.length !== 1 ? "s" : ""}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Manage serial numbers and statuses
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSerialDialogOpen(true)}
                >
                  Manage Serials
                </Button>
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
      <Dialog open={serialDialogOpen} onOpenChange={setSerialDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Manage Serials</DialogTitle>
            <DialogDescription>Add and manage serial numbers</DialogDescription>
          </DialogHeader>

          <div className="max-h-125 overflow-y-auto pr-2">
            <div className="space-y-2">
              {serialInputs.map((serial, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[1fr_150px_auto] gap-2 rounded-lg border p-3"
                >
                  <Input
                    value={serial.name}
                    placeholder="Serial Number"
                    onChange={(e) => {
                      const updated = [...serialInputs];

                      updated[index].name = e.target.value;

                      setSerialInputs(updated);
                    }}
                  />

                  <Select
                    value={serial.status}
                    onValueChange={(value) => {
                      const updated = [...serialInputs];

                      updated[index].status = value;

                      setSerialInputs(updated);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="AVAILABLE">Available</SelectItem>

                      <SelectItem value="IN_USE">In Use</SelectItem>

                      <SelectItem value="DAMAGED">Damaged</SelectItem>

                      <SelectItem value="LOST">Lost</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setSerialInputs((prev) =>
                        prev.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setSerialInputs((prev) => [
                ...prev,
                {
                  name: "",
                  status: "AVAILABLE",
                },
              ])
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Serial
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

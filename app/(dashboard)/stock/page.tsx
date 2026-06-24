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
import { useData } from "@/lib/data-context";
import type { Stock } from "@/lib/types";

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
import React, { useState } from "react";

export default function StockPage() {
  const { stocks, setStocks, items, warehouses, assets, employees } = useData();
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Stock | null>(null);
  const [serialInputs, setSerialInputs] = useState<
    {
      name: string;
      status?: string;
    }[]
  >([]);
  const [serialDialogOpen, setSerialDialogOpen] = useState(false);

  const filteredStocks = stocks.filter((s) => {
    const item = items.find((a) => a.id === s.item_id);
    const matchSearch =
      item?.item_name.toLowerCase().includes(search.toLowerCase()) ||
      item?.item_code.toLowerCase().includes(search.toLowerCase());
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

    const stockData: Stock = {
      id: editing?.id || `stock-${Date.now()}`,
      item_id: formData.get("item_id") as string,
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
      setStocks((prev) =>
        prev.map((s) => (s.id === editing.id ? stockData : s)),
      );
    } else {
      setStocks((prev) => [...prev, stockData]);
    }
    setDialogOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this stock record?")) {
      setStocks((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const openEdit = (stock: Stock) => {
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

  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  const toggleRow = (stockId: string) => {
    setExpandedRows((prev) =>
      prev.includes(stockId)
        ? prev.filter((id) => id !== stockId)
        : [...prev, stockId],
    );
  };

  const getAssetInfo = (stockId: string) => {
    const stock = stocks.find((s) => s.id === stockId);
    if (!stock) return null;
    const asset = assets.filter((a) => a.stock_id === stockId);
    return { asset };
  };

  const employeeMap = React.useMemo(() => {
    return new Map(employees.map((e) => [e.id, e.full_name]));
  }, [employees]);

  const warehouseMap = React.useMemo(() => {
    return new Map(warehouses.map((w) => [w.id, w.name]));
  }, [warehouses]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Stock Management
          </h1>
          <p className="text-muted-foreground">
            Track item inventory across warehouses
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
              Stock Records ({stocks.length})
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
                  <TableHead className="pl-11">Item</TableHead>
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
                  const item = items.find((a) => a.id === stock.item_id);
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
                                {item?.item_name || "-"}
                              </p>
                              <p className="font-mono text-xs text-muted-foreground">
                                {item?.item_code}
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
                        <TableRow key={stock.id}>
                          <TableCell colSpan={8} className="p-0">
                            <div className="bg-muted/20 px-6 py-4">
                              <div className="mx-auto w-full max-w-5xl">
                                {stock.serials.length > 0 ? (
                                  <div className="space-y-4">
                                    {[
                                      {
                                        key: "AVAILABLE",
                                        label: "Available",
                                        badgeClass:
                                          "bg-green-500/10 text-green-600 border-green-500/20",
                                        match: (s: any) => !s.status,
                                      },
                                      {
                                        key: "IN_USE",
                                        label: "In Use",
                                        badgeClass:
                                          "bg-blue-500/10 text-blue-600 border-blue-500/20",
                                        match: (s: any) =>
                                          s.status === "IN_USE",
                                      },
                                    ].map((group) => {
                                      const serials = stock.serials.filter(
                                        group.match,
                                      );

                                      if (serials.length === 0) return null;

                                      return (
                                        <div
                                          key={group.key}
                                          className="rounded-xl border bg-background p-4"
                                        >
                                          {/* Header */}
                                          <div className="mb-3 flex items-center gap-2">
                                            <Badge className={group.badgeClass}>
                                              {group.label}
                                            </Badge>

                                            <span className="text-sm text-muted-foreground">
                                              {serials.length} assets
                                            </span>
                                          </div>

                                          {/* Grid */}
                                          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                            {serials.map((serial) => {
                                              const assetInfo = getAssetInfo(
                                                stock.id,
                                              );

                                              const info =
                                                assetInfo?.asset?.find(
                                                  (item) =>
                                                    item.asset_code ===
                                                    serial.name,
                                                );

                                              const assignedName = (() => {
                                                if (!info?.assigned_to)
                                                  return "-";

                                                if (
                                                  info.assign_type ===
                                                  "CHANGE_WAREHOUSE"
                                                ) {
                                                  return (
                                                    warehouseMap.get(
                                                      info.assigned_to,
                                                    ) ?? "-"
                                                  );
                                                }

                                                return (
                                                  employeeMap.get(
                                                    info.assigned_to,
                                                  ) ?? "-"
                                                );
                                              })();

                                              return (
                                                <Popover key={serial.name}>
                                                  <PopoverTrigger asChild>
                                                    <div className="rounded-lg border bg-card p-3 cursor-pointer transition hover:border-primary hover:shadow-sm">
                                                      <div className="flex items-center gap-2">
                                                        <Package className="h-4 w-4 text-muted-foreground" />
                                                        <p className="truncate font-mono text-sm font-medium">
                                                          {serial.name}
                                                        </p>
                                                      </div>
                                                    </div>
                                                  </PopoverTrigger>

                                                  <PopoverContent
                                                    side="top"
                                                    align="start"
                                                    className="w-72 space-y-3 rounded-xl p-4"
                                                  >
                                                    <div className="text-xs text-muted-foreground">
                                                      Asset Information
                                                    </div>

                                                    <div className="space-y-2 text-sm">
                                                      <div className="flex justify-between">
                                                        <span className="text-muted-foreground">
                                                          ID
                                                        </span>
                                                        <span className="font-mono">
                                                          {serial.name}
                                                        </span>
                                                      </div>
                                                      <div className="flex justify-between">
                                                        <span className="text-muted-foreground">
                                                          Assign Type
                                                        </span>
                                                        <span>
                                                          {info?.assign_type
                                                            ? info?.assign_type
                                                            : "-"}
                                                        </span>
                                                      </div>

                                                      <div className="flex justify-between">
                                                        <span className="text-muted-foreground">
                                                          Assign to
                                                        </span>
                                                        <span>
                                                          {assignedName ?? "-"}
                                                        </span>
                                                      </div>
                                                    </div>

                                                    <div className="border-t pt-2">
                                                      <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground">
                                                          Status
                                                        </span>

                                                        <Badge
                                                          className={
                                                            serial.status
                                                              ? "bg-blue-500/10 text-blue-600"
                                                              : "bg-green-500/10 text-green-600"
                                                          }
                                                        >
                                                          {serial.status ??
                                                            "AVAILABLE"}
                                                        </Badge>
                                                      </div>
                                                    </div>
                                                  </PopoverContent>
                                                </Popover>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="rounded-lg border border-dashed bg-background py-8 text-center">
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
              <Label htmlFor="item_id">Item</Label>
              <Select name="item_id" defaultValue={editing?.item_id} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {items
                    .filter((a) => !a.deleted_at)
                    .map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.item_name} ({item.item_code})
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

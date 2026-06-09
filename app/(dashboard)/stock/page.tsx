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
import { useData } from "@/lib/data-context";
import type { AssetStock } from "@/lib/types";
import { Box, ChevronRight, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";

export default function StockPage() {
  const { assetStocks, setAssetStocks, assets, warehouses } = useData();
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AssetStock | null>(null);

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

    const serials = (formData.get("serials") as string)
      .split(",")
      .map((s) => ({ name: s }))
      .filter(Boolean);

    const stockData: AssetStock = {
      id: editing?.id || `stock-${Date.now()}`,
      asset_id: formData.get("asset_id") as string,
      warehouse_id: formData.get("warehouse_id") as string,
      quantity,
      available_quantity: quantity - reserved,
      reserved_quantity: reserved,
      serials,
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
    setDialogOpen(true);
  };

  const openAdd = () => {
    setEditing(null);
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
                  <TableHead>Asset</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Available</TableHead>
                  <TableHead className="text-center">Reserved</TableHead>
                  <TableHead>Serials</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStocks.map((stock) => {
                  const asset = assets.find((a) => a.id === stock.asset_id);
                  const warehouse = warehouses.find(
                    (w) => w.id === stock.warehouse_id,
                  );
                  return (
                    <>
                      <TableRow key={stock.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {asset?.asset_name || "-"}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {asset?.asset_code}
                            </p>
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
                          {stock.serials.map((e) => e?.name ?? "-").join(", ")}
                        </TableCell>
                        <TableCell>-</TableCell>
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
                      {stock.serials
                        .filter((e) => e.status)
                        .map((serial) => (
                          <TableRow key={serial.id} className="bg-muted/30">
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2 pl-4">
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                {serial.name}
                              </div>
                            </TableCell>
                            <TableCell>-</TableCell>
                            <TableCell className="text-center font-medium">
                              -
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              -
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              -
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              -
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  serial.status !== "IN_USE"
                                    ? "bg-green-500/10 text-green-500"
                                    : "bg-gray-500/10 text-blue-500"
                                }
                              >
                                {serial.status === "IN_USE"
                                  ? "In use"
                                  : "Available"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                    </>
                  );
                })}
                {filteredStocks.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="serials">Serial Numbers (comma separated)</Label>
              <Input
                id="serials"
                name="serials"
                defaultValue={editing?.serials
                  .map((e) => e?.name ?? "-")
                  .join(", ")}
                placeholder="SN001, SN002, SN003"
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

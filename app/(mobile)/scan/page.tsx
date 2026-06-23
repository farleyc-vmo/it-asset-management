"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useData } from "@/lib/data-context";
import type { Asset, Item, Stock } from "@/lib/types";
import {
  ArrowLeft,
  ArrowRightLeft,
  CheckCircle2,
  Keyboard,
  Package,
  QrCode,
  RotateCcw,
  ScanLine,
  UserPlus,
  Warehouse,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

type ScanView = "scanner" | "detail";
type ActionType = "assign" | "warehouse" | "return" | null;

interface ScannedResult {
  item: Item;
  stock: Stock;
  matchedSerial: string | null;
  trackedAsset: Asset | null;
}

const DEMO_CODES = ["MBP001", "LTP-01", "MBP-2024-001", "CSW002", "MBP14-003"];

function getSerialStatusColor(status?: string) {
  if (status === "IN_USE") return "bg-amber-500/10 text-amber-500";
  return "bg-green-500/10 text-green-500";
}

export default function MobileScanPage() {
  const {
    items,
    stocks,
    assets,
    setAssets,
    employees,
    warehouses,
    categories,
  } = useData();

  const [view, setView] = useState<ScanView>("scanner");
  const [manualCode, setManualCode] = useState("");
  const [scanned, setScanned] = useState<ScannedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const lookupCode = useCallback(
    (raw: string): ScannedResult | null => {
      const code = raw.trim().toUpperCase();
      if (!code) return null;

      const trackedByCode = assets.find(
        (a) => a.asset_code.toUpperCase() === code,
      );
      if (trackedByCode) {
        const stock = stocks.find((s) => s.id === trackedByCode.stock_id);
        if (!stock) return null;
        const item = items.find((i) => i.id === stock.item_id && !i.deleted_at);
        if (!item) return null;
        return {
          item,
          stock,
          matchedSerial: trackedByCode.serial_number || null,
          trackedAsset: trackedByCode,
        };
      }

      for (const stock of stocks) {
        const serials = Array.isArray(stock.serials) ? stock.serials : [];
        const match = serials.find(
          (s: { name: string }) => s.name.toUpperCase() === code,
        );
        if (match) {
          const item = items.find((i) => i.id === stock.item_id && !i.deleted_at);
          if (!item) continue;
          const trackedAsset =
            assets.find(
              (a) =>
                a.stock_id === stock.id &&
                a.serial_number.toUpperCase() === code &&
                a.assignment_status === "assigned",
            ) ?? null;
          return {
            item,
            stock,
            matchedSerial: match.name,
            trackedAsset,
          };
        }
      }

      const byItemCode = items.find(
        (i) => i.item_code.toUpperCase() === code && !i.deleted_at,
      );
      if (byItemCode) {
        const stock = stocks.find((s) => s.item_id === byItemCode.id);
        if (!stock) return null;
        return {
          item: byItemCode,
          stock,
          matchedSerial: null,
          trackedAsset: null,
        };
      }

      return null;
    },
    [assets, items, stocks],
  );

  const handleScan = (code: string) => {
    setError(null);
    setSuccessMessage(null);
    const result = lookupCode(code);
    if (!result) {
      setError(
        `No asset found for "${code.trim()}". Try MBP001, LTP-01, or MBP-2024-001.`,
      );
      return;
    }
    setScanned(result);
    setView("detail");
    setManualCode(code.trim());
  };

  const resetToScanner = () => {
    setView("scanner");
    setScanned(null);
    setManualCode("");
    setError(null);
    setActiveAction(null);
    setSuccessMessage(null);
  };

  const currentTrackedAsset = scanned?.trackedAsset
    ? scanned.trackedAsset
    : scanned
      ? assets.find(
          (a) =>
            a.stock_id === scanned.stock.id &&
            a.assignment_status === "assigned" &&
            (scanned.matchedSerial
              ? a.serial_number === scanned.matchedSerial
              : true),
        ) ?? null
      : null;

  const assignedEmployee = currentTrackedAsset
    ? employees.find((e) => e.id === currentTrackedAsset.assigned_to)
    : null;

  const warehouse = scanned
    ? warehouses.find((w) => w.id === scanned.stock.warehouse_id)
    : null;

  const category = scanned?.item.category_id
    ? categories.find((c) => c.id === scanned.item.category_id)
    : null;

  const createAsset = (type: Asset["asset_type"], extra: Partial<Asset>) => {
    if (!scanned) return;
    const now = new Date().toISOString().split("T")[0];
    const asset: Asset = {
      id: `assign-${Date.now()}`,
      stock_id: scanned.stock.id,
      asset_type: type,
      assigned_to: extra.assigned_to ?? "",
      assigned_date: now,
      expected_return_date: null,
      returned_date: extra.returned_date ?? null,
      assignment_status: extra.assignment_status ?? "assigned",
      asset_status: extra.asset_status ?? "IN_USE",
      condition_before: extra.condition_before ?? "Good",
      condition_after: extra.condition_after ?? null,
      note: extra.note ?? "",
      signature_url: null,
      created_at: now,
      updated_at: now,
      created_by: employees[0]?.id ?? null,
      quantity: 1,
      serial_number:
        scanned.matchedSerial ?? currentTrackedAsset?.serial_number ?? "",
      priority: "medium",
      asset_code:
        extra.asset_code ??
        `AST-${Date.now().toString(36).slice(-6).toUpperCase()}`,
      approved_by: null,
      warehouse_id: extra.warehouse_id,
    };
    setAssets((prev) => [...prev, asset]);
  };

  const handleAssignSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    createAsset("EMPLOYEE", {
      assigned_to: form.get("employee_id") as string,
      note: form.get("note") as string,
      assignment_status: "assigned",
      asset_status: "IN_USE",
    });
    setActiveAction(null);
    setSuccessMessage("Asset assigned successfully.");
  };

  const handleWarehouseSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    createAsset("CHANGE_WAREHOUSE", {
      warehouse_id: form.get("warehouse_id") as string,
      note: form.get("note") as string,
      assignment_status: "pending",
      asset_status: "AVAILABLE",
      assigned_to: employees[0]?.id ?? "",
    });
    setActiveAction(null);
    setSuccessMessage("Warehouse change request created.");
  };

  const handleReturnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const today = new Date().toISOString().split("T")[0];
    createAsset("DEVICE_RECALL", {
      returned_date: today,
      condition_after: form.get("condition") as string,
      note: form.get("note") as string,
      assignment_status: "returned",
      asset_status: "AVAILABLE",
      assigned_to: currentTrackedAsset?.assigned_to ?? employees[0]?.id ?? "",
    });
    setActiveAction(null);
    setSuccessMessage("Asset marked as returned.");
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        {view === "detail" ? (
          <button
            type="button"
            onClick={resetToScanner}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground"
            aria-label="Back to scanner"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        )}
        <div className="flex-1">
          <h1 className="text-base font-semibold leading-tight">Scan Asset</h1>
          <p className="text-xs text-muted-foreground">
            {view === "scanner"
              ? "Point camera at QR code"
              : scanned?.item.item_name}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <QrCode className="h-5 w-5 text-primary" />
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 pb-28">
        {successMessage && (
          <div className="flex items-start gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-500">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{successMessage}</p>
          </div>
        )}

        {view === "scanner" && (
          <>
            <section
              aria-label="Camera scanner"
              className="relative overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="relative aspect-[3/4] bg-gradient-to-b from-secondary/80 to-background">
                <div className="absolute inset-0 opacity-30">
                  <div
                    className="h-full w-full"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
                    }}
                  />
                </div>

                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="relative h-56 w-56">
                    <span className="absolute left-0 top-0 h-8 w-8 rounded-tl-lg border-l-4 border-t-4 border-primary" />
                    <span className="absolute right-0 top-0 h-8 w-8 rounded-tr-lg border-r-4 border-t-4 border-primary" />
                    <span className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-lg border-b-4 border-l-4 border-primary" />
                    <span className="absolute bottom-0 right-0 h-8 w-8 rounded-br-lg border-b-4 border-r-4 border-primary" />
                    <div className="absolute inset-x-4 top-1/2 h-0.5 -translate-y-1/2 animate-pulse bg-primary/70" />
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-4 pt-12 text-center">
                  <ScanLine className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Align QR code within the frame
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    Camera integration coming soon — use demo codes below
                  </p>
                </div>
              </div>
            </section>

            <section aria-label="Manual entry" className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Keyboard className="h-4 w-4" />
                Enter code manually
              </div>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleScan(manualCode);
                }}
              >
                <Input
                  placeholder="Asset code, serial, or item code"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="h-12 flex-1 text-base"
                />
                <Button type="submit" className="h-12 px-5">
                  Go
                </Button>
              </form>
              {error && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}
            </section>

            <section aria-label="Demo codes" className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Quick demo scans
              </p>
              <div className="flex flex-wrap gap-2">
                {DEMO_CODES.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleScan(code)}
                    className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        {view === "detail" && scanned && (
          <>
            <section
              aria-label="Asset summary"
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="flex items-start gap-4 p-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold leading-tight">
                      {scanned.item.item_name}
                    </h2>
                    <Badge
                      className={
                        scanned.item.status === "active"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {scanned.item.status}
                    </Badge>
                  </div>
                  <p className="mt-1 font-mono text-sm text-primary">
                    {scanned.trackedAsset?.asset_code ?? scanned.item.item_code}
                  </p>
                  {scanned.matchedSerial && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Serial:{" "}
                      <span className="font-medium text-foreground">
                        {scanned.matchedSerial}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-px border-t border-border bg-border">
                {[
                  ["Brand", scanned.item.brand],
                  ["Model", scanned.item.model],
                  ["Category", category?.name ?? "—"],
                  ["Warehouse", warehouse?.name ?? "—"],
                ].map(([label, value]) => (
                  <div key={label} className="bg-card px-4 py-3">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="mt-0.5 truncate text-sm font-medium">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              {assignedEmployee && (
                <div className="border-t border-border px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    Currently assigned to
                  </p>
                  <p className="mt-0.5 text-sm font-medium">
                    {assignedEmployee.full_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {assignedEmployee.employee_code} · {assignedEmployee.position}
                  </p>
                </div>
              )}

              {currentTrackedAsset && (
                <div className="border-t border-border px-4 py-3">
                  <p className="text-xs text-muted-foreground">Asset status</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <Badge className="bg-blue-500/10 text-blue-500">
                      {currentTrackedAsset.asset_status}
                    </Badge>
                    <Badge className="bg-green-500/10 text-green-500 capitalize">
                      {currentTrackedAsset.assignment_status}
                    </Badge>
                  </div>
                </div>
              )}

              <div className="border-t border-border px-4 py-3">
                <p className="mb-2 text-xs text-muted-foreground">
                  Stock · {scanned.stock.available_quantity} available /{" "}
                  {scanned.stock.quantity} total
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(scanned.stock.serials)
                    ? scanned.stock.serials
                    : []
                  )
                    .slice(0, 6)
                    .map((s: { name: string; status?: string }) => (
                      <span
                        key={s.name}
                        className={`rounded-md px-2 py-0.5 text-xs font-medium ${getSerialStatusColor(s.status)}`}
                      >
                        {s.name}
                      </span>
                    ))}
                </div>
              </div>
            </section>

            <section aria-label="Quick actions" className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Quick actions
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSuccessMessage(null);
                    setActiveAction("assign");
                  }}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left transition-colors active:bg-accent"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                    <UserPlus className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Assign to Employee</p>
                    <p className="text-sm text-muted-foreground">
                      Hand over asset to a team member
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSuccessMessage(null);
                    setActiveAction("warehouse");
                  }}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left transition-colors active:bg-accent"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                    <ArrowRightLeft className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Change Warehouse</p>
                    <p className="text-sm text-muted-foreground">
                      Transfer stock to another location
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSuccessMessage(null);
                    setActiveAction("return");
                  }}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left transition-colors active:bg-accent"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                    <RotateCcw className="h-6 w-6 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Return Asset</p>
                    <p className="text-sm text-muted-foreground">
                      Record device return or recall
                    </p>
                  </div>
                </button>
              </div>
            </section>

            <Button
              variant="outline"
              className="h-12 w-full"
              onClick={resetToScanner}
            >
              <ScanLine className="mr-2 h-4 w-4" />
              Scan another asset
            </Button>
          </>
        )}
      </main>

      {activeAction && scanned && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close"
            onClick={() => setActiveAction(null)}
          />
          <div className="relative max-h-[85dvh] overflow-y-auto rounded-t-2xl border-t border-border bg-card p-4 pb-8 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {activeAction === "assign" && "Assign to Employee"}
                {activeAction === "warehouse" && "Change Warehouse"}
                {activeAction === "return" && "Return Asset"}
              </h2>
              <button
                type="button"
                onClick={() => setActiveAction(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-4 rounded-xl bg-secondary/50 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Item: </span>
              <span className="font-medium">{scanned.item.item_name}</span>
              {scanned.matchedSerial && (
                <span className="text-muted-foreground">
                  {" "}
                  · {scanned.matchedSerial}
                </span>
              )}
            </div>

            {activeAction === "assign" && (
              <form className="space-y-4" onSubmit={handleAssignSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="employee_id">Employee</Label>
                  <Select name="employee_id" required>
                    <SelectTrigger id="employee_id" className="h-12">
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees
                        .filter((e) => e.status === "active")
                        .map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.full_name} ({emp.employee_code})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assign_note">Note (optional)</Label>
                  <Textarea
                    id="assign_note"
                    name="note"
                    placeholder="Handed over at office..."
                    rows={2}
                  />
                </div>
                <Button type="submit" className="h-12 w-full text-base">
                  Confirm Assignment
                </Button>
              </form>
            )}

            {activeAction === "warehouse" && (
              <form className="space-y-4" onSubmit={handleWarehouseSubmit}>
                <div className="space-y-2">
                  <Label>Current warehouse</Label>
                  <div className="flex h-12 items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 text-sm">
                    <Warehouse className="h-4 w-4 text-muted-foreground" />
                    {warehouse?.name ?? "Unknown"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warehouse_id">Move to</Label>
                  <Select name="warehouse_id" required>
                    <SelectTrigger id="warehouse_id" className="h-12">
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses
                        .filter((w) => w.id !== scanned.stock.warehouse_id)
                        .map((wh) => (
                          <SelectItem key={wh.id} value={wh.id}>
                            {wh.name} ({wh.code})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wh_note">Reason (optional)</Label>
                  <Textarea
                    id="wh_note"
                    name="note"
                    placeholder="Relocating to branch office..."
                    rows={2}
                  />
                </div>
                <Button type="submit" className="h-12 w-full text-base">
                  Submit Transfer
                </Button>
              </form>
            )}

            {activeAction === "return" && (
              <form className="space-y-4" onSubmit={handleReturnSubmit}>
                {assignedEmployee && (
                  <div className="rounded-xl border border-border bg-secondary/30 p-3 text-sm">
                    <p className="text-muted-foreground">Returning from</p>
                    <p className="font-medium">{assignedEmployee.full_name}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition on return</Label>
                  <Select name="condition" defaultValue="Good" required>
                    <SelectTrigger id="condition" className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Fair">Fair — minor wear</SelectItem>
                      <SelectItem value="Damaged">Damaged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="return_note">Note (optional)</Label>
                  <Textarea
                    id="return_note"
                    name="note"
                    placeholder="Returned during offboarding..."
                    rows={2}
                  />
                </div>
                <Button
                  type="submit"
                  variant="destructive"
                  className="h-12 w-full text-base"
                >
                  Confirm Return
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

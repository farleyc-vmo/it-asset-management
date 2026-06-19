"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/lib/data-context";
import {
  AlertTriangle,
  Building2,
  CheckCircle,
  ClipboardList,
  Clock,
  Package,
  TrendingUp,
  Users,
  Warehouse,
} from "lucide-react";

export default function DashboardPage() {
  const {
    items,
    employees,
    departments,
    warehouses,
    assets,
    categories,
    stocks,
  } = useData();

  const activeItems = items.filter((a) => a.status === "active").length;

  const maintenanceAssets = stocks
    .flatMap((stock) => stock.serials)
    .filter((serial) => serial.status === "IN_USE").length;
  const activeEmployees = employees.filter((e) => e.status === "active").length;
  const pendingAssignments = assets.filter(
    (a) => a.assignment_status === "pending",
  ).length;
  const activeAssignments = assets.filter(
    (a) => a.assignment_status === "assigned",
  ).length;

  const totalAssetValue = 0;

  const stats = [
    {
      name: "Total Items",
      value: items.length,
      icon: Package,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      name: "Active Items",
      value: activeItems,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      name: "In Maintenance",
      value: maintenanceAssets,
      icon: AlertTriangle,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      name: "Employees",
      value: activeEmployees,
      icon: Users,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
    },
    {
      name: "Departments",
      value: departments.length,
      icon: Building2,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      name: "Warehouses",
      value: warehouses.length,
      icon: Warehouse,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      name: "Pending Assignments",
      value: pendingAssignments,
      icon: Clock,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
    },
    {
      name: "Active Assignments",
      value: activeAssignments,
      icon: ClipboardList,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
  ];

  const recentAssignments = assets
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 5);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your IT asset management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bgColor}`}
                >
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.name}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Total Asset Value */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Total Asset Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(totalAssetValue)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Across {items.length} items in {categories.length} categories
            </p>
          </CardContent>
        </Card>

        {/* Recent Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Recent Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAssignments.map((assignment) => {
                const employee = employees.find(
                  (e) => e.id === assignment.assigned_to,
                );
                return (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {assignment.asset_code}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {employee?.full_name || "Unknown"}
                      </p>
                    </div>
                    <Badge className={getStatusColor(assignment.asset_status)}>
                      {assignment.asset_status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asset Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Stock Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {["AVAILABLE", "DAMAGED", "IN_USE", "MAINTENANCE", "LOST"].map(
              (status) => {
                const count = assets.filter(
                  (a) => a.asset_status === status,
                ).length;
                const percentage =
                  assets.length > 0
                    ? ((count / assets.length) * 100).toFixed(1)
                    : 0;
                const colors: Record<string, string> = {
                  AVAILABLE: "bg-green-500",
                  IN_USE: "bg-blue-500",
                  MAINTENANCE: "bg-cyan-500",
                  DAMAGED: "bg-amber-500",
                  LOST: "bg-gray-500",
                };
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize text-muted-foreground">
                        {status.replace("_", " ")}
                      </span>
                      <span className="font-medium text-foreground">
                        {count}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${colors[status]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {percentage}%
                    </p>
                  </div>
                );
              },
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

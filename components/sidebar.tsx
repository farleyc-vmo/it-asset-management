"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  Box,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  History,
  Layers,
  LayoutDashboard,
  MapPin,
  Menu,
  Package,
  Shield,
  Users,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  {
    name: "Inventory",
    icon: Package,
    children: [
      {
        name: "Assets",
        href: "/assets",
      },
      { name: "Categories", href: "/categories", icon: Layers },
    ],
  },
  { name: "Warehouses", href: "/warehouses", icon: Warehouse },
  { name: "Stock", href: "/stock", icon: Box },
  { name: "Assignments", href: "/assignments", icon: ClipboardList },
  {
    name: "User Management",
    icon: Users,
    children: [
      {
        name: "Employees",
        href: "/employees",
        icon: Users,
      },
      {
        name: "Roles",
        href: "/roles",
        icon: Shield,
      },
    ],
  },
  { name: "Departments", href: "/departments", icon: Building2 },
  { name: "Locations", href: "/locations", icon: MapPin },
  { name: "Audit Logs", href: "/audit-logs", icon: History },
];

function SidebarContent({ collapsed = false }: { collapsed?: boolean }) {
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const pathname = usePathname();

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name],
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex h-16 items-center border-b border-border px-4",
          collapsed ? "justify-center" : "gap-3",
        )}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Package className="h-5 w-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              IT Assets
            </span>
            <span className="text-xs text-muted-foreground">Management</span>
          </div>
        )}
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navigation.map((item) => {
            const isOpen = openMenus.includes(item.name);

            if (item.children) {
              return (
                <div key={item.name}>
                  <Button
                    variant="ghost"
                    className="w-full justify-between"
                    onClick={() => toggleMenu(item.name)}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.name}</span>}
                    </div>

                    {!collapsed && (
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isOpen && "rotate-180",
                        )}
                      />
                    )}
                  </Button>

                  {isOpen && !collapsed && (
                    <div className="ml-7 mt-1 flex flex-col gap-1">
                      {item.children.map((child) => {
                        const isActive = pathname === child.href;

                        return (
                          <Link key={child.href} href={child.href}>
                            <Button
                              variant={isActive ? "secondary" : "ghost"}
                              size="sm"
                              className="w-full justify-start"
                            >
                              {child.name}
                            </Button>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = pathname === item.href;

            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3"
                >
                  <item.icon className="h-4 w-4" />
                  {!collapsed && <span>{item.name}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-40"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-border bg-card transition-all duration-300",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <SidebarContent collapsed={collapsed} />
        <div className="border-t border-border p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}

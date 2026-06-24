import { DataProvider } from "@/lib/data-context";

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DataProvider>
      <div className="min-h-dvh bg-background text-foreground">{children}</div>
    </DataProvider>
  );
}

export function InventoryHeader() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-bold tracking-tight">Inventory Status</h1>
      <p className="text-lg text-muted-foreground">
        View real-time stock levels across all products and variants
      </p>
    </div>
  );
}
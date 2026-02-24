export default function InventoryLoading() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      <p className="mt-4 text-slate-600">Loading inventory...</p>
    </div>
  );
}

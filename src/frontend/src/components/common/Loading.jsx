export function Loading({ text = 'Đang tải...' }) {
  return (
    <div className="flex items-center justify-center py-16 gap-3 text-ink-muted">
      <span className="animate-spin h-5 w-5 border-2 border-primary border-r-transparent rounded-full" />
      <span className="text-sm">{text}</span>
    </div>
  );
}

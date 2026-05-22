import { Inbox } from 'lucide-react';

export function EmptyState({ icon: Icon = Inbox, title = 'Chưa có dữ liệu', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-ink-muted mb-4">
        <Icon size={28} />
      </div>
      <h4 className="text-base font-semibold text-ink">{title}</h4>
      {description && <p className="text-sm text-ink-muted mt-1 max-w-md">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// Shared empty state component — ready to use, not wired anywhere yet
interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center" style={{ padding: '60px 24px' }}>
      <p className="font-semibold text-base mb-2">{title}</p>
      {description && (
        <p className="text-sm mb-5" style={{ color: '#9490b8' }}>{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="text-sm text-white border-0 rounded-lg cursor-pointer"
          style={{
            background: '#6c5ce7',
            padding: '10px 20px',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

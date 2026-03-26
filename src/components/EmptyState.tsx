// Shared empty state component — ready to use, not wired anywhere yet
interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
      <p style={{ fontWeight: 600, fontSize: '16px', margin: '0 0 8px' }}>{title}</p>
      {description && (
        <p style={{ color: '#9490b8', fontSize: '14px', margin: '0 0 20px' }}>{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          style={{
            background: '#6c5ce7',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

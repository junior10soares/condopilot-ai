export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border-border animate-fade-in-up flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-16 text-center">
      <p className="text-text text-base font-medium">{title}</p>
      {description ? <p className="text-muted mt-1 max-w-sm text-sm">{description}</p> : null}
    </div>
  );
}

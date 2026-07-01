/** Small uppercase section label with an optional trailing action. */
export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
        {title}
      </h2>
      {action}
    </div>
  );
}
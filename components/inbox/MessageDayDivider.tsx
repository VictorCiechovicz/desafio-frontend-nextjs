interface Props {
  label: string;
}

export function MessageDayDivider({ label }: Props) {
  return (
    <div role="separator" aria-label={label} className="flex justify-center py-2">
      <span className="rounded-md bg-card/80 px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm">
        {label}
      </span>
    </div>
  );
}

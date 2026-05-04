type EmptyCardProps = {
  message: string;
};

export function EmptyCard({ message }: EmptyCardProps) {
  return (
    <div className="rounded-[1.3rem] border border-dashed border-white/10 bg-white/[0.03] px-4 py-5 text-sm text-white/55">
      {message}
    </div>
  );
}

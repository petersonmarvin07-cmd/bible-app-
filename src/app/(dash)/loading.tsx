export default function DashboardLoading() {
  return (
    <div className="animate-fade space-y-6">
      <div className="space-y-3">
        <div className="skeleton h-3 w-28" />
        <div className="skeleton h-8 w-72" />
        <div className="skeleton h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="skeleton h-24 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="skeleton h-80 rounded-2xl" />
        <div className="space-y-4">
          <div className="skeleton h-36 rounded-2xl" />
          <div className="skeleton h-36 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

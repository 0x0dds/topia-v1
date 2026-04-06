export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="shimmer h-8 w-48 rounded-lg" />
      <div className="shimmer mt-3 h-4 w-72 rounded-lg" />
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="shimmer h-[300px] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

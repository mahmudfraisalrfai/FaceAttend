export function SessionsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow"
        >
          <div className="h-4 bg-gray-300 rounded w-1/12" />
          <div className="h-4 bg-gray-300 rounded w-3/12" />
          <div className="h-4 bg-gray-300 rounded w-2/12" />
          <div className="h-4 bg-gray-300 rounded w-2/12" />
          <div className="h-4 bg-gray-300 rounded w-1/12" />
        </div>
      ))}
    </div>
  );
}

export function LecturersSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow"
        >
          <div className="h-4 bg-gray-300 rounded w-1/12" />
          <div className="h-4 bg-gray-300 rounded w-3/12" />
          <div className="h-4 bg-gray-300 rounded w-3/12" />
          <div className="h-4 bg-gray-300 rounded w-2/12" />
          <div className="h-4 bg-gray-300 rounded w-1/12" />
        </div>
      ))}
    </div>
  );
}

export function AttendanceSkeleton() {
  const fakeRows = Array.from({ length: 5 });

  return (
    <>
      {fakeRows.map((_, index) => (
        <tr key={index} className="border-b">
          <td className="px-4 py-2">
            <div className="h-4 w-6 bg-gray-300 rounded"></div>
          </td>
          <td className="px-4 py-2">
            <div className="h-4 w-32 bg-gray-300 rounded"></div>
          </td>
          <td className="px-4 py-2">
            <div className="h-4 w-28 bg-gray-300 rounded"></div>
          </td>
          <td className="px-4 py-2">
            <div className="h-4 w-14 bg-gray-300 rounded"></div>
          </td>
        </tr>
      ))}
    </>
  );
}

export function DetailsSkeleton() {
  return (
    <>
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-gray-300 p-4 shadow-md bg-gray-100 animate-pulse space-y-4 mb-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="h-4 bg-gray-300 rounded w-3/4" />
            <div className="h-4 bg-gray-300 rounded w-2/3" />
            <div className="h-4 bg-gray-300 rounded w-1/2" />
            <div className="h-4 bg-gray-300 rounded w-2/3" />
            <div className="h-4 bg-gray-300 rounded w-1/3" />
            <div className="h-6 bg-gray-300 rounded w-24" />
          </div>

          <div className="flex justify-end">
            <div className="h-8 w-32 bg-gray-300 rounded-lg" />
          </div>
        </div>
      ))}
    </>
  );
}

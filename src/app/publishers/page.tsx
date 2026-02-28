import { apiFetch } from "@/lib/api";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Publisher = {
  id: number;
  name: string;
};

type SortField = "id" | "name";
type SortOrder = "asc" | "desc";

type PublishersPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getQueryValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function nextOrder(
  currentField: SortField,
  activeField: SortField,
  activeOrder: SortOrder,
): SortOrder {
  if (currentField !== activeField) {
    return "asc";
  }

  return activeOrder === "asc" ? "desc" : "asc";
}

function sortIndicator(
  field: SortField,
  activeField: SortField,
  activeOrder: SortOrder,
): string {
  if (field !== activeField) {
    return "";
  }

  return activeOrder === "asc" ? " ▲" : " ▼";
}

export default async function PublishersPage({
  searchParams,
}: PublishersPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const sortParam = getQueryValue(resolvedSearchParams.sort);
  const orderParam = getQueryValue(resolvedSearchParams.order);

  const sortField: SortField = sortParam === "name" ? "name" : "id";
  const sortOrder: SortOrder = orderParam === "desc" ? "desc" : "asc";

  let publishers: Publisher[] = [];

  try {
    publishers = await apiFetch<Publisher[]>("/api/v1/publishers");
    // console.log("[PublishersPage] /api/v1/publishers", publishers);
  } catch (error) {
    console.error("[PublishersPage] Failed to fetch publishers", error);
  }

  const sortedPublishers = [...publishers].sort((a, b) => {
    if (sortField === "id") {
      return sortOrder === "asc" ? a.id - b.id : b.id - a.id;
    }

    const comparison = a.name.localeCompare(b.name, undefined, {
      sensitivity: "base",
    });
    return sortOrder === "asc" ? comparison : -comparison;
  });

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold">Publishers</h1>
      <p className="mt-3 text-black/70">
        Manage and browse publishers from your library.
      </p>

      <div className="mt-6 w-[730px] max-w-full overflow-x-auto rounded-lg border border-black/10">
        <table className="w-full table-fixed text-left">
          <colgroup>
            <col className="w-[130px] max-w-[130px]" />
            <col className="w-[600px] max-w-[600px]" />
          </colgroup>
          <thead className="bg-black/5">
            <tr>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">
                <Link
                  href={`/publishers?sort=id&order=${nextOrder("id", sortField, sortOrder)}`}
                  className="inline-block hover:underline"
                >
                  ID{sortIndicator("id", sortField, sortOrder)}
                </Link>
              </th>
              <th className="px-4 py-3 font-semibold">
                <Link
                  href={`/publishers?sort=name&order=${nextOrder("name", sortField, sortOrder)}`}
                  className="inline-block hover:underline"
                >
                  Name{sortIndicator("name", sortField, sortOrder)}
                </Link>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPublishers.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-black/60">
                  No publishers found.
                </td>
              </tr>
            ) : (
              sortedPublishers.map((publisher) => (
                <tr key={publisher.id} className="border-t border-black/10">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {publisher.id}
                  </td>
                  <td className="px-4 py-3">{publisher.name}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

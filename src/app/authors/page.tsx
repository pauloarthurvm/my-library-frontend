import { apiFetch } from "@/lib/api";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Author = {
  id: number;
  fullname: string;
  books: unknown[];
};

type SortField = "id" | "fullname";
type SortOrder = "asc" | "desc";

type AuthorsPageProps = {
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

  return activeOrder === "asc" ? " ^" : " v";
}

export default async function AuthorsPage({ searchParams }: AuthorsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const sortParam = getQueryValue(resolvedSearchParams.sort);
  const orderParam = getQueryValue(resolvedSearchParams.order);

  const sortField: SortField = sortParam === "fullname" ? "fullname" : "id";
  const sortOrder: SortOrder = orderParam === "desc" ? "desc" : "asc";

  let authors: Author[] = [];

  try {
    authors = await apiFetch<Author[]>("/api/v1/authors");
    console.log("[AuthorsPage] /api/v1/authors", authors);
  } catch (error) {
    console.error("[AuthorsPage] Failed to fetch authors", error);
  }

  const sortedAuthors = [...authors].sort((a, b) => {
    if (sortField === "id") {
      return sortOrder === "asc" ? a.id - b.id : b.id - a.id;
    }

    const comparison = a.fullname.localeCompare(b.fullname, undefined, {
      sensitivity: "base",
    });
    return sortOrder === "asc" ? comparison : -comparison;
  });

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold">Authors</h1>
      <p className="mt-3 text-black/70">Manage and browse authors from your library.</p>

      <div className="mt-6 w-[870px] max-w-full overflow-x-auto rounded-lg border border-black/10">
        <table className="w-full table-fixed text-left">
          <colgroup>
            <col className="w-[130px] max-w-[130px]" />
            <col className="w-[600px] max-w-[600px]" />
            <col className="w-[140px] max-w-[140px]" />
          </colgroup>
          <thead className="bg-black/5">
            <tr>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">
                <Link
                  href={`/authors?sort=id&order=${nextOrder("id", sortField, sortOrder)}`}
                  className="inline-block hover:underline"
                >
                  ID{sortIndicator("id", sortField, sortOrder)}
                </Link>
              </th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">
                <Link
                  href={`/authors?sort=fullname&order=${nextOrder("fullname", sortField, sortOrder)}`}
                  className="inline-block hover:underline"
                >
                  Fullname{sortIndicator("fullname", sortField, sortOrder)}
                </Link>
              </th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">Details</th>
            </tr>
          </thead>
          <tbody>
            {sortedAuthors.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-black/60">
                  No authors found.
                </td>
              </tr>
            ) : (
              sortedAuthors.map((author) => (
                <tr key={author.id} className="border-t border-black/10">
                  <td className="px-4 py-3 whitespace-nowrap">{author.id}</td>
                  <td className="px-4 py-3">{author.fullname}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="text-sm font-medium underline-offset-2 hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

import { apiFetch } from "@/lib/api";
import Link from "next/link";

export const dynamic = "force-dynamic";

type BookAuthor = {
  id: number;
  fullname: string;
};

type Book = {
  id: number;
  title: string;
  publisherId: number;
  publisherName: string;
  authors: BookAuthor[];
};

type SortField = "id" | "title";
type SortOrder = "asc" | "desc";

type BooksPageProps = {
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

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const sortParam = getQueryValue(resolvedSearchParams.sort);
  const orderParam = getQueryValue(resolvedSearchParams.order);

  const sortField: SortField = sortParam === "title" ? "title" : "id";
  const sortOrder: SortOrder = orderParam === "desc" ? "desc" : "asc";

  let books: Book[] = [];

  try {
    const response = await apiFetch<Book[]>("/api/v1/books");
    books = response.map((book) => ({
      ...book,
      authors: Array.isArray(book.authors)
        ? book.authors.map((author) => ({
            id: Number(author.id),
            fullname: String(author.fullname),
          }))
        : [],
    }));
    console.log("[BooksPage] /api/v1/books", JSON.stringify(books, null, 2));
  } catch (error) {
    console.error("[BooksPage] Failed to fetch books", error);
  }

  const sortedBooks = [...books].sort((a, b) => {
    if (sortField === "id") {
      return sortOrder === "asc" ? a.id - b.id : b.id - a.id;
    }

    const comparison = a.title.localeCompare(b.title, undefined, {
      sensitivity: "base",
    });
    return sortOrder === "asc" ? comparison : -comparison;
  });

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold">Books</h1>
      <p className="mt-3 text-black/70">Manage and browse books from your library.</p>

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
                  href={`/books?sort=id&order=${nextOrder("id", sortField, sortOrder)}`}
                  className="inline-block hover:underline"
                >
                  ID{sortIndicator("id", sortField, sortOrder)}
                </Link>
              </th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">
                <Link
                  href={`/books?sort=title&order=${nextOrder("title", sortField, sortOrder)}`}
                  className="inline-block hover:underline"
                >
                  Title{sortIndicator("title", sortField, sortOrder)}
                </Link>
              </th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">Details</th>
            </tr>
          </thead>
          <tbody>
            {sortedBooks.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-black/60">
                  No books found.
                </td>
              </tr>
            ) : (
              sortedBooks.map((book) => (
                <tr key={book.id} className="border-t border-black/10">
                  <td className="px-4 py-3 whitespace-nowrap">{book.id}</td>
                  <td className="px-4 py-3">{book.title}</td>
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

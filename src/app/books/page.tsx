import { apiFetch } from "@/lib/api";
import BooksTable from "./BooksTable";

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
      <BooksTable books={sortedBooks} sortField={sortField} sortOrder={sortOrder} />
    </section>
  );
}

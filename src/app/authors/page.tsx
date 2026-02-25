import { apiFetch } from "@/lib/api";
import AuthorsTable from "./AuthorsTable";

export const dynamic = "force-dynamic";

type AuthorBook = {
  id: number;
  title: string;
};

type Author = {
  id: number;
  fullname: string;
  books: AuthorBook[];
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

export default async function AuthorsPage({ searchParams }: AuthorsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const sortParam = getQueryValue(resolvedSearchParams.sort);
  const orderParam = getQueryValue(resolvedSearchParams.order);

  const sortField: SortField = sortParam === "fullname" ? "fullname" : "id";
  const sortOrder: SortOrder = orderParam === "desc" ? "desc" : "asc";

  let authors: Author[] = [];

  try {
    const response = await apiFetch<Author[]>("/api/v1/authors");
    authors = response.map((author) => ({
      ...author,
      books: Array.isArray(author.books)
        ? author.books.map((book) => ({
            id: Number(book.id),
            title: String(book.title),
          }))
        : [],
    }));
    console.log("[AuthorsPage] /api/v1/authors", JSON.stringify(authors, null, 2));
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
      <AuthorsTable authors={sortedAuthors} sortField={sortField} sortOrder={sortOrder} />
    </section>
  );
}

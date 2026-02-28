"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

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

type AuthorsTableProps = {
  authors: Author[];
  sortField: SortField;
  sortOrder: SortOrder;
};

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

export default function AuthorsTable({
  authors,
  sortField,
  sortOrder,
}: AuthorsTableProps) {
  const router = useRouter();
  const [selectedAuthorId, setSelectedAuthorId] = useState<number | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const selectedAuthor = useMemo(
    () => authors.find((author) => author.id === selectedAuthorId) ?? null,
    [authors, selectedAuthorId],
  );

  async function handleDelete(authorId: number) {
    try {
      const response = await fetch(`/api/v1/authors/${authorId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        let message = `Delete failed (${response.status} ${response.statusText})`;

        try {
          const body = (await response.json()) as { message?: unknown };

          if (typeof body.message === "string" && body.message.trim()) {
            message = body.message;
          }
        } catch {
          // Fall back to the HTTP status message when the response is not JSON.
        }

        window.alert(message);
        return;
      }

      setSelectedAuthorId(null);
      router.refresh();
    } catch {
      window.alert("Delete failed unexpectedly.");
    }
  }

  return (
    <>
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
              <th className="px-4 py-3 font-semibold whitespace-nowrap">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {authors.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-black/60">
                  No authors found.
                </td>
              </tr>
            ) : (
              authors.map((author) => (
                <tr key={author.id} className="border-t border-black/10">
                  <td className="px-4 py-3 whitespace-nowrap">{author.id}</td>
                  <td className="px-4 py-3">{author.fullname}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="text-sm font-medium underline-offset-2 hover:underline"
                      disabled={isDeleting}
                      onClick={() =>
                        setSelectedAuthorId((currentId) =>
                          currentId === author.id ? null : author.id,
                        )
                      }
                    >
                      {selectedAuthorId === author.id ? "Close" : "View"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedAuthor ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="author-details-title"
          onClick={() => setSelectedAuthorId(null)}
        >
          <article
            className="w-full max-w-xl rounded-lg border border-black/10 bg-white p-5 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id="author-details-title" className="text-lg font-semibold">
                {selectedAuthor.fullname}
              </h2>
              <button
                type="button"
                className="rounded border border-black/15 px-2 py-1 text-sm hover:bg-black/5"
                disabled={isDeleting}
                onClick={() => setSelectedAuthorId(null)}
              >
                Close
              </button>
            </div>
            <p className="mt-3 text-sm">
              <span className="font-medium">ID:</span> {selectedAuthor.id}
            </p>
            <div className="mt-2 text-sm">
              <p>
                <span className="font-medium">Books:</span>
              </p>
              {selectedAuthor.books.length === 0 ? (
                <p className="mt-1 text-black/60">No books.</p>
              ) : (
                <ul className="mt-1 list-disc pl-5">
                  {selectedAuthor.books.map((book) => (
                    <li key={book.id}>
                      {book.title} ({book.id})
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isDeleting}
                onClick={() => {
                  if (!selectedAuthor) {
                    return;
                  }

                  startDeleteTransition(() => {
                    void handleDelete(selectedAuthor.id);
                  });
                }}
              >
                {isDeleting ? "Deleting..." : "Delete author"}
              </button>
            </div>
          </article>
        </div>
      ) : null}
    </>
  );
}

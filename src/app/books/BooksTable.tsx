"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

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

type BooksTableProps = {
  books: Book[];
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

export default function BooksTable({
  books,
  sortField,
  sortOrder,
}: BooksTableProps) {
  const router = useRouter();
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const selectedBook = useMemo(
    () => books.find((book) => book.id === selectedBookId) ?? null,
    [books, selectedBookId],
  );

  async function handleDelete(bookId: number) {
    setDeleteError(null);

    try {
      const response = await fetch(`/api/v1/books/${bookId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Delete failed (${response.status} ${response.statusText})`);
      }

      setSelectedBookId(null);
      router.refresh();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Delete failed unexpectedly.",
      );
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
              <th className="px-4 py-3 font-semibold whitespace-nowrap">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {books.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-black/60">
                  No books found.
                </td>
              </tr>
            ) : (
              books.map((book) => (
                <tr key={book.id} className="border-t border-black/10">
                  <td className="px-4 py-3 whitespace-nowrap">{book.id}</td>
                  <td className="px-4 py-3">{book.title}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="text-sm font-medium underline-offset-2 hover:underline"
                      disabled={isDeleting}
                      onClick={() =>
                        setSelectedBookId((currentId) =>
                          currentId === book.id ? null : book.id,
                        )
                      }
                    >
                      {selectedBookId === book.id ? "Close" : "View"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedBook ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="book-details-title"
          onClick={() => setSelectedBookId(null)}
        >
          <article
            className="w-full max-w-xl rounded-lg border border-black/10 bg-white p-5 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id="book-details-title" className="text-lg font-semibold">
                {selectedBook.title}
              </h2>
              <button
                type="button"
                className="rounded border border-black/15 px-2 py-1 text-sm hover:bg-black/5"
                disabled={isDeleting}
                onClick={() => setSelectedBookId(null)}
              >
                Close
              </button>
            </div>
            <p className="mt-3 text-sm">
              <span className="font-medium">ID:</span> {selectedBook.id}
            </p>
            <p className="mt-1 text-sm">
              <span className="font-medium">Publisher:</span>{" "}
              {selectedBook.publisherName} ({selectedBook.publisherId})
            </p>
            <div className="mt-2 text-sm">
              <p>
                <span className="font-medium">Authors:</span>
              </p>
              {selectedBook.authors.length === 0 ? (
                <p className="mt-1 text-black/60">No authors.</p>
              ) : (
                <ul className="mt-1 list-disc pl-5">
                  {selectedBook.authors.map((author) => (
                    <li key={author.id}>
                      {author.fullname} ({author.id})
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {deleteError ? (
              <p className="mt-4 text-sm text-red-700">{deleteError}</p>
            ) : null}
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isDeleting}
                onClick={() => {
                  if (!selectedBook) {
                    return;
                  }

                  startDeleteTransition(() => {
                    void handleDelete(selectedBook.id);
                  });
                }}
              >
                {isDeleting ? "Deleting..." : "Delete book"}
              </button>
            </div>
          </article>
        </div>
      ) : null}
    </>
  );
}

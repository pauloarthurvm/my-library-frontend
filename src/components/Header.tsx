export function Header() {
  return (
    <header className="border-b border-black/10 px-6 py-4">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-3 items-center">
        <div className="text-xl font-bold">MyLibrary</div>

        <nav className="col-start-2 flex items-center justify-center gap-3">
          <button className="rounded-md border border-black/15 px-4 py-2 text-sm font-medium transition hover:bg-black/5">
            Books
          </button>
          <button className="rounded-md border border-black/15 px-4 py-2 text-sm font-medium transition hover:bg-black/5">
            Publishers
          </button>
          <button className="rounded-md border border-black/15 px-4 py-2 text-sm font-medium transition hover:bg-black/5">
            Authors
          </button>
        </nav>

        <div aria-hidden="true" />
      </div>
    </header>
  );
}

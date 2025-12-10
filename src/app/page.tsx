"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Contact } from "@/types/contact";

type RecentSearch = {
  q: string;
  department?: string;
  location?: string;
};

const MAX_RECENT_SEARCHES = 8;
const SUGGESTION_LIMIT = 6;

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const Highlight = ({ text, query }: { text: string; query: string }) => {
  if (!query) return <span>{text}</span>;
  const regex = new RegExp(escapeRegExp(query), "ig");
  const parts = text.split(regex);
  const matches = text.match(regex) ?? [];

  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {part}
          {matches[index] ? <mark>{matches[index]}</mark> : null}
        </Fragment>
      ))}
    </>
  );
};

const ActionButton = ({ href, label }: { href: string; label: string }) => (
  <a
    href={href}
    onClick={(event) => event.stopPropagation()}
    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-50 transition hover:border-white/30 hover:bg-white/10"
    target={href.startsWith("http") ? "_blank" : undefined}
    rel={href.startsWith("http") ? "noreferrer" : undefined}
  >
    {label}
  </a>
);

const ContactCard = ({
  contact,
  query,
  isFavorite,
  onOpenProfile,
  onToggleFavorite,
}: {
  contact: Contact;
  query: string;
  isFavorite: boolean;
  onOpenProfile: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}) => {
  const languages = contact.languages?.join(", ");

  return (
    <article
      onClick={() => onOpenProfile(contact.id)}
      className="group relative flex cursor-pointer flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
            {contact.department ?? "Team"} • {contact.location ?? "Remote"}
          </p>
          <h3 className="text-xl font-semibold text-white">
            <Highlight
              text={`${contact.firstName} ${contact.lastName}`}
              query={query}
            />
          </h3>
          <p className="text-sm text-slate-200">
            <Highlight
              text={contact.jobTitle ?? "Teammate"}
              query={query}
            />
          </p>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite(contact.id);
          }}
          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
            isFavorite
              ? "border-amber-300/70 bg-amber-300/20 text-amber-100"
              : "border-white/10 bg-white/5 text-slate-100 hover:border-white/30"
          }`}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? "Remove from favourites" : "Save to favourites"}
        >
          {isFavorite ? "Pinned" : "Pin"}
        </button>
      </div>

      <div className="grid gap-2 text-sm text-slate-200 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Email</span>
          <span className="font-medium">
            <Highlight text={contact.email} query={query} />
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Phone</span>
          <span className="font-medium">
            {contact.phone ? (
              <Highlight text={contact.phone} query={query} />
            ) : (
              "—"
            )}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Office</span>
          <span className="font-medium">{contact.office ?? "—"}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Languages</span>
          <span className="font-medium">{languages ?? "—"}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <ActionButton href={`mailto:${contact.email}`} label="Email" />
        {contact.phone ? (
          <ActionButton
            href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}
            label="Call"
          />
        ) : null}
        <ActionButton
          href={`https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(
            contact.email,
          )}`}
          label="Chat"
        />
        <Link
          onClick={(event) => event.stopPropagation()}
          href={`/person/${contact.id}`}
          className="rounded-full border border-white/0 px-3 py-2 text-xs font-semibold text-emerald-200 transition hover:border-emerald-200/60 hover:bg-emerald-400/10"
        >
          View profile
        </Link>
      </div>
    </article>
  );
};

const ContactRow = ({
  contact,
  query,
  isFavorite,
  onOpenProfile,
  onToggleFavorite,
}: {
  contact: Contact;
  query: string;
  isFavorite: boolean;
  onOpenProfile: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}) => (
  <div className="grid cursor-pointer grid-cols-[1.3fr,1fr,1fr,1.2fr,0.9fr,auto] items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 transition hover:border-white/30 hover:bg-white/10 max-md:grid-cols-1 max-md:items-start max-md:gap-2.5">
    <button
      type="button"
      onClick={() => onOpenProfile(contact.id)}
      className="flex min-w-0 items-center gap-2 text-left"
    >
      <span className="truncate font-semibold" title={`${contact.firstName} ${contact.lastName}`}>
        <Highlight
          text={`${contact.firstName} ${contact.lastName}`}
          query={query}
        />
      </span>
    </button>
    <span className="truncate text-xs uppercase tracking-[0.18em] text-slate-300" title={`${contact.department ?? "Team"} • ${contact.location ?? "Remote"}`}>
      {(contact.department ?? "Team") + " • " + (contact.location ?? "Remote")}
    </span>
    <span className="truncate text-sm font-medium text-slate-100" title={contact.jobTitle ?? "Teammate"}>
      <Highlight text={contact.jobTitle ?? "Teammate"} query={query} />
    </span>
    <span className="truncate text-sm font-medium text-slate-100" title={contact.email}>
      <Highlight text={contact.email} query={query} />
    </span>
    <span className="truncate text-sm font-medium text-slate-100" title={contact.phone ?? "—"}>
      {contact.phone ? <Highlight text={contact.phone} query={query} /> : "—"}
    </span>
    <div className="flex flex-wrap items-center justify-end gap-1.5 max-md:justify-start">
      <ActionButton href={`mailto:${contact.email}`} label="Email" />
      {contact.phone ? (
        <ActionButton
          href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}
          label="Call"
        />
      ) : null}
      <ActionButton
        href={`https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(
          contact.email,
        )}`}
        label="Chat"
      />
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onToggleFavorite(contact.id);
        }}
        className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
          isFavorite
            ? "border-amber-300/70 bg-amber-300/20 text-amber-100"
            : "border-white/10 bg-white/5 text-slate-100 hover:border-white/30"
        }`}
        aria-pressed={isFavorite}
      >
        {isFavorite ? "Pinned" : "Pin"}
      </button>
    </div>
  </div>
);

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const latestRequestId = useRef(0);

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [department, setDepartment] = useState(
    searchParams.get("department") ?? "",
  );
  const [location, setLocation] = useState(searchParams.get("location") ?? "");
  const [results, setResults] = useState<Contact[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");

  const suggestions = useMemo(
    () => results.slice(0, SUGGESTION_LIMIT),
    [results],
  );

  const favoriteContacts = useMemo(
    () => allContacts.filter((contact) => favorites.includes(contact.id)),
    [allContacts, favorites],
  );

  const filterOptions = useMemo(() => {
    const departments = new Set<string>();
    const locations = new Set<string>();
    (allContacts.length ? allContacts : results).forEach((contact) => {
      if (contact.department) departments.add(contact.department);
      if (contact.location) locations.add(contact.location);
    });

    return {
      departments: Array.from(departments).sort(),
      locations: Array.from(locations).sort(),
    };
  }, [allContacts, results]);

  const addRecentSearch = useCallback((entry: RecentSearch) => {
    if (!entry.q && !entry.department && !entry.location) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (item) =>
          item.q !== entry.q ||
          item.department !== entry.department ||
          item.location !== entry.location,
      );
      return [entry, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [id, ...prev],
    );
  }, []);

  const openContact = useCallback(
    (id: string) => {
      router.push(`/person/${id}`);
    },
    [router],
  );

  const performSearch = useCallback(async () => {
    const trimmedQuery = query.trim();
    const requestId = Date.now();
    latestRequestId.current = requestId;
    setIsLoading(true);

    const params = new URLSearchParams();
    if (trimmedQuery) params.set("q", trimmedQuery);
    if (department) params.set("department", department);
    if (location) params.set("location", location);
    params.set("limit", "60");

    try {
      const response = await fetch(`/api/contacts?${params.toString()}`, {
        cache: "no-store",
      });
      const payload: Contact[] = await response.json();
      if (latestRequestId.current === requestId) {
        setResults(payload);
        if (trimmedQuery || department || location) {
          addRecentSearch({
            q: trimmedQuery,
            department: department || undefined,
            location: location || undefined,
          });
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Search failed", error);
      }
    } finally {
      if (latestRequestId.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [addRecentSearch, department, location, query]);

  useEffect(() => {
    const storedFavorites = localStorage.getItem("yp-favorites");
    const storedRecent = localStorage.getItem("yp-recent-searches");
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites));
      } catch {
        setFavorites([]);
      }
    }
    if (storedRecent) {
      try {
        setRecentSearches(JSON.parse(storedRecent));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("yp-favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("yp-recent-searches", JSON.stringify(recentSearches));
  }, [recentSearches]);

  useEffect(() => {
    let ignore = false;
    const loadAllContacts = async () => {
      try {
        const response = await fetch("/api/contacts", { cache: "no-store" });
        const payload: Contact[] = await response.json();
        if (!ignore) setAllContacts(payload);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Unable to load contacts", error);
        }
      }
    };
    loadAllContacts();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (department) params.set("department", department);
    if (location) params.set("location", location);
    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : "/", { scroll: false });
  }, [department, location, query, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void performSearch();
    }, 260);
    return () => clearTimeout(timer);
  }, [performSearch]);

  useEffect(() => {
    const handleSlashShortcut = (event: KeyboardEvent) => {
      if (event.key === "/" && !event.metaKey && !event.ctrlKey) {
        const tag =
          (document.activeElement as HTMLElement | null)?.tagName.toLowerCase() ??
          "";
        if (tag === "input" || tag === "textarea") return;
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleSlashShortcut);
    return () => window.removeEventListener("keydown", handleSlashShortcut);
  }, []);

  useEffect(() => {
    setActiveIndex(-1);
  }, [query, department, location]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void performSearch();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      if (!suggestions.length) return;
      event.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (event.key === "ArrowUp") {
      if (!suggestions.length) return;
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      const target = suggestions[activeIndex];
      if (target) openContact(target.id);
    }
  };

  const clearFilters = () => {
    setQuery("");
    setDepartment("");
    setLocation("");
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(128,255,219,0.09),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.04),transparent_20%)]" />

      <main className="relative mx-auto max-w-6xl px-4 py-12 sm:px-8">
        <header className="mb-8 flex flex-col gap-4">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
            Yellow Pages demo
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Find anyone in 2–3 keystrokes.
            </h1>
            <p className="max-w-3xl text-lg text-slate-200">
              Search-as-you-type, quick filters, and one-click actions to email,
              call, or chat. Works great on desktop and mobile for a fast demo.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-slate-200">
            <span className="rounded-full bg-white/5 px-3 py-1">
              ⌨ / to focus
            </span>
            <span className="rounded-full bg-white/5 px-3 py-1">
              ↑↓ to browse suggestions
            </span>
            <span className="rounded-full bg-white/5 px-3 py-1">
              Favourites + recent searches
            </span>
            <span className="rounded-full bg-white/5 px-3 py-1">
              Deep links via query params
            </span>
          </div>
        </header>

        <section className="relative mb-8 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <label className="text-xs text-slate-300">Search</label>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Name, email, department, location…"
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-base text-white shadow-inner outline-none transition focus:border-emerald-300/60 focus:bg-white/15"
                />
                <span className="pointer-events-none absolute right-3 top-8 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-300">
                  /
                </span>
              </div>
              <div className="grid flex-shrink-0 gap-3 md:w-80 md:grid-cols-2">
                <div>
                  <label className="text-xs text-slate-300">Department</label>
                  <select
                    value={department}
                    onChange={(event) => setDepartment(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/20 bg-slate-900/80 px-3 py-3 text-sm text-white shadow-inner outline-none transition focus:border-emerald-300/70 focus:bg-white/10 focus:ring-2 focus:ring-emerald-300/25"
                  >
                    <option value="">All</option>
                    {filterOptions.departments.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300">Location</label>
                  <select
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/20 bg-slate-900/80 px-3 py-3 text-sm text-white shadow-inner outline-none transition focus:border-emerald-300/70 focus:bg-white/10 focus:ring-2 focus:ring-emerald-300/25"
                  >
                    <option value="">Anywhere</option>
                    {filterOptions.locations.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
              >
                Show full results
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-white/40 hover:bg-white/10"
              >
                Clear all
              </button>
              {isLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
                  Searching…
                </div>
              ) : null}
            </div>
          </form>

          {query.trim().length >= 2 && suggestions.length > 0 ? (
            <div className="absolute left-0 right-0 top-[calc(100%-12px)] z-20 mx-4 rounded-2xl border border-white/10 bg-slate-900/95 shadow-xl backdrop-blur">
              {suggestions.map((contact, index) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => openContact(contact.id)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition ${
                    index === activeIndex ? "bg-white/10" : "hover:bg-white/5"
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-white">
                      <Highlight
                        text={`${contact.firstName} ${contact.lastName}`}
                        query={query}
                      />
                    </p>
                    <p className="text-xs text-slate-300">
                      {contact.department ?? "Team"} • {contact.location ?? "Remote"}
                    </p>
                  </div>
                  <span className="text-[11px] uppercase text-emerald-200">
                    Enter
                  </span>
                </button>
              ))}
              <div className="border-t border-white/5 px-4 py-2 text-xs text-slate-300">
                Suggestions refresh as you type. Press Enter to open highlighted
                contact or keep typing for the full list.
              </div>
            </div>
          ) : null}
        </section>

        {recentSearches.length > 0 ? (
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-200">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Recent
            </span>
            {recentSearches.map((entry, index) => (
              <button
                key={`${entry.q}-${entry.department ?? "all"}-${
                  entry.location ?? "all"
                }-${index}`}
                onClick={() => {
                  setQuery(entry.q);
                  setDepartment(entry.department ?? "");
                  setLocation(entry.location ?? "");
                  inputRef.current?.focus();
                }}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold transition hover:border-white/30 hover:bg-white/10"
              >
                {[entry.q || "Any", entry.department, entry.location]
                  .filter(Boolean)
                  .join(" • ")}
              </button>
            ))}
          </div>
        ) : null}

        {(department || location) && (
          <div className="mb-4 flex flex-wrap gap-2 text-xs text-slate-200">
            {department ? (
              <button
                onClick={() => setDepartment("")}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 transition hover:border-white/40 hover:bg-white/10"
              >
                Department: {department}
                <span className="text-slate-400">✕</span>
              </button>
            ) : null}
            {location ? (
              <button
                onClick={() => setLocation("")}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 transition hover:border-white/40 hover:bg-white/10"
              >
                Location: {location}
                <span className="text-slate-400">✕</span>
              </button>
            ) : null}
          </div>
        )}

        {favoriteContacts.length > 0 ? (
          <section className="mb-8 rounded-3xl border border-amber-200/20 bg-amber-200/5 p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-amber-200">
                  Favourites
                </p>
                <p className="text-base text-amber-50/90">
                  Quick pins you starred earlier.
                </p>
              </div>
              <button
                onClick={() => setFavorites([])}
                className="rounded-full border border-amber-200/40 px-3 py-1 text-xs font-semibold text-amber-50 transition hover:border-amber-200/70 hover:bg-amber-200/10"
              >
                Clear
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {favoriteContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  query={query}
                  isFavorite
                  onOpenProfile={openContact}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </section>
        ) : null}

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Results
              </p>
              <h2 className="text-2xl font-semibold">
                {query ? `Matches for "${query}"` : "Everyone"}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-xs font-semibold text-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode("cards")}
                  className={`rounded-full px-3 py-1 transition ${
                    viewMode === "cards"
                      ? "bg-white/20 text-white"
                      : "hover:bg-white/10"
                  }`}
                  aria-pressed={viewMode === "cards"}
                >
                  Cards
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`rounded-full px-3 py-1 transition ${
                    viewMode === "list"
                      ? "bg-white/20 text-white"
                      : "hover:bg-white/10"
                  }`}
                  aria-pressed={viewMode === "list"}
                >
                  List
                </button>
              </div>
              <span className="text-sm text-slate-300">
                {results.length} people
              </span>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-200">
              No contacts found. Try a different spelling (typos are tolerated) or
              clear filters.
            </div>
          ) : viewMode === "cards" ? (
            <div className="grid gap-4 md:grid-cols-2">
              {results.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  query={query}
                  isFavorite={favorites.includes(contact.id)}
                  onOpenProfile={openContact}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="grid grid-cols-[1.3fr,1fr,1fr,1.2fr,0.9fr,auto] items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300 max-md:hidden">
                <span>Name</span>
                <span>Dept / Location</span>
                <span>Role</span>
                <span>Email</span>
                <span>Phone</span>
                <span className="text-right">Actions</span>
              </div>
              <div className="space-y-1.5">
                {results.map((contact) => (
                  <ContactRow
                    key={contact.id}
                    contact={contact}
                    query={query}
                    isFavorite={favorites.includes(contact.id)}
                    onOpenProfile={openContact}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

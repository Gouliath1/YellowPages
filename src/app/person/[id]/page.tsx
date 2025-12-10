import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { contacts, getContactById } from "@/lib/search";
import type { Contact } from "@/types/contact";

export const revalidate = 0;

export const generateStaticParams = () =>
  contacts.map((contact) => ({ id: contact.id }));

export const generateMetadata = ({
  params,
}: {
  params: { id: string };
}): Metadata => {
  const contact = getContactById(params.id);
  if (!contact) return { title: "Person not found" };
  return {
    title: `${contact.firstName} ${contact.lastName} – Yellow Pages`,
  };
};

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: string | undefined;
}) => (
  <div className="flex flex-col gap-1 rounded-xl border border-white/10 bg-white/5 p-3">
    <span className="text-xs uppercase tracking-[0.15em] text-slate-400">
      {label}
    </span>
    <span className="text-base text-white">{value ?? "—"}</span>
  </div>
);

const ContactConnections = ({
  title,
  people,
}: {
  title: string;
  people: Contact[];
}) => {
  if (!people.length) return null;
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.15em] text-slate-400">
        {title}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {people.map((person) => (
          <Link
            key={person.id}
            href={`/person/${person.id}`}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-emerald-100 transition hover:border-emerald-200/60 hover:bg-emerald-400/10"
          >
            {person.firstName} {person.lastName}
          </Link>
        ))}
      </div>
    </div>
  );
};

const PersonPage = ({ params }: { params: { id: string } }) => {
  const contact = getContactById(params.id);

  if (!contact) return notFound();

  const manager = contact.managerId ? getContactById(contact.managerId) : null;
  const reports = (contact.reports ?? [])
    .map((id) => getContactById(id))
    .filter(Boolean) as Contact[];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 transition hover:text-emerald-100"
      >
        ← Back to search
      </Link>

      <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-300">
              {contact.department ?? "Team"} • {contact.location ?? "Remote"}
            </p>
            <h1 className="text-3xl font-semibold text-white">
              {contact.firstName} {contact.lastName}
            </h1>
            <p className="text-lg text-slate-200">{contact.jobTitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300"
              href={`mailto:${contact.email}`}
            >
              Email
            </a>
            {contact.phone ? (
              <a
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
                href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}
              >
                Call
              </a>
            ) : null}
            <a
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
              href={`https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(
                contact.email,
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              Chat
            </a>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <InfoRow label="Email" value={contact.email} />
          <InfoRow label="Phone" value={contact.phone} />
          <InfoRow label="Office" value={contact.office} />
          <InfoRow label="Languages" value={contact.languages?.join(", ")} />
          <InfoRow label="Time zone" value={contact.timeZone} />
          <InfoRow label="Nicknames" value={contact.nicknames?.join(", ")} />
        </div>

        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <ContactConnections
            title="Manager"
            people={manager ? [manager] : []}
          />
          <ContactConnections title="Direct reports" people={reports} />
        </div>
      </div>
    </div>
  );
};

export default PersonPage;

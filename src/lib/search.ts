import contactsData from "@/data/contacts.json";
import { Contact, ContactFilters } from "@/types/contact";

const accentRegex = /[\u0300-\u036f]/g;

export const contacts: Contact[] = contactsData;

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(accentRegex, "")
    .toLowerCase()
    .trim();

const levenshtein = (a: string, b: string) => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const column = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let i = 1; i <= a.length; i += 1) {
    let prevDiagonal = column[0];
    column[0] = i;

    for (let j = 1; j <= b.length; j += 1) {
      const temp = column[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      column[j] = Math.min(
        column[j] + 1,
        column[j - 1] + 1,
        prevDiagonal + cost,
      );
      prevDiagonal = temp;
    }
  }

  return column[b.length];
};

const scoreField = (value: string | undefined, query: string) => {
  if (!value || !query) return 0;
  const target = normalize(value);
  if (!target) return 0;

  if (target === query) return 10;
  if (target.startsWith(query)) return 8;
  if (target.includes(query)) return 5;

  const distance = levenshtein(target, query);
  if (query.length >= 3 && distance === 1) return 4;
  if (query.length >= 5 && distance === 2) return 2;

  return 0;
};

const computeContactScore = (contact: Contact, query: string) => {
  const fieldsToCheck: Array<string | undefined> = [
    contact.firstName,
    contact.lastName,
    `${contact.firstName} ${contact.lastName}`,
    contact.email,
    contact.department,
    contact.location,
    contact.jobTitle,
    contact.office,
    ...(contact.nicknames ?? []),
  ];

  return fieldsToCheck.reduce(
    (best, value) => Math.max(best, scoreField(value, query)),
    0,
  );
};

export const searchContacts = ({
  q = "",
  department,
  location,
  limit,
}: ContactFilters & { limit?: number }) => {
  const normalizedQuery = normalize(q);

  const results = contacts
    .map((contact) => {
      const baseScore = normalizedQuery ? computeContactScore(contact, normalizedQuery) : 1;
      const matchesQuery = normalizedQuery ? baseScore > 0 : true;
      const matchesDepartment = department ? contact.department === department : true;
      const matchesLocation = location ? contact.location === location : true;
      const matchesAll = matchesQuery && matchesDepartment && matchesLocation;

      const boostedScore = baseScore +
        (department && contact.department === department ? 1 : 0) +
        (location && contact.location === location ? 1 : 0);

      return {
        contact,
        score: matchesAll ? boostedScore : 0,
        matchesAll,
      };
    })
    .filter((entry) => entry.matchesAll)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.contact.lastName.localeCompare(b.contact.lastName);
    });

  const trimmed = limit && limit > 0 ? results.slice(0, limit) : results.slice();

  return trimmed.map((entry) => entry.contact);
};

export const getContactById = (id: string) =>
  contacts.find((contact) => contact.id === id);

export const getFilterOptions = () => {
  const departments = new Set<string>();
  const locations = new Set<string>();

  contacts.forEach((contact) => {
    if (contact.department) departments.add(contact.department);
    if (contact.location) locations.add(contact.location);
  });

  return {
    departments: Array.from(departments).sort(),
    locations: Array.from(locations).sort(),
  };
};

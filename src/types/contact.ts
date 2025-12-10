export type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  location?: string;
  jobTitle?: string;
  office?: string;
  languages?: string[];
  timeZone?: string;
  nicknames?: string[];
  managerId?: string;
  reports?: string[];
};

export type ContactFilters = {
  q?: string;
  department?: string;
  location?: string;
};

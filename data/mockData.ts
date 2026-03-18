import type {
  User,
  Mentorship,
  Session,
  SessionType,
  Feedback,
  Message,
  MentorApplication,
} from "../types";

export const MOCK_USERS: User[] = [
  {
    id: "user-admin-1",
    email: "admin@bnm.org",
    role: "admin",
    gender: "male",
    name: "Ahmad Al-Farsi",
    phone: "+49 151 12345678",
    city: "Berlin",
    age: 38,
    contact_preference: "email",
    created_at: "2024-01-01T10:00:00Z",
  },
  {
    id: "user-mentor-1",
    email: "mentor@bnm.org",
    role: "mentor",
    gender: "male",
    name: "Yusuf Schneider",
    phone: "+49 152 23456789",
    city: "Hamburg",
    age: 32,
    contact_preference: "whatsapp",
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "user-mentor-2",
    email: "mentorin@bnm.org",
    role: "mentor",
    gender: "female",
    name: "Fatima Weber",
    phone: "+49 153 34567890",
    city: "Köln",
    age: 29,
    contact_preference: "phone",
    created_at: "2024-01-20T10:00:00Z",
  },
  {
    id: "user-mentee-1",
    email: "mentee@bnm.org",
    role: "mentee",
    gender: "male",
    name: "Michael Bauer",
    phone: "+49 154 45678901",
    city: "Hamburg",
    age: 27,
    contact_preference: "whatsapp",
    created_at: "2024-02-01T10:00:00Z",
  },
  {
    id: "user-mentee-2",
    email: "mentee2@bnm.org",
    role: "mentee",
    gender: "female",
    name: "Sarah Müller",
    phone: "+49 155 56789012",
    city: "Köln",
    age: 24,
    contact_preference: "telegram",
    created_at: "2024-02-10T10:00:00Z",
  },
  {
    id: "user-mentee-3",
    email: "mentee3@bnm.org",
    role: "mentee",
    gender: "male",
    name: "Thomas Richter",
    phone: "+49 156 67890123",
    city: "Berlin",
    age: 35,
    contact_preference: "whatsapp",
    created_at: "2024-03-01T10:00:00Z",
  },
];

export const SESSION_TYPES: SessionType[] = [
  {
    id: "st-1",
    name: "Registrierung",
    sort_order: 1,
    is_default: true,
    description: "Erstregistrierung des Mentees im BNM-System",
  },
  {
    id: "st-2",
    name: "Zuweisung",
    sort_order: 2,
    is_default: true,
    description: "Zuweisung des Mentees an einen geeigneten Mentor",
  },
  {
    id: "st-3",
    name: "Erstkontakt",
    sort_order: 3,
    is_default: true,
    description: "Erster telefonischer oder digitaler Kontakt",
  },
  {
    id: "st-4",
    name: "Ersttreffen",
    sort_order: 4,
    is_default: true,
    description: "Persönliches Kennenlernen vor Ort",
  },
  {
    id: "st-5",
    name: "BNM-Box",
    sort_order: 5,
    is_default: true,
    description: "Übergabe der BNM-Willkommensbox",
  },
  {
    id: "st-6",
    name: "Wudu",
    sort_order: 6,
    is_default: true,
    description: "Einführung in die Waschung (Wudu)",
  },
  {
    id: "st-7",
    name: "Salah",
    sort_order: 7,
    is_default: true,
    description: "Einführung in das Gebet (Salah)",
  },
  {
    id: "st-8",
    name: "Koran (5 Suren)",
    sort_order: 8,
    is_default: true,
    description: "Lernen der 5 grundlegenden Suren",
  },
  {
    id: "st-9",
    name: "Community",
    sort_order: 9,
    is_default: true,
    description: "Einführung in die lokale muslimische Gemeinschaft",
  },
  {
    id: "st-10",
    name: "Nachbetreuung",
    sort_order: 10,
    is_default: true,
    description: "Langfristige Begleitung nach Abschluss",
  },
];

export const MOCK_MENTORSHIPS: Mentorship[] = [
  {
    id: "mentorship-1",
    mentor_id: "user-mentor-1",
    mentee_id: "user-mentee-1",
    status: "active",
    assigned_by: "user-admin-1",
    assigned_at: "2024-02-05T10:00:00Z",
    mentor: MOCK_USERS.find((u) => u.id === "user-mentor-1"),
    mentee: MOCK_USERS.find((u) => u.id === "user-mentee-1"),
  },
  {
    id: "mentorship-2",
    mentor_id: "user-mentor-2",
    mentee_id: "user-mentee-2",
    status: "active",
    assigned_by: "user-admin-1",
    assigned_at: "2024-02-15T10:00:00Z",
    mentor: MOCK_USERS.find((u) => u.id === "user-mentor-2"),
    mentee: MOCK_USERS.find((u) => u.id === "user-mentee-2"),
  },
  {
    id: "mentorship-3",
    mentor_id: "user-mentor-1",
    mentee_id: "user-mentee-3",
    status: "completed",
    assigned_by: "user-admin-1",
    assigned_at: "2024-01-20T10:00:00Z",
    completed_at: "2024-03-15T10:00:00Z",
    mentor: MOCK_USERS.find((u) => u.id === "user-mentor-1"),
    mentee: MOCK_USERS.find((u) => u.id === "user-mentee-3"),
  },
];

export const MOCK_SESSIONS: Session[] = [
  {
    id: "session-1",
    mentorship_id: "mentorship-1",
    session_type_id: "st-1",
    date: "2024-02-05T14:00:00Z",
    is_online: false,
    details: "Registrierung erfolgreich abgeschlossen",
    documented_by: "user-admin-1",
    session_type: SESSION_TYPES[0],
  },
  {
    id: "session-2",
    mentorship_id: "mentorship-1",
    session_type_id: "st-2",
    date: "2024-02-05T15:00:00Z",
    is_online: false,
    details: "Zuweisung zu Yusuf Schneider basierend auf Nähe und Geschlecht",
    documented_by: "user-admin-1",
    session_type: SESSION_TYPES[1],
  },
  {
    id: "session-3",
    mentorship_id: "mentorship-1",
    session_type_id: "st-3",
    date: "2024-02-07T18:00:00Z",
    is_online: true,
    details: "Telefonat verlief sehr positiv. Nächstes Treffen vereinbart.",
    documented_by: "user-mentor-1",
    session_type: SESSION_TYPES[2],
  },
  {
    id: "session-4",
    mentorship_id: "mentorship-1",
    session_type_id: "st-4",
    date: "2024-02-14T15:00:00Z",
    is_online: false,
    details: "Persönliches Treffen in der Moschee. Sehr gute Chemie.",
    documented_by: "user-mentor-1",
    session_type: SESSION_TYPES[3],
  },
  {
    id: "session-5",
    mentorship_id: "mentorship-1",
    session_type_id: "st-5",
    date: "2024-02-21T16:00:00Z",
    is_online: false,
    details: "BNM-Box übergeben. Mentee war sehr begeistert.",
    documented_by: "user-mentor-1",
    session_type: SESSION_TYPES[4],
  },
  {
    id: "session-6",
    mentorship_id: "mentorship-1",
    session_type_id: "st-6",
    date: "2024-02-28T17:00:00Z",
    is_online: false,
    details: "Wudu gemeinsam geübt. Gut verstanden.",
    documented_by: "user-mentor-1",
    session_type: SESSION_TYPES[5],
  },
  {
    id: "session-7",
    mentorship_id: "mentorship-2",
    session_type_id: "st-1",
    date: "2024-02-15T14:00:00Z",
    is_online: false,
    details: "Registrierung abgeschlossen",
    documented_by: "user-admin-1",
    session_type: SESSION_TYPES[0],
  },
  {
    id: "session-8",
    mentorship_id: "mentorship-2",
    session_type_id: "st-2",
    date: "2024-02-15T15:00:00Z",
    is_online: false,
    details: "Zuweisung zu Fatima Weber",
    documented_by: "user-admin-1",
    session_type: SESSION_TYPES[1],
  },
  {
    id: "session-9",
    mentorship_id: "mentorship-2",
    session_type_id: "st-3",
    date: "2024-02-18T19:00:00Z",
    is_online: true,
    details: "Erstkontakt per WhatsApp und Telefonat",
    documented_by: "user-mentor-2",
    session_type: SESSION_TYPES[2],
  },
];

export const MOCK_FEEDBACK: Feedback[] = [
  {
    id: "feedback-1",
    mentorship_id: "mentorship-3",
    submitted_by: "user-mentee-3",
    rating: 5,
    comments:
      "Sehr dankbar für die Betreuung. Yusuf war immer geduldig und verständnisvoll.",
    created_at: "2024-03-16T10:00:00Z",
  },
  {
    id: "feedback-2",
    mentorship_id: "mentorship-3",
    submitted_by: "user-mentor-1",
    rating: 5,
    comments:
      "Thomas hat sehr schnell Fortschritte gemacht. Sehr motivierter Bruder.",
    created_at: "2024-03-16T12:00:00Z",
  },
];

export const MOCK_CREDENTIALS: Record<
  string,
  { password: string; userId: string }
> = {
  "admin@bnm.org": { password: "admin123", userId: "user-admin-1" },
  "mentor@bnm.org": { password: "mentor123", userId: "user-mentor-1" },
  "mentorin@bnm.org": { password: "mentor123", userId: "user-mentor-2" },
  "mentee@bnm.org": { password: "mentee123", userId: "user-mentee-1" },
  "mentee2@bnm.org": { password: "mentee123", userId: "user-mentee-2" },
  "mentee3@bnm.org": { password: "mentee123", userId: "user-mentee-3" },
};

export function getMentorshipsByMentorId(mentorId: string): Mentorship[] {
  return MOCK_MENTORSHIPS.filter((m) => m.mentor_id === mentorId);
}

export function getMentorshipByMenteeId(
  menteeId: string
): Mentorship | undefined {
  return MOCK_MENTORSHIPS.find((m) => m.mentee_id === menteeId);
}

export function getSessionsByMentorshipId(mentorshipId: string): Session[] {
  return MOCK_SESSIONS.filter((s) => s.mentorship_id === mentorshipId);
}

export function getCompletedStepIds(mentorshipId: string): string[] {
  const sessions = getSessionsByMentorshipId(mentorshipId);
  return sessions.map((s) => s.session_type_id);
}

export function getUserById(id: string): User | undefined {
  return MOCK_USERS.find((u) => u.id === id);
}

export const MOCK_APPLICATIONS: MentorApplication[] = [
  {
    id: "app-1",
    name: "Ibrahim Hassan",
    email: "ibrahim.hassan@example.de",
    city: "Frankfurt",
    gender: "male",
    age: 34,
    experience: "Ich bin seit 5 Jahren Muslime und habe bereits informell zwei Konvertierte begleitet. Ich bin in der lokalen Moscheegemeinde aktiv.",
    motivation: "Ich möchte meine Erfahrung und meinen Glauben teilen und neuen Muslimen den Einstieg erleichtern. Es ist das Beste, was ich für die Gemeinschaft tun kann.",
    contact_preference: "whatsapp",
    phone: "+49 160 11223344",
    status: "pending",
    submitted_at: "2026-03-10T09:00:00Z",
  },
  {
    id: "app-2",
    name: "Aisha Richter",
    email: "aisha.richter@example.de",
    city: "München",
    gender: "female",
    age: 28,
    experience: "Konvertitin seit 3 Jahren. Ich habe eine Schwester durch ihre erste Zeit im Islam begleitet und verstehe die Herausforderungen gut.",
    motivation: "Als Konvertitin weiß ich, wie wichtig Unterstützung am Anfang ist. Ich möchte für andere Schwestern da sein, wie man für mich da war.",
    contact_preference: "phone",
    phone: "+49 176 55667788",
    status: "pending",
    submitted_at: "2026-03-12T14:30:00Z",
  },
  {
    id: "app-3",
    name: "Omar Dietrich",
    email: "omar.dietrich@example.de",
    city: "Stuttgart",
    gender: "male",
    age: 41,
    experience: "Muslime seit 12 Jahren, Moscheevorsitzender seit 4 Jahren. Habe bereits mehrere Mentoring-Programme mitorganisiert.",
    motivation: "Das BNM-Programm ist ein wichtiges Projekt. Mit meiner Erfahrung in der Gemeinschaftsarbeit kann ich einen großen Beitrag leisten.",
    contact_preference: "email",
    status: "pending",
    submitted_at: "2026-03-15T11:00:00Z",
  },
];

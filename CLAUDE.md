# BNM Web-App – Projekt-Gehirn

Automatisch geladen. Immer aktuell halten. Nach jeder Arbeit Fortschritts-Log updaten.

---

## PROJEKT

**BNM – Betreuung neuer Muslime.** Mentoring-Programm für Konvertierte (~40 Mentoren). Zeitrahmen: **~8 Wochen.**

## TECH-STACK

- **Framework:** Expo (React Native) – eine Codebase für Web + iOS + Android
- **Routing:** Expo Router | **Styling:** NativeWind (Tailwind)
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Edge Functions, Storage)
- **Hosting:** Expo Web Export (statisch, kein Vercel) | **Builds:** EAS

## BRANDING (von iman.ngo)

Helles Theme, professioneller NGO-Stil. Tiefe Blautöne + Gold-Akzente.

| Zweck | Hex |
|---|---|
| Primary (Buttons, Headings) | `#101828` |
| Secondary Text | `#475467` |
| Tertiary Text | `#98A2B3` |
| Akzent Gold | `#EEA71B` |
| CTA Buttons Grün | `#27ae60` |
| Links Violett-Blau | `#444CE7` |
| Gradient Start | `#0A3A5A` |
| Gradient End | `#012A46` |
| Background | `#F9FAFB` |
| Cards | `#FFFFFF` |
| Borders | `#e5e7eb` |

**Font:** System-Stack (Inter als Fallback). Geschlechtertrennung visuell kennzeichnen.

## ROLLEN

- **Admin:** Volles Dashboard, alle Daten, Reporting, Zuweisungen, Session-Typen konfigurieren
- **Mentor:** NUR eigene Mentees. **Brüder NUR Brüder, Schwestern NUR Schwestern** (RLS in Supabase!)
- **Mentee:** Eigener Fortschritt, Gamification, limitiert

## WORKFLOW (sequenziell – kein Skip!)

1. Registrierung → 2. Zuweisung (Geschlecht+Stadt 25km+Alter) → 3. Erstkontakt → 4. Ersttreffen → 5. BNM-Box → 6. Wudu → 7. Salah → 8. Koran (5 Suren) → 9. Community → 10. Nachbetreuung

Pro Session: Datum, Online/Offline, Details. Nächster Step erst nach Dokumentation.

## STATUS

Aktiv (weiß) | Abgeschlossen (grün, +Feedback) | Abgebrochen (rot, +Feedback)

## KERNREGELN

1. Geschlechtertrennung ABSOLUT kritisch
2. Sequenzielle Freigabe – kein Skip
3. Erinnerungen alle 2-3 Tage bei aktiver Betreuung
4. Nachbetreuung auch nach Abschluss möglich
5. Gamification wichtig (Ehrenamt braucht Wertschätzung)
6. Mentee hakt ab + Mentor nicht → Reminder
7. Admin kann Session-Typen hinzufügen
8. Diagramme exportierbar (Meetings)
9. Keine Duplikate bei Registrierungen

## DATENMODELL

```
users: id, email, role, gender, name, phone, city, age, contact_preference, avatar_url
mentorships: id, mentor_id, mentee_id, status, assigned_by, assigned_at, completed_at
sessions: id, mentorship_id, session_type_id, date, is_online, details, documented_by
session_types: id, name, sort_order, is_default, description
feedback: id, mentorship_id, submitted_by, rating, comments
messages: id, mentorship_id, sender_id, content, read_at
```

## FEATURES

### MVP (Prio HOCH)
- [ ] Auth + Rollen + Geschlechtertrennung
- [ ] Registrierung (Mentee + Mentor-Bewerbung)
- [ ] Zuweisungssystem (Smart Matching)
- [ ] Mentoring-Tracking (sequenzielle Steps)
- [ ] Status-System
- [ ] Admin-Dashboard

### Phase 2 (Prio MITTEL)
- [ ] Monatsberichte + KPIs + Diagramme + Export
- [ ] Gamification (Fortschritt, Mentor des Monats, Leaderboard)
- [ ] Feedback-System (Auto-Versand)
- [ ] Erinnerungen (Edge Functions / Cron)
- [ ] Chat (Supabase Realtime)

### Phase 3 (Prio NIEDRIG)
- [ ] Datenmigration aus Excel
- [ ] App Store Release (EAS, Push)
- [ ] Motivationsnachrichten, Q&A-DB, Webinar-Modul

---

## FORTSCHRITTS-LOG

| Datum | Was gemacht | Status |
|---|---|---|
| 2026-03-17 | Projektanalyse, CLAUDE.md erstellt, Branding von iman.ngo extrahiert, Tech-Stack definiert (Expo+Supabase, kein Vercel) | Fertig |
| | **NÄCHSTER SCHRITT:** Expo-Projekt initialisieren + Supabase Setup | Offen |

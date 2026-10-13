"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/shell/app-shell";
import {
  DemoNotice,
  ErrorState,
  LoadingBlock,
} from "@/components/shared/page-states";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MonthCalendar } from "@/features/calendar/month-calendar";
import { todayIso } from "@/lib/domain/dates";
import { isGroupHrUser } from "@/lib/services/people-service";
import { listTeamCalendar } from "@/lib/services/leave-service";
import { listMyCompanies } from "@/lib/services/company-service";
import { useSession } from "@/lib/session/session-context";

export default function HrCalendarPage() {
  const { ready, activeCompany } = useSession();
  const [month, setMonth] = useState(todayIso().slice(0, 7));
  const [companyId, setCompanyId] = useState("");
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [groupHr, setGroupHr] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [events, setEvents] = useState<
    Extract<Awaited<ReturnType<typeof listTeamCalendar>>, { ok: true }>["data"]
  >([]);

  useEffect(() => {
    if (!ready) return;
    void listMyCompanies().then((res) => {
      if (!res.ok) return;
      setCompanies(res.data);
      setGroupHr(isGroupHrUser(res.data.map((c) => c.id)));
      setCompanyId(activeCompany?.id ?? res.data[0]?.id ?? "");
    });
  }, [ready, activeCompany?.id]);

  useEffect(() => {
    if (!ready || !companyId) return;
    setLoading(true);
    void listTeamCalendar(month, { companyId }).then((res) => {
      setLoading(false);
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      setError("");
      setEvents(res.data);
    });
  }, [ready, month, companyId]);

  return (
    <AppShell title="Team Calendar">
      <div className="mx-auto max-w-4xl space-y-4">
        <DemoNotice>
          Approved absences and holidays only — names, dates, and Full Day / AM /
          PM. Leave type and reason are never shown.
        </DemoNotice>
        {groupHr ? (
          <div className="max-w-sm space-y-1">
            <label htmlFor="cal-co" className="text-sm font-medium">
              Company
            </label>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger id="cal-co">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
        {loading ? <LoadingBlock /> : null}
        {error ? <ErrorState message={error} /> : null}
        {!loading && !error ? (
          <MonthCalendar month={month} events={events} onMonthChange={setMonth} />
        ) : null}
      </div>
    </AppShell>
  );
}

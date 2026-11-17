import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { FilterTabs, PageHeader, PreviewNotice } from "@/components/workspace/WorkspacePrimitives";
import { DEMO_LECTURER_STUDENTS } from "@/content/workspaces";

export const Route = createFileRoute("/teach/students")({
  head: () => ({
    meta: [{ title: "Students · Lecturer Workspace — THEORYLAB" }],
  }),
  component: LecturerStudentsPage,
});

function LecturerStudentsPage() {
  const [classFilter, setClassFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  const filtered = DEMO_LECTURER_STUDENTS.filter((s) => {
    const matchesClass = classFilter === "all" || s.classCode === classFilter;
    const matchesQuery =
      !query.trim() ||
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.classCode.toLowerCase().includes(query.toLowerCase());
    return matchesClass && matchesQuery;
  });

  return (
    <div className="space-y-8">
      <PreviewNotice message="Student rosters below are demonstration records. Real enrolments and individual scores will sync via Supabase once connected." />

      <PageHeader
        eyebrow="Cohort Roster"
        title="Students"
        description="Monitor student assignment completion, ear-training accuracy and stage readiness across your classes."
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs
          label="Filter students by class"
          value={classFilter}
          onChange={setClassFilter}
          options={[
            { id: "all", label: "All classes" },
            { id: "MUS-101", label: "MUS-101" },
            { id: "MUS-204", label: "MUS-204" },
            { id: "EAR-110", label: "EAR-110" },
          ]}
        />

        <input
          type="search"
          aria-label="Search students"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by student name…"
          className="h-10 w-full rounded-[2px] border border-input bg-paper px-3.5 text-sm outline-none focus:border-primary sm:w-64"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[2px] border border-border bg-paper p-8 text-center text-sm text-muted-foreground">
          No demonstration student records match your current filter.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[2px] border border-border bg-paper">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5 font-medium">Student</th>
                <th className="px-5 py-3.5 font-medium">Class</th>
                <th className="px-5 py-3.5 font-medium">Current stage</th>
                <th className="px-5 py-3.5 font-medium">Assignments</th>
                <th className="px-5 py-3.5 text-right font-medium">Ear accuracy</th>
                <th className="px-5 py-3.5 font-medium">Support note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-background/60">
                  <td className="px-5 py-3.5 font-medium text-foreground">{s.name}</td>
                  <td className="px-5 py-3.5 tabular-nums text-crimson-deep">{s.classCode}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{s.stage}</td>
                  <td className="px-5 py-3.5 tabular-nums text-foreground">
                    {s.assignmentsCompleted}
                  </td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-foreground">
                    {s.earAccuracy}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{s.supportNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

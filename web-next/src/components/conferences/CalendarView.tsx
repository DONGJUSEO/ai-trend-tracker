"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventInput, EventClickArg } from "@fullcalendar/core";
import { AIConference } from "@/lib/types";

const FullCalendar = dynamic(() => import("@fullcalendar/react"), { ssr: false });

function tierClassName(tier?: string): string {
  if (tier === "A*") return "bg-amber-500/40 border border-amber-300/50 text-amber-100";
  if (tier === "A") return "bg-slate-400/35 border border-slate-200/40 text-slate-100";
  return "bg-blue-500/35 border border-blue-300/40 text-blue-100";
}

function addOneDay(dateLike: string): string {
  const date = new Date(dateLike);
  date.setDate(date.getDate() + 1);
  return date.toISOString();
}

function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("ko-KR");
}

function dDay(value?: string) {
  if (!value) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(value);
  target.setHours(0, 0, 0, 0);
  const diff = Math.floor((target.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return null;
  if (diff === 0) return "D-Day";
  return `D-${diff}`;
}

export default function CalendarView({ conferences }: { conferences: AIConference[] }) {
  const [selected, setSelected] = useState<AIConference | null>(null);

  const eventMap = useMemo(() => {
    const map = new Map<string, AIConference>();
    conferences.forEach((conf) => map.set(String(conf.id), conf));
    return map;
  }, [conferences]);

  const events = useMemo<EventInput[]>(() => {
    return conferences.map((conf) => ({
      id: String(conf.id),
      title: conf.name || conf.conference_name || "Conference",
      start: conf.start_date,
      end: addOneDay(conf.end_date || conf.start_date),
      allDay: true,
      className: tierClassName(conf.tier),
      extendedProps: {
        tier: conf.tier,
      },
    }));
  }, [conferences]);

  const handleEventClick = (arg: EventClickArg) => {
    const conf = eventMap.get(arg.event.id);
    if (conf) setSelected(conf);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 md:p-4 overflow-hidden">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "",
          }}
          events={events}
          eventClick={handleEventClick}
          dayMaxEvents={3}
          height="auto"
          eventDisplay="block"
          eventClassNames={(arg) => arg.event.classNames}
          eventContent={(arg) => (
            <div className="px-1 py-0.5 text-[11px] font-medium truncate">
              {arg.event.title}
            </div>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="rounded-lg border border-amber-300/30 bg-amber-500/15 px-3 py-2 text-amber-200">A* Tier</div>
        <div className="rounded-lg border border-slate-200/30 bg-slate-400/15 px-3 py-2 text-slate-100">A Tier</div>
        <div className="rounded-lg border border-blue-300/30 bg-blue-500/15 px-3 py-2 text-blue-200">B Tier</div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 grid place-items-center">
          <div className="w-full max-w-xl rounded-2xl border border-white/15 bg-[#11131a] p-6 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">
                  {selected.name || selected.conference_name}
                </h3>
                <p className="text-sm text-white/60 mt-1">{selected.location}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-white/60 hover:text-white text-sm"
              >
                닫기
              </button>
            </div>

            <div className="mt-4 space-y-2 text-sm text-white/80">
              <div>기간: {formatDate(selected.start_date)} - {formatDate(selected.end_date)}</div>
              <div>티어: {selected.tier || "-"}</div>
              <div>제출 마감: {formatDate(selected.submission_deadline)} {dDay(selected.submission_deadline) ? `(${dDay(selected.submission_deadline)})` : ""}</div>
              <div>주제: {(selected.topics || []).join(", ") || "-"}</div>
              {selected.url || selected.website_url ? (
                <a
                  href={selected.url || selected.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-sky-300 hover:text-sky-200 underline underline-offset-4"
                >
                  공식 사이트 이동
                </a>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

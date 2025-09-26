export default defineEventHandler(async (_) => {
  const nitroApp = useNitroApp();

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

  const startIso = todayStart.toISOString();
  const endIso = todayEnd.toISOString();

  // 1) new inquiries (contact_submissions submitted today)
  const newInquiriesQ = `
    SELECT COUNT(*)::int AS cnt
    FROM public.contact_submissions
    WHERE submitted_at >= '${startIso}' AND submitted_at < '${endIso}'
    `;

  // 2) open tickets (status = 0 and not deleted)
  const openTicketsQ = `
    SELECT COUNT(*)::int AS cnt
    FROM public.tickets
    WHERE status = 0 AND (is_deleted IS DISTINCT FROM true)
    `;

  // 3) tickets resolved (updated_at today AND status indicates resolved/closed)
  // adjust status values if you use 'closed' or 'resolved'
  const resolvedTicketsQ = `
    SELECT COUNT(*)::int AS cnt
    FROM public.tickets
    WHERE updated_at >= '${startIso}' AND updated_at < '${endIso}'
    AND status = 3 OR status = 4
    AND (is_deleted IS DISTINCT FROM true)
    `;

  const totalTicketsQ = `
    SELECT COUNT(*)::int AS cnt
    FROM public.tickets
    WHERE (is_deleted IS DISTINCT FROM true)
    `;

  const [newInquiriesRes, openTicketsRes, resolvedTicketsRes, totalTicketsRes] =
    await Promise.all([
      nitroApp.sql!.unsafe(newInquiriesQ),
      nitroApp.sql!.unsafe(openTicketsQ),
      nitroApp.sql!.unsafe(resolvedTicketsQ),
      nitroApp.sql!.unsafe(totalTicketsQ),
    ]);

  const newInquiries = Number(newInquiriesRes[0].cnt ?? 0);
  const openTickets = Number(openTicketsRes[0].cnt ?? 0);
  const ticketsResolved = Number(resolvedTicketsRes[0].cnt ?? 0);
  const totalTickets = Number(totalTicketsRes[0].cnt ?? 0);

  return {
    stats: [
      {
        name: "new_inquiries",
        value: newInquiries,
      },
      { name: "open_tickets", value: openTickets },
      {
        name: "total_tickets",
        value: totalTickets,
      },
      {
        name: "tickets_resolved_today",
        value: ticketsResolved,
      },
    ],
  };
});

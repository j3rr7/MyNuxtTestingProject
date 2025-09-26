export default defineEventHandler(async (event) => {
  const nitroApp = useNitroApp();
  const id = event.context.params?.id;

  if (!id || isNaN(Number(id))) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing or invalid ticket id",
    });
  }

  const ticketQ = `
    SELECT
        id,
        subject,
        description,
        status,
        priority,
        metadata,
        is_deleted,
        created_at,
        updated_at
    FROM tickets
    WHERE id = $1
      AND is_deleted = false
    LIMIT 1;
  `;

  const [ticket] = await nitroApp.sql!.unsafe(ticketQ, [Number(id)]);

  if (!ticket) {
    throw createError({
      statusCode: 404,
      statusMessage: "Ticket not found",
    });
  }

  const repliesQ = `
    SELECT
        id,
        ticket_id,
        message,
        author_type,
        author_name,
        author_id,
        created_at,
        updated_at
    FROM ticket_replies
    WHERE ticket_id = $1
      AND is_deleted = false
    ORDER BY created_at ASC;
  `;
  const replies = await nitroApp.sql!.unsafe(repliesQ, [Number(id)]);

  return {
    ...ticket,
    replies,
  };
});

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');

    if (!id || isNaN(Number(id))) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing or invalid ticket id",
      });
    }

    const sql = useDatabase(event);

    if (!sql) {
      throw createError({
        statusCode: 500,
        statusMessage: "Database connection is not available.",
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

    const [ticket] = await sql.unsafe(ticketQ, [Number(id)]);

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
    const replies = await sql.unsafe(repliesQ, [Number(id)]);

    return {
      ...ticket,
      replies,
    };
  } catch (error) {

    if (error instanceof Error) {
      throw createError({
        statusCode: 500,
        statusMessage: "Service temporarily unavailable",
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Service temporarily unavailable",
    });
  }
});


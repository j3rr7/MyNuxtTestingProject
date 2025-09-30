import { z } from "zod";

const requestSchema = z.object({
  search: z.string().trim().min(1).optional(),
  page: z.preprocess((v) => {
    if (v === undefined) return undefined;
    const n = Number(v);
    return Number.isNaN(n) ? v : Math.trunc(n);
  }, z.number().int().positive().default(1)),
  limit: z.preprocess((v) => {
    if (v === undefined) return undefined;
    const n = Number(v);
    return Number.isNaN(n) ? v : Math.trunc(n);
  }, z.number().int().positive().max(100).default(20)),
});

export default defineEventHandler(async (event) => {
  // throw createError({ statusCode: 500, statusMessage: "Internal server error" });

  const parseResult = requestSchema.safeParse(getQuery(event));
  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request body: " + parseResult.error,
    });
  }

  const { search, page, limit } = parseResult.data;
  const offset = (page - 1) * limit;

  const nitroApp = useNitroApp();

  // Build query
  const params = [];
  let where = "";

  if (search) {
    params.push(`%${search}%`); // For $1
    params.push(`%${search}%`); // For $2
    where = `WHERE company_name ILIKE $1 OR company_code ILIKE $2`;
  }

  const limitIdx = params.length + 1;
  const offsetIdx = params.length + 2;

  params.push(limit);
  params.push(offset);

  const sql = `
    SELECT
      company_id,
      company_name,
      company_code,
      database_name,
      created_at,
      subscription_expires_at,
      is_active
    FROM public.companies
    ${where}
    ORDER BY created_at DESC
    LIMIT $${limitIdx} OFFSET $${offsetIdx}
  `;

  const companies = await nitroApp.sql!.unsafe(sql, params);

  const total = await nitroApp.sql!.unsafe(
    `SELECT COUNT(*) FROM public.companies ${where} LIMIT $${limitIdx} OFFSET $${offsetIdx}`, 
    params
  );

  if (companies.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: "No companies found",
    });
  }

  return {
    data: companies,
    meta: { page, limit, offset, total: total[0].count, totalPages: Math.ceil(total[0].count / limit)},
  };
});
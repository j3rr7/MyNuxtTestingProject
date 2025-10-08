interface QueryParams {
  page?: string;
  limit?: string;
  email?: string;
  company?: string;
  sortBy?: string;
  order?: string;
  q?: string;
}

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  filters: {
    email: string | null;
    company: string | null;
    q: string | null;
  };
  sortBy: string;
  order: 'ASC' | 'DESC';
}

interface ApiResponse {
  success: true;
  data: unknown[];
  meta: Meta;
}

// --- Constants ---
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const VALID_SORT_COLUMNS = [
  'submitted_at',
  'id',
  'display_name',
  'email',
  'company_name',
] as const;

type SortColumn = (typeof VALID_SORT_COLUMNS)[number];

const SORT_EXPRESSIONS: Record<SortColumn, string> = {
  submitted_at: 'submitted_at',
  id: 'id',
  display_name: 'first_name, last_name',
  email: 'email',
  company_name: 'company_name',
};

// --- Utility Functions ---
function parsePagination(query: QueryParams) {
  const page = query.page ? parseInt(query.page, 10) : DEFAULT_PAGE;
  const limit = query.limit ? parseInt(query.limit, 10) : DEFAULT_LIMIT;

  if (isNaN(page) || page < 1) {
    throw createError({
      statusCode: 400,
      message: 'Invalid page. Must be a positive integer.',
    });
  }

  if (isNaN(limit) || limit < 1 || limit > MAX_LIMIT) {
    throw createError({
      statusCode: 400,
      message: `Invalid limit. Must be between 1 and ${MAX_LIMIT}.`,
    });
  }

  return { page, limit, offset: (page - 1) * limit };
}

function parseFilters(query: QueryParams) {
  return {
    email: typeof query.email === 'string' ? query.email : null,
    company: typeof query.company === 'string' ? query.company : null,
    q: typeof query.q === 'string' ? query.q : null,
  };
}

function parseSorting(query: QueryParams): { sortBy: SortColumn; order: 'ASC' | 'DESC' } {
  const sortBy = typeof query.sortBy === 'string' && VALID_SORT_COLUMNS.includes(query.sortBy as SortColumn)
    ? (query.sortBy as SortColumn)
    : 'submitted_at';

  const order = typeof query.order === 'string' && ['asc', 'desc'].includes(query.order.toLowerCase())
    ? (query.order.toUpperCase() as 'ASC' | 'DESC')
    : 'DESC';

  return { sortBy, order };
}

function buildWhereClause(filters: { email: string | null; company: string | null, q: string | null }, values: string[]) {
  const conditions: string[] = [];

  if (filters.email) {
    conditions.push(`email ILIKE $${values.length + 1}`);
    values.push(`%${filters.email}%`);
  }

  if (filters.company) {
    conditions.push(`company_name ILIKE $${values.length + 1}`);
    values.push(`%${filters.company}%`);
  }

  if (filters.q) {
    const searchValue = `%${filters.q}%`;
    const qConditions = [
      `first_name ILIKE $${values.length + 1}`,
      `last_name ILIKE $${values.length + 2}`,
      `email ILIKE $${values.length + 3}`,
      `company_name ILIKE $${values.length + 4}`,
      `question ILIKE $${values.length + 5}`,
    ];
    values.push(searchValue, searchValue, searchValue, searchValue, searchValue);
    conditions.push(`(${qConditions.join(' OR ')})`);
  }

  return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event) as QueryParams;

  try {
    const sql = useDatabase(event);

    if (!sql) {
      throw createError({
        statusCode: 500,
        statusMessage: "Database connection is not available.",
      });
    }

    const { page, limit, offset } = parsePagination(query);
    const filters = parseFilters(query);
    const { sortBy, order } = parseSorting(query);

    const values: string | never[] | undefined = [];
    const whereClause = buildWhereClause(filters, values);

    const orderByExpression = SORT_EXPRESSIONS[sortBy];
    const orderBy = `${orderByExpression} ${order}`;

    const inquiries = await sql.unsafe(
      `
      SELECT
        id,
        first_name,
        last_name,
        company_name,
        phone_number,
        email,
        question,
        submitted_at
      FROM public.contact_submissions
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
      `,
      [...values, limit, offset]
    );

    const [{ count }] = await sql.unsafe(
      `
      SELECT COUNT(*) FROM public.contact_submissions
      ${whereClause}
      `,
      values
    );

    const total = Number(count);
    const totalPages = Math.ceil(total / limit);

    const meta: Meta = {
      page,
      limit,
      total,
      totalPages,
      filters,
      sortBy,
      order,
    };

    const response: ApiResponse = {
      success: true,
      data: inquiries,
      meta,
    };

    return response;
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
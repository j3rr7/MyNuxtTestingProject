interface QueryParams {
  page?: string;
  limit?: string;
  status?: string;
  priority?: string;
  is_deleted?: string;
  q?: string; // free-text search
  sortBy?: string;
  order?: string;
}

interface Filters {
  status?: number;
  priority?: number;
  is_deleted?: boolean;
  q?: string;
}

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  filters: Filters;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
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
  'id',
  'created_at',
  'updated_at',
  'status',
  'priority',
  'subject',
] as const;

type SortColumn = (typeof VALID_SORT_COLUMNS)[number];

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

function parseFilters(query: QueryParams): { filters: Filters; whereClause: string; values: (string | number | boolean)[] } {
  const filters: Filters = {};
  const whereConditions: string[] = [];
  const values = [];

  if (query.status !== undefined) {
    const status = parseInt(query.status, 10);
    if (!isNaN(status)) {
      filters.status = status;
      whereConditions.push(`status = $${values.length + 1}`);
      values.push(status);
    }
  }

  if (query.priority !== undefined) {
    const priority = parseInt(query.priority, 10);
    if (!isNaN(priority) && priority >= 1 && priority <= 5) {
      filters.priority = priority;
      whereConditions.push(`priority = $${values.length + 1}`);
      values.push(priority);
    }
  }

  if (query.is_deleted !== undefined) {
    const isDeleted = String(query.is_deleted).toLowerCase() === 'true';
    filters.is_deleted = isDeleted;
    whereConditions.push(`is_deleted = $${values.length + 1}`);
    values.push(isDeleted);
  }

  if (typeof query.q === 'string' && query.q.trim()) {
    const searchTerm = query.q.trim();
    filters.q = searchTerm;
    whereConditions.push(`subject ILIKE $${values.length + 1}`);
    values.push(`%${searchTerm}%`);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  return { filters, whereClause, values };
}

function parseSorting(query: QueryParams): { sortBy: SortColumn; order: 'ASC' | 'DESC' } {
  const sortBy = typeof query.sortBy === 'string' && VALID_SORT_COLUMNS.includes(query.sortBy as SortColumn)
    ? (query.sortBy as SortColumn)
    : 'created_at';

  const order = typeof query.order === 'string' && ['asc', 'desc'].includes(query.order.toLowerCase())
    ? (query.order.toUpperCase() as 'ASC' | 'DESC')
    : 'DESC';

  return { sortBy, order };
}

export default defineEventHandler(async (event) => {
  const nitroApp = useNitroApp();
  const query = getQuery(event) as QueryParams;

  try {
    const { page, limit, offset } = parsePagination(query);
    const { filters, whereClause, values } = parseFilters(query);
    const { sortBy, order } = parseSorting(query);

    const tickets = await nitroApp.sql!.unsafe(
      `
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
      FROM public.tickets
      ${whereClause}
      ORDER BY ${sortBy} ${order}
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
      `,
      [...values, limit, offset]
    );

    const [{ count }] = await nitroApp.sql!.unsafe(
      `
      SELECT COUNT(*) FROM public.tickets
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
      sortOrder: order,
    };

    const response: ApiResponse = {
      success: true,
      data: tickets,
      meta,
    };

    return response;
  } catch (error) {
    console.error('Failed to fetch tickets:', error);

    if (error instanceof Error && 'statusCode' in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to fetch tickets. Please try again later.',
    });
  }
});
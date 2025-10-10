export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);

  // disable on health
  if (url.pathname === "/api/health") {
    return;
  }

  // disable on auth routes
  if (url.pathname.startsWith("/api/auth/")) {
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    const session = await requireUserSession(event, {
      statusCode: 401,
      message: "Unauthorized",
    });

    event.context.user = session.user;
  }
});

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (session.user) {
    const actorName = session.user.name;
    try {
      await insertAuditLog({
        actor: actorName,
        action: "LOGOUT",
        target: "USER",
        status: "SUCCESS",
        description: `User '${actorName}' logged out successfully.`,
      });
    } catch (error) {
      console.error("Failed to write logout audit log:", error);
    }
  }
  
  await clearUserSession(event);

  return sendRedirect(event, "/login");
});

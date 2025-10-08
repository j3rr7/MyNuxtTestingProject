export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  return { message: `Delete ticket by ID ${id} - to be implemented` };
});

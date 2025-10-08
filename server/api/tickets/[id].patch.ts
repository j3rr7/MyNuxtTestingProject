export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    return { message: `Update ticket by ID ${id} - to be implemented` };
});
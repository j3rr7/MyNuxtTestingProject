import { utils, write } from 'xlsx';

export default defineEventHandler(async (event) => {
    const nitroApp = useNitroApp();

    // Set headers for file download
    const res = event.node.res;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="contact_submissions_${Date.now()}.xlsx"`); // Added timestamp to filename

    const submissions = await nitroApp.sql!.unsafe(`
        SELECT 
            id, 
            first_name,
            last_name, 
            company_name, 
            phone_number, 
            email, 
            question, 
            submitted_at 
        FROM 
            public.contact_submissions
        ORDER BY submitted_at DESC
    `);

    const ws = utils.json_to_sheet(submissions);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Submissions");
    const buffer = write(wb, { type: "buffer", bookType: "xlsx" });

    return buffer; 
});
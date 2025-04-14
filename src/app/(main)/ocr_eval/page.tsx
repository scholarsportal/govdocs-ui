/*
This page get the document_id and the ocr_request_id from the params and fetch all the ocr jobs for that document.
It will fetch all the pages from from supabase storage using document_id/page_num.png.
It will display one page at a time and allow the user to navigate between pages.
below the image of each page, it will display the ocr text from all four models.
Just below the ocr text for each model, there will be a form to submit the evaluation for that model.
*/
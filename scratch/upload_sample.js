const fs = require('fs');
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4emFncWF4bWNhaHJjb3J2eGNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjY3MTUyNywiZXhwIjoyMTAyMjQ3NTI3fQ.eq2mYfTIi1FhCtUrJEGu9pP8dOiDyvXwfGylRARtU98';

const csvContent = fs.readFileSync('Transaction_Inquiry_Download_Single_20260814090236597.csv');

fetch('https://bxzagqaxmcahrcorvxco.supabase.co/storage/v1/object/csv-files/Transaction_Inquiry_Download_Single_20260814090236597.csv', {
  method: 'POST',
  headers: {
    'apikey': serviceKey,
    'Authorization': 'Bearer ' + serviceKey,
    'Content-Type': 'text/csv',
    'x-upsert': 'true'
  },
  body: csvContent
}).then(r => r.json()).then(res => console.log('TEST UPLOAD FILE RESULT:', res));

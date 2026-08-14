const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4emFncWF4bWNhaHJjb3J2eGNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjY3MTUyNywiZXhwIjoyMTAyMjQ3NTI3fQ.eq2mYfTIi1FhCtUrJEGu9pP8dOiDyvXwfGylRARtU98';

async function testRPC() {
  const res = await fetch('https://bxzagqaxmcahrcorvxco.supabase.co/rest/v1/', {
    headers: {
      'apikey': serviceKey,
      'Authorization': 'Bearer ' + serviceKey
    }
  });
  const json = await res.json();
  console.log('OpenAPI Paths:', Object.keys(json.paths || {}));
}

testRPC();

const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4emFncWF4bWNhaHJjb3J2eGNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjY3MTUyNywiZXhwIjoyMTAyMjQ3NTI3fQ.eq2mYfTIi1FhCtUrJEGu9pP8dOiDyvXwfGylRARtU98';

const sqlQueries = [
  `CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_date VARCHAR(50) NOT NULL,
    value_date VARCHAR(50),
    branch VARCHAR(20),
    journal_no VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    debit NUMERIC(15, 2) DEFAULT 0,
    credit NUMERIC(15, 2) DEFAULT 0,
    category VARCHAR(100) DEFAULT 'Lain-lain / Operational',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );`,
  `ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;`
];

async function run() {
  for (const query of sqlQueries) {
    const res = await fetch('https://bxzagqaxmcahrcorvxco.supabase.co/pg/v1/query', {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': 'Bearer ' + serviceKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });
    const txt = await res.text();
    console.log('QUERY RESULT:', txt);
  }
}

run();

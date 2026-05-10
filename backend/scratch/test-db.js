const { Client } = require('pg');

const passwords = [
  'Prince@&#0609', // Literal characters
  'Prince@&0609',  // Assuming &#0609 was an encoded string but they meant &0609
  'Prince@&0609'   // Assuming & then #0609
];

async function test() {
  for (const pw of passwords) {
    console.log(`Testing password: ${pw}`);
    const client = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'postgres',
      password: pw,
      port: 5432,
    });
    try {
      await client.connect();
      console.log(`Success with password: ${pw}`);
      await client.end();
      process.exit(0);
    } catch (err) {
      console.log(`Failed: ${err.message}`);
    }
  }
  process.exit(1);
}

test();

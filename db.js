const pkg = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const client = new pkg.Client({
  connectionString: process.env.DATABASE_URL || 'postgres://mdesoky:Welcome2024@localhost:5432/the_acme_ice_cream_flavors_db' });

module.exports = client;
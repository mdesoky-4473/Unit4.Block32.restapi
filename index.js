const express = require('express');
const client = require('./db.js');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

const seedFlavors = async () => {
    try {
      let SQL = `
        DROP TABLE IF EXISTS flavors;
        
        CREATE TABLE flavors (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          is_favorite BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      `;
      await client.query(SQL);
  
      SQL = `INSERT INTO flavors (name, is_favorite) VALUES
        ('Vanilla Bean', true),
        ('Strawberry Swirl', false),
        ('Pumpkin Spice', false),
        ('Mint Chocolate Chip', true);
      `;
      await client.query(SQL);
  
      console.log('Flavors table seeded.');
    } catch (err) {
      console.error('Seeding error:', err);
    }
  };

// App Routes
//all flavors
app.get('/api/flavors', async (req, res) => {
    try {
      const result = await client.query('SELECT * FROM flavors');
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  //one flavor
app.get('/api/flavors/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query('SELECT * FROM flavors WHERE id = $1', [id]);

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Flavor not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  //post flavor
  app.post('/api/flavors', async (req, res) => {
    try {
      const { name, is_favorite } = req.body;
  
      const result = await client.query(
        `INSERT INTO flavors (name, is_favorite)
         VALUES ($1, $2)
         RETURNING *`,
        [name, is_favorite ?? false] // default to false if not provided
      );
  
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating flavor:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  //delete flavor
  app.delete('/api/flavors/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query('DELETE FROM flavors WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Flavor not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
      console.error('Error deleting flavor:',err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  //update flavor
  app.put('/api/flavors/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, is_favorite } = req.body;
    
      const result = await client.query(
        `UPDATE flavors
         SET name = $1, is_favorite = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
        [name, is_favorite ?? false, id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Flavor not found' });
      }
  
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error updating flavor:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  



  const init = async () => {
    try {
      await client.connect();
      //const result = await client.query('SELECT NOW()');
      console.log('Connected to PostgreSQL');
  
      await seedFlavors();
  
      app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
      });
    } catch (err) {
      console.error('Error starting server:', err);
    }
  };
  
  init();
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Plaid Configuration
const plaidClient = new PlaidApi(
  new Configuration({
    basePath: PlaidEnvironments.sandbox, // Change to 'development' or 'production' as needed
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
      },
    },
  })
);

/** ------------------ USER AUTHENTICATION ------------------ **/

// 🔹 Login Route (✅ Added fallback for JWT_SECRET)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userQuery.rows[0];

    if (!user) return res.status(400).json({ error: 'User not found' });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    // Generate JWT Token with fallback secret
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "default_secret", // ✅ Fallback if JWT_SECRET is missing
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 🔹 Signup Route
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userQuery.rows.length > 0) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3)', [name, email, hashedPassword]);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

/** ------------------ PLAID INTEGRATION ------------------ **/

// 🔹 Create Plaid Link Token (✅ Ensure redirect_uri is correctly registered)
app.post('/api/create_link_token', async (req, res) => {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: '123-test-user' },
      client_name: 'YourAppName',
      products: ['auth', 'transactions'],
      country_codes: ['US'],
      language: 'en',
      redirect_uri: process.env.PLAID_REDIRECT_URI || 'http://localhost:5173/', // ✅ Ensure this is registered in Plaid
    });
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// 🔹 Exchange Public Token for Access Token (✅ Store access_token in DB)
app.post('/api/exchange_public_token', async (req, res) => {
  const { public_token, email } = req.body;
  try {
    const response = await plaidClient.itemPublicTokenExchange({ public_token });
    const access_token = response.data.access_token;

    // ✅ Store access_token in PostgreSQL
    await pool.query('UPDATE users SET access_token = $1 WHERE email = $2', [access_token, email]);

    res.json({ access_token });
  } catch (error) {
    console.error("Error exchanging token:", error);
    res.status(500).send(error);
  }
});

// 🔹 Get Account Balance
app.get('/api/accounts/balance', async (req, res) => {
  const { access_token } = req.query;
  try {
    const response = await plaidClient.accountsBalanceGet({ access_token });
    res.json(response.data.accounts);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// 🔹 Get Account Details (Account Number & Routing Number)
app.get('/api/accounts/details', async (req, res) => {
  const { access_token } = req.query;
  try {
    const response = await plaidClient.authGet({ access_token });
    res.json({
      accounts: response.data.accounts,
      numbers: response.data.numbers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// 🔹 Get Transactions (✅ Fixed infinite loop bug)
app.get('/api/transactions', async (req, res) => {
  const { access_token } = req.query;
  let transactions = [];
  let cursor = null;
  let hasMore = true;

  try {
    while (hasMore) {
      const response = await plaidClient.transactionsSync({ access_token, cursor });
      transactions = transactions.concat(response.data.added);
      cursor = response.data.next_cursor;
      hasMore = response.data.has_more;
    }

    res.json({ transactions, next_cursor: cursor });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).send(error);
  }
});

/** ------------------ END OF PLAID INTEGRATION ------------------ **/

// Upload CSV and Dynamically Create Table
app.post('/api/assets/upload-dynamic', async (req, res) => {
  const { userId, csvData } = req.body;

  // Table name specific to the user (e.g., assets_data_user_1)
  const tableName = `assets_data_user_${userId}`;

  // Extract column names from the first row of the CSV
  const columns = Object.keys(csvData[0]);

  // Dynamically create table columns with sanitized names
  let columnDefinitions = columns.map(col => {
    const sanitizedCol = col.toLowerCase().replace(/[^a-z0-9_]/g, '');
    return `"${sanitizedCol}" TEXT`;
  }).join(', ');

  try {
    // Check if the table exists
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = $1
      );
    `;
    const tableExistsResult = await pool.query(checkTableQuery, [tableName]);
    const tableExists = tableExistsResult.rows[0].exists;

    // If the table doesn't exist, create it
    if (!tableExists) {
      const createTableQuery = `
        CREATE TABLE ${tableName} (
          id SERIAL PRIMARY KEY,
          ${columnDefinitions},
          uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      await pool.query(createTableQuery);
      console.log(`Table ${tableName} created successfully.`);
    }

    // Insert CSV data into the dynamically created table
    for (let row of csvData) {
      const sanitizedColumns = Object.keys(row).map(col => `"${col.toLowerCase().replace(/[^a-z0-9_]/g, '')}"`);
      const columnNames = sanitizedColumns.join(', ');

      // Use parameterized queries for safe value insertion
      const values = Object.values(row);
      const valuePlaceholders = values.map((_, index) => `$${index + 1}`).join(', ');

      const insertQuery = `
        INSERT INTO ${tableName} (${columnNames})
        VALUES (${valuePlaceholders});
      `;

      await pool.query(insertQuery, values);
    }

    console.log('CSV Data Saved Successfully');
    res.status(201).json({ message: 'CSV Data Saved Successfully' });
  } catch (err) {
    console.error('Error saving CSV Data:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Fetch CSV Data for a Specific User
app.get('/api/assets', async (req, res) => {
  const { userId } = req.query;

  // Table name specific to the user (e.g., assets_data_user_1)
  const tableName = `assets_data_user_${userId}`;

  try {
    // Check if the table exists
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = $1
      );
    `;
    const tableExistsResult = await pool.query(checkTableQuery, [tableName]);
    const tableExists = tableExistsResult.rows[0].exists;

    if (!tableExists) {
      return res.status(404).json({ message: 'No data found for this user' });
    }

    // Fetch data from the table
    const fetchDataQuery = `SELECT * FROM ${tableName}`;
    const dataResult = await pool.query(fetchDataQuery);

    res.json(dataResult.rows);
  } catch (err) {
    console.error('Error fetching CSV Data:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
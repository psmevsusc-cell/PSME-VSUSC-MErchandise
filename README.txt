# PSME-VSUSC Merchandise — Phase 2

## What this version adds
- Real Supabase database connection
- Customer order form
- Proof-of-payment upload
- Unique order number
- Order + order item records
- Payment status and order status fields
- Browser cart persistence

## Setup
1. Create a Supabase project.
2. Open SQL Editor.
3. Paste and run `supabase_schema.sql`.
4. Open Project Settings > API.
5. Copy the Project URL and browser-safe anon/public key.
6. Put them into `config.js`.
7. Keep `config.js` private if possible and NEVER use the service_role/secret key in browser code.
8. Serve the folder through a local web server (VS Code Live Server is recommended). Opening HTML directly with file:// can cause browser restrictions.

## Important
The product prices are still demo values in `script.js`.
The proof-of-payment bucket is private.
The treasurer dashboard and authenticated admin policies are Phase 3.
For production, use authenticated customer/admin workflows and stronger validation/authorization.

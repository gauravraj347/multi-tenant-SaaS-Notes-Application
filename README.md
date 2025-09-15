# Multi-Tenant SaaS Notes Application

A full-stack MERN application that provides multi-tenant note management with role-based access control and subscription feature gating.

## Features

- **Multi-Tenancy**: Support for multiple tenants (Acme and Globex) with strict data isolation
- **Authentication**: JWT-based authentication with role-based access control
- **Subscription Gating**: Free plan (3 notes) and Pro plan (unlimited notes)
- **Notes CRUD**: Full create, read, update, delete functionality for notes
- **Tenant Isolation**: Complete data separation between tenants
- **Admin Features**: Upgrade subscriptions and manage tenant settings

## Multi-Tenancy Approach

This application uses a **shared schema with tenant ID column** approach:

- All data models include a `tenantId` field that references the tenant
- Database queries are filtered by `tenantId` to ensure strict isolation
- Users are associated with a specific tenant and can only access their tenant's data
- This approach provides good performance while maintaining data isolation

### Benefits of this approach:
- Cost-effective (single database)
- Easy to maintain and scale
- Good performance with proper indexing
- Simple backup and disaster recovery

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React.js, React Router, Axios
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Vercel
- **Database**: MongoDB Atlas (recommended for production)

## Test Accounts

The following test accounts are pre-configured (all with password: `password`):

- `admin@acme.test` (Admin, tenant: Acme)
- `user@acme.test` (Member, tenant: Acme)
- `admin@globex.test` (Admin, tenant: Globex)
- `user@globex.test` (Member, tenant: Globex)

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Notes
- `POST /api/notes` - Create a note
- `GET /api/notes` - List all notes for current tenant
- `GET /api/notes/:id` - Get specific note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note

### Tenants
- `GET /api/tenants/:slug` - Get tenant info
- `POST /api/tenants/:slug/upgrade` - Upgrade tenant to Pro (Admin only)

### Health
- `GET /health` - Health check endpoint

## Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd multi-tenant-notes-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/notes-app
   JWT_SECRET=your_jwt_secret_key_here
   ```

4. **Set up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Update the `MONGODB_URI` in your `.env` file

5. **Initialize the database**
   ```bash
   node scripts/initDatabase.js
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Start the React frontend** (in a new terminal)
   ```bash
   cd client && npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Deployment on Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Set up environment variables in Vercel**
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure JWT secret key
   - `NODE_ENV`: production

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Initialize production database**
   After deployment, run the initialization script with your production MongoDB URI:
   ```bash
   MONGODB_URI=your_production_mongodb_uri node scripts/initDatabase.js
   ```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Admin and Member roles with different permissions
- **Tenant Isolation**: Strict data separation between tenants
- **Input Validation**: Server-side validation for all inputs
- **CORS Configuration**: Properly configured for cross-origin requests

## Subscription Plans

### Free Plan
- Maximum 3 notes per tenant
- Basic note management features
- Member and Admin roles

### Pro Plan
- Unlimited notes
- All Free plan features
- Admin can upgrade via the upgrade endpoint

## Project Structure

```
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   └── ...
│   └── package.json
├── models/                 # MongoDB models
│   ├── User.js
│   ├── Tenant.js
│   └── Note.js
├── routes/                 # Express routes
│   ├── auth.js
│   ├── notes.js
│   └── tenants.js
├── middleware/             # Express middleware
│   └── auth.js
├── scripts/                # Database scripts
│   └── initDatabase.js
├── server.js              # Main server file
├── package.json
└── vercel.json           # Vercel configuration
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

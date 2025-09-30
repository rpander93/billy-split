# Billy Split

Billy Split helps managing splitting bills. Imagine you just paid for dinner of a large group and you want to get your money back. You send a picture of the bill plus a payment request to people. How do you know who paid back what? The process is tedious and error-prone. Now imagine if you had used Billy: users tick the items they had and see the amount they owe. Billy keeps track of everyone's payments so you know who paid what. Problem solved!

## How it works

Users upload a picture of the bill to Billy. Images are processed by [Azure AI Document Intelligence](https://azure.microsoft.com/en-us/products/ai-services/ai-document-intelligence) to extract information. They verify that the scanned information is correct and then save it. They then get a shareable link for others to open the bill and record their payments.

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Variables

Create a `.env` file in the root directory with the following variables:

#### SQLite Configuration
```env
SQLITE_DATABASE_PATH=./billy-split.db
```

The SQLite database file will be created automatically in your project directory. You can specify a different path if needed.

#### Azure Storage (for file uploads)
```env
VITE_AZURE_STORAGE_ACCOUNT_NAME=your_storage_account
VITE_AZURE_STORAGE_CONTAINER_NAME=your_container
VITE_AZURE_STORAGE_SAS_TOKEN=your_sas_token
```

### 3. Database Setup

The SQLite database and schema will be initialized automatically when you first run the application. If you want to set it up explicitly, run:

```bash
pnpm run setup
```

This will:
- Create the SQLite database file
- Set up all required tables and indexes
- Create database views for optimized queries

## Development

```bash
pnpm run dev
```

## Database Schema

The application uses the following SQLite tables:

- **scanned_bills** - Initial scanned bill data
- **scanned_bill_line_items** - Line items for scanned bills
- **submitted_bills** - Finalized bills with payment information
- **submitted_bill_line_items** - Line items for submitted bills
- **payment_items** - Payment records
- **payment_item_line_items** - Individual line items within payments

The database schema is automatically created from `database-schema.sql` when the application starts. All database operations use Kysely query builder for type safety and better developer experience.

## Migration from MongoDB

If you're migrating from a MongoDB version of Billy Split, you'll need to:

1. Export your data from MongoDB
2. Transform the data structure to fit the normalized SQLite schema
3. Import the data into the new SQLite database

The new SQLite structure with Kysely query builder provides better performance, full type safety, and eliminates the need for external database hosting.

## Production Deployment

For production, you can:

1. **Local SQLite File**: Keep the database file on the server filesystem
2. **Network Storage**: Store the database file on a shared volume for multi-instance deployments
3. **Backup Strategy**: Implement regular SQLite database backups using `sqlite3 .backup` command

### Docker Production Setup

The SQLite database will persist in the container. For production use, mount a volume to preserve data:

```yaml
services:
  billy-split:
    volumes:
      - ./data:/app/data
    environment:
      - SQLITE_DATABASE_PATH=/app/data/billy-split.db
```

## Features

- 📸 **Bill Scanning**: Upload bill images for automatic text extraction
- 💰 **Smart Splitting**: Assign specific items to different people
- 📊 **Payment Tracking**: Keep track of who paid what amount
- 🔗 **Easy Sharing**: Share bills via simple links
- 💾 **Local Storage**: Self-contained SQLite database
- 🚀 **Fast Setup**: No external database required
- 🔒 **Type Safety**: Full compile-time query validation with Kysely

## Tech Stack

- **Frontend**: Remix (React-based full-stack framework)
- **Database**: SQLite with better-sqlite3 + Kysely query builder
- **File Storage**: Azure Blob Storage
- **Document Processing**: Azure AI Document Intelligence
- **Styling**: Panda CSS
- **Deployment**: Docker ready
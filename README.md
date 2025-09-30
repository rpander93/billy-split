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

Create the SQLite file and scheme by running the migrations:

```bash
pnpm run database:migrate
```

## Development

```bash
pnpm run dev
```

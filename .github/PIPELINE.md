# GitHub Actions CI/CD Pipeline Setup

This repository uses GitHub Actions for automated testing and deployment.

## Workflows

### 1. CI Pipeline (`ci.yml`)
Runs on every push and pull request to `main` and `develop` branches.

**Jobs:**
- **Lint**: Runs ESLint to check code quality
- **Type Check**: Validates TypeScript types
- **Build**: Builds the Next.js application

### 2. Deploy Pipeline (`deploy.yml`)
Runs on every push to `main` branch or manual trigger.

**Jobs:**
- **Deploy**: Builds and deploys to Vercel production

## Required GitHub Secrets

To use these workflows, add the following secrets in your GitHub repository:
**Settings → Secrets and variables → Actions → New repository secret**

### Supabase Secrets
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

### OpenAI Secrets
- `OPENAI_API_KEY` - Your OpenAI API key
- `OPENAI_ASSISTANT_ID` - Your OpenAI Assistant ID

### Vercel Secrets (for deployment)
- `VERCEL_TOKEN` - Your Vercel authentication token
- `VERCEL_ORG_ID` - Your Vercel organization ID
- `VERCEL_PROJECT_ID` - Your Vercel project ID

## How to Get Vercel Credentials

1. **Vercel Token:**
   ```bash
   npx vercel login
   npx vercel token
   ```

2. **Vercel Org & Project IDs:**
   ```bash
   npx vercel link
   # Check .vercel/project.json for orgId and projectId
   ```

## Manual Deployment

You can manually trigger the deployment workflow:
1. Go to **Actions** tab
2. Select **Deploy to Production**
3. Click **Run workflow**

## Pipeline Status

Check the status of your pipelines in the **Actions** tab of your GitHub repository.

## Local Development

The pipeline uses the same commands you can run locally:

```bash
# Lint code
npm run lint

# Type check
npx tsc --noEmit

# Build
npm run build

# Run dev server
npm run dev
```

## Notes

- The `.env.local` file is excluded from git (in `.gitignore`)
- All secrets are managed through GitHub Secrets
- Build artifacts are kept for 7 days for debugging

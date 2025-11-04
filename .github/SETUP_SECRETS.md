# GitHub Actions Secrets Setup

The GitHub Actions workflows require certain secrets to be configured in your repository settings.

## Why the workflow is disabled

The `deploy.yml` workflow is currently disabled (renamed to `deploy.yml.disabled`) to prevent failures until secrets are configured.

## How to enable GitHub Actions deployment

### Step 1: Configure GitHub Secrets

Go to your GitHub repository settings:
1. Navigate to **Settings** > **Secrets and variables** > **Actions**
2. Click **New repository secret**
3. Add each of the following secrets:

#### Required Secrets

| Secret Name | Description | Where to find |
|------------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | Supabase Dashboard > Settings > API |
| `OPENAI_API_KEY` | Your OpenAI API key | OpenAI Platform > API Keys |
| `OPENAI_ASSISTANT_ID` | Your OpenAI Assistant ID | OpenAI Platform > Assistants |
| `VERCEL_TOKEN` | Your Vercel deployment token | Vercel > Settings > Tokens |
| `VERCEL_ORG_ID` | Your Vercel organization ID | Run `vercel` locally, check `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Your Vercel project ID | Run `vercel` locally, check `.vercel/project.json` |

### Step 2: Enable the workflow

Once all secrets are configured:

```powershell
# Rename the workflow file to enable it
Rename-Item -Path ".github\workflows\deploy.yml.disabled" -NewName "deploy.yml"

# Commit and push
git add .github/workflows/deploy.yml
git commit -m "Enable GitHub Actions deployment workflow"
git push
```

### Step 3: Trigger deployment

The workflow can be triggered:
- **Manually**: Go to Actions tab > Deploy to Production > Run workflow
- **Automatically**: Uncomment the `push:` trigger in `deploy.yml` to auto-deploy on every push to main

## Current Deployment Method

For now, you're deploying using **Vercel CLI**:

```powershell
vercel --prod
```

This works perfectly and doesn't require GitHub Actions.

## Notes

- The CI workflow (`.github/workflows/ci.yml`) is separate and runs lint/typecheck on PRs
- You can keep using Vercel CLI for deployment if you prefer
- GitHub Actions deployment is optional but useful for automation

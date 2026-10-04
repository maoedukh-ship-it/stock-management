# Production Deployment & Git Version Control Guide

This guide details how to version control the **Stock Management System (SMS)** with Git, synchronize it with GitHub, and deploy it live to production using **GitHub Pages (CI/CD)**, **Vercel**, **Netlify**, or **Firebase Hosting**.

---

## 1. Git Repository & GitHub Synchronization

The repository has been initialized with the `main` branch and standard `.gitignore` rules (ignoring `node_modules/`, `dist/`, OS files, and secrets).

### Step 1: Create a Repository on GitHub
1. Log in to [GitHub](https://github.com).
2. Click the **`+`** icon in the top right corner and select **New repository**.
3. Set the Repository name, for example: `stock-management-system`.
4. Choose **Public** (or **Private**).
5. **Do not** initialize with a README, .gitignore, or license (these already exist in your local project).
6. Click **Create repository**.

### Step 2: Push Local Code to GitHub
Open your terminal in `d:\Learning Code_2026\Stock Management Project` and run:

```bash
# Add your GitHub repository as remote origin (replace with your repo URL):
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/stock-management-system.git

# Verify remote configuration:
git remote -v

# Push the main branch:
git push -u origin main
```

---

## 2. Automated Live Deployment via GitHub Pages (Free)

A GitHub Actions CI/CD workflow is already configured at:
[`./.github/workflows/deploy.yml`](file:///d:/Learning%20Code_2026/Stock%20Management%20Project/.github/workflows/deploy.yml)

Whenever you push to the `main` branch, GitHub Actions automatically:
1. Installs dependencies (`npm ci`)
2. Builds the optimized production bundle (`npm run build`)
3. Deploys the `./dist` folder to GitHub Pages

### To Enable GitHub Pages:
1. In your GitHub repository, navigate to **Settings** → **Pages** (under "Code and automation" in the left sidebar).
2. Under **Build and deployment** → **Source**, select:
   👉 **`GitHub Actions`** (instead of "Deploy from a branch").
3. Push any commit to `main` (or go to the **Actions** tab and click **Run workflow**).
4. Within 1-2 minutes, your live site will be accessible at:
   `https://YOUR_GITHUB_USERNAME.github.io/stock-management-system/`

---

## 3. Alternative 1-Click Hosting Options

### Option A: Vercel
1. Install Vercel CLI (optional) or visit [vercel.com](https://vercel.com).
2. Click **Add New** → **Project** → Import your GitHub repository.
3. Vercel automatically detects the Vite configuration:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**.

### Option B: Netlify
1. Log into [netlify.com](https://netlify.com).
2. Click **Add new site** → **Import an existing project** → GitHub.
3. Select your repository.
4. Set:
   - **Base directory**: (leave empty or `.`)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click **Deploy site**.

### Option C: Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Run `firebase login` and `firebase init hosting`.
3. When prompted for the public directory, enter: `dist`.
4. Configure as single-page app: `Yes`.
5. Run:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

---

## 4. Connecting the Live Google Sheets Backend

Once deployed on GitHub Pages or Vercel, connect your live Google Sheets database:
1. Open the deployed website in your browser.
2. Navigate to **Administration** → **Settings** (or `#settings`).
3. Click the **Localization & Language** tab.
4. Paste your deployed Google Apps Script Web App URL into:
   **`Google Apps Script Web App API URL`**
   *(e.g., `https://script.google.com/macros/s/AKfycbx.../exec`)*
5. Click **Test Connection** to confirm connectivity.
6. Click **Save Configuration**.

> **Tip**: You can also define the URL in an `.env.local` file using `VITE_API_URL` during build time.

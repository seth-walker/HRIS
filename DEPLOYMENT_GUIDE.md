# HRIS Application - Deployment Guide

This guide provides step-by-step instructions for deploying the HRIS application to production using various hosting platforms.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Vercel Deployment](#vercel-deployment-recommended-for-frontend)
4. [Railway Deployment](#railway-deployment-full-stack)
5. [Render Deployment](#render-deployment-full-stack)
6. [Heroku Deployment](#heroku-deployment-full-stack)
7. [AWS Deployment](#aws-deployment-advanced)
8. [Docker Deployment](#docker-deployment-self-hosted)
9. [DigitalOcean Deployment](#digitalocean-deployment-vps)
10. [Environment Variables Reference](#environment-variables-reference)
11. [Post-Deployment Steps](#post-deployment-steps)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- [ ] Git repository with your code (GitHub, GitLab, or Bitbucket)
- [ ] Node.js 18+ installed locally (for testing)
- [ ] PostgreSQL database (local or hosted)
- [ ] Account on chosen deployment platform
- [ ] Environment variables documented
- [ ] Application tested locally

---

## Database Setup

Before deploying the application, you need a PostgreSQL database. Here are popular options:

### Option 1: Neon (Serverless PostgreSQL) - **Recommended**

**Pros:** Free tier, serverless, auto-scaling, excellent for Vercel
**Cons:** Newer service

1. Go to [neon.tech](https://neon.tech)
2. Sign up for free account
3. Create a new project
4. Create a database named `hris_db`
5. Copy the connection string (format: `postgresql://user:password@host/dbname`)
6. Save for environment variables

### Option 2: Supabase (PostgreSQL + Backend)

**Pros:** Free tier, includes auth, real-time features
**Cons:** May be overkill for this project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings > Database
4. Copy connection string (use "Connection Pooling" for serverless)
5. Save for environment variables

### Option 3: Railway PostgreSQL

**Pros:** Simple setup, integrates with Railway deployment
**Cons:** No free tier (usage-based pricing)

1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL plugin
4. Copy connection string from Variables tab
5. Save for environment variables

### Option 4: ElephantSQL

**Pros:** Free tier available, reliable
**Cons:** Free tier has limitations (20MB storage, 5 concurrent connections)

1. Go to [elephantsql.com](https://www.elephantsql.com)
2. Sign up for free account
3. Create new instance (Tiny Turtle - Free)
4. Copy the URL from Details page
5. Save for environment variables

### Option 5: AWS RDS PostgreSQL

**Pros:** Highly scalable, enterprise-grade
**Cons:** More complex setup, costs money

See [AWS Deployment](#aws-deployment-advanced) section for details.

---

## Vercel Deployment (Recommended for Frontend)

Vercel is ideal for the **frontend** but **does not support long-running backend processes**. You'll need to deploy the backend separately.

### Architecture
- **Frontend**: Vercel
- **Backend**: Railway, Render, or Heroku
- **Database**: Neon, Supabase, or Railway

### Step 1: Deploy Backend First

Choose one of the backend deployment options below:
- [Railway](#railway-deployment-full-stack) - Easiest
- [Render](#render-deployment-full-stack) - Good free tier
- [Heroku](#heroku-deployment-full-stack) - Classic option

### Step 2: Deploy Frontend to Vercel

1. **Install Vercel CLI** (optional, can use web interface):
   ```bash
   npm install -g vercel
   ```

2. **Push code to GitHub** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/hris.git
   git push -u origin main
   ```

3. **Import Project to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" > "Project"
   - Import your GitHub repository
   - Select **frontend** folder as root directory

4. **Configure Build Settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Set Environment Variables**:
   - Go to Settings > Environment Variables
   - Add the following:
     ```
     VITE_API_URL=https://your-backend.railway.app/api
     ```
   - Replace with your actual backend URL

6. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Your frontend will be live at `https://your-project.vercel.app`

7. **Configure Custom Domain** (optional):
   - Go to Settings > Domains
   - Add your custom domain
   - Follow DNS configuration instructions

### Step 3: Update Backend CORS

Update your backend's `CORS_ORIGIN` environment variable to include your Vercel URL:
```
CORS_ORIGIN=https://your-project.vercel.app
```

---

## Railway Deployment (Full-Stack)

Railway is excellent for full-stack apps with a generous free tier (500 hours/month).

### Step 1: Prepare Your Application

1. **Create Railway Configuration Files**

   Create `railway.json` in the **backend** folder:
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm run start:prod",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

2. **Update Backend package.json**:

   Ensure you have these scripts in `backend/package.json`:
   ```json
   {
     "scripts": {
       "build": "nest build",
       "start:prod": "node dist/main"
     }
   }
   ```

### Step 2: Deploy Backend to Railway

1. **Sign up** at [railway.app](https://railway.app)

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Authorize GitHub and select your repository

3. **Configure Backend Service**:
   - Click "Add Service" > "GitHub Repo"
   - Select your repository
   - Set **Root Directory**: `backend`
   - Railway will auto-detect Node.js

4. **Add PostgreSQL Database**:
   - In your project, click "New"
   - Select "Database" > "Add PostgreSQL"
   - Railway will create a database and inject connection variables

5. **Set Environment Variables**:
   - Click on your backend service
   - Go to "Variables" tab
   - Add the following (Railway auto-provides DATABASE_URL):
     ```
     NODE_ENV=production
     PORT=3000
     JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
     JWT_EXPIRES_IN=24h
     CORS_ORIGIN=https://your-frontend.vercel.app
     ```

   - **Important**: Railway provides these automatically:
     - `DATABASE_URL` (from PostgreSQL plugin)

   - You need to manually parse DATABASE_URL or use it directly. Update your backend to use `DATABASE_URL` if provided, or individual variables.

6. **Update TypeORM Configuration**:

   Modify `backend/src/app.module.ts` to use `DATABASE_URL`:
   ```typescript
   import { parse } from 'pg-connection-string';

   const databaseUrl = process.env.DATABASE_URL;
   let typeOrmConfig;

   if (databaseUrl) {
     const config = parse(databaseUrl);
     typeOrmConfig = {
       type: 'postgres',
       host: config.host,
       port: parseInt(config.port || '5432'),
       username: config.user,
       password: config.password,
       database: config.database,
       entities: [__dirname + '/**/*.entity{.ts,.js}'],
       synchronize: process.env.NODE_ENV !== 'production',
       ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
     };
   } else {
     typeOrmConfig = {
       type: 'postgres',
       host: process.env.DB_HOST,
       port: parseInt(process.env.DB_PORT || '5432'),
       username: process.env.DB_USERNAME,
       password: process.env.DB_PASSWORD,
       database: process.env.DB_DATABASE,
       entities: [__dirname + '/**/*.entity{.ts,.js}'],
       synchronize: process.env.NODE_ENV !== 'production',
     };
   }

   @Module({
     imports: [
       TypeOrmModule.forRoot(typeOrmConfig),
       // ... other imports
     ],
   })
   ```

7. **Generate Public URL**:
   - In Settings > Networking
   - Click "Generate Domain"
   - Save the URL (e.g., `https://your-backend.up.railway.app`)

8. **Run Database Seed** (one-time):
   - Go to your service
   - Click "Deploy" tab
   - Click on latest deployment
   - Open "Logs"
   - You may need to run seed manually via Railway CLI or create a one-off task

### Step 3: Deploy Frontend to Railway

1. **Add Frontend Service**:
   - In your Railway project, click "New"
   - Select "GitHub Repo" (same repository)
   - Set **Root Directory**: `frontend`

2. **Set Environment Variables**:
   ```
   VITE_API_URL=https://your-backend.up.railway.app/api
   ```

3. **Configure Build**:
   Railway will auto-detect Vite. If needed, create `railway.json` in `frontend/`:
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm run preview -- --host 0.0.0.0 --port $PORT"
     }
   }
   ```

   **Note**: Vite preview is not recommended for production. Better to use a static server:

   Update `frontend/package.json`:
   ```json
   {
     "scripts": {
       "start": "npx serve dist -s -l $PORT"
     },
     "devDependencies": {
       "serve": "^14.2.0"
     }
   }
   ```

   Update `frontend/railway.json`:
   ```json
   {
     "deploy": {
       "startCommand": "npm run build && npm start"
     }
   }
   ```

4. **Generate Public URL** for frontend

5. **Update Backend CORS** with frontend URL

### Alternative: Deploy Frontend to Vercel

Instead of Railway for frontend, use Vercel (recommended):
- Follow [Vercel Deployment](#vercel-deployment-recommended-for-frontend) steps above
- Point `VITE_API_URL` to your Railway backend

---

## Render Deployment (Full-Stack)

Render offers a free tier for static sites and web services (with limitations).

### Step 1: Deploy PostgreSQL Database

1. Go to [render.com](https://render.com) and sign up
2. Click "New" > "PostgreSQL"
3. Configure:
   - **Name**: hris-db
   - **Database**: hris_db
   - **User**: hris_user
   - **Region**: Choose closest to users
   - **Plan**: Free (or paid for production)
4. Click "Create Database"
5. Copy **Internal Database URL** from database page
6. Save for backend configuration

### Step 2: Deploy Backend

1. **Create Web Service**:
   - Click "New" > "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: hris-backend
     - **Root Directory**: `backend`
     - **Runtime**: Node
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm run start:prod`
     - **Plan**: Free (or paid)

2. **Set Environment Variables**:
   - Scroll to "Environment Variables"
   - Add:
     ```
     NODE_ENV=production
     PORT=3000
     DATABASE_URL=<your-render-postgres-url>
     JWT_SECRET=your-super-secret-jwt-key
     JWT_EXPIRES_IN=24h
     CORS_ORIGIN=https://your-frontend.onrender.com
     ```

3. **Update TypeORM Config** (same as Railway section above)

4. **Deploy**:
   - Click "Create Web Service"
   - Wait for build and deployment
   - Note your service URL (e.g., `https://hris-backend.onrender.com`)

### Step 3: Deploy Frontend

1. **Create Static Site**:
   - Click "New" > "Static Site"
   - Connect your repository
   - Configure:
     - **Name**: hris-frontend
     - **Root Directory**: `frontend`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `dist`

2. **Set Environment Variables**:
   ```
   VITE_API_URL=https://hris-backend.onrender.com/api
   ```

3. **Deploy**:
   - Click "Create Static Site"
   - Your frontend will be at `https://hris-frontend.onrender.com`

4. **Update Backend CORS** with frontend URL

### Important Notes for Render Free Tier

- **Web services spin down after 15 minutes of inactivity**
- First request after spin-down takes ~30-60 seconds
- Consider paid tier ($7/month) for production use
- Database free tier has 90-day limit, then deleted

---

## Heroku Deployment (Full-Stack)

Heroku no longer offers a free tier, but remains a solid option for production.

### Prerequisites

1. Install Heroku CLI:
   ```bash
   npm install -g heroku
   ```

2. Login to Heroku:
   ```bash
   heroku login
   ```

### Step 1: Create Heroku Apps

```bash
# Create backend app
heroku create hris-backend

# Create frontend app
heroku create hris-frontend

# Add PostgreSQL to backend
heroku addons:create heroku-postgresql:mini -a hris-backend
```

### Step 2: Deploy Backend

1. **Add Procfile** in `backend/` folder:
   ```
   web: npm run start:prod
   ```

2. **Configure Environment Variables**:
   ```bash
   heroku config:set NODE_ENV=production -a hris-backend
   heroku config:set JWT_SECRET=your-secret-key -a hris-backend
   heroku config:set JWT_EXPIRES_IN=24h -a hris-backend
   heroku config:set CORS_ORIGIN=https://hris-frontend.herokuapp.com -a hris-backend
   ```

   Note: `DATABASE_URL` is automatically set by Heroku PostgreSQL addon

3. **Update TypeORM Config** (same as Railway)

4. **Deploy Backend**:
   ```bash
   # From project root
   git subtree push --prefix backend heroku main

   # Or if using separate repos
   cd backend
   git init
   heroku git:remote -a hris-backend
   git add .
   git commit -m "Deploy backend"
   git push heroku main
   ```

### Step 3: Deploy Frontend

1. **Add Buildpack**:
   ```bash
   heroku buildpacks:set heroku/nodejs -a hris-frontend
   ```

2. **Add Procfile** in `frontend/` folder:
   ```
   web: npm run build && npx serve dist -s -l $PORT
   ```

3. **Update package.json** in frontend:
   ```json
   {
     "scripts": {
       "start": "npx serve dist -s -l $PORT"
     }
   }
   ```

4. **Configure Environment Variables**:
   ```bash
   heroku config:set VITE_API_URL=https://hris-backend.herokuapp.com/api -a hris-frontend
   ```

5. **Deploy Frontend**:
   ```bash
   git subtree push --prefix frontend heroku main
   ```

### Step 4: Run Database Seed

```bash
heroku run npm run seed -a hris-backend
```

---

## AWS Deployment (Advanced)

AWS deployment offers maximum control and scalability.

### Architecture

- **Frontend**: S3 + CloudFront (static hosting)
- **Backend**: EC2, ECS, or Lambda (API Gateway)
- **Database**: RDS PostgreSQL
- **Load Balancer**: Application Load Balancer (ALB)

### Option A: EC2 Deployment (Traditional)

1. **Launch EC2 Instance**:
   - Instance type: t3.micro (free tier) or larger
   - OS: Ubuntu 22.04 LTS
   - Security group: Allow 22 (SSH), 80 (HTTP), 443 (HTTPS), 3000 (API)

2. **Connect to Instance**:
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Install Dependencies**:
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install PM2
   sudo npm install -g pm2

   # Install Nginx
   sudo apt install -y nginx
   ```

4. **Create RDS PostgreSQL**:
   - Go to AWS RDS console
   - Create PostgreSQL database
   - Note the endpoint, username, password
   - Configure security group to allow EC2 access

5. **Clone and Deploy Backend**:
   ```bash
   git clone https://github.com/yourusername/hris.git
   cd hris/backend
   npm install
   npm run build

   # Create .env file
   nano .env
   # Add your environment variables

   # Start with PM2
   pm2 start dist/main.js --name hris-backend
   pm2 startup
   pm2 save
   ```

6. **Configure Nginx** as reverse proxy:
   ```bash
   sudo nano /etc/nginx/sites-available/hris
   ```

   Add:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable and restart:
   ```bash
   sudo ln -s /etc/nginx/sites-available/hris /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Deploy Frontend to S3**:
   ```bash
   # Build frontend
   cd ../frontend
   npm install
   npm run build

   # Create S3 bucket
   aws s3 mb s3://hris-frontend

   # Upload build
   aws s3 sync dist/ s3://hris-frontend --acl public-read

   # Enable static website hosting
   aws s3 website s3://hris-frontend --index-document index.html --error-document index.html
   ```

8. **Setup CloudFront** (optional but recommended):
   - Create CloudFront distribution
   - Origin: S3 bucket
   - Enable HTTPS
   - Configure custom domain

### Option B: ECS with Fargate (Containerized)

See [Docker Deployment](#docker-deployment-self-hosted) first, then:

1. Create ECR repositories
2. Push Docker images to ECR
3. Create ECS cluster
4. Create task definitions
5. Create services with ALB
6. Configure auto-scaling

This is more complex but offers better scalability.

---

## Docker Deployment (Self-Hosted)

Use Docker for deployment to any VPS or container platform.

### Step 1: Create Dockerfiles

**Backend Dockerfile** (`backend/Dockerfile`):
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/main.js"]
```

**Frontend Dockerfile** (`frontend/Dockerfile`):
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production image - use nginx to serve static files
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Nginx Config** (`frontend/nginx.conf`):
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### Step 2: Create Docker Compose

**docker-compose.yml** (project root):
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    container_name: hris-db
    environment:
      POSTGRES_USER: hris_user
      POSTGRES_PASSWORD: hris_password
      POSTGRES_DB: hris_db
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U hris_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: hris-backend
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USERNAME: hris_user
      DB_PASSWORD: hris_password
      DB_DATABASE: hris_db
      PORT: 3000
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: 24h
      CORS_ORIGIN: http://localhost
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_URL: http://localhost:3000/api
    container_name: hris-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres-data:
```

### Step 3: Deploy

1. **Create .env file** in project root:
   ```
   JWT_SECRET=your-super-secret-jwt-key
   ```

2. **Build and run**:
   ```bash
   docker-compose up -d --build
   ```

3. **Run database seed**:
   ```bash
   docker-compose exec backend npm run seed
   ```

4. **Access application**:
   - Frontend: http://localhost
   - Backend: http://localhost:3000/api

### Deploy to VPS with Docker

1. **Provision VPS** (DigitalOcean, Linode, Vultr, etc.)

2. **Install Docker**:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

3. **Install Docker Compose**:
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

4. **Clone repository**:
   ```bash
   git clone https://github.com/yourusername/hris.git
   cd hris
   ```

5. **Update docker-compose.yml** for production:
   - Change CORS_ORIGIN to your domain
   - Update VITE_API_URL to your domain
   - Use stronger passwords

6. **Deploy**:
   ```bash
   docker-compose up -d --build
   ```

7. **Setup Nginx** as reverse proxy (optional but recommended):
   - Install Nginx on host
   - Proxy port 80/443 to Docker containers
   - Setup SSL with Let's Encrypt

---

## DigitalOcean Deployment (VPS)

DigitalOcean offers simple VPS (Droplets) and App Platform.

### Option A: App Platform (Easiest)

1. **Sign up** at [digitalocean.com](https://www.digitalocean.com)

2. **Create Database**:
   - Go to Databases
   - Create PostgreSQL cluster
   - Choose plan (starting at $15/month)
   - Note connection details

3. **Create App**:
   - Go to Apps
   - Click "Create App"
   - Connect GitHub repository

4. **Configure Components**:

   **Backend**:
   - Type: Web Service
   - Source Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Run Command: `npm run start:prod`
   - HTTP Port: 3000
   - Environment Variables:
     ```
     NODE_ENV=production
     DATABASE_URL=${db.DATABASE_URL}
     JWT_SECRET=your-secret
     CORS_ORIGIN=https://your-frontend-url
     ```

   **Frontend**:
   - Type: Static Site
   - Source Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Output Directory: `dist`
   - Environment Variables:
     ```
     VITE_API_URL=${backend.PUBLIC_URL}/api
     ```

5. **Deploy**:
   - Click "Create Resources"
   - DigitalOcean will build and deploy

### Option B: Droplet (VPS)

Similar to EC2 deployment:

1. Create Droplet (Ubuntu)
2. Install Node.js, PostgreSQL, Nginx
3. Follow EC2 deployment steps above

---

## Environment Variables Reference

### Backend Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `production` | Yes |
| `PORT` | Server port | `3000` | Yes |
| `DATABASE_URL` | Full PostgreSQL URL | `postgresql://user:pass@host:5432/db` | Yes* |
| `DB_HOST` | Database host | `localhost` | Yes* |
| `DB_PORT` | Database port | `5432` | Yes* |
| `DB_USERNAME` | Database user | `hris_user` | Yes* |
| `DB_PASSWORD` | Database password | `secret` | Yes* |
| `DB_DATABASE` | Database name | `hris_db` | Yes* |
| `JWT_SECRET` | Secret for JWT tokens | `your-256-bit-secret` | Yes |
| `JWT_EXPIRES_IN` | JWT expiration time | `24h` | Yes |
| `CORS_ORIGIN` | Allowed frontend origin | `https://app.example.com` | Yes |

*Use either `DATABASE_URL` OR individual DB variables

### Frontend Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API URL | `https://api.example.com/api` | Yes |

---

## Post-Deployment Steps

### 1. Run Database Migrations

If using migrations instead of synchronize:
```bash
# Railway
railway run npm run migration:run

# Render
Use Render shell or create a one-off job

# Heroku
heroku run npm run migration:run -a hris-backend

# Docker
docker-compose exec backend npm run migration:run
```

### 2. Seed Initial Data

```bash
# Railway
railway run npm run seed

# Render
Use Render shell

# Heroku
heroku run npm run seed -a hris-backend

# Docker
docker-compose exec backend npm run seed
```

### 3. Test the Deployment

1. **Test Backend API**:
   ```bash
   curl https://your-backend-url/api/health
   ```

2. **Test Frontend**:
   - Open frontend URL in browser
   - Try logging in with seed credentials:
     - Admin: admin@hris.com / admin123
     - HR: hr@hris.com / hr123

3. **Test Database Connection**:
   - Create a new employee
   - Verify data persists after refresh

### 4. Setup SSL/HTTPS

Most platforms (Vercel, Railway, Render) provide SSL automatically.

For custom deployments:

**Using Let's Encrypt with Certbot**:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 5. Setup Monitoring

- **Vercel**: Built-in analytics
- **Railway**: Built-in metrics
- **Render**: Built-in monitoring
- **Custom**: Setup Sentry, LogRocket, or similar

### 6. Setup Backups

**Railway/Render**: Automatic database backups included

**Custom Postgres**:
```bash
# Backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql

# Setup cron job for daily backups
0 2 * * * pg_dump $DATABASE_URL | gzip > ~/backups/hris-$(date +\%Y\%m\%d).sql.gz
```

### 7. Configure Custom Domain

1. **Purchase domain** (Namecheap, Google Domains, etc.)

2. **Add DNS records**:
   - For Vercel: Add CNAME pointing to `cname.vercel-dns.com`
   - For Railway: Add CNAME from Railway settings
   - For Render: Add CNAME from Render settings

3. **Wait for DNS propagation** (up to 48 hours)

4. **Update CORS** to include custom domain

---

## Troubleshooting

### Frontend Can't Connect to Backend

**Problem**: CORS errors or network errors

**Solutions**:
1. Check `VITE_API_URL` is correct (include `/api` at the end)
2. Verify backend CORS_ORIGIN includes frontend URL
3. Check backend is running and accessible
4. Open browser dev tools > Network tab to see actual requests

### Database Connection Failed

**Problem**: Backend can't connect to database

**Solutions**:
1. Verify database is running
2. Check database credentials
3. For serverless: Ensure SSL is enabled
4. Check database accepts connections from backend IP
5. Verify connection string format

### Build Fails

**Problem**: Deployment build fails

**Solutions**:
1. Test build locally first: `npm run build`
2. Check for TypeScript errors: `npm run lint`
3. Ensure all dependencies are in `package.json`
4. Check Node.js version compatibility
5. Review build logs for specific errors

### Application Crashes on Startup

**Problem**: Backend crashes immediately after deploy

**Solutions**:
1. Check environment variables are set correctly
2. Review application logs
3. Ensure database schema exists (run migrations/synchronize)
4. Check for missing dependencies
5. Verify port configuration

### Slow Performance

**Problem**: Application is slow

**Solutions**:
1. Check database query performance
2. Enable response caching
3. Add database indexes (see TODOs.md)
4. Implement pagination
5. Use CDN for static assets
6. Upgrade server resources

### Free Tier Limitations

**Problem**: App spins down or has usage limits

**Solutions**:
1. Upgrade to paid tier
2. Use multiple free tiers (frontend on Vercel, backend on Railway)
3. Implement warming pings (keep-alive requests)
4. Optimize cold start times
5. Consider serverless alternatives

---

## Recommended Deployment Strategy

For **small projects** or **MVPs**:
- ✅ Frontend: Vercel (free)
- ✅ Backend: Railway (free 500 hours)
- ✅ Database: Neon (free tier)
- **Cost**: $0/month (with limitations)

For **production apps**:
- ✅ Frontend: Vercel Pro ($20/month) or Cloudflare Pages (free)
- ✅ Backend: Railway ($5-20/month) or Render ($7-25/month)
- ✅ Database: Neon Scale ($19/month) or Supabase Pro ($25/month)
- ✅ Monitoring: Sentry (free tier) + LogRocket (paid)
- **Cost**: ~$50-100/month

For **enterprise apps**:
- ✅ Frontend: AWS CloudFront + S3
- ✅ Backend: AWS ECS Fargate or EKS
- ✅ Database: AWS RDS PostgreSQL (Multi-AZ)
- ✅ Load Balancer: AWS ALB
- ✅ Monitoring: CloudWatch, Datadog, New Relic
- **Cost**: $200-1000+/month (depending on traffic)

---

## Next Steps After Deployment

1. ✅ Setup monitoring and error tracking
2. ✅ Configure automated backups
3. ✅ Setup CI/CD pipeline (GitHub Actions)
4. ✅ Implement security best practices (see TODOs.md)
5. ✅ Setup staging environment
6. ✅ Create deployment checklist
7. ✅ Document deployment process for team
8. ✅ Setup uptime monitoring (UptimeRobot, Pingdom)
9. ✅ Configure log aggregation (Papertrail, Logtail)
10. ✅ Plan scaling strategy

---

**Last Updated:** 2025-11-03
**Document Version:** 1.0

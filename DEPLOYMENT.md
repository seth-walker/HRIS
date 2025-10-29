# HRIS Deployment Guide

This guide covers deploying the HRIS application to production environments.

## Prerequisites

- A server or cloud platform (AWS, DigitalOcean, Heroku, etc.)
- PostgreSQL database (managed or self-hosted)
- Node.js v18+ installed on the server
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)

## Environment Configuration

### Backend Environment Variables

Create a production `.env` file in the `backend` directory:

```bash
# Database Configuration
DB_HOST=your-postgres-host
DB_PORT=5432
DB_USERNAME=hris_user
DB_PASSWORD=your-secure-password
DB_DATABASE=hris_db

# Application Configuration
PORT=3000
NODE_ENV=production

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.com
```

### Frontend Environment Variables

Create a production `.env` file in the `frontend` directory:

```bash
VITE_API_URL=https://your-backend-domain.com/api
```

## Deployment Options

### Option 1: Traditional VPS (DigitalOcean, Linode, AWS EC2)

#### 1. Prepare the Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx
```

#### 2. Setup PostgreSQL

```bash
sudo -u postgres psql

CREATE DATABASE hris_db;
CREATE USER hris_user WITH ENCRYPTED PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE hris_db TO hris_user;
\q
```

#### 3. Deploy Backend

```bash
# Clone repository
git clone <your-repo-url>
cd HRIS/backend

# Install dependencies
npm install

# Create .env file with production settings
nano .env

# Build the application
npm run build

# Seed the database (first time only)
npm run seed

# Start with PM2
pm2 start dist/main.js --name hris-backend
pm2 save
pm2 startup
```

#### 4. Deploy Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file with production settings
nano .env

# Build for production
npm run build

# Copy build to Nginx directory
sudo cp -r dist/* /var/www/hris/
```

#### 5. Configure Nginx

Create `/etc/nginx/sites-available/hris`:

```nginx
# Backend API
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Frontend
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/hris;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/hris /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. Setup SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d api.your-domain.com
```

### Option 2: Docker Deployment

#### 1. Create Backend Dockerfile

`backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

#### 2. Create Frontend Dockerfile

`frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 3. Create docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: hris_db
      POSTGRES_USER: hris_user
      POSTGRES_PASSWORD: your-secure-password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USERNAME: hris_user
      DB_PASSWORD: your-secure-password
      DB_DATABASE: hris_db
      JWT_SECRET: your-super-secret-jwt-key
      NODE_ENV: production
      CORS_ORIGIN: http://localhost
    depends_on:
      - postgres
    ports:
      - "3000:3000"

  frontend:
    build: ./frontend
    environment:
      VITE_API_URL: http://localhost:3000/api
    depends_on:
      - backend
    ports:
      - "80:80"

volumes:
  postgres_data:
```

#### 4. Deploy with Docker

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Seed the database (first time only)
docker-compose exec backend npm run seed

# Stop all services
docker-compose down
```

### Option 3: Cloud Platform (Heroku, Railway, Render)

#### Heroku Deployment

1. Install Heroku CLI
2. Create Heroku apps:

```bash
# Create backend app
heroku create hris-backend
heroku addons:create heroku-postgresql:hobby-dev -a hris-backend

# Set environment variables
heroku config:set JWT_SECRET=your-secret -a hris-backend
heroku config:set NODE_ENV=production -a hris-backend

# Deploy backend
cd backend
git init
heroku git:remote -a hris-backend
git add .
git commit -m "Deploy backend"
git push heroku master

# Run seed (first time only)
heroku run npm run seed -a hris-backend

# Create frontend app
cd ../frontend
heroku create hris-frontend

# Set environment variables
heroku config:set VITE_API_URL=https://hris-backend.herokuapp.com/api -a hris-frontend

# Deploy frontend
git init
heroku git:remote -a hris-frontend
git add .
git commit -m "Deploy frontend"
git push heroku master
```

## Post-Deployment

### 1. Verify Deployment

- Test backend API: `curl https://api.your-domain.com/api/auth/login`
- Visit frontend: `https://your-domain.com`
- Try logging in with test credentials
- Test all major features

### 2. Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secret (minimum 32 characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Enable rate limiting (optional)
- [ ] Set up database backups
- [ ] Review and restrict database access
- [ ] Enable application monitoring

### 3. Monitoring

Set up monitoring for:
- Application uptime
- Database performance
- Error logging
- API response times

Recommended tools:
- **PM2 Plus** - Process monitoring
- **Sentry** - Error tracking
- **New Relic** - Application performance
- **Datadog** - Infrastructure monitoring

### 4. Backup Strategy

```bash
# PostgreSQL backup
pg_dump -U hris_user -h localhost hris_db > backup_$(date +%Y%m%d).sql

# Automated daily backup (crontab)
0 2 * * * pg_dump -U hris_user hris_db > /backups/hris_$(date +\%Y\%m\%d).sql
```

## Maintenance

### Update Application

```bash
# Pull latest changes
git pull origin main

# Backend
cd backend
npm install
npm run build
pm2 restart hris-backend

# Frontend
cd ../frontend
npm install
npm run build
sudo cp -r dist/* /var/www/hris/
```

### Database Migrations

When schema changes are needed:

```bash
# Create migration
npm run typeorm migration:create -- -n MigrationName

# Run migrations
npm run typeorm migration:run

# Revert migration
npm run typeorm migration:revert
```

## Troubleshooting

### Common Issues

**Backend won't start:**
- Check database connection
- Verify environment variables
- Check application logs: `pm2 logs hris-backend`

**Frontend can't connect to API:**
- Verify VITE_API_URL is correct
- Check CORS settings in backend
- Verify SSL certificates

**Database connection errors:**
- Check PostgreSQL is running
- Verify credentials
- Check firewall rules

## Support

For deployment assistance, please open an issue on GitHub.

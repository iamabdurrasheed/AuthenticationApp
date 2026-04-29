# AuthenticationApp

A full-stack User Authentication System built with **Spring Boot 3** (backend) and **Angular 18** (frontend).

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Features](#4-features)
5. [API Reference](#5-api-reference)
6. [Logging & Catalina Logs](#6-logging--catalina-logs)
7. [Run Locally — IntelliJ IDEA](#7-run-locally--intellij-idea)
8. [Run Locally — Terminal](#8-run-locally--terminal)
9. [Deploy with Docker (Full Guide)](#9-deploy-with-docker-full-guide)
10. [Deploy on Standalone Tomcat (.tar.gz)](#10-deploy-on-standalone-tomcat-targz)
11. [Environment Variables](#11-environment-variables)
12. [H2 Database Console](#12-h2-database-console)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Project Overview

| Flow | Behaviour |
|------|-----------|
| User not registered | Redirected to `/register` |
| User registered | Can login at `/login` |
| Login successful | JWT token issued → redirected to `/dashboard` |
| Dashboard accessed without token | Redirected to `/login` |

---

## 2. Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Java | 17 | Language |
| Spring Boot | 3.2.5 | Framework |
| Spring MVC | 6.x | REST Controllers |
| Spring Security | 6.x | JWT Auth + BCrypt |
| Spring Data JPA | 3.x | Database ORM |
| H2 Database | Runtime | In-memory DB |
| JJWT | 0.11.5 | JWT generation/validation |
| Lombok | Latest | Boilerplate reduction |
| Embedded Tomcat | 10.1.x | Application server |
| Logback | 1.4.x | Logging (app.log + catalina.out) |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Angular | 18.2 | SPA Framework |
| TypeScript | 5.5 | Language |
| Angular Router | 18.2 | Client-side routing |
| Reactive Forms | 18.2 | Form handling + validation |
| HttpClient | 18.2 | API calls |
| RxJS | 7.8 | Async/reactive streams |
| Nginx | Alpine | Production static file server |

---

## 3. Project Structure

```
AuthenticationApp/
├── src/
│   └── main/
│       ├── java/com/authapp/
│       │   ├── AuthApplication.java          # Entry point
│       │   ├── config/
│       │   │   └── SecurityConfig.java       # Spring Security + CORS + JWT filter chain
│       │   ├── controller/
│       │   │   ├── AuthController.java       # POST /api/auth/register, /login
│       │   │   └── DashboardController.java  # GET /api/dashboard
│       │   ├── dto/
│       │   │   ├── LoginRequest.java
│       │   │   ├── RegisterRequest.java
│       │   │   ├── AuthResponse.java
│       │   │   └── ApiResponse.java
│       │   ├── entity/
│       │   │   └── User.java                 # JPA entity (id, username, email, password)
│       │   ├── exception/
│       │   │   └── GlobalExceptionHandler.java
│       │   ├── repository/
│       │   │   └── UserRepository.java
│       │   ├── security/
│       │   │   ├── JwtUtils.java             # Token generation + validation
│       │   │   ├── JwtAuthFilter.java        # Bearer token filter
│       │   │   └── UserDetailsServiceImpl.java
│       │   └── service/
│       │       └── AuthService.java          # Business logic + logging
│       └── resources/
│           ├── application.properties
│           └── logback-spring.xml            # Dual log config (app.log + catalina.out)
│
├── auth-frontend/
│   └── src/app/
│       ├── pages/
│       │   ├── login/login.component.ts
│       │   ├── register/register.component.ts
│       │   └── dashboard/dashboard.component.ts
│       ├── services/
│       │   └── auth.service.ts               # API calls + session management
│       ├── guards/
│       │   ├── auth.guard.ts                 # Route protection
│       │   └── jwt.interceptor.ts            # Auto-attach Bearer token
│       ├── app.routes.ts
│       ├── app.config.ts
│       └── app.component.ts
│
├── logs/                                     # Generated at runtime
│   ├── app.log                               # Application + Spring logs
│   └── catalina.out                          # Tomcat internal logs
│
├── Dockerfile                                # Backend Docker image
├── docker-compose.yml                        # Full stack orchestration
├── auth-frontend/Dockerfile                  # Frontend Docker image (Nginx)
├── auth-frontend/nginx.conf                  # Nginx reverse proxy config
└── pom.xml
```

---

## 4. Features

- User registration with BCrypt password hashing
- JWT-based stateless authentication (24h expiry)
- Protected dashboard route (Angular auth guard)
- Auto-attach JWT on every HTTP request (interceptor)
- Reactive forms with client-side validation
- Global exception handler with structured error responses
- Dual logging: `logs/app.log` + `logs/catalina.out`
- Daily log rotation, 7-day retention
- H2 in-memory database (zero setup)
- CORS configured for `localhost:4200`

---

## 5. API Reference

### POST `/api/auth/register`
**Request:**
```json
{
  "username": "john",
  "email": "john@example.com",
  "password": "secret123"
}
```
**Response `200`:**
```json
{
  "token": "<jwt>",
  "username": "john",
  "email": "john@example.com"
}
```
**Response `400`:** Username or email already taken.

---

### POST `/api/auth/login`
**Request:**
```json
{
  "username": "john",
  "password": "secret123"
}
```
**Response `200`:**
```json
{
  "token": "<jwt>",
  "username": "john",
  "email": "john@example.com"
}
```
**Response `400`:** Invalid username or password.

---

### GET `/api/dashboard`
**Headers:** `Authorization: Bearer <jwt>`

**Response `200`:**
```json
{
  "message": "Welcome to your dashboard!",
  "username": "john"
}
```
**Response `403`:** Missing or invalid token.

---

## 6. Logging & Catalina Logs

### How it works
Spring Boot's embedded Tomcat does **not** produce a standalone `catalina.out` by default — it routes everything through Logback. This project configures Logback to split logs into two dedicated files.

### Log files (generated at runtime)

| File | Contains |
|------|----------|
| `logs/app.log` | Application logs, Spring, JPA, Security events |
| `logs/catalina.out` | Tomcat internals: `org.apache.catalina`, `org.apache.tomcat`, `org.apache.coyote` |

### What you'll see in `catalina.out`
```
o.apache.catalina.core.StandardEngine  - Starting Servlet engine: [Apache Tomcat/10.1.x]
o.a.c.c.C.[Tomcat].[localhost].[/]     - Initializing Spring embedded WebApplicationContext
o.apache.catalina.core.StandardService - Starting service [Tomcat]
```

### What you'll see in `app.log`
```
INFO  c.authapp.service.AuthService - User registered successfully: john
INFO  c.authapp.service.AuthService - Login attempt for user: john
INFO  c.authapp.service.AuthService - Login successful for user: john
WARN  c.authapp.service.AuthService - Login failed for user: baduser
```

### Log rotation
Both files rotate daily. Archived files are named:
```
logs/app.2025-01-15.log
logs/catalina.2025-01-15.out
```
Retention: 7 days (configurable in `logback-spring.xml`).

---

## 7. Run Locally — IntelliJ IDEA

### Prerequisites
- IntelliJ IDEA (Community or Ultimate)
- JDK 17+ installed
- Node.js (any version) installed
- Maven (bundled with IntelliJ)

### Backend

1. Open IntelliJ → `File → Open` → select the `AuthenticationApp` root folder
2. Wait for Maven sync to complete (watch the bottom progress bar)
3. Open `src/main/java/com/authapp/AuthApplication.java`
4. Click the green ▶ **Run** button next to `public static void main`
5. Backend is live at `http://localhost:8080`

### Frontend

Open IntelliJ's built-in terminal (`Alt+F12`) or any CMD window:

```cmd
cd C:\Users\mrasheed\Desktop\AuthenticationApp\auth-frontend
npm start
```

Frontend is live at `http://localhost:4200`

---

## 8. Run Locally — Terminal

### Backend
```cmd
cd C:\Users\mrasheed\Desktop\AuthenticationApp
mvnw.cmd spring-boot:run
```

### Frontend
```cmd
cd C:\Users\mrasheed\Desktop\AuthenticationApp\auth-frontend
npm start
```

### Quick API test (CMD)
```cmd
curl -X POST http://localhost:8080/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser\",\"email\":\"test@test.com\",\"password\":\"secret123\"}"
```

---

## 9. Deploy with Docker (Full Guide)

This section covers deploying the **entire application** (backend + frontend) on any server using Docker from scratch.

### Prerequisites on the server
- Linux server (Ubuntu 22.04 recommended) or any OS with Docker support
- Docker Engine 24+
- Docker Compose v2+
- Ports `80` and `8080` open in firewall

---

### Step 1 — Install Docker on the server

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sudo sh

# Add your user to docker group (no sudo needed)
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker --version
docker compose version
```

---

### Step 2 — Copy the project to the server

**Option A — Git (recommended)**
```bash
git clone https://github.com/<your-username>/AuthenticationApp.git
cd AuthenticationApp
```

**Option B — SCP from your Windows machine**
```cmd
scp -r C:\Users\mrasheed\Desktop\AuthenticationApp user@<server-ip>:/home/user/
```

---

### Step 3 — Set the JWT secret (production)

Never use the default secret in production. Create a `.env` file in the project root:

```bash
cd AuthenticationApp
cat > .env << 'EOF'
APP_JWT_SECRET=replace_this_with_a_64_char_random_secret_string_for_production_use
EOF
```

Update `docker-compose.yml` to read from `.env` (already configured via `environment` block).

---

### Step 4 — Build and start all containers

```bash
# From the AuthenticationApp root directory
docker compose up --build -d
```

This single command:
- Builds the Spring Boot JAR inside a Maven container
- Packages it into a lightweight JRE Alpine image
- Builds the Angular app inside a Node container
- Serves the Angular build via Nginx Alpine
- Wires both containers on a private Docker network
- Maps backend to port `8080`, frontend to port `80`

---

### Step 5 — Verify containers are running

```bash
docker compose ps
```

Expected output:
```
NAME                 STATUS          PORTS
authapp-backend      Up (healthy)    0.0.0.0:8080->8080/tcp
authapp-frontend     Up              0.0.0.0:80->80/tcp
```

---

### Step 6 — Access the application

| URL | What |
|-----|------|
| `http://<server-ip>` | Angular frontend (port 80) |
| `http://<server-ip>/register` | Register page |
| `http://<server-ip>/login` | Login page |
| `http://<server-ip>/dashboard` | Dashboard (JWT protected) |
| `http://<server-ip>:8080/api/auth/register` | Backend API direct |
| `http://<server-ip>:8080/h2-console` | H2 DB console |

---

### Step 7 — View logs

```bash
# Live backend logs (app.log + catalina.out)
docker compose logs -f backend

# Live frontend (Nginx access logs)
docker compose logs -f frontend

# View catalina.out on host (mounted volume)
cat logs/catalina.out

# View app.log on host
cat logs/app.log
```

---

### Step 8 — Stop / restart

```bash
# Stop all containers
docker compose down

# Restart without rebuilding
docker compose up -d

# Rebuild and restart (after code changes)
docker compose up --build -d
```

---

### Step 9 — Update the application (redeploy)

```bash
# Pull latest code
git pull origin main

# Rebuild and redeploy with zero manual steps
docker compose up --build -d
```

---

### Docker Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│                  Docker Host                    │
│                                                 │
│  ┌──────────────────┐    ┌───────────────────┐  │
│  │  authapp-frontend│    │  authapp-backend  │  │
│  │  (Nginx:Alpine)  │    │  (JRE 17:Alpine)  │  │
│  │                  │    │                   │  │
│  │  Angular 18 SPA  │───▶│  Spring Boot 3    │  │
│  │  Port: 80        │    │  Port: 8080       │  │
│  │                  │    │                   │  │
│  │  /api/* proxied ─┼───▶│  H2 In-Memory DB  │  │
│  └──────────────────┘    └───────────────────┘  │
│           │                       │             │
│           └───── authapp-network ─┘             │
│                  (bridge)                       │
│                                                 │
│  ./logs/ ◀──────────────── volume mount        │
└─────────────────────────────────────────────────┘
```

---

## 10. Deploy on Standalone Tomcat (.tar.gz)

This section covers deploying the Spring Boot backend on a **standalone Apache Tomcat** server (the traditional `.tar.gz` installation), not Docker.

> Note: The Angular frontend is a static SPA — it is served separately via Nginx or any static file server. Only the backend needs Tomcat.

---

### Step 1 — Install Java 17 on the server

```bash
sudo apt update
sudo apt install -y openjdk-17-jdk
java -version
```

---

### Step 2 — Download and extract Tomcat

```bash
# Download Tomcat 10.1 (matches Spring Boot 3's embedded version)
wget https://downloads.apache.org/tomcat/tomcat-10/v10.1.24/bin/apache-tomcat-10.1.24.tar.gz

# Extract
tar -xzf apache-tomcat-10.1.24.tar.gz

# Move to standard location
sudo mv apache-tomcat-10.1.24 /opt/tomcat

# Make scripts executable
sudo chmod +x /opt/tomcat/bin/*.sh
```

---

### Step 3 — Change pom.xml packaging to WAR

Edit `pom.xml` — change packaging and add Tomcat scope:

```xml
<!-- Change this line -->
<packaging>war</packaging>

<!-- Add this dependency -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-tomcat</artifactId>
    <scope>provided</scope>
</dependency>
```

---

### Step 4 — Extend SpringBootServletInitializer

Edit `AuthApplication.java`:

```java
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

@SpringBootApplication
public class AuthApplication extends SpringBootServletInitializer {

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        return builder.sources(AuthApplication.class);
    }

    public static void main(String[] args) {
        SpringApplication.run(AuthApplication.class, args);
    }
}
```

---

### Step 5 — Build the WAR file

```cmd
# On your Windows machine (IntelliJ terminal)
mvnw.cmd clean package -DskipTests
```

Output WAR file:
```
target/AuthenticationApp-1.0.0.war
```

---

### Step 6 — Deploy WAR to Tomcat

```bash
# Copy WAR to Tomcat webapps folder
scp target/AuthenticationApp-1.0.0.war user@<server-ip>:/opt/tomcat/webapps/ROOT.war
```

Deploying as `ROOT.war` means the app is served at `/` (not `/AuthenticationApp-1.0.0/`).

---

### Step 7 — Set environment variable for JWT secret

```bash
# Edit Tomcat's setenv.sh
sudo nano /opt/tomcat/bin/setenv.sh
```

Add:
```bash
export APP_JWT_SECRET="replace_this_with_your_64_char_secret"
export JAVA_OPTS="-Xms256m -Xmx512m"
```

```bash
sudo chmod +x /opt/tomcat/bin/setenv.sh
```

---

### Step 8 — Start Tomcat

```bash
sudo /opt/tomcat/bin/startup.sh
```

Verify it started:
```bash
tail -f /opt/tomcat/logs/catalina.out
```

You should see:
```
INFO: Starting Servlet engine: [Apache Tomcat/10.1.24]
INFO: Initializing Spring embedded WebApplicationContext
INFO: Started AuthApplication in 4.3 seconds
```

---

### Step 9 — Catalina logs location (standalone Tomcat)

With standalone Tomcat, the real `catalina.out` lives here:

```
/opt/tomcat/logs/
├── catalina.out          ← main Tomcat log (stdout + stderr)
├── catalina.2025-01-15.log
├── localhost.2025-01-15.log
├── localhost_access_log.2025-01-15.txt   ← HTTP access log
└── manager.2025-01-15.log
```

```bash
# Watch live
tail -f /opt/tomcat/logs/catalina.out

# Watch HTTP access log
tail -f /opt/tomcat/logs/localhost_access_log.$(date +%Y-%m-%d).txt
```

---

### Step 10 — Deploy Angular frontend (Nginx)

```bash
# Install Nginx
sudo apt install -y nginx

# Build Angular on your Windows machine
cd auth-frontend
npm run build

# Copy dist to server
scp -r dist/auth-frontend/* user@<server-ip>:/var/www/html/

# Configure Nginx to proxy /api to Tomcat
sudo nano /etc/nginx/sites-available/default
```

Nginx config:
```nginx
server {
    listen 80;
    root /var/www/html;
    index index.html;

    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

### Step 11 — Stop / restart Tomcat

```bash
# Stop
sudo /opt/tomcat/bin/shutdown.sh

# Start
sudo /opt/tomcat/bin/startup.sh

# Redeploy (replace WAR and restart)
sudo /opt/tomcat/bin/shutdown.sh
sudo cp AuthenticationApp-1.0.0.war /opt/tomcat/webapps/ROOT.war
sudo /opt/tomcat/bin/startup.sh
```

---

## 11. Environment Variables

| Variable | Default (dev) | Required in prod |
|---|---|---|
| `APP_JWT_SECRET` | 64-char fallback in `application.properties` | YES — override with strong secret |
| `SPRING_PROFILES_ACTIVE` | (none) | Optional — set to `prod` |
| `SERVER_PORT` | `8080` | Optional |

---

## 12. H2 Database Console

Available only in development (not recommended in production).

- URL: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:authdb`
- Username: `sa`
- Password: *(leave empty)*

> Data is in-memory only — it resets every time the backend restarts. For production, replace H2 with MySQL or PostgreSQL in `application.properties`.

---

## 13. Troubleshooting

### Backend won't start — port 8080 in use
```cmd
netstat -ano | findstr :8080
taskkill /PID <pid> /F
```

### Angular build fails — `Cannot find module 'rxjs'`
Node.js odd versions (v21, v23, v25) can corrupt installs. Fix:
```cmd
cd auth-frontend
powershell -Command "Remove-Item -Path node_modules -Recurse -Force"
npm install --legacy-peer-deps
```

### CORS error in browser
Ensure backend is running on port `8080` and frontend on `4200`.
Check `SecurityConfig.java` — `allowedOrigins` must include `http://localhost:4200`.

### JWT token not sent
Check browser DevTools → Network tab → request headers must contain:
```
Authorization: Bearer eyJ...
```
If missing, the `jwtInterceptor` is not firing — ensure `provideHttpClient(withInterceptors([jwtInterceptor]))` is in `app.config.ts`.

### Docker build fails — `AuthenticationApp-1.0.0.jar not found`
Ensure `pom.xml` has `<version>1.0.0</version>` and `<packaging>jar</packaging>`.
The `Dockerfile` COPY line references `AuthenticationApp-1.0.0.jar` exactly.

### Tomcat WAR — 404 on all routes
Ensure the WAR is deployed as `ROOT.war` not `AuthenticationApp-1.0.0.war`.
Check `/opt/tomcat/logs/catalina.out` for deployment errors.

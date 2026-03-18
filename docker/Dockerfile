# Sentinel Core Launcher — Docker Development Environment
# Uses Node.js for frontend development with Vite HMR
# Rust/Tauri compilation runs on the host machine (requires system libs)

FROM node:22-alpine AS dev

WORKDIR /app

# Install dependencies only (cached layer)
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY . .

# Expose Vite dev server port
EXPOSE 1420

# Start Vite dev server for frontend development
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

FROM node:18

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

EXPOSE 5173

# Start Vite dev server bound to 0.0.0.0 so Docker can expose it
CMD ["pnpm", "run", "dev", "--host"]

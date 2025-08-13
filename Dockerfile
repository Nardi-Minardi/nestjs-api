FROM ubuntu:22.04

# Install dependencies & tools
RUN apt-get update && apt-get install -y \
    curl \
    nano \
    git \
    build-essential \
    libssl-dev \
    postgresql-client \
    netcat \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 18 LTS
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs

WORKDIR /usr/src/app

# Script tunggu Postgres siap
RUN echo '#!/bin/bash\n\
attempt=0\n\
max_attempts=30\n\
while ! nc -z db 5432; do\n\
  echo "Waiting for PostgreSQL... ($attempt)"\n\
  attempt=$((attempt+1))\n\
  if [ $attempt -ge $max_attempts ]; then\n\
    echo "PostgreSQL not available, exiting."\n\
    exit 1\n\
  fi\n\
  sleep 2\n\
done\n\
echo "PostgreSQL is up."' > /usr/local/bin/wait-for-postgres.sh && chmod +x /usr/local/bin/wait-for-postgres.sh

# Copy package.json & package-lock.json (atau yarn.lock)
COPY package*.json ./

# Install dependencies (termasuk dev dependencies utk ts-node)
RUN npm install --include=dev

# Copy source code (dipakai untuk build dan runtime)
COPY . .

# Generate Prisma client & build NestJS
RUN npx prisma generate && npm run build

# Copy entrypoint script dan beri executable permission
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
# Default command for development
CMD ["npm", "run", "start:dev"]

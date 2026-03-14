FROM node:20-slim

# Instala ffmpeg + python3 + pip (para yt-dlp)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    curl \
    && pip3 install -U yt-dlp --break-system-packages \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia dependências e instala
COPY package.json package-lock.json* ./
RUN npm ci

# Copia o restante do projeto
COPY . .

# Build Next.js
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

---

**`.dockerignore`**
```
node_modules
.next
.git
.env*.local
*.log
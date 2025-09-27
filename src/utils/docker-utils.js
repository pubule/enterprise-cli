const fs = require('fs-extra');
const path = require('path');
const { execa } = require('execa');

/**
 * Docker utilities for containerization
 */

/**
 * Check if Docker is installed and accessible
 * @returns {boolean} True if Docker is available
 */
async function isDockerAvailable() {
  try {
    await execa('docker', ['--version']);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if Docker Compose is installed and accessible
 * @returns {boolean} True if Docker Compose is available
 */
async function isDockerComposeAvailable() {
  try {
    await execa('docker-compose', ['--version']);
    return true;
  } catch {
    // Try docker compose (newer syntax)
    try {
      await execa('docker', ['compose', 'version']);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Get Docker version
 * @returns {string|null} Docker version or null if not available
 */
async function getDockerVersion() {
  try {
    const { stdout } = await execa('docker', ['--version']);
    const versionMatch = stdout.match(/Docker version (\d+\.\d+\.\d+)/);
    return versionMatch ? versionMatch[1] : null;
  } catch {
    return null;
  }
}

/**
 * Check if Docker daemon is running
 * @returns {boolean} True if Docker daemon is running
 */
async function isDockerRunning() {
  try {
    await execa('docker', ['info']);
    return true;
  } catch {
    return false;
  }
}

/**
 * Build Docker image
 * @param {string} projectPath - Path to project directory
 * @param {string} imageName - Name for the Docker image
 * @param {object} options - Build options
 */
async function buildImage(projectPath, imageName, options = {}) {
  const { dockerfile = 'Dockerfile', tag = 'latest', buildArgs = {} } = options;

  const args = ['build', '-t', `${imageName}:${tag}`];

  // Add build arguments
  for (const [key, value] of Object.entries(buildArgs)) {
    args.push('--build-arg', `${key}=${value}`);
  }

  // Add dockerfile if not default
  if (dockerfile !== 'Dockerfile') {
    args.push('-f', dockerfile);
  }

  // Add build context (project path)
  args.push('.');

  try {
    const result = await execa('docker', args, {
      cwd: projectPath,
      stdio: 'inherit'
    });

    return {
      success: true,
      imageName: `${imageName}:${tag}`
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Run Docker container
 * @param {string} imageName - Name of the Docker image
 * @param {object} options - Run options
 */
async function runContainer(imageName, options = {}) {
  const {
    containerName,
    ports = [],
    volumes = [],
    environment = {},
    detached = true,
    remove = false
  } = options;

  const args = ['run'];

  if (detached) {
    args.push('-d');
  }

  if (remove) {
    args.push('--rm');
  }

  if (containerName) {
    args.push('--name', containerName);
  }

  // Add port mappings
  ports.forEach(port => {
    if (typeof port === 'string') {
      args.push('-p', port);
    } else {
      args.push('-p', `${port.host}:${port.container}`);
    }
  });

  // Add volume mappings
  volumes.forEach(volume => {
    if (typeof volume === 'string') {
      args.push('-v', volume);
    } else {
      args.push('-v', `${volume.host}:${volume.container}`);
    }
  });

  // Add environment variables
  for (const [key, value] of Object.entries(environment)) {
    args.push('-e', `${key}=${value}`);
  }

  args.push(imageName);

  try {
    const result = await execa('docker', args, { stdio: 'inherit' });
    return {
      success: true,
      containerId: result.stdout.trim()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Stop Docker container
 * @param {string} containerName - Name or ID of the container
 */
async function stopContainer(containerName) {
  try {
    await execa('docker', ['stop', containerName]);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Remove Docker container
 * @param {string} containerName - Name or ID of the container
 */
async function removeContainer(containerName) {
  try {
    await execa('docker', ['rm', containerName]);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Run Docker Compose
 * @param {string} projectPath - Path to project directory
 * @param {string} command - Docker Compose command (up, down, etc.)
 * @param {object} options - Command options
 */
async function runDockerCompose(projectPath, command, options = {}) {
  const { file = 'docker-compose.yml', detached = true } = options;

  let args = ['compose', '-f', file];

  if (command === 'up' && detached) {
    args.push('up', '-d');
  } else {
    args.push(command);
  }

  try {
    await execa('docker', args, {
      cwd: projectPath,
      stdio: 'inherit'
    });

    return { success: true };
  } catch (error) {
    // Try legacy docker-compose command
    try {
      args = ['-f', file];
      if (command === 'up' && detached) {
        args.push('up', '-d');
      } else {
        args.push(command);
      }

      await execa('docker-compose', args, {
        cwd: projectPath,
        stdio: 'inherit'
      });

      return { success: true };
    } catch (legacyError) {
      return {
        success: false,
        error: legacyError.message
      };
    }
  }
}

/**
 * Generate Dockerfile for Spring Boot application
 * @param {object} config - Configuration object
 * @returns {string} Dockerfile content
 */
function generateSpringBootDockerfile(config) {
  const {
    javaVersion = '17',
    jarFile = '*.jar',
    exposedPort = '8080'
  } = config;

  return `# Multi-stage build for Spring Boot application
FROM eclipse-temurin:${javaVersion}-jdk-alpine AS builder

WORKDIR /app
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline

COPY src ./src
RUN ./mvnw clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:${javaVersion}-jre-alpine

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \\
    adduser -u 1001 -S appuser -G appgroup

# Install required packages
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy JAR file from builder stage
COPY --from=builder /app/target/${jarFile} app.jar

# Change ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE ${exposedPort}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:${exposedPort}/actuator/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Run the application
CMD ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
`;
}

/**
 * Generate Dockerfile for React application
 * @param {object} config - Configuration object
 * @returns {string} Dockerfile content
 */
function generateReactDockerfile(config) {
  const {
    nodeVersion = '18',
    buildTool = 'npm',
    exposedPort = '80'
  } = config;

  const packageManager = buildTool === 'yarn' ? 'yarn' : 'npm';
  const installCommand = buildTool === 'yarn' ? 'yarn install --frozen-lockfile' : 'npm ci';
  const buildCommand = buildTool === 'yarn' ? 'yarn build' : 'npm run build';

  return `# Multi-stage build for React application
FROM node:${nodeVersion}-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
${buildTool === 'yarn' ? 'COPY yarn.lock ./' : ''}

# Install dependencies
RUN ${installCommand}

# Copy source code
COPY . .

# Build the application
RUN ${buildCommand}

# Production stage with Nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \\
    adduser -u 1001 -S appuser -G appgroup

# Change ownership of nginx files
RUN chown -R appuser:appgroup /usr/share/nginx/html && \\
    chown -R appuser:appgroup /var/cache/nginx && \\
    chown -R appuser:appgroup /var/log/nginx && \\
    chown -R appuser:appgroup /etc/nginx/conf.d

# Switch to non-root user
USER appuser

# Expose port
EXPOSE ${exposedPort}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
`;
}

/**
 * Generate nginx configuration for React application
 * @returns {string} Nginx configuration
 */
function generateNginxConfig() {
  return `server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate max-age=0;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # API proxy (if needed)
    location /api/ {
        proxy_pass http://backend:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }
}
`;
}

/**
 * Generate Docker Compose file for full-stack application
 * @param {object} config - Configuration object
 * @returns {string} Docker Compose YAML content
 */
function generateDockerCompose(config) {
  const {
    serviceName,
    hasBackend = true,
    hasFrontend = true,
    database = 'postgresql',
    hasRedis = false
  } = config;

  const services = {};

  // Backend service
  if (hasBackend) {
    services.backend = {
      build: {
        context: hasBackend && hasFrontend ? './backend' : '.',
        dockerfile: 'Dockerfile'
      },
      ports: ['8080:8080'],
      environment: [
        'SPRING_PROFILES_ACTIVE=docker',
        `SPRING_DATASOURCE_URL=jdbc:${database}://database:5432/${serviceName.replace('-', '_')}`,
        'SPRING_DATASOURCE_USERNAME=postgres',
        'SPRING_DATASOURCE_PASSWORD=password'
      ],
      depends_on: ['database'],
      networks: ['app-network']
    };

    if (hasRedis) {
      services.backend.depends_on.push('redis');
      services.backend.environment.push('SPRING_REDIS_HOST=redis');
    }
  }

  // Frontend service
  if (hasFrontend) {
    services.frontend = {
      build: {
        context: hasBackend && hasFrontend ? './frontend' : '.',
        dockerfile: 'Dockerfile'
      },
      ports: ['3000:80'],
      environment: [
        'REACT_APP_API_URL=http://localhost:8080/api/v1'
      ],
      networks: ['app-network']
    };

    if (hasBackend) {
      services.frontend.depends_on = ['backend'];
    }
  }

  // Database service
  if (database === 'postgresql') {
    services.database = {
      image: 'postgres:15-alpine',
      environment: [
        'POSTGRES_DB=' + serviceName.replace('-', '_'),
        'POSTGRES_USER=postgres',
        'POSTGRES_PASSWORD=password'
      ],
      ports: ['5432:5432'],
      volumes: [
        'postgres_data:/var/lib/postgresql/data'
      ],
      networks: ['app-network']
    };
  } else if (database === 'mysql') {
    services.database = {
      image: 'mysql:8.0',
      environment: [
        'MYSQL_DATABASE=' + serviceName.replace('-', '_'),
        'MYSQL_USER=mysql',
        'MYSQL_PASSWORD=password',
        'MYSQL_ROOT_PASSWORD=rootpassword'
      ],
      ports: ['3306:3306'],
      volumes: [
        'mysql_data:/var/lib/mysql'
      ],
      networks: ['app-network']
    };
  }

  // Redis service
  if (hasRedis) {
    services.redis = {
      image: 'redis:7-alpine',
      ports: ['6379:6379'],
      networks: ['app-network']
    };
  }

  // Monitoring services
  services.prometheus = {
    image: 'prom/prometheus:latest',
    ports: ['9090:9090'],
    volumes: [
      './monitoring/prometheus.yml:/etc/prometheus/prometheus.yml'
    ],
    networks: ['app-network']
  };

  services.grafana = {
    image: 'grafana/grafana:latest',
    ports: ['3001:3000'],
    environment: [
      'GF_SECURITY_ADMIN_PASSWORD=admin'
    ],
    volumes: [
      'grafana_data:/var/lib/grafana'
    ],
    networks: ['app-network']
  };

  const volumes = {};
  if (database === 'postgresql') {
    volumes.postgres_data = {};
  } else if (database === 'mysql') {
    volumes.mysql_data = {};
  }
  volumes.grafana_data = {};

  const compose = {
    version: '3.8',
    services,
    volumes,
    networks: {
      'app-network': {
        driver: 'bridge'
      }
    }
  };

  return `# Docker Compose file for ${serviceName}
# Generated by Enterprise CLI

${require('yaml').stringify(compose)}`;
}

/**
 * Create .dockerignore file
 * @param {object} config - Configuration object
 * @returns {string} .dockerignore content
 */
function generateDockerIgnore(config) {
  const { hasBackend = true, hasFrontend = true } = config;

  let content = `# Common ignores
.git
.gitignore
README.md
.env
.env.local
.env.production.local
.env.test.local
.DS_Store
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

`;

  if (hasBackend) {
    content += `# Backend ignores
target/
!.mvn/wrapper/maven-wrapper.jar
!**/src/main/**/target/
!**/src/test/**/target/

`;
  }

  if (hasFrontend) {
    content += `# Frontend ignores
node_modules/
build/
coverage/
.nyc_output

`;
  }

  content += `# IDE ignores
.idea/
.vscode/
*.swp
*.swo
*~

# OS ignores
Thumbs.db
`;

  return content;
}

module.exports = {
  isDockerAvailable,
  isDockerComposeAvailable,
  getDockerVersion,
  isDockerRunning,
  buildImage,
  runContainer,
  stopContainer,
  removeContainer,
  runDockerCompose,
  generateSpringBootDockerfile,
  generateReactDockerfile,
  generateNginxConfig,
  generateDockerCompose,
  generateDockerIgnore
};
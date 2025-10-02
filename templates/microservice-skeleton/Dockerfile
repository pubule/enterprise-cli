# ═══════════════════════════════════════════════════════════════
# Multi-stage Dockerfile for {{domainTitleCase}} Microservice
# Enterprise Framework v{{frameworkVersion}}
# ═══════════════════════════════════════════════════════════════

# ───────────────────────────────────────────────────────────────
# Stage 1: Build Stage
# ───────────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17 AS build

LABEL stage=builder
LABEL description="Build stage for {{serviceName}}"

WORKDIR /app

# Copy pom.xml and download dependencies (layer caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application (skip tests for faster builds)
RUN mvn clean package -DskipTests -B

# ───────────────────────────────────────────────────────────────
# Stage 2: Runtime Stage
# ───────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

LABEL maintainer="Enterprise CLI"
LABEL service="{{serviceName}}"
LABEL version="1.0.0"
LABEL framework="enterprise-framework-v{{frameworkVersion}}"

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user for security
RUN addgroup -g 1001 appgroup && \
    adduser -D -u 1001 -G appgroup appuser

WORKDIR /app

# Copy JAR from build stage
COPY --from=build /app/target/{{serviceName}}.jar app.jar

# Change ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 8080

# Environment variables (can be overridden at runtime)
ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

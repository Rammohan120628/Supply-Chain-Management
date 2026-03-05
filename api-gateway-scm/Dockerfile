# Use OpenJDK
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Copy WAR file
COPY build/libs/*.war app.war

# Expose port
EXPOSE 9070

# Run application
ENTRYPOINT ["java","-jar","app.war"]

FROM eclipse-temurin:17-jdk-jammy

WORKDIR /app

COPY build/libs/*.war app.war

EXPOSE 9070

ENTRYPOINT ["java","-jar","/app/app.war"]

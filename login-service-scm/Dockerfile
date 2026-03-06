FROM tomcat:10-jdk17

# Remove default apps
RUN rm -rf /usr/local/tomcat/webapps/*

# Copy WAR file
COPY build/libs/*.war /usr/local/tomcat/webapps/login-service-scm.war

# Expose port
EXPOSE 9072

CMD ["catalina.sh", "run"]

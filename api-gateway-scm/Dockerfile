FROM tomcat:10-jdk17

# Remove default apps
RUN rm -rf /usr/local/tomcat/webapps/*

# Copy WAR file
COPY build/libs/*.war /usr/local/tomcat/webapps/api-gateway-scm.war

# Expose port
EXPOSE 9071

CMD ["catalina.sh", "run"]

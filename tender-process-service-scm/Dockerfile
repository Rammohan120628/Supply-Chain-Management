FROM tomcat:10-jdk17

# Remove default apps
RUN rm -rf /usr/local/tomcat/webapps/*

# Copy WAR file
COPY build/libs/*.war /usr/local/tomcat/webapps/tender-process-service-scm.war

# Expose port
EXPOSE 9073

CMD ["catalina.sh", "run"]

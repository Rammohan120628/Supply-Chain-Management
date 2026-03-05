FROM tomcat:10-jdk17

# Remove default apps
RUN rm -rf /usr/local/tomcat/webapps/*

# Copy WAR file
COPY build/libs/*.war /usr/local/tomcat/webapps/service-registry-scm.war

# Expose port
EXPOSE 9070

CMD ["catalina.sh", "run"]

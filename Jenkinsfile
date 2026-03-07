stage('Deploy React Frontend') {
    when {
        expression { env.FRONTEND_CHANGED == "true" }
    }
    steps {
        dir('scm-frontend') {
            script {
                // Check if package.json exists
                def packageJsonExists = fileExists('package.json')
                if (!packageJsonExists) {
                    error "package.json not found in scm-frontend directory!"
                }
            }
            
            // Create Dockerfile with npm install instead of npm ci
            bat '''
            @echo off
            echo Creating Dockerfile for React...
            
            (
                echo FROM node:18-alpine AS build
                echo WORKDIR /app
                echo COPY package*.json ./
                echo RUN npm install
                echo COPY . .
                echo RUN npm run build
                echo.
                echo FROM nginx:alpine
                echo COPY --from=build /app/build /usr/share/nginx/html
                echo EXPOSE 80
                echo CMD ["nginx", "-g", "daemon off;"]
            ) > Dockerfile
            
            echo Dockerfile created successfully.
            '''
            
            // Build Docker image
            bat 'docker build --no-cache -t scm-frontend .'
        }

        // Stop and remove existing container
        bat '''
        docker stop scm-frontend 2>nul || exit 0
        docker rm scm-frontend 2>nul || exit 0
        '''

        // Run React frontend container
        bat 'docker run -d -p 3000:80 --name scm-frontend --network %NETWORK% scm-frontend'
    }
}

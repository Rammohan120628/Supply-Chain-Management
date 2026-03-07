pipeline {
    agent any

    triggers {
        pollSCM('* * * * *')
    }

    environment {
        NETWORK = "scm-network"
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Create Docker Network') {
            steps {
                bat '''
                docker network inspect %NETWORK% >nul 2>&1
                if %ERRORLEVEL% NEQ 0 (
                    docker network create %NETWORK%
                )
                '''
            }
        }

        stage('Detect Changes') {
            steps {
                script {
                    def changes = bat(
                        script: "git diff --name-only HEAD~1 HEAD",
                        returnStdout: true
                    ).trim()

                    echo "Changed files: ${changes}"

                    env.REGISTRY_CHANGED = changes.contains("service-registry-scm") ? "true" : "false"
                    env.GATEWAY_CHANGED  = changes.contains("api-gateway-scm") ? "true" : "false"
                    env.LOGIN_CHANGED    = changes.contains("login-service-scm") ? "true" : "false"
                    env.TENDER_CHANGED   = changes.contains("tender-process-service-scm") ? "true" : "false"
                    env.FRONTEND_CHANGED = changes.contains("scm-frontend") ? "true" : "false"
                }
            }
        }

        stage('Deploy Service Registry') {
            when {
                expression { env.REGISTRY_CHANGED == "true" }
            }
            steps {
                dir('service-registry-scm') {
                    bat 'gradlew.bat build -x test'
                    bat 'docker build -t service-registry-scm .'
                }

                bat 'docker stop service-registry || exit 0'
                bat 'docker rm service-registry || exit 0'

                bat 'docker run -d -p 8761:8761 --name service-registry --network %NETWORK% service-registry-scm'
            }
        }

        stage('Deploy API Gateway') {
            when {
                expression { env.GATEWAY_CHANGED == "true" }
            }
            steps {
                dir('api-gateway-scm') {
                    bat 'gradlew.bat build -x test'
                    bat 'docker build -t api-gateway-scm .'
                }

                bat 'docker stop api-gateway || exit 0'
                bat 'docker rm api-gateway || exit 0'

                bat 'docker run -d -p 9191:9191 --name api-gateway --network %NETWORK% api-gateway-scm'
            }
        }

        stage('Deploy Login Service') {
            when {
                expression { env.LOGIN_CHANGED == "true" }
            }
            steps {
                dir('login-service-scm') {
                    bat 'gradlew.bat build -x test'
                    bat 'docker build -t login-service-scm .'
                }

                bat 'docker stop login-service || exit 0'
                bat 'docker rm login-service || exit 0'

                bat 'docker run -d -p 9072:8080 --name login-service --network %NETWORK% login-service-scm'
            }
        }

        stage('Deploy Tender Process Service') {
            when {
                expression { env.TENDER_CHANGED == "true" }
            }
            steps {
                dir('tender-process-service-scm') {
                    bat 'gradlew.bat build -x test'
                    bat 'docker build -t tender-process-service-scm .'
                }

                bat 'docker stop tender-process-service || exit 0'
                bat 'docker rm tender-process-service || exit 0'

                bat 'docker run -d -p 9073:8080 --name tender-process-service --network %NETWORK% tender-process-service-scm'
            }
        }

        stage('Deploy React Frontend') {
            when {
                expression { env.TENDER_CHANGED == "true" }
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
                    
                    // Create optimized Dockerfile for React
                    bat '''
                    @echo off
                    echo Creating Dockerfile for React...
                    
                    (
                        echo FROM node:18-alpine AS build
                        echo WORKDIR /app
                        echo COPY package*.json ./
                        echo RUN npm ci
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
    }
    
    post {
        success {
            echo 'Deployment completed successfully!'
            echo 'Frontend is available at http://localhost:3000'
            echo 'Service Registry: http://localhost:8761'
            echo 'API Gateway: http://localhost:9191'
            echo 'Login Service: http://localhost:9072'
            echo 'Tender Service: http://localhost:9073'
        }
        failure {
            echo 'Deployment failed!'
            script {
                // Print last logs from failed build
                bat 'docker logs scm-frontend 2>&1 || exit 0'
            }
        }
    }
}

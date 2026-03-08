pipeline {
    agent any

    options {
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

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

        // SERVICE REGISTRY
        stage('Deploy Service Registry') {
            when {
                expression { env.REGISTRY_CHANGED == "true" }
            }
            steps {

                dir('service-registry-scm') {
                    bat 'gradlew.bat build -x test'
                    bat 'docker build -t service-registry-scm .'
                }

                bat 'docker stop service-registry 2>nul'
                bat 'docker rm service-registry 2>nul'

                bat 'docker run -d -p 8761:8761 --name service-registry --network %NETWORK% service-registry-scm'
            }
        }

        // API GATEWAY
        stage('Deploy API Gateway') {
            when {
                expression { env.GATEWAY_CHANGED == "true" }
            }
            steps {

                dir('api-gateway-scm') {
                    bat 'gradlew.bat build -x test'
                    bat 'docker build -t api-gateway-scm .'
                }

                bat 'docker stop api-gateway 2>nul'
                bat 'docker rm api-gateway 2>nul'

                bat 'docker run -d -p 9191:9191 --name api-gateway --network %NETWORK% api-gateway-scm'
            }
        }

        // LOGIN SERVICE
        stage('Deploy Login Service') {
            when {
                expression { env.LOGIN_CHANGED == "true" }
            }
            steps {

                dir('login-service-scm') {
                    bat 'gradlew.bat build -x test'
                    bat 'docker build -t login-service-scm .'
                }

                bat 'docker stop login-service 2>nul'
                bat 'docker rm login-service 2>nul'

                bat 'docker run -d -p 9072:8080 --name login-service --network %NETWORK% login-service-scm'
            }
        }

        // TENDER PROCESS SERVICE
        stage('Deploy Tender Process Service') {
            when {
                expression { env.TENDER_CHANGED == "true" }
            }
            steps {

                dir('tender-process-service-scm') {
                    bat 'gradlew.bat build -x test'
                    bat 'docker build -t tender-process-service-scm .'
                }

                bat 'docker stop tender-process-service 2>nul'
                bat 'docker rm tender-process-service 2>nul'

                bat 'docker run -d -p 9073:8080 --name tender-process-service --network %NETWORK% tender-process-service-scm'
            }
        }

        // FRONTEND (React)
stage('Run Frontend Container') {
    steps {
        dir('scm-frontend') {
            script {
                // Build the image first
                bat 'docker build -t scm-frontend .'
                
                // Stop and remove existing container if it exists (Windows syntax)
                bat '''
                    docker stop scm-frontend 2>nul || ver>nul
                    docker rm scm-frontend 2>nul || ver>nul
                '''
                
                // Run the new container
                bat '''
                    docker run -d ^
                    --name scm-frontend ^
                    --network scm-network ^
                    -p 3000:80 ^
                    --restart unless-stopped ^
                    scm-frontend:latest
                '''
                
                // Verify container is running
                bat 'docker ps | findstr scm-frontend || echo Container not found'
            }
        }
    }
}

stage('Verify Frontend Deployment') {
    steps {
        script {
            // Wait for container to be ready
            sleep time: 15, unit: 'SECONDS'
            
            // Check container logs (Windows syntax)
            bat '''
                docker logs scm-frontend --tail 50 2>nul || echo No logs available yet
            '''
            
            // Test if application is responding
            bat '''
                curl -f http://localhost:3000 >nul 2>&1
                if %ERRORLEVEL% NEQ 0 (
                    echo Frontend not responding yet
                    exit /b 1
                ) else (
                    echo Frontend is responding!
                )
            '''
        }
    }
}

        stage('No Changes') {
            when {
                expression {
                    env.REGISTRY_CHANGED == "false" &&
                    env.GATEWAY_CHANGED == "false" &&
                    env.LOGIN_CHANGED == "false" &&
                    env.TENDER_CHANGED == "false" &&
                    env.FRONTEND_CHANGED == "false"
                }
            }
            steps {
                echo "No changes detected in microservices or frontend."
            }
        }

    }
}

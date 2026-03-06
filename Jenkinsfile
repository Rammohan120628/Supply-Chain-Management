pipeline {
    agent any

    stages {

        stage('Check Service Registry') {
            steps {
                bat '''
                docker ps -a --format "{{.Names}}" | findstr service-registry
                if %ERRORLEVEL% NEQ 0 (
                    echo Service Registry not found. Building...
                    cd service-registry-scm
                    gradlew.bat clean build
                    docker build -t service-registry-scm .
                    docker run -d -p 9070:8080 --name service-registry --network scm-network service-registry-scm
                ) else (
                    echo Service Registry already exists
                    docker start service-registry || echo Already running
                )
                '''
            }
        }

        stage('Check API Gateway') {
            steps {
                bat '''
                docker ps -a --format "{{.Names}}" | findstr api-gateway
                if %ERRORLEVEL% NEQ 0 (
                    echo API Gateway not found. Building...
                    cd api-gateway-scm
                    gradlew.bat build -x test
                    docker build -t api-gateway-scm .
                    docker run -d -p 9071:8080 --name api-gateway --network scm-network api-gateway-scm
                ) else (
                    echo API Gateway already exists
                    docker start api-gateway || echo Already running
                )
                '''
            }
        }

        stage('Check Login Service') {
            steps {
                bat '''
                docker ps -a --format "{{.Names}}" | findstr login-service
                if %ERRORLEVEL% NEQ 0 (
                    echo Login Service not found. Building...
                    cd login-service-scm
                    gradlew.bat build -x test
                    docker build -t login-service-scm .
                    docker run -d -p 9072:8080 --name login-service --network scm-network login-service-scm
                ) else (
                    echo Login Service already exists
                    docker start login-service || echo Already running
                )
                '''
            }
        }

        stage('Build Tender Process Service') {
            steps {
                dir('tender-process-service-scm') {
                    bat 'gradlew.bat clean build -x test'
                    bat 'docker build -t tender-process-service-scm .'
                }
            }
        }

        stage('Deploy Tender Process Service') {
            steps {
                bat 'docker rm -f tender-process-service || exit 0'
                bat 'docker run -d -p 9073:8080 --name tender-process-service --network scm-network tender-process-service-scm'
            }
        }

    }
}

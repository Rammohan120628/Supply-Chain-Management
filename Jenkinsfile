pipeline {
    agent any

    triggers {
        pollSCM('* * * * *')
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
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

                bat 'docker stop service-registry || exit 0'
                bat 'docker rm service-registry || exit 0'

                bat 'docker run -d -p 8761:8761 --name service-registry --network scm-network service-registry-scm'
            }
        }

        // ENSURE SERVICE REGISTRY FOR DEPENDENT SERVICES
        stage('Ensure Service Registry Running') {
            when {
                expression {
                    env.GATEWAY_CHANGED == "true" ||
                    env.LOGIN_CHANGED == "true" ||
                    env.TENDER_CHANGED == "true"
                }
            }
            steps {
                bat '''
                docker ps -q -f name=service-registry >nul
                if %ERRORLEVEL% NEQ 0 (
                    echo Starting Service Registry...
                    docker run -d -p 8761:8761 --name service-registry --network scm-network service-registry-scm
                ) else (
                    echo Service Registry already running
                )
                '''
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

                bat 'docker stop api-gateway || exit 0'
                bat 'docker rm api-gateway || exit 0'

                bat 'docker run -d -p 9191:9191 --name api-gateway --network scm-network api-gateway-scm'
            }
        }

        // ENSURE API GATEWAY
        stage('Ensure API Gateway Running') {
            when {
                expression {
                    env.LOGIN_CHANGED == "true" ||
                    env.TENDER_CHANGED == "true"
                }
            }
            steps {
                bat '''
                docker ps -q -f name=api-gateway >nul
                if %ERRORLEVEL% NEQ 0 (
                    echo Starting API Gateway...
                    docker run -d -p 9191:9191 --name api-gateway --network scm-network api-gateway-scm
                ) else (
                    echo API Gateway already running
                )
                '''
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

                bat 'docker stop login-service || exit 0'
                bat 'docker rm login-service || exit 0'

                bat 'docker run -d -p 9072:8080 --name login-service --network scm-network login-service-scm'
            }
        }

        // TENDER PROCESS
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

                bat 'docker run -d -p 9073:8080 --name tender-process-service --network scm-network tender-process-service-scm'
            }
        }

        stage('No Changes') {
            when {
                expression {
                    env.REGISTRY_CHANGED == "false" &&
                    env.GATEWAY_CHANGED == "false" &&
                    env.LOGIN_CHANGED == "false" &&
                    env.TENDER_CHANGED == "false"
                }
            }
            steps {
                echo "No microservice changes detected."
            }
        }
    }
}

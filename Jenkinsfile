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

                bat 'docker stop api-gateway || exit 0'
                bat 'docker rm api-gateway || exit 0'

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

                bat 'docker stop login-service || exit 0'
                bat 'docker rm login-service || exit 0'

                bat 'docker run -d -p 9072:8080 --name login-service --network %NETWORK% login-service-scm'
            }
        }

        // TENDER SERVICE
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

        // REACT FRONTEND
        stage('Deploy Frontend') {
    when {
        expression { 
            env.FRONTEND_CHANGED == "true" || env.TENDER_CHANGED == "true"
        }
    }
    steps {
        dir('scm-frontend') {

            bat 'npm install'
            bat 'npm run build'

            bat 'docker build -t scm-frontend .'
        }

        bat 'docker stop scm-frontend || exit 0'
        bat 'docker rm scm-frontend || exit 0'

        bat 'docker run -d -p 3000:80 --name scm-frontend --network scm-network scm-frontend'
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

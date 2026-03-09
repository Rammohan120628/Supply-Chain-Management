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

                    // Dependency logic
                    if (env.GATEWAY_CHANGED == "true" || env.LOGIN_CHANGED == "true" || env.TENDER_CHANGED == "true") {
                        env.REGISTRY_CHANGED = "true"
                    }

                    if (env.LOGIN_CHANGED == "true" || env.TENDER_CHANGED == "true") {
                        env.GATEWAY_CHANGED = "true"
                    }

                }
            }
        }

        // ===============================
        // SERVICE REGISTRY
        // ===============================
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

                bat '''
                docker run -d ^
                --name service-registry ^
                --network %NETWORK% ^
                -p 8761:8761 ^
                service-registry-scm
                '''

                // wait for Eureka
                sleep time: 20, unit: 'SECONDS'
            }
        }

        // ===============================
        // API GATEWAY
        // ===============================
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

                bat '''
                docker run -d ^
                --name api-gateway ^
                --network %NETWORK% ^
                -p 9191:9191 ^
                api-gateway-scm
                '''

                sleep time: 15, unit: 'SECONDS'
            }
        }

        // ===============================
        // LOGIN SERVICE
        // ===============================
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

                bat '''
                docker run -d ^
                --name login-service ^
                --network %NETWORK% ^
                -p 9072:8080 ^
                login-service-scm
                '''
            }
        }

        // ===============================
        // TENDER PROCESS SERVICE
        // ===============================
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

                bat '''
                docker run -d ^
                --name tender-process-service ^
                --network %NETWORK% ^
                -p 9073:8080 ^
                tender-process-service-scm
                '''
            }
        }

        // ===============================
        // FRONTEND
        // ===============================
        stage('Deploy Frontend') {
            when {
                expression { env.FRONTEND_CHANGED == "true" }
            }
            steps {

                dir('scm-frontend') {

                    bat 'docker build -t scm-frontend .'

                    bat '''
                    docker stop scm-frontend 2>nul || ver>nul
                    docker rm scm-frontend 2>nul || ver>nul
                    '''

                    bat '''
                    docker run -d ^
                    --name scm-frontend ^
                    --network %NETWORK% ^
                    -p 3000:80 ^
                    --restart unless-stopped ^
                    scm-frontend
                    '''
                }
            }
        }

        // ===============================
        // VERIFY FRONTEND
        // ===============================
        stage('Verify Frontend Deployment') {
            when {
                expression { env.FRONTEND_CHANGED == "true" }
            }
            steps {
                script {

                    sleep time: 15, unit: 'SECONDS'

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

        // ===============================
        // NO CHANGES
        // ===============================
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
                echo "No changes detected in services."
            }
        }

    }
}

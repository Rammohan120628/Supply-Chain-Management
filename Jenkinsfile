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

                    if (changes.contains("tender-process-service-scm")) {
                        env.TENDER_CHANGED = "true"
                    } else {
                        env.TENDER_CHANGED = "false"
                    }
                }
            }
        }

        stage('Ensure Service Registry Running') {
            when {
                expression { env.TENDER_CHANGED == "true" }
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

        stage('Ensure API Gateway Running') {
            when {
                expression { env.TENDER_CHANGED == "true" }
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

        stage('Deploy Tender Process Service') {
            when {
                expression { env.TENDER_CHANGED == "true" }
            }
            steps {
                dir('tender-process-service-scm') {
                    bat 'gradlew.bat build -x test'
                    bat 'docker build -t tender-process-service-scm .'
                }

                bat 'docker rm -f tender-process-service || exit 0'
                bat 'docker run -d -p 9073:8080 --name tender-process-service --network scm-network tender-process-service-scm'
            }
        }

        stage('No Changes') {
            when {
                expression { env.TENDER_CHANGED == "false" }
            }
            steps {
                echo "No changes in tender-process-service"
            }
        }
    }
}

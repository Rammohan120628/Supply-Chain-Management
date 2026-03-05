pipeline {
    agent any

    stages {

        stage('Build Service Registry') {
            steps {
                dir('service-registry-scm') {
                    bat 'gradlew.bat build'
                    bat 'docker build -t service-registry-scm .'
                }
            }
        }

        stage('Run Service Registry') {
            steps {
                bat 'docker rm -f service-registry || exit 0'
                bat 'docker run -d -p 8761:8761 --name service-registry service-registry-scm'
            }
        }

        stage('Build API Gateway') {
            steps {
                dir('api-gateway-scm') {
                    bat 'gradlew.bat build'
                    bat 'docker build -t api-gateway-scm .'
                }
            }
        }

        stage('Run API Gateway') {
            steps {
                bat 'docker rm -f api-gateway || exit 0'
                bat 'docker run -d -p 9080:9080 --name api-gateway api-gateway-scm'
            }
        }

        stage('Build Login Service') {
            steps {
                dir('login-service-scm') {
                    bat 'gradlew.bat build'
                    bat 'docker build -t login-service-scm .'
                }
            }
        }

        stage('Run Login Service') {
            steps {
                bat 'docker rm -f login-service || exit 0'
                bat 'docker run -d -p 9090:9090 --name login-service login-service-scm'
            }
        }

    }
}

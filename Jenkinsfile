pipeline {
    agent any

    stages {

        stage('Build Service Registry') {
            steps {
                dir('service-registry-scm') {
                    sh './gradlew build'
                    sh 'docker build -t service-registry-scm .'
                }
            }
        }

        stage('Run Service Registry') {
            steps {
                sh 'docker rm -f service-registry || true'
                sh 'docker run -d -p 8761:8761 --name service-registry service-registry-scm'
            }
        }

        stage('Build API Gateway') {
            steps {
                dir('api-gateway-scm') {
                    sh './gradlew build'
                    sh 'docker build -t api-gateway-scm .'
                }
            }
        }

        stage('Run API Gateway') {
            steps {
                sh 'docker rm -f api-gateway || true'
                sh 'docker run -d -p 9080:9080 --name api-gateway api-gateway-scm'
            }
        }

        stage('Build Login Service') {
            steps {
                dir('login-service-scm') {
                    sh './gradlew build'
                    sh 'docker build -t login-service-scm .'
                }
            }
        }

        stage('Run Login Service') {
            steps {
                sh 'docker rm -f login-service || true'
                sh 'docker run -d -p 9090:9090 --name login-service login-service-scm'
            }
        }

    }
}
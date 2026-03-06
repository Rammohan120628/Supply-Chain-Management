pipeline {
agent any

stages {

    stage('Build Service Registry') {
        steps {
            dir('service-registry-scm') {
                bat 'gradlew.bat clean build'
                bat 'docker build -t service-registry-scm .'
            }
        }
    }

    stage('Run Service Registry') {
        steps {
            bat 'docker rm -f service-registry || exit 0'
            bat 'docker run -d -p 9070:8080 --name service-registry --network scm-network service-registry-scm'
        }
    }

    stage('Build API Gateway') {
        steps {
            dir('api-gateway-scm') {
                bat 'gradlew.bat clean build'
                bat 'docker build -t api-gateway-scm .'
            }
        }
    }

    stage('Run API Gateway') {
        steps {
            bat 'docker rm -f api-gateway || exit 0'
            bat 'docker run -d -p 9071:8080 --name api-gateway --network scm-network api-gateway-scm'
        }
    }

    stage('Build Login Service') {
        steps {
            dir('login-service-scm') {
                bat 'gradlew.bat clean build'
                bat 'docker build -t login-service-scm .'
            }
        }
    }

    stage('Run Login Service') {
        steps {
            bat 'docker rm -f login-service || exit 0'
            bat 'docker run -d -p 9072:8080 --name login-service --network scm-network login-service-scm'
        }
    }

}

}

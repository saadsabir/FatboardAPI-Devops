pipeline {
    agent any
    environment {
        CI = 'true'
        COMPOSE_PROJECT_NAME = "${JOB_NAME}-${BUILD_ID}"
        REGISTRY = 'nexus.fatboarrestaurant.com:8082'
        image = 'fatboar-api'
    }
    stages {
        stage('Build') {
            steps {
                //Supprimer les images inutiles
                sh 'docker rmi $(docker images -qf dangling=true)'
                //Supprimer les volumes orphelins
                //sh 'docker volume rm $(docker volume ls -qf dangling=true)'

                sh 'docker-compose down'
                sh 'docker build -t "${image}:${BUILD_ID}" -f docker/Dockerfile --no-cache .'
            }
        }
        stage('Tests') {
            steps {
                sh 'docker build -t api_test -f docker/Dockerfile.test --no-cache .'
                sh 'echo "artifact file:" > ../report.xml'
                sh 'echo "Test # ${BUILD_NUMBER} finished" '
                sh 'docker rmi api_test'
            }
            post {
                always {
                    archiveArtifacts artifacts: 'report.xml', fingerprint: true
                    junit 'report.xml'
                }
            }
        }
        stage('Deploy') {
            steps {
                script {
                    docker.withRegistry("http://${REGISTRY}", 'key-nexus') {
                        def customImage = docker.build("${image}:${BUILD_ID}", "-f docker/Dockerfile .")
                        customImage.push()
                        customImage.push('latest')
                    }
                }
            }
        }
        stage('Deploy for production') {
            when {
                branch 'master'  
            }
            steps {
                script {
                    docker.withRegistry("http://${REGISTRY}", 'key-nexus') {
                        sh 'docker container stop fatboar_api fatboar_db'
                        sh 'docker container rm fatboar_api fatboar_db'
                        sh 'docker-compose down && docker-compose build --pull && docker-compose up -d'
                        input message: 'Do you want to push this version into production?'
                    }
                }
            }
        }
        stage('Deliver for development') {
            when {
                branch 'develop' 
            }
            steps {
                script {
                    docker.withRegistry("http://${REGISTRY}", 'key-nexus') {
                        sh 'docker pull "${REGISTRY}"/"${image}:latest"'
                        sh 'docker container stop fatboar_api_dev fatboar_db_dev'
                        sh 'docker container rm fatboar_api_dev fatboar_db_dev'
                        sh 'docker-compose -f docker-compose.dev.yml up -d'
                        input message: 'Do you want to push this version into stagin?'
                    }
                }
            }
        }
    }

    post {
        always {
            junit 'report.xml'
            deleteDir()
        }
        success {
            echo 'Build Succeed ! 🥳'
        }
        unstable {
            echo 'Build unstable'
        }
        failure {
            echo 'Build failed 🤐'
        }
        changed {
            echo 'Things were different before...'
        }
    }
}
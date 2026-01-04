pipeline {
    agent {
        kubernetes {
            yaml """
apiVersion: v1
kind: Pod
metadata:
  labels:
    jenkins: agent
spec:
  serviceAccountName: jenkins
  containers:
  - name: docker
    image: docker:24-dind
    command:
    - cat
    tty: true
    volumeMounts:
    - name: docker-sock
      mountPath: /var/run/docker.sock
    securityContext:
      privileged: true
  - name: kubectl
    image: bitnami/kubectl:latest
    command:
    - cat
    tty: true
  volumes:
  - name: docker-sock
    hostPath:
      path: /var/run/docker.sock
"""
        }
    }
    
    environment {
        DOCKER_REGISTRY = "docker.io" // Change to your registry
        IMAGE_NAME = "hello-app"
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        NAMESPACE = "default" // Change to your namespace
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code...'
                checkout scm
            }
        }
        
        stage('Test') {
            steps {
                container('docker') {
                    echo 'Running tests...'
                    sh '''
                        cd app
                        docker run --rm -v $(pwd):/app -w /app node:18-alpine sh -c "npm install && npm test"
                    '''
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                container('docker') {
                    echo 'Building Docker image...'
                    sh '''
                        docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
                        docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest
                    '''
                }
            }
        }
        
        stage('Push to Registry') {
            steps {
                container('docker') {
                    echo 'Pushing image to registry...'
                    // Uncomment and configure with your registry credentials
                    // withCredentials([usernamePassword(credentialsId: 'docker-registry-creds', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                    //     sh '''
                    //         echo $PASSWORD | docker login -u $USERNAME --password-stdin ${DOCKER_REGISTRY}
                    //         docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${DOCKER_REGISTRY}/${USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}
                    //         docker push ${DOCKER_REGISTRY}/${USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}
                    //     '''
                    // }
                    echo 'Skipping push (configure credentials first)'
                }
            }
        }
        
        stage('Deploy to K8s') {
            steps {
                container('kubectl') {
                    echo 'Deploying to Kubernetes...'
                    sh '''
                        kubectl apply -f k8s/deployment.yaml -n ${NAMESPACE}
                        kubectl apply -f k8s/service.yaml -n ${NAMESPACE}
                        kubectl set image deployment/hello-app hello-app=${IMAGE_NAME}:${IMAGE_TAG} -n ${NAMESPACE} || true
                        kubectl rollout status deployment/hello-app -n ${NAMESPACE}
                    '''
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
        always {
            echo 'Cleaning up...'
        }
    }
}

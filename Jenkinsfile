// SIMPLEST PIPELINE - Just deploy pre-built app (no Docker building)
// Perfect for learning Jenkins basics!

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
  - name: kubectl
    image: alpine/k8s:1.28.3
    command:
    - /bin/sh
    - -c
    - "sleep 3600"
  - name: node
    image: node:18-alpine
    command:
    - /bin/sh
    - -c
    - "sleep 3600"
"""
        }
    }
    
    environment {
        NAMESPACE = "jenkins"
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out code...'
                checkout scm
            }
        }
        
        stage('Test Application') {
            steps {
                container('node') {
                    echo '🧪 Running tests...'
                    sh '''
                        cd app
                        npm install
                        npm test
                    '''
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') {
                    echo '🚀 Deploying to Kubernetes...'
                    sh '''
                        # Deploy application
                        kubectl apply -f k8s/deployment.yaml -n ${NAMESPACE}
                        kubectl apply -f k8s/service.yaml -n ${NAMESPACE}
                        
                        # Wait for deployment
                        kubectl rollout status deployment/hello-app -n ${NAMESPACE} --timeout=2m
                    '''
                }
            }
        }
        
        stage('Verify') {
            steps {
                container('kubectl') {
                    echo '✅ Verifying deployment...'
                    sh '''
                        echo "=== Pods ==="
                        kubectl get pods -l app=hello-app -n ${NAMESPACE}
                        
                        echo "\\n=== Service ==="
                        kubectl get svc hello-app-service -n ${NAMESPACE}
                        
                        echo "\\n=== Deployment ==="
                        kubectl get deployment hello-app -n ${NAMESPACE}
                    '''
                }
            }
        }
    }
    
    post {
        success {
            echo '''
            ✅ Pipeline completed successfully!
            
            To test your app:
            kubectl port-forward svc/hello-app-service 8080:80 -n jenkins
            
            Then visit: http://localhost:8080
            '''
        }
        failure {
            echo '❌ Pipeline failed! Check the logs above.'
        }
    }
}

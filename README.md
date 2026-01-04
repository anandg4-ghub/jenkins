# Jenkins Kubernetes Demo Project

This is a simple demonstration project for testing Jenkins CI/CD on a Kubernetes cluster.

## Project Structure

```
jenkins-k8s-demo/
├── app/
│   ├── package.json       # Node.js dependencies
│   ├── server.js          # Simple Express server
│   └── test.js            # Basic tests
├── k8s/
│   ├── deployment.yaml    # Kubernetes deployment manifest
│   ├── service.yaml       # Kubernetes service manifest
│   └── rbac.yaml          # RBAC permissions for Jenkins
├── Dockerfile             # Container image definition
├── Jenkinsfile            # Jenkins pipeline definition
└── README.md              # This file
```

## Prerequisites

1. **Kubernetes cluster** with kubectl access
2. **Jenkins installed** on the K8s cluster
3. **Jenkins Kubernetes Plugin** installed
4. **Docker** available in the cluster (or use Kaniko for buildless builds)

## Setup Instructions

### Step 1: Apply RBAC Permissions

First, create the necessary service account and permissions for Jenkins:

```bash
kubectl apply -f k8s/rbac.yaml
```

**Note**: Update the namespace in `rbac.yaml` if your Jenkins is in a different namespace.

### Step 2: Configure Jenkins

1. **Install required plugins** in Jenkins:
   - Kubernetes Plugin
   - Docker Pipeline Plugin
   - Git Plugin

2. **Configure Kubernetes Cloud** in Jenkins:
   - Go to: Manage Jenkins → Manage Nodes and Clouds → Configure Clouds
   - Add a new Kubernetes cloud
   - Set Kubernetes URL (usually `https://kubernetes.default.svc.cluster.local`)
   - Set Kubernetes Namespace (where Jenkins creates pods)
   - Test the connection

### Step 3: Create a Jenkins Job

1. **Create a new Pipeline job** in Jenkins:
   - Click "New Item"
   - Enter a name (e.g., "hello-app-pipeline")
   - Select "Pipeline"
   - Click OK

2. **Configure the Pipeline**:
   - In the Pipeline section, select "Pipeline script from SCM"
   - Choose your SCM (Git)
   - Enter repository URL
   - Set Script Path to `Jenkinsfile`
   - Save

### Step 4: (Optional) Set Up Docker Registry Credentials

If you want to push images to a registry:

1. Go to: Manage Jenkins → Manage Credentials
2. Add credentials (Username with password)
3. ID: `docker-registry-creds`
4. Enter your registry username and password
5. Uncomment the "Push to Registry" stage in `Jenkinsfile`

### Step 5: Run the Pipeline

1. Click "Build Now" in your Jenkins job
2. Watch the build progress in the Console Output

## What the Pipeline Does

1. **Checkout**: Clones the repository
2. **Test**: Runs the application tests in a container
3. **Build**: Creates a Docker image
4. **Push**: (Optional) Pushes the image to a registry
5. **Deploy**: Deploys the application to Kubernetes

## Testing the Deployment

After successful deployment, test your application:

```bash
# Check if pods are running
kubectl get pods -l app=hello-app

# Check the service
kubectl get svc hello-app-service

# If using NodePort, get the URL
kubectl get svc hello-app-service -o jsonpath='{.spec.ports[0].nodePort}'

# Test the application (adjust the URL based on your setup)
curl http://<node-ip>:<node-port>
```

## Local Development

### Build and run locally:

```bash
# Build the Docker image
docker build -t hello-app:local .

# Run the container
docker run -p 3000:3000 hello-app:local

# Test
curl http://localhost:3000
```

### Run tests:

```bash
cd app
npm install
npm test
```

## Customization

### Change the application:
- Edit `app/server.js` to modify the application
- Edit `app/test.js` to add more tests

### Modify deployment:
- Edit `k8s/deployment.yaml` to change replicas, resources, etc.
- Edit `k8s/service.yaml` to change service type (LoadBalancer, ClusterIP, etc.)

### Update pipeline:
- Edit `Jenkinsfile` to add more stages or modify existing ones

## Troubleshooting

### Jenkins pod creation fails:
```bash
# Check Jenkins service account
kubectl get sa jenkins -n <jenkins-namespace>

# Check RBAC permissions
kubectl auth can-i create pods --as=system:serviceaccount:<namespace>:jenkins
```

### Build fails in Docker stage:
- Ensure Docker socket is accessible in the cluster
- Consider using Kaniko for Docker-less builds
- Check if the node has enough resources

### Deployment fails:
```bash
# Check deployment status
kubectl describe deployment hello-app

# Check pod logs
kubectl logs -l app=hello-app

# Check events
kubectl get events --sort-by=.metadata.creationTimestamp
```

### Can't access the application:
```bash
# Port-forward for testing
kubectl port-forward svc/hello-app-service 8080:80

# Then access: http://localhost:8080
```

## Alternative: Simplified Pipeline (Without Docker Build)

If you don't have Docker available, you can use a pre-built image or modify the pipeline to use Kaniko. Create a `Jenkinsfile.simple`:

```groovy
pipeline {
    agent {
        kubernetes {
            yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: kubectl
    image: bitnami/kubectl:latest
    command: ['cat']
    tty: true
"""
        }
    }
    stages {
        stage('Deploy') {
            steps {
                container('kubectl') {
                    sh 'kubectl apply -f k8s/'
                }
            }
        }
    }
}
```

## Next Steps

- Add more comprehensive tests
- Implement code quality checks (linting, security scanning)
- Add multiple environments (dev, staging, prod)
- Implement blue-green or canary deployments
- Add notifications (Slack, email)
- Implement rollback mechanisms

## Support

For issues or questions:
1. Check Jenkins console output
2. Check Kubernetes pod logs
3. Review Jenkins and Kubernetes documentation

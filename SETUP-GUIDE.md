# Jenkins on Kubernetes - Setup Guide for Beginners

## Understanding Docker in Jenkins + K8s

### The Challenge
When Jenkins runs on Kubernetes and needs to build Docker images, you have several options:

## 🎯 Three Approaches (Choose One)

### Approach 1: Simple Pipeline (RECOMMENDED FOR BEGINNERS) ✅
**File: `Jenkinsfile.simple`**

- ✅ **No Docker needed!**
- ✅ **No Docker Hub account needed!**
- Uses pre-built Node.js image from Docker Hub
- Only tests and deploys the application
- Perfect for learning Jenkins basics

**How it works:**
- Tests your code using Node.js container
- Deploys using the official node:18-alpine image
- No image building required

**Use this if:**
- You're new to Jenkins
- You want to learn CI/CD basics
- You don't need custom Docker images yet

---

### Approach 2: Kaniko (RECOMMENDED FOR PRODUCTION) 🏆
**File: `Jenkinsfile.kaniko`**

- ✅ **No Docker daemon needed on nodes!**
- ✅ **More secure**
- ✅ **Works in any K8s cluster**
- Builds images inside Kubernetes pods
- Can push to any registry (or use --no-push)

**How it works:**
- Uses Google's Kaniko project
- Builds images without Docker daemon
- More cloud-native approach

**Use this if:**
- You don't have Docker on K8s nodes
- You want a secure, production-ready setup
- You're using managed K8s (EKS, GKE, AKS)

---

### Approach 3: Docker Socket Mounting
**File: `Jenkinsfile` (original)**

- ⚠️ **Requires Docker on K8s nodes**
- ⚠️ **Security concerns** (privileged containers)
- Fastest build times
- Traditional approach

**Use this if:**
- You have Docker installed on all nodes
- You're in a development environment
- You understand the security implications

---

## 🚀 Quick Start (Choose Your Path)

### Path A: Simplest Setup (No Docker, No Registry)

1. **Apply RBAC:**
```bash
kubectl apply -f k8s/rbac.yaml
```

2. **In Jenkins, create a Pipeline job pointing to your repo**
   - Use `Jenkinsfile.simple` as the script path

3. **Run the build!**

4. **Test your app:**
```bash
kubectl port-forward svc/hello-app-service 8080:80
curl http://localhost:8080
```

---

### Path B: With Image Building (Using Kaniko)

1. **Apply RBAC:**
```bash
kubectl apply -f k8s/rbac.yaml
```

2. **Rename Jenkinsfile:**
```bash
mv Jenkinsfile.kaniko Jenkinsfile
```

3. **Push to Git:**
```bash
git add .
git commit -m "Use Kaniko for building"
git push
```

4. **Create Jenkins Pipeline job pointing to your repo**

5. **Run the build!**

---

### Path C: With Docker Hub (Optional)

**Only if you want to share images or use them across multiple clusters**

1. **Create Docker Hub account** (free): https://hub.docker.com

2. **Create Jenkins credential:**
   - Go to: Manage Jenkins → Manage Credentials
   - Add: Username with password
   - ID: `docker-hub-creds`
   - Username: Your Docker Hub username
   - Password: Your Docker Hub password or access token

3. **Update `Jenkinsfile.kaniko`** to push to Docker Hub:
```groovy
stage('Build and Push to Docker Hub') {
    steps {
        container('kaniko') {
            withCredentials([usernamePassword(
                credentialsId: 'docker-hub-creds',
                usernameVariable: 'DOCKER_USER',
                passwordVariable: 'DOCKER_PASS'
            )]) {
                sh '''
                    echo "{\\"auths\\":{\\"https://index.docker.io/v1/\\":{\\"auth\\":\\"$(echo -n $DOCKER_USER:$DOCKER_PASS | base64)\\"}}}" > /kaniko/.docker/config.json
                    
                    /kaniko/executor --context=${WORKSPACE} \
                    --dockerfile=${WORKSPACE}/Dockerfile \
                    --destination=${DOCKER_USER}/${IMAGE_NAME}:${IMAGE_TAG} \
                    --destination=${DOCKER_USER}/${IMAGE_NAME}:latest
                '''
            }
        }
    }
}
```

4. **Update deployment.yaml** to use your Docker Hub image:
```yaml
image: your-dockerhub-username/hello-app:latest
imagePullPolicy: Always
```

---

## 🔍 Checking Your Kubernetes Cluster

### Check if Docker is available:
```bash
# Check on K8s nodes
kubectl get nodes
kubectl debug node/<node-name> -it --image=busybox

# Inside the debug pod:
chroot /host
docker --version
```

### Check your K8s setup:
```bash
# Check Jenkins service account
kubectl get sa jenkins -n default

# Check if kubectl works
kubectl get pods

# Check cluster info
kubectl cluster-info
```

---

## 📊 Comparison Table

| Feature | Simple Pipeline | Kaniko | Docker Socket |
|---------|----------------|--------|---------------|
| **Needs Docker on nodes** | ❌ No | ❌ No | ✅ Yes |
| **Builds custom images** | ❌ No | ✅ Yes | ✅ Yes |
| **Needs registry** | ❌ No | Optional | Optional |
| **Security** | ✅ Best | ✅ Good | ⚠️ Risky |
| **Complexity** | ✅ Simple | ⚠️ Medium | ⚠️ Medium |
| **Best for** | Learning | Production | Local Dev |

---

## 🎓 Learning Path Recommendation

1. **Week 1**: Start with `Jenkinsfile.simple`
   - Learn Jenkins basics
   - Understand K8s deployments
   - Get comfortable with the workflow

2. **Week 2-3**: Move to `Jenkinsfile.kaniko`
   - Build custom images
   - Learn about container registries
   - Understand image tags and versions

3. **Week 4+**: Explore advanced topics
   - Multi-stage builds
   - Security scanning
   - Multiple environments (dev/staging/prod)
   - GitOps with ArgoCD

---

## 🆘 Troubleshooting

### "Cannot connect to Docker daemon"
- You're using original `Jenkinsfile` but don't have Docker on nodes
- **Solution**: Use `Jenkinsfile.simple` or `Jenkinsfile.kaniko`

### "serviceaccount 'jenkins' not found"
```bash
kubectl apply -f k8s/rbac.yaml
```

### "ImagePullBackOff" error
- K8s can't find the image
- **Solution**: 
  - For local images: Make sure image is built on the same node
  - For registry images: Check image name and credentials

### Pipeline gets stuck
```bash
# Check pod logs
kubectl logs -l jenkins=agent -n default --tail=100

# Check events
kubectl get events --sort-by=.metadata.creationTimestamp
```

---

## 📚 Next Steps

1. ✅ Choose a pipeline approach
2. ✅ Run your first build
3. ✅ Access your deployed application
4. 📝 Try modifying the app code
5. 📝 Add more test cases
6. 📝 Implement code quality checks
7. 📝 Add Slack/email notifications

---

## 🔗 Useful Resources

- [Jenkins Kubernetes Plugin](https://plugins.jenkins.io/kubernetes/)
- [Kaniko Project](https://github.com/GoogleContainerTools/kaniko)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Jenkins Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)

---

## ❓ Still Have Questions?

Remember:
- **You DON'T need Docker Hub to get started!**
- **You DON'T need Docker on your K8s nodes!**
- **Start simple, then add complexity**

Happy learning! 🚀

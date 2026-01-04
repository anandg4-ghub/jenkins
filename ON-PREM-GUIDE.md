# Jenkins on On-Premises Kubernetes - Perfect Setup! 🏢

## Why On-Prem is Great for Learning

With an on-premises K8s cluster, you have:
- ✅ **Full control** over the environment
- ✅ **Direct access** to nodes
- ✅ **No cloud costs**
- ✅ **Can use local Docker registries**
- ✅ **Easier to experiment**

## 🎯 Best Approaches for On-Prem K8s

### Approach 1: Simple Pipeline (Currently Active) ✅ **BEST FOR LEARNING**

**Your current `Jenkinsfile` is PERFECT for on-prem!**

**What it does:**
- Uses pre-built Node.js image (node:18-alpine)
- No image building required
- No registry needed
- Just tests and deploys

**Perfect for:**
- ✅ Learning Jenkins pipeline basics
- ✅ Understanding K8s deployments
- ✅ Getting started quickly

---

### Approach 2: Docker Socket Mount (Good for On-Prem)

Since you're on-prem, you likely **DO have Docker** on your nodes! This is the fastest option.

**Check if Docker is available:**
```bash
# Check on master node
docker --version

# Or check on K8s nodes
kubectl get nodes
kubectl debug node/<node-name> -it --image=busybox
# Inside debug pod:
chroot /host
docker --version
```

If Docker is available, you can use `Jenkinsfile.original` for **faster builds**.

---

### Approach 3: Local Docker Registry (Best for On-Prem Production)

Run a local registry in your cluster - **no Docker Hub needed!**

```bash
# Deploy local registry
kubectl create deployment registry --image=registry:2
kubectl expose deployment registry --port=5000 --target-port=5000 --type=NodePort

# Get the NodePort
kubectl get svc registry
```

---

## 🚀 Recommended Setup for On-Prem

### Option A: Start Simple (Current Setup)
Your current `Jenkinsfile` is **perfect**! Just run it as-is.

### Option B: Use Docker (If Available on Nodes)

1. **Check if Docker is on your nodes:**
```bash
# SSH to a node or use kubectl debug
kubectl get nodes -o wide
ssh user@<node-ip>
docker --version
```

2. **If YES**, you can use the original Jenkinsfile with Docker:
```bash
cd /tmp/jenkins-k8s-demo
cp Jenkinsfile.original Jenkinsfile
git add Jenkinsfile
git commit -m "Use Docker socket for on-prem cluster"
git push
```

### Option C: Setup Local Registry (Recommended for Teams)

This gives you the best of both worlds:
- Build custom images
- No external registry needed
- Fast local pulls
- Works like Docker Hub but private

---

## 📊 On-Prem Comparison

| Approach | Needs Docker | Needs Registry | Speed | Best For |
|----------|--------------|----------------|-------|----------|
| **Simple Pipeline** | ❌ No | ❌ No | Fast | Learning |
| **Docker Socket** | ✅ Yes | ❌ No | Fastest | Dev/Testing |
| **Local Registry** | ✅ Yes | ✅ Local | Fast | Teams/Prod |
| **Kaniko** | ❌ No | Optional | Medium | Security-focused |

---

## 🔧 On-Prem Specific Tips

### 1. **Node Access**
Since it's on-prem, you can:
```bash
# SSH directly to nodes
ssh user@node-ip

# Check Docker
docker ps
docker images

# Check disk space
df -h
```

### 2. **Storage Considerations**
On-prem means you control storage:
```bash
# Check available storage
kubectl get pv
kubectl get pvc

# Docker images location (usually)
du -sh /var/lib/docker
```

### 3. **Network Access**
Test your app easily:
```bash
# Get NodePort
kubectl get svc hello-app-service
# Access via: http://<any-node-ip>:<node-port>

# Or use port-forward
kubectl port-forward svc/hello-app-service 8080:80
```

### 4. **Resource Management**
You know your hardware limits:
```bash
# Check node resources
kubectl top nodes

# Check pod resources
kubectl top pods
```

---

## 🎓 Learning Path for On-Prem

### Week 1: Current Setup ✅
```bash
# Just use your current Jenkinsfile.simple
# Focus on: Jenkins basics, K8s deployments
```

### Week 2: Add Docker Building
```bash
# If you have Docker on nodes, use Jenkinsfile.original
# Learn: Building images, Docker basics
```

### Week 3: Setup Local Registry
```bash
# Deploy local registry in cluster
# Learn: Image management, registry operations
```

### Week 4: Advanced Pipelines
```bash
# Multi-branch pipelines
# Automated testing
# Quality gates
```

---

## 🏁 Quick Start for Your On-Prem Cluster

### Step 1: Check Your Setup
```bash
# Check K8s version
kubectl version --short

# Check nodes
kubectl get nodes

# Check if Jenkins is running
kubectl get pods -n <jenkins-namespace>
```

### Step 2: Apply RBAC
```bash
kubectl apply -f k8s/rbac.yaml
```

### Step 3: Run the Pipeline
Your current `Jenkinsfile` will work perfectly as-is!
- Create Pipeline job in Jenkins
- Point to your GitHub repo
- Build Now!

### Step 4: Access Your App
```bash
# Get the service details
kubectl get svc hello-app-service

# Method 1: NodePort (on-prem advantage!)
# Access via any node IP and the NodePort
curl http://<node-ip>:<node-port>

# Method 2: Port-forward
kubectl port-forward svc/hello-app-service 8080:80
curl http://localhost:8080
```

---

## 🔍 Troubleshooting On-Prem

### Issue: Can't pull images
```bash
# Check internet access from nodes
kubectl run test --image=busybox --rm -it -- ping -c 4 google.com

# If no internet, you'll need:
# 1. Local registry, OR
# 2. Pre-loaded images, OR
# 3. HTTP proxy configuration
```

### Issue: Slow image pulls
```bash
# On-prem solution: Local registry or image cache
# Or pre-pull images on all nodes:
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: prepull-images
spec:
  selector:
    matchLabels:
      app: prepull
  template:
    metadata:
      labels:
        app: prepull
    spec:
      containers:
      - name: node
        image: node:18-alpine
        command: ["sleep", "infinity"]
EOF
```

### Issue: Resource limits
```bash
# On-prem, you control everything!
# Adjust resources in deployment.yaml:
resources:
  requests:
    memory: "128Mi"
    cpu: "250m"
  limits:
    memory: "256Mi"
    cpu: "500m"
```

---

## 💡 On-Prem Advantages

1. **Full Control**: You can install whatever you need
2. **No Cloud Costs**: Run as many builds as you want
3. **Direct Access**: SSH to nodes, check logs directly
4. **Custom Config**: Tune everything for your hardware
5. **Private Network**: All data stays in your datacenter

---

## 📚 Next Steps

1. ✅ **Keep using your current simple pipeline** - it's perfect for learning!
2. 🔍 **Check if Docker is on your nodes** - unlocks more options
3. 📦 **Consider local registry** - when you're ready for custom images
4. 🔧 **Experiment freely** - on-prem means you can try anything!

---

## ❓ Common On-Prem Questions

**Q: Do I need internet access?**
A: Only to pull base images (node:18-alpine, kubectl, etc.). After first pull, they're cached.

**Q: Can I use Docker Hub?**
A: Yes, but you don't need to! Local registry is better for on-prem.

**Q: How do I share images between nodes?**
A: Use a local registry or build images on each node.

**Q: What if nodes have no internet?**
A: Pre-load images or setup an air-gapped registry.

---

Your current setup is **perfect for on-premises**! Just keep using `Jenkinsfile.simple` and you're good to go! 🚀

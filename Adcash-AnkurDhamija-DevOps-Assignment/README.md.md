
# Adcash Node.js Application Deployment & Monitoring

Link to the repository: 

## Step 1: Deploying Node.js App

### 1.1 EC2 with Docker

**Dockerfile Highlights**
- Multi-stage build
- Runs as non-root user `adcash`
- Based on `node:20-alpine`
- Exposes port `80`


**Build Docker Image**

docker build -t adcash-node-app .


Run Container:


docker run -d --name=adcash --restart=always -p 80:80 adcash-node-app:latest


**Access Application**

* [http://13.232.9.68/gandalf](http://13.232.9.68/gandalf)
* [http://13.232.9.68/colombo](http://13.232.9.68/colombo)
* [http://13.232.9.68/metrics](http://13.232.9.68/metrics)

---

### 1.2 Kubernetes on EKS

**Deployment Highlights**


replicas: 1
image: 761018875260.dkr.ecr.ap-south-1.amazonaws.com/adcash:latest
containerPort: 80

**Prometheus Annotations**


prometheus.io/scrape: "true"
prometheus.io/path: "/metrics"
prometheus.io/port: "80"


**Apply Resources**

commands to apply resources: 

kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

---

## Step 2: Prometheus Monitoring

### 2.1 EC2 with Ansible

**Inventory File**

```ini
[adcash-ansible]
localhost ansible_connection=local
```

**Run Playbook**

```bash
ansible-playbook -i inventory adcash-prometheus-playbook.yml
```

**Monitored Endpoints**

* [http://13.232.9.68/gandalf](http://13.232.9.68/gandalf)
* [http://13.232.9.68/colombo](http://13.232.9.68/colombo)
* [http://13.232.9.68/metrics](http://13.232.9.68/metrics)

---

### 2.2 EKS with Helm

**Create Secret**

```bash
kubectl create secret generic prometheus-additional-scrape-configs \
  --from-file=additional-scrape-configs.yaml
```

**Deploy Prometheus**

```bash
helm upgrade --install prometheus prometheus-community/prometheus -f main-values.yaml
```

**Sample Values**

```yaml
server:
  service:
    type: LoadBalancer
    port: 80
  extraScrapeConfigsSecret: prometheus-additional-scrape-configs
```

**Check Resources**

```bash
helm list
kubectl get all
```

**Access Prometheus**

```
http://<loadbalancer-dns>/

-----------------------

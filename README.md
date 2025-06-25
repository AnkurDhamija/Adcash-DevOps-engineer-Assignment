
# Adcash Node.js Application Deployment & Monitoring

Link to the repository: https://github.com/AnkurDhamija/Adcash-DevOps-engineer-Assignment


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

# Step 2: Prometheus Monitoring

### 2.1 Running Prometheus server on an EC2 with Ansible

**Inventory File**

```ini
[adcash-ansible]
localhost ansible_connection=local

``` Playbook
####[ec2-user@ip-172-31-9-46 adcash-prometheus]$ cat adcash-prometheus-playbook.yml
---
- name: Install and run Prometheus on local VM
  hosts: localhost
  become: yes
  connection: local

  tasks:
    - name: Install required packages
      package:
        name:
          - wget
          - tar
          - python3
        state: present

    - name: Create prometheus user
      user:
        name: prometheus
        system: yes
        shell: /sbin/nologin

    - name: Download Prometheus 2.52.0
      get_url:
        url: https://github.com/prometheus/prometheus/releases/download/v2.52.0/prometheus-2.52.0.linux-amd64.tar.gz
        dest: /tmp/prometheus.tar.gz

    - name: Extract Prometheus
      unarchive:
        src: /tmp/prometheus.tar.gz
        dest: /opt/
        remote_src: yes

    - name: Create symbolic link to /opt/prometheus
      file:
        src: /opt/prometheus-2.52.0.linux-amd64
        dest: /opt/prometheus
        state: link

    - name: Create Prometheus config file
      copy:
        dest: /opt/prometheus/prometheus.yml
        content: |
          global:
            scrape_interval: 15s

          scrape_configs:
            - job_name: 'adcash-app'
              static_configs:
                - targets: ['13.232.9.68:80']

    - name: Run Prometheus in background
      shell: |
        nohup /opt/prometheus/prometheus --config.file=/opt/prometheus/prometheus.yml --web.listen-address=":9090" > /var/log/prometheus.log 2>&1 &
      args:
        executable: /bin/bash


**command to run  the Playbook**

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


helm upgrade --install prometheus prometheus-community/prometheus -f main-values.yaml

# Command to Check  the Resources**


Command 1: helm list


Command 2: kubectl get all

# Process to Access Prometheus


http://endpoint of our loadbalancer/

-----------------------

# Enterprise Framework - Dashboard Setup & Configuration

📊 **Complete guide for setting up and configuring monitoring dashboards in Enterprise Framework applications.**

This guide shows how to use the automatically generated dashboard configurations for Grafana, Prometheus, and Kibana that come with every Enterprise Framework microservice.

## 🎯 **Overview**

The Enterprise Framework includes **pre-configured monitoring dashboards** that work out of the box with:

- **Grafana Dashboards** - Visual monitoring with business and technical metrics
- **Prometheus Configuration** - Metric collection and alerting rules
- **Kibana Dashboards** - Log analysis and audit trail visualization
- **Alert Rules** - Automatic alerting for business and technical issues

## 🚀 **Quick Start**

### 1. **Start Complete Monitoring Stack**

```bash
# Generate enterprise microservice with monitoring
enterprise generate my-service --domain my-domain --enterprise-framework

# Navigate to generated service
cd my-service

# Start full monitoring stack with Docker Compose
docker-compose up -d

# Wait for services to start (about 60 seconds)
docker-compose logs -f
```

### 2. **Access Monitoring Tools**

```bash
# Application with metrics endpoint
curl http://localhost:8080/api/v1/actuator/prometheus

# Grafana Dashboard
open http://localhost:3000
# Login: admin / admin

# Prometheus Metrics & Alerts
open http://localhost:9090

# Kibana Log Analysis
open http://localhost:5601

# RabbitMQ Management
open http://localhost:15672
# Login: admin / password
```

### 3. **Verify Enterprise Framework Metrics**

```bash
# Check enterprise metrics are being collected
curl -s http://localhost:8080/api/v1/actuator/prometheus | grep enterprise_service

# Expected output:
# enterprise_service_operations_total{entity="mydomain",operation="create"} 0.0
# enterprise_service_create_time_bucket{entity="mydomain",le="0.1"} 0.0
# enterprise_cache_hit{entity="mydomain"} 0.0
```

## 📊 **Grafana Dashboard Configuration**

### **Enterprise Overview Dashboard**

The generated `enterprise-overview.json` dashboard provides:

#### **Key Performance Indicators (KPIs)**
```json
{
  "Service Health": "up{job=\"enterprise-app\"}",
  "Request Rate": "sum(rate(enterprise_service_operations_total[5m]))",
  "Error Rate": "(sum(rate(enterprise_service_errors_total[5m])) / sum(rate(enterprise_service_operations_total[5m]))) * 100",
  "Response Time (95th)": "histogram_quantile(0.95, sum(rate(enterprise_service_create_time_bucket[5m])) by (le))",
  "Active Users": "count(count by (user)(rate(enterprise_service_operations_total[5m]) > 0))"
}
```

#### **Business Operations Trend**
- Real-time operation rates by type (CREATE, READ, UPDATE, DELETE, SEARCH)
- Entity-specific operation volumes
- User engagement patterns

#### **Performance Analysis**
- Response time distribution (50th, 95th, 99th percentiles)
- Error breakdown by type (validation, system, business rule violations)
- Cache performance metrics

### **Import Dashboard Process**

1. **Access Grafana**
   ```bash
   open http://localhost:3000
   # Login: admin / admin
   ```

2. **Import Enterprise Dashboard**
   - Navigate to Dashboards → Import
   - Upload `docker/grafana/dashboards/enterprise-overview.json`
   - Select Prometheus datasource
   - Click Import

3. **Verify Dashboard Data**
   - Dashboard should show real-time metrics
   - Generate some test data to see metrics:
   ```bash
   # Generate test operations
   curl -X POST http://localhost:8080/api/v1/mydomains \
     -H "Content-Type: application/json" \
     -d '{"name": "Test Item", "description": "Dashboard test"}'
   ```

### **Custom Dashboard Creation**

#### **Business Metrics Dashboard**

Create business-specific dashboards using Enterprise Framework metrics:

```json
{
  "Business KPIs Panel": {
    "targets": [
      {
        "expr": "sum(increase(mydomain_created[1h]))",
        "legendFormat": "Items Created/Hour"
      },
      {
        "expr": "sum(mydomain_potential_revenue)",
        "legendFormat": "Potential Revenue"
      },
      {
        "expr": "mydomain_inventory_low_stock_count",
        "legendFormat": "Low Stock Items"
      }
    ]
  },
  "User Engagement Panel": {
    "targets": [
      {
        "expr": "sum(rate(mydomain_user_engagement[5m])) by (operation)",
        "legendFormat": "{{ operation }} engagement"
      }
    ]
  }
}
```

#### **Operational Dashboard**

```json
{
  "Infrastructure Health Panel": {
    "targets": [
      {
        "expr": "(jvm_memory_used_bytes{area=\"heap\"} / jvm_memory_max_bytes{area=\"heap\"}) * 100",
        "legendFormat": "JVM Heap Usage %"
      },
      {
        "expr": "(hikaricp_connections_active / hikaricp_connections_max) * 100",
        "legendFormat": "DB Connection Pool %"
      },
      {
        "expr": "rate(jvm_gc_collection_seconds_sum[5m])",
        "legendFormat": "GC Time/sec"
      }
    ]
  }
}
```

## 📈 **Prometheus Configuration**

### **Generated Configuration Files**

#### **1. prometheus.yml**
Complete Prometheus configuration with:
```yaml
# Enterprise application metrics
- job_name: 'enterprise-app'
  metrics_path: '/api/v1/actuator/prometheus'
  scrape_interval: 10s
  static_configs:
    - targets: ['myservice:8080']

# Infrastructure metrics
- job_name: 'redis'
  static_configs:
    - targets: ['redis-exporter:9121']

- job_name: 'postgresql'  # or mysql
  static_configs:
    - targets: ['postgres-exporter:9187']
```

#### **2. alert_rules.yml**
Enterprise-specific alert rules:
```yaml
# Application performance alerts
- alert: HighResponseTime
  expr: histogram_quantile(0.95, sum(rate(enterprise_service_create_time_bucket[5m])) by (le)) > 2
  for: 1m
  labels:
    severity: warning

# Business rule violation alerts
- alert: BusinessRuleViolationSpike
  expr: increase(enterprise_service_business_rule_violation[1h]) > 50
  for: 5m
  labels:
    severity: warning
```

#### **3. business_rules.yml**
Business-specific alerts (customizable):
```yaml
# Revenue and business KPI alerts
- alert: LowRevenueImpact
  expr: sum(increase(mydomain_potential_revenue[1h])) < 1000
  for: 30m
  labels:
    severity: warning

# User engagement alerts
- alert: LowUserEngagement
  expr: sum(rate(mydomain_user_engagement[1h])) < 50
  for: 30m
  labels:
    severity: warning
```

### **Custom Alert Rules**

#### **Adding Business-Specific Alerts**

1. **Edit business_rules.yml**
   ```yaml
   # Add custom business alerts
   - alert: HighValueTransaction
     expr: mydomain_transaction_value > 10000
     for: 0s
     labels:
       severity: info
     annotations:
       summary: "High value transaction detected"
       description: "Transaction of ${{ $value }} detected"
   ```

2. **Reload Prometheus Configuration**
   ```bash
   # Send reload signal to Prometheus
   curl -X POST http://localhost:9090/-/reload
   ```

3. **Verify Alert Rules**
   ```bash
   # Check alert rules status
   curl http://localhost:9090/api/v1/rules | jq '.data.groups[].rules[].name'
   ```

### **Alert Manager Integration**

#### **Configure Alert Manager**
```yaml
# alertmanager.yml
global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alerts@company.com'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'

receivers:
- name: 'web.hook'
  email_configs:
  - to: 'admin@company.com'
    subject: 'MyService Alert - {{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
    body: |
      {{ range .Alerts }}
      Alert: {{ .Annotations.summary }}
      Description: {{ .Annotations.description }}
      Severity: {{ .Labels.severity }}
      {{ end }}

  slack_configs:
  - api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
    channel: '#myservice-alerts'
    title: 'MyService Alert'
    text: |
      {{ range .Alerts }}
      Alert: {{ .Annotations.summary }}
      {{ .Annotations.description }}
      {{ end }}
```

## 📋 **Kibana Log Analysis**

### **Enterprise Framework Log Patterns**

#### **1. Application Logs**
```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "level": "INFO",
  "logger": "com.company.myservice.service.MyDomainServiceImpl",
  "message": "Creating new mydomain entity",
  "correlationId": "req-123-456",
  "userId": "user@company.com",
  "entityType": "MYDOMAIN",
  "operation": "CREATE"
}
```

#### **2. Audit Logs**
```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "auditId": "audit-uuid-123",
  "eventType": "OPERATION_SUCCESS",
  "operation": "CREATE",
  "entityType": "MYDOMAIN",
  "entityId": "MD-123",
  "userId": "user@company.com",
  "status": "SUCCESS",
  "processingTimeMs": 145
}
```

### **Kibana Dashboard Setup**

#### **1. Index Pattern Configuration**
```bash
# Create index patterns in Kibana
# Application logs: logstash-*
# Audit logs: audit-events-*
```

#### **2. Application Logs Dashboard**

**Log Volume Panel**
```json
{
  "query": {
    "match_all": {}
  },
  "aggs": {
    "logs_over_time": {
      "date_histogram": {
        "field": "@timestamp",
        "calendar_interval": "minute"
      },
      "aggs": {
        "by_level": {
          "terms": {
            "field": "level.keyword"
          }
        }
      }
    }
  }
}
```

**Error Analysis Panel**
```json
{
  "query": {
    "bool": {
      "must": [
        {"term": {"level.keyword": "ERROR"}},
        {"range": {"@timestamp": {"gte": "now-1h"}}}
      ]
    }
  },
  "aggs": {
    "by_logger": {
      "terms": {
        "field": "logger.keyword"
      }
    }
  }
}
```

#### **3. Audit Trails Dashboard**

**Business Operations Panel**
```json
{
  "query": {
    "bool": {
      "must": [
        {"term": {"eventType.keyword": "OPERATION_SUCCESS"}},
        {"range": {"timestamp": {"gte": "now-24h"}}}
      ]
    }
  },
  "aggs": {
    "by_operation": {
      "terms": {
        "field": "operation.keyword"
      }
    },
    "by_entity": {
      "terms": {
        "field": "entityType.keyword"
      }
    }
  }
}
```

**User Activity Panel**
```json
{
  "query": {
    "bool": {
      "must": [
        {"exists": {"field": "security.userId"}},
        {"range": {"timestamp": {"gte": "now-24h"}}}
      ]
    }
  },
  "aggs": {
    "top_users": {
      "terms": {
        "field": "security.userId.keyword",
        "size": 10
      },
      "aggs": {
        "operations": {
          "terms": {
            "field": "operation.keyword"
          }
        }
      }
    }
  }
}
```

## 🔧 **Development Workflow**

### **1. Local Development Setup**

```bash
# Start monitoring stack
enterprise dev setup --docker

# Start application with monitoring
enterprise dev start --full-stack

# Generate test data for dashboards
enterprise dev test --generate-metrics
```

### **2. Dashboard Development**

```bash
# Create custom business metrics
@Component
public class MyDomainBusinessMetrics {

    @Autowired
    private MeterRegistry meterRegistry;

    @EventListener
    public void onBusinessEvent(MyDomainCreatedEvent event) {
        // Custom revenue metric
        Gauge.builder("mydomain.potential.revenue")
             .tag("category", event.getMyDomain().getCategory())
             .register(meterRegistry, () -> calculateRevenue(event.getMyDomain()));

        // Custom inventory metric
        Counter.builder("mydomain.inventory.changes")
               .tag("operation", "CREATE")
               .register(meterRegistry)
               .increment();
    }
}
```

### **3. Dashboard Testing**

```bash
# Test dashboard with load
for i in {1..100}; do
  curl -X POST http://localhost:8080/api/v1/mydomains \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"Test Item $i\", \"description\": \"Load test\"}"
  sleep 0.1
done

# Verify metrics in Grafana
open http://localhost:3000/d/enterprise-overview/enterprise-overview
```

### **4. Alert Testing**

```bash
# Test high error rate alert
for i in {1..20}; do
  curl -X POST http://localhost:8080/api/v1/mydomains \
    -H "Content-Type: application/json" \
    -d '{"name": "", "description": "Invalid data"}'  # Will trigger validation error
done

# Check alerts in Prometheus
open http://localhost:9090/alerts
```

## 🚀 **Production Deployment**

### **1. Kubernetes Dashboard Deployment**

```yaml
# k8s/monitoring-stack.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-dashboards
data:
  enterprise-overview.json: |
    # Dashboard JSON content here

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: grafana
spec:
  template:
    spec:
      containers:
      - name: grafana
        image: grafana/grafana:latest
        env:
        - name: GF_SECURITY_ADMIN_PASSWORD
          valueFrom:
            secretKeyRef:
              name: grafana-secrets
              key: admin-password
        volumeMounts:
        - name: dashboards
          mountPath: /etc/grafana/provisioning/dashboards
        - name: datasources
          mountPath: /etc/grafana/provisioning/datasources
      volumes:
      - name: dashboards
        configMap:
          name: grafana-dashboards
```

### **2. Production Alert Configuration**

```yaml
# Production alert manager configuration
global:
  smtp_smarthost: 'smtp.company.com:587'
  smtp_auth_username: 'alerts@company.com'
  smtp_auth_password: '${SMTP_PASSWORD}'

route:
  group_by: ['severity', 'service']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'production-alerts'
  routes:
  - match:
      severity: critical
    receiver: 'critical-alerts'
    repeat_interval: 15m

receivers:
- name: 'production-alerts'
  email_configs:
  - to: 'team@company.com'
    subject: 'Production Alert - {{ .GroupLabels.service }}'

- name: 'critical-alerts'
  email_configs:
  - to: 'oncall@company.com'
    subject: 'CRITICAL - {{ .GroupLabels.service }}'
  pagerduty_configs:
  - service_key: '${PAGERDUTY_SERVICE_KEY}'
```

### **3. Dashboard Backup and Versioning**

```bash
# Export dashboards for version control
curl -H "Authorization: Bearer ${GRAFANA_API_KEY}" \
  http://grafana:3000/api/dashboards/uid/enterprise-overview | \
  jq '.dashboard' > enterprise-overview-backup.json

# Import dashboards in CI/CD
curl -X POST -H "Authorization: Bearer ${GRAFANA_API_KEY}" \
  -H "Content-Type: application/json" \
  -d @enterprise-overview.json \
  http://grafana:3000/api/dashboards/db
```

## 🎯 **Dashboard Best Practices**

### **1. Enterprise Framework Approach**
- **🤖 Infrastructure automatic**: Basic dashboards work out of the box
- **👨‍💻 Business focus**: Customize dashboards for business KPIs
- **📊 Standard patterns**: Consistent monitoring across all microservices
- **🔍 Drill-down capability**: From overview to detailed analysis

### **2. Dashboard Design Principles**
```json
{
  "Top Level KPIs": "Service health, request rate, error rate, response time",
  "Business Metrics": "Revenue impact, user engagement, conversion rates",
  "Operational Metrics": "Infrastructure health, resource utilization",
  "Drill-down Paths": "From overview → entity → operation → user level"
}
```

### **3. Alert Strategy**
```yaml
Severity Levels:
  critical: "Service down, data loss, security breach"
  warning: "Performance degradation, business rule violations"
  info: "High activity, notable events, threshold approaches"

Alert Routing:
  critical: "Immediate notification + pager"
  warning: "Email + Slack channel"
  info: "Dashboard annotation + daily digest"
```

---

**Enterprise Framework Dashboards** - Pre-configured monitoring dashboards with automatic metrics and business intelligence.

> 📊 **Zero Configuration**: **Production-ready dashboards** work automatically with comprehensive business and technical metrics from day one.

> 🎯 **Business Focus**: Dashboards emphasize business KPIs and user experience while providing complete infrastructure visibility when needed.
FROM grafana/grafana:latest

# We need to set the Prometheus URL to the Render deployed Prometheus
ENV GF_SECURITY_ALLOW_EMBEDDING=true
ENV GF_AUTH_ANONYMOUS_ENABLED=true
ENV GF_AUTH_ANONYMOUS_ORG_ROLE=Viewer

COPY provisioning /etc/grafana/provisioning
COPY dashboards /var/lib/grafana/dashboards

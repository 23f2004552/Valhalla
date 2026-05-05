FROM grafana/grafana:latest

ENV GF_SECURITY_ALLOW_EMBEDDING=true
ENV GF_AUTH_ANONYMOUS_ENABLED=true
ENV GF_AUTH_ANONYMOUS_ORG_ROLE=Viewer
ENV GF_SERVER_HTTP_PORT=3000
ENV GF_SERVER_ROOT_URL=https://valhalla-grafana.onrender.com/
ENV GF_SECURITY_COOKIE_SAMESITE=none
ENV GF_SECURITY_COOKIE_SECURE=true

COPY grafana/provisioning /etc/grafana/provisioning
COPY grafana/dashboards /var/lib/grafana/dashboards

EXPOSE 3000

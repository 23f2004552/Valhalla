FROM prom/prometheus:latest
COPY prometheus.yml /etc/prometheus/prometheus.yml
COPY prometheus_rules.yml /etc/prometheus/prometheus_rules.yml
EXPOSE 9090
CMD ["--config.file=/etc/prometheus/prometheus.yml", "--web.listen-address=:9090"]

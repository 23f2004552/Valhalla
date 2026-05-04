#!/bin/sh
# Substitute environment variables into the nginx config template
envsubst '${FRONTEND_ORIGIN}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

FROM patrickhulce/lhci-server:latest

COPY .lighthouserc.js .
COPY docker-entrypoint.sh .

ENTRYPOINT [ "docker-entrypoint.sh" ]

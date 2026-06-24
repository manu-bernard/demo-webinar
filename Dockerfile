# Serveur statique unique : sert public/ (galerie + toutes les démos figées).
# Aucune démo n'est reconstruite ici — on ne fait que servir le dist déjà commité.
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY public/ /usr/share/nginx/html/
EXPOSE 80

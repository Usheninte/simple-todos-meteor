FROM gcr.io/google_appengine/nodejs
RUN install_node 8.15.1
RUN npm install npm@5.0.0
RUN node -v
RUN npm -v
COPY . /app/
RUN (cd programs/server && npm install --unsafe-perm)
CMD node main.js
EXPOSE 8080
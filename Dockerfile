FROM node:12

EXPOSE 3000
COPY . /srv
WORKDIR /srv
ENV NODE_ENV=production
RUN npm install --unsafe-perm
RUN npm run build:server
CMD ["npm", "start"]

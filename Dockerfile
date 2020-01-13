FROM node:12

EXPOSE 3000
COPY . /srv
WORKDIR /srv
ENV NODE_ENV=production
RUN npm install
RUN npm run build
CMD ["npm", "start"]

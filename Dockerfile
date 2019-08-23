FROM node

EXPOSE 3000
COPY . /srv
WORKDIR /srv
RUN npm run build
CMD ["npm", "start"]

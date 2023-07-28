# Base image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN npm run build

# Expose port 3000 for the server
EXPOSE 3000

# Create a Docker volume for the "data" folder
VOLUME /usr/src/app/data

# Start the server using the production build
CMD [ "node", "dist/main.js" ]

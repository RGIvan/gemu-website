FROM node:22-alpine

WORKDIR /app

# Copiamos solo los archivos de dependencias primero
COPY package*.json ./
# Si usas yarn: COPY yarn.lock package.json ./

# Instalamos dependencias dentro del contenedor
RUN npm install
# o: RUN yarn install

# Copiamos el resto del proyecto
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--port", "3000", "--hostname", "0.0.0.0"]
# o: CMD ["yarn", "dev", "--port", "3000", "--hostname", "0.0.0.0"]
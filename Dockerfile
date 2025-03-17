# Usa Node.js 18 como base
FROM node:18

# Establecer el directorio de trabajo
WORKDIR /app

# Eliminar Serverless global si está preinstalado (opcional)
RUN npm uninstall -g serverless && \
    npm cache clean --force && \
    rm -rf /usr/local/lib/node_modules/serverless

# Instalar Serverless v3 globalmente (NO actualizar a v4)
RUN npm install -g serverless@3

# Copiar solo los archivos necesarios para instalar dependencias
COPY package.json package-lock.json ./

# Limpiar la caché de npm e instalar dependencias
RUN npm cache clean --force && \
    npm install --legacy-peer-deps

# Copiar el resto de los archivos de configuración
COPY tsconfig.json nest-cli.json serverless.yml ./

# Copiar el código fuente
COPY . .

# Verificar la estructura de archivos (para depuración)
RUN ls -lR /app

# Limpiar compilaciones previas y compilar el código
RUN rm -rf dist && npm run build

# Exponer puerto (si usas serverless offline)
EXPOSE 3000

# Ejecutar Serverless
CMD ["serverless", "offline", "--host", "0.0.0.0"]



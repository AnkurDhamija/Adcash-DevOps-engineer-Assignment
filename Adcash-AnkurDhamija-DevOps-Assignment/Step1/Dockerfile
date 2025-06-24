
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev


#Stage 2: Build and prepare runtime image
FROM node:20-alpine

Create non-root user
RUN addgroup -S adcashgroup && adduser -S adcash -G adcashgroup

WORKDIR /app

Copy only necessary files from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

#Set permissions and switch user
RUN chown -R adcash:adcashgroup /app
USER adcash

#Expose port
EXPOSE 80

# Run app
CMD ["node", "index.js"]
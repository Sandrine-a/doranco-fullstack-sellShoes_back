import fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import mongodb from '@fastify/mongodb'
import fastifyPlugin from 'fastify-plugin'
import userRoute from './routes/users.routes'
import users from './routes/users.routes'

// Création d'une application fastify
const app = fastify({ logger: true })

/**
 * On initialize une connection à la base de données
 */
app.register(mongodb, {
  // Nous devons spécifier l'url de connnection à la base de données
  url: process.env.DATABASE_URL,
  // Nous devons aussi spécifier la base de données :
  database: 'sellshoes',
})

// +++ On ajoute le plugin pour generer les token
app.register(fastifyJwt, {
  secret: process.env.API_TOKEN_SECRET || 'secret'
})
// On enresgistre le pluging
app.register(users)

// Démarage du serveur http
app.listen({ port: 5353, host: '127.0.0.1' }, () => {
  console.log("Le serveur http est prêt sur l'adresse : http://127.0.0.1:5353")
})

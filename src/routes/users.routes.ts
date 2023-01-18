// src/routes/users.ts
import { FastifyInstance } from 'fastify'
import {
  NewUserModel,
  NewUserSchema,
  UserCollectionModel,
  UserCollectionSchema,
  UserCredentialModel,
  UserModel,
  UserSchema,
  UserSearchCriteriaModel,
  UserSearchCriteriaSchema,
  UserTokenModel,
} from '../models/users.model'

/**
 * Création du plugin des utilisateurs
 */
export default async function users(app: FastifyInstance) {
  /**
   * Création d'un route permettant de créer un nouvelle utilisateur
   */
  app.post(
    '/users',
    { schema: { body: NewUserSchema, response: { 201: UserSchema } } },
    async (request, response) => {
      //1- Pour lancer la validation du body en utilisant le
      // NewUserModel. Je m'assure que toutes les données soient corrects
      // Je récupére le nouvel user
      const newUser = NewUserModel.parse(request.body)
      // console.log(newUser) // { email: '...', firstname: '', lastname: '' }

      //Le cryptage et la vérification se fera avec zod --

      //2-On enregistre le nouvel utilisateur dans la base de donnees
      const result = await app.mongo.db?.collection('users').insertOne({
        email: newUser.email,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        password: newUser.password,
      })

      //3- On recupere l'utilisateur tout juste enregistré
      const user = await app.mongo.db?.collection('users').findOne({
        _id: result?.insertedId,
      })

      console.log(user);
      
      // on ajoute le code reponse
      response.code(201)

      //On retourne l'utilsatueur validé par un Model
      return UserModel.parse(user)
    },
  )

  /**
   * Création d'un route permettant de lister des utilisateurs de l'appi
   */
  app.get(
    '/users',
    {
      schema: {
        querystring: UserSearchCriteriaSchema,
        response: { 200: UserCollectionSchema },
      },
    },
    async request => {
      // Je vérifie de bien recevoir un jeton de connexion
      await request.jwtVerify()
      
      //On recupere les criteres de recherche qui sont dans les queries
      const criterias = UserSearchCriteriaModel.parse(request.query)

      // On lance la requête à la base de données permettant de récupérer
      // les utilisateurs correspondant aux critéres de recherche
      const data = await app.mongo.db
        ?.collection('users')
        .find(
          criterias.email
            ? {
                email: new RegExp(`${criterias.email}`),
              }
            : {},
        )
        .limit(criterias.limit)
        .skip((criterias.page - 1) * criterias.limit)
        .sort({ [criterias.orderBy]: criterias.direction })
        .toArray()

      // On retourne les résultat de la recherche
      return UserCollectionModel.parse(data)
    },
  )

  /**
   * Création d'un route permettant de demander le toeken
   */
  app.post('/token', {}, async (request, response) => {
    //1- On parse le UserCredentialModel reçu dans request.query
    const userCredential = UserCredentialModel.parse(request.body)

    //2- On recupere l'utilisateur correspondant dans la base de donnnes
    const userExist = await app.mongo.db?.collection('users').findOne({
      email: userCredential.email,
      password: userCredential.password,
    })

    if (userExist) {
      //-3 On s'assure que les donnnes de la base de donnes correspondent bien
      // à notre model dans la reponse envoyee
      const user = UserModel.parse(userExist)

      //4-On génère le UserTokenModel avec un jeton de connxion
      return UserTokenModel.parse({
        token: app.jwt.sign({ _id: user._id, email: user.email }),
      })

    } else {
      response.code(400)
      return {
        error: 'Bad credentials',
      }
    }
  })
}

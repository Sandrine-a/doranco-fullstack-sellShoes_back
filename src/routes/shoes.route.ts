import { FastifyInstance } from 'fastify'
import { ObjectId } from 'mongodb'
import {
  NewShoesModel,
  NewShoesSchema,
  ShoesSchema,
  ShoesModel,
} from '../models/shoes.models'
import { UserModel, UserSchema, UserTokenModel } from '../models/users.model'

/**
 * Création du plugin des utilisateurs
 */
export default async function shoes(app: FastifyInstance) {
  /**
   * Création d'un route permettant de créer une annonce shoes
   */
  app.post(
    '/shoes',
    { schema: { body: NewShoesSchema, response: { 201: ShoesSchema } } },
    async (request, response) => {
      // 1 - Je vérifie de bien recevoir un jeton de connexion
      await request.jwtVerify()

      // const decodedTokenToString = await request.jwtVerify()
      // console.log("decodedTokenToString ==", JSON.stringify(decodedTokenToString));

      // 2 - J'utilise le model User pour créer un schema avec uniquement l'_id et le mail
      const userModelPartial = UserModel.pick({ _id: true, email: true })
      // 3 - Je parse en userModelPartial la request.user qui contient les donnees user
      const userValues = userModelPartial.parse(request.user)
      //4- On recupere l'utilisateur tout juste enregistré
      const userExist = await app.mongo.db?.collection('users').findOne({
        _id: new ObjectId(userValues._id),
        email: userValues.email,
      })
      if (userExist) {
        // 5 - Je cree ma shoes pour l'enregistrer en database avec l'userId
        // const newShoes = NewShoesModel.parse(request.body)
        const newShoes = Object.assign(NewShoesModel.parse(request.body), {
          user: userExist._id,
        })

        // 6 - On enregistre la chaussure en bdd
        const result = await app.mongo.db
          ?.collection('shoes')
          .insertOne(newShoes)

        // 7- On recupere l'utilisateur tout juste enregistré
        const shoes = await app.mongo.db?.collection('shoes').findOne({
          _id: result?.insertedId,
        })

        // console.log(shoes)
        // on ajoute le code reponse
        response.code(201)

        //On retourne la shoes validee par le model
        return ShoesModel.parse(shoes)
      } else {
        response.code(400)
        return {
          error: 'Bad request',
        }
      }
    },
  )
}

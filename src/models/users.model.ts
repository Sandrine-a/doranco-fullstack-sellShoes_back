import { createHash, createHmac } from 'crypto'
import { z } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'

/**
 * @module users.model
 *
 * @description
 *  Ce module contient tous les modèles concernant les utilisateurs
 */

/**
 * 1 -- Grace à z, nous pouvons définir des models, ici :NewUserModel
 *  Ce model represente la request envoyee par le client au serveur
 *  pour creer un user
 *
 */
export const NewUserModel = z
  .object({
    email: z.string().email(),
    firstname: z.string(),
    lastname: z.string(),
    password: z
      .string()
      .min(5)
      .transform(pass =>
        createHmac('sha256', process.env.API_KEY_SECRET || 'secret')
          .update(pass)
          .digest('hex'),
      ),
    repeatedPassword: z
      .string()
      .min(5)
      .transform(pass =>
        createHmac('sha256', process.env.API_KEY_SECRET || 'secret')
          .update(pass)
          .digest('hex'),
      ),
  })
  .refine(newUser => newUser.password === newUser.repeatedPassword, {
    message: 'Your passwords must match',
  })

/**
 * 2-- (facultatif en js) Type de NewUSerMOdel ////A enlever si fichier .js
 */
export type NewUserType = z.infer<typeof NewUserModel>

/**
 * 3-- Schéma de NewUserModel
 */
export const NewUserSchema = zodToJsonSchema(NewUserModel)

/**
 * Grace à z, nous pouvons définir des models : UserModel:
 *  Ce model represente la reponse du serveur suite a la demande
 *  de creation du client et la reussite
 *
 */
export const UserModel = z.object({
  _id: z.preprocess(id => `${id}`, z.string()),
  email: z.string().email(),
  firstname: z.string(),
  lastname: z.string(),
  password: z.string(),
})

/**
 * Type de UserModel ////A enlever si fichier .js
 */
export type UserType = z.infer<typeof UserModel>

/**
 * Schema de UserModel
 */
export const UserSchema = zodToJsonSchema(UserModel)

/**
 * Grace à z, definissons le  UserSearchCriteriaModel
 *
 */
export const UserSearchCriteriaModel = z.object({
  limit: z.number().min(2).max(100).optional().default(20),
  page: z.number().min(1).optional().default(1),
  orderBy: z
    .enum(['_id', 'email', 'firstname', 'lastname'])
    .optional()
    .default('_id'),
  direction: z
    .enum(['asc', 'desc'])
    .optional()
    .default('asc')
    .transform(dir => ('asc' === dir ? 1 : -1)),
  email: z.string().optional(),
})
/**
 * Type de UserSearchCriteriaModel
 */
export type UserSearchCriteriaType = z.infer<typeof UserSearchCriteriaModel>
/**
 * Schéma de UserSearchCriteriaModel
 */
export const UserSearchCriteriaSchema = zodToJsonSchema(UserSearchCriteriaModel)

/**
 * Définission de UserCollectionModel
 */
export const UserCollectionModel = z.array(UserModel)
/**
 * Type de UserCollectionModel
 */
export type UserCollectionType = z.infer<typeof UserCollectionModel>

/**
 * Schéma de UserCollectionModel
 */
export const UserCollectionSchema = zodToJsonSchema(UserCollectionModel)

/**
 * Schéma pour les token UserCredentialModel
 * Ce model represente les donnees envoyees pour creer un user
 */
export const UserCredentialModel = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(5)
    .transform(pass =>
      createHmac('sha256', process.env.API_KEY_SECRET || 'secret')
        .update(pass)
        .digest('hex'),
    ),
})
/**
 * Type de UserCredential
 */
export type UserCredentialType = z.infer<typeof UserCredentialModel>
/**
 * Schéma de UserCredential
 */
export const UserCredentialSchema = zodToJsonSchema(UserSearchCriteriaModel)

/**
 * Schéma pour les token UserTokenModel
 * Ce model represente les donnees renvoyee par le server suite a la creation
 * du user
 */
export const UserTokenModel = z.object({
  token: z.string(),
})
/**
 * Type de UserCredential
 */
export type UserTokenType = z.infer<typeof UserTokenModel>
/**
 * Schéma de UserCredential
 */
export const UserTokenSchema = zodToJsonSchema(UserTokenModel)

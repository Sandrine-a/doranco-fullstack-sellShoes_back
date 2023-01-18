import { z } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'
/**
 * @module shoes.model
 *
 * @description
 *  Ce module contient tous les modèles concernant les annonces des chaussures
 */

/**
 * 1 -- Grace à z, nous pouvons définir des models, ici :NewShoesModel
 *  Ce model represente la request envoyee par le client au serveur
 *  pour creer une annonce
 *
 */
export const NewShoesModel = z.object({
  title: z.string(),
  price: z.number().min(2).max(300),
  model: z.string(),
  pictures: z.string().array(),
  description: z.string(),
  color: z.string(),
  condition: z.enum(['neuf', 'semi neuve', 'usé', 'très usé']),
  size: z.number()
})

/**
 * 2-- (facultatif en js) Type de NewShoesModel ////A enlever si fichier .js
 */
export type NewShoesType = z.infer<typeof NewShoesModel>

/**
 * 3-- Schéma de NewShoesModel
 */
export const NewShoesSchema = zodToJsonSchema(NewShoesModel)

/**
 * Grace à z, nous pouvons définir un ShoesModel: ShoesModel:
 *  Ce model represente la reponse du serveur suite a la demande
 *  de creation du client et la reussite
 *
 */
export const ShoesModel = z.object({
  _id: z.preprocess(id => `${id}`, z.string()),
  title: z.string(),
  price: z.number().min(2).max(300),
  model: z.string(),
  pictures: z.string().array(),
  description: z.string(),
  color: z.string(),
  condition: z.enum(['neuf', 'semi neuve', 'usé', 'très usé']),
  size: z.number(),
  user: z.preprocess(userId => `${userId}`, z.string()),
})

/**
 * 2-- (facultatif en js) Type de ShoesModel ////A enlever si fichier .js
 */
export type ShoesModelType = z.infer<typeof ShoesModel>

/**
 * 3-- Schéma de NewShoesModel
 */
export const ShoesSchema = zodToJsonSchema(ShoesModel)
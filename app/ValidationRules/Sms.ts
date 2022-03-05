import { schema } from '@ioc:Adonis/Core/Validator'

export const createScheduleRules = {
  schedule: schema.date(),
  recipients: schema.array().members(schema.string()),
  message: schema.string(),
}

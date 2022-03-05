import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Recipient extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public smsScheduleId: number

  @column()
  public phoneNumber: string

  @column()
  public sentAt: DateTime

  @column()
  public status: string

  @column()
  public messageId: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}

import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany, scope } from '@ioc:Adonis/Lucid/Orm'
import Recipient from './Recipient'

export default class SmsSchedule extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public message: string

  @column()
  public scheduledAt: string

  @column()
  public status: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => Recipient)
  public recipients: HasMany<typeof Recipient>

  public static statusFilter = scope((query, status: string) => {
    if (status) {
      query.where('status', status)
    }
  })

  public static scheduledAtRangeFilter = scope((query, dateRange: string) => {
    if (dateRange) {
      const dates = dateRange.split(',')
      query.whereBetween('scheduled_at', [dates[0], dates[1]])
    }
  })
}

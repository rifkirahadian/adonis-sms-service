import { DateTime } from 'luxon'
import { BaseModel, column, scope } from '@ioc:Adonis/Lucid/Orm'

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
  public deliveredAt: string

  @column()
  public status: string

  @column()
  public messageId: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  public static statusFilter = scope((query, status: string) => {
    if (status) {
      query.where('status', status)
    }
  })

  public static sentAtRangeFilter = scope((query, dateRange: string) => {
    if (dateRange) {
      const dates = dateRange.split(',')
      query.whereBetween('sent_at', [dates[0], dates[1]])
    }
  })
}

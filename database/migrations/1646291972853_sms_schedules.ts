import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class SmsSchedules extends BaseSchema {
  protected tableName = 'sms_schedules'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.timestamp('scheduled_at', { useTz: true }).notNullable()
      table.text('message').notNullable()
      table.string('status', 15)
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

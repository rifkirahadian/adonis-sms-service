import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Recipients extends BaseSchema {
  protected tableName = 'recipients'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('sms_schedule_id')
        .unsigned()
        .references('id')
        .inTable('sms_schedules')
        .onDelete('cascade')
        .notNullable()
      table.string('phone_number', 20).notNullable()
      table.string('status', 15)
      table.string('message_id', 70)
      table.timestamp('sent_at', { useTz: true })
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

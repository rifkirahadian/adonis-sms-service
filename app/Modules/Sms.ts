import Recipient from 'App/Models/Recipient'
import SmsSchedule from 'App/Models/SmsSchedule'
import Responser from 'App/Utils/Responser'
import { sendSms } from 'App/Utils/Sms'
import { DateTime } from 'luxon'

export default class SmsModules extends Responser {
  public async createSmsSchedule(schedule: string, message: string): Promise<SmsSchedule> {
    return await SmsSchedule.create({
      scheduledAt: DateTime.fromISO(schedule).toFormat('yyyy-MM-dd HH:mm:ss'),
      message,
      status: 'pending',
    })
  }

  public async createSmsRecipients(smsScheduleId: number, phoneNumbers: string[]) {
    const payload = phoneNumbers.map((item) => {
      return {
        smsScheduleId,
        phoneNumber: item,
      }
    })
    await Recipient.createMany(payload)
  }

  public async getPendingSmsSchedule() {
    const schedules = await SmsSchedule.query()
      .where('status', 'pending')
      .where('scheduled_at', '<', DateTime.local().toISO())

    return schedules
  }

  public async sendSmsSchedule(smsSchedule: SmsSchedule) {
    const { id, message } = smsSchedule
    const now = DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss')

    const recipients = await Recipient.query().where('sms_schedule_id', id)
    const phoneNumbers = recipients.map((item) => {
      return item.phoneNumber
    })

    const smsResponse = await sendSms(phoneNumbers, message)

    await SmsSchedule.query().where({ id }).update({
      status: 'sent',
    })

    if (recipients.length > 1) {
      const updateMessageQueries = smsResponse.map((item) => {
        return Recipient.query().where({ smsScheduleId: id, phoneNumber: item.dnis }).update({
          messageId: item.message_id,
          status: 'sent',
          sentAt: now,
        })
      })
      return await Promise.all(updateMessageQueries)
    }

    await Recipient.query().where({ smsScheduleId: id }).update({
      messageId: smsResponse.message_id,
      status: 'sent',
      sentAt: now,
    })
  }
}

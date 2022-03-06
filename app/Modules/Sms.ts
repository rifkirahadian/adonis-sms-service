import Recipient from 'App/Models/Recipient'
import SmsSchedule from 'App/Models/SmsSchedule'
import Responser from 'App/Utils/Responser'
import { checkSmsStatus, sendSms } from 'App/Utils/Sms'
import { DateTime } from 'luxon'
import { RequestContract } from '@ioc:Adonis/Core/Request'
import { ResponseContract } from '@ioc:Adonis/Core/Response'
import Event from '@ioc:Adonis/Core/Event'

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

    console.log({
      sendSms: id,
    })

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
        return this.updateMessageId(id, item.message_id, item.dnis)
      })
      return await Promise.all(updateMessageQueries)
    }

    await this.updateMessageId(id, smsResponse.message_id, phoneNumbers[0])
  }

  public async updateMessageId(smsScheduleId: number, messageId: string, phoneNumber: string) {
    await Recipient.query()
      .where({ smsScheduleId, phoneNumber })
      .update({
        messageId,
        status: 'sent',
        sentAt: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
      })
  }

  public async getSmsScheduleSent(): Promise<SmsSchedule[]> {
    const aMinuteAgo = DateTime.local().plus({ minute: -1 }).toFormat('yyyy-MM-dd HH:mm:ss')
    return await SmsSchedule.query()
      .where({ status: 'sent' })
      .whereHas('recipients', (query) => {
        query.where('sent_at', '<', aMinuteAgo).whereIn('status', ['sent', 'ACCEPTD'])
      })
  }

  public async checkSmsScheduleStatus(smsScheduleId: number) {
    const recipients = await Recipient.query()
      .where({ smsScheduleId })
      .whereIn('status', ['sent', 'ACCEPTD'])

    recipients.forEach((item, key) => {
      setTimeout(() => {
        Event.emit('sms:status-check', item)
      }, 500 * (key + 1))
    })

    setTimeout(async () => {
      await this.isDoneStatusChecking(smsScheduleId)
    }, 500 * (recipients.length + 5))
  }

  public async isDoneStatusChecking(smsScheduleId: number) {
    const recipients = await Recipient.query()
      .where({ smsScheduleId })
      .whereIn('status', ['sent', 'ACCEPTD'])
      .first()

    if (!recipients) {
      await SmsSchedule.query().where({ id: smsScheduleId }).update({
        status: 'done',
      })
    }
  }

  public async updateSmsStatus(recipient: Recipient) {
    const { messageId } = recipient

    const smsStatusResponse = await checkSmsStatus(messageId)
    const { status, delivery_time: deliveryAt } = smsStatusResponse

    recipient.status = status
    if (status === 'DELIVRD') {
      recipient.deliveredAt = DateTime.fromFormat(deliveryAt, 'yyMMddHHmm')
        .setZone('Asia/Almaty')
        .toFormat('yyyy-MM-dd HH:mm:ss')
    }
    await recipient.save()

    console.log({ smsStatusResponse })

    return recipient
  }

  public async getSmsSchedules(request: RequestContract) {
    const { perPage, page, status, dateRange } = request.qs()

    const schedules = await SmsSchedule.query()
      .apply((scope) => {
        scope.statusFilter(status)
        scope.scheduledAtRangeFilter(dateRange)
      })
      .orderBy('id', 'desc')
      .select('id', 'message', 'status', 'scheduled_at')
      .paginate(page || 1, perPage || 10)

    return schedules
  }

  public async getSmsSchedule(id: number, response: ResponseContract) {
    try {
      return await SmsSchedule.findOrFail(id)
    } catch (error) {
      throw this.notFoundResponse(`Sms schedule id=${id} not found`, response)
    }
  }

  public async getSmsScheduleRecipients(smsScheduleId: number, request: RequestContract) {
    const { perPage, page, status, dateRange } = request.qs()

    const recipients = await Recipient.query()
      .where({ smsScheduleId })
      .apply((scope) => {
        scope.statusFilter(status)
        scope.sentAtRangeFilter(dateRange)
      })
      .orderBy('id', 'desc')
      .select('id', 'phone_number', 'status', 'sent_at')
      .paginate(page || 1, perPage || 10)

    return recipients
  }
}

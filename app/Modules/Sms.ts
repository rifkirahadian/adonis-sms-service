import Recipient from 'App/Models/Recipient'
import SmsSchedule from 'App/Models/SmsSchedule'
import Responser from 'App/Utils/Responser'
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
}

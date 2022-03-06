import Database from '@ioc:Adonis/Lucid/Database'
import { BaseTask } from 'adonis5-scheduler/build'
import SmsModules from 'App/Modules/Sms'
const smsModules = new SmsModules()

export default class SmsStatucCheck extends BaseTask {
  public static get schedule() {
    return '30 * * * * *'
  }
  /**
   * Set enable use .lock file for block run retry task
   * Lock file save to `build/tmpTaskLock`
   */
  public static get useLock() {
    return false
  }

  public async handle() {
    try {
      await Database.beginGlobalTransaction()

      const smsSchedules = await smsModules.getSmsScheduleSent()

      if (smsSchedules.length > 0) {
        await Promise.all(
          smsSchedules.map((item) => {
            return smsModules.checkSmsScheduleStatus(item.id)
          })
        )
      }

      console.log({
        smsStatusCheck: `checked ${smsSchedules.length} row`,
      })

      await Database.commitGlobalTransaction()
    } catch (error) {
      console.log({ errorStatusCheck: error.message })
      await Database.rollbackGlobalTransaction()
    }
  }
}

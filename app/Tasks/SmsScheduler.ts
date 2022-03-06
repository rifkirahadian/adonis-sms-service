import Database from '@ioc:Adonis/Lucid/Database'
import { BaseTask } from 'adonis5-scheduler/build'
import SmsModules from 'App/Modules/Sms'
const smsModules = new SmsModules()

export default class SmsScheduler extends BaseTask {
  public static get schedule() {
    return '1 * * * * *'
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

      const pendingSms = await smsModules.getPendingSmsSchedule()
      if (pendingSms.length > 0) {
        await Promise.all(
          pendingSms.map((item) => {
            return smsModules.sendSmsSchedule(item)
          })
        )
      }

      console.log({
        smsSent: `sent ${pendingSms.length} row`,
      })

      await Database.commitGlobalTransaction()
    } catch (error) {
      console.log({ errorSmsSent: error.message })
      await Database.rollbackGlobalTransaction()
    }
  }
}

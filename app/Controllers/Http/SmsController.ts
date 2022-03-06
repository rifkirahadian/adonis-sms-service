import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import SmsModules from 'App/Modules/Sms'
import { createScheduleRules } from 'App/ValidationRules/Sms'

export default class SmsController extends SmsModules {
  public async createSchedule({ response, request }: HttpContextContract) {
    try {
      await Database.beginGlobalTransaction()
      await this.formValidate(createScheduleRules, request, response)

      const { schedule, recipients, message } = request.body()

      const smsSchedule = await this.createSmsSchedule(schedule, message)
      await this.createSmsRecipients(smsSchedule.id, recipients)

      await Database.commitGlobalTransaction()

      return this.successResponse(null, 'Sms schedule created', response)
    } catch (error) {
      await Database.rollbackGlobalTransaction()
      return this.errorResponseHandle(error, response)
    }
  }

  public async index({ request, response }: HttpContextContract) {
    try {
      const smsSchedules = await this.getSmsSchedules(request)

      return this.successResponse(smsSchedules, null, response)
    } catch (error) {
      return this.errorResponseHandle(error, response)
    }
  }

  public async recipients({ request, response, params }: HttpContextContract) {
    try {
      const { id } = params
      await this.getSmsSchedule(id, response)

      const recipients = await this.getSmsScheduleRecipients(id, request)

      return this.successResponse(recipients, null, response)
    } catch (error) {
      return this.errorResponseHandle(error, response)
    }
  }
}

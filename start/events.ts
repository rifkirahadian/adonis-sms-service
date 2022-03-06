/*
|--------------------------------------------------------------------------
| Preloaded File
|--------------------------------------------------------------------------
|
| Any code written inside this file will be executed during the application
| boot.
|
*/
import Event from '@ioc:Adonis/Core/Event'
import Recipient from 'App/Models/Recipient'
import SmsSchedule from 'App/Models/SmsSchedule'
import SmsModules from 'App/Modules/Sms'

const smsModule = new SmsModules()

Event.on('sms:send', async (smsSchedule: SmsSchedule) => {
  await smsModule.sendSmsSchedule(smsSchedule)
})

Event.on('sms:status-check', async (recipient: Recipient) => {
  await smsModule.updateSmsStatus(recipient)
})

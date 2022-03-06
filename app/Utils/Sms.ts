import axios from 'axios'
import Env from '@ioc:Adonis/Core/Env'

export const sendSms = async (phoneNumbers: string[], message: string) => {
  const response = await axios
    .post(Env.get('SMS_URL'), {
      dnis: phoneNumbers.join(','),
      message,
    })
    .then((res) => res.data)
    .catch((res) => res)

  console.log({ smsResponse: response })

  return response
}

export const checkSmsStatus = async (messageId: string) => {
  const response = await axios
    .get(`${Env.get('SMS_URL')}`)
    .then((res) => res.data)
    .catch((res) => res)

  return response
}

import { schema } from '@ioc:Adonis/Core/Validator'
import { ResponseContract } from '@ioc:Adonis/Core/Response'
import { RequestContract } from '@ioc:Adonis/Core/Request'

export default class Responser {
  public async formValidate(rules, request: RequestContract, response: ResponseContract) {
    try {
      await request.validate({
        schema: schema.create(rules),
        messages: {
          unique: '{{ field }} has been taken',
          exists: '{{ field }} not exist',
          regex: '{{ field }} format invalid',
          minLength: '{{ field }} character count not allowed',
        },
      })
    } catch (error) {
      throw this.errorResponseValidation(error, response)
    }
  }

  public successResponse(data, message, response: ResponseContract) {
    if (message !== null) {
      message = [
        {
          message,
        },
      ]
    }

    return response.json({
      status: 'success',
      message,
      data,
    })
  }

  public errorResponse(message, response: ResponseContract) {
    if (message !== null) {
      message = [
        {
          message,
        },
      ]
    }

    return response.status(400).json({
      status: 'error',
      message,
    })
  }

  public notFoundResponse(message, response: ResponseContract) {
    if (message !== null) {
      message = [
        {
          message,
        },
      ]
    }

    return response.status(404).json({
      status: 'error',
      message,
    })
  }

  public notAllowedResponse(message, response: ResponseContract) {
    if (message !== null) {
      message = [
        {
          message,
        },
      ]
    }

    return response.status(403).json({
      status: 'error',
      message,
    })
  }

  private errorResponseValidation(errors, response: ResponseContract) {
    const fields = {}
    errors.messages.errors.forEach((item) => {
      const { field, message, rule } = item
      if (!fields.hasOwnProperty(field)) {
        fields[field] = [{ message, rule }]
      } else {
        fields[field].push({ message, rule })
      }
    })

    return response.status(errors.status).json({
      status: errors.status,
      message: fields,
    })
  }

  public errorResponseHandle(error, response: ResponseContract) {
    if (typeof error !== 'undefined') {
      let status = error.status ? error.status : 500

      return response.status(status).json({
        status: 'error',
        message: [
          {
            message: error.message,
          },
        ],
        data: null,
      })
    } else {
      return error
    }
  }
}

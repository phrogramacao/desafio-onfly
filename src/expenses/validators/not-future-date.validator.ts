import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isNotFutureDate', async: false })
export class IsNotFutureDateConstraint implements ValidatorConstraintInterface {
  validate(value: string, _args: ValidationArguments) {
    const input = new Date(value);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return input <= today;
  }

  defaultMessage(_args: ValidationArguments) {
    return 'a data não pode ser futura';
  }
}

export function IsNotFutureDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNotFutureDateConstraint,
    });
  };
}

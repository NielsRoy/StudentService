import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

export interface DatabaseError {
  code?: string;
  detail?: string;
  // Se pueden añadir más propiedades comunes de errores de DB
}

export function isDatabaseError(error: unknown): error is DatabaseError {
  return typeof error === 'object' && error !== null && 'code' in error;
}

export class ErrorHandlerUtil {
  static handle(error: unknown): never {
    if (isDatabaseError(error)) {
      if (error.code === '23505') {
        // Violación de unique constraint
        throw new BadRequestException(error.detail);
      }
      // Puedes añadir más casos específicos aquí
    }

    console.error('Database error:', error);
    throw new InternalServerErrorException('Please check server logs');
  }
}
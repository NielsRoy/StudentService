import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  
  @Get()
  checkHealth() {
    // Simplemente devolvemos un string. 
    // Si NestJS responde esto, significa que el EventLoop no está bloqueado.
    return 'OK';
  }
}
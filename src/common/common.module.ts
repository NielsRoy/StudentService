import { Module } from '@nestjs/common';
import { HASH_SERVICE } from './adapters/injection-tokens';
import { BcryptjsService } from './adapters/hash/bcryptjs.service';

@Module({
  providers: [
  {
    provide: HASH_SERVICE,
    useClass: BcryptjsService,
  },
  ],
  exports: [HASH_SERVICE],
})
export class CommonModule {}

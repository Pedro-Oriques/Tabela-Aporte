import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StocksModule } from './stocks/stocks.module';

@Module({
  imports: [
    // O isGlobal permite usar o .env em qualquer arquivo sem importar de novo
    ConfigModule.forRoot({ isGlobal: true }),
    StocksModule,
  ],
})
export class AppModule {}

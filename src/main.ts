import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.enableCors({ origin: process.env.CORS_ORIGIN || '*' });

    const config = new DocumentBuilder()
      .setTitle('历史星图 API')
      .setDescription('History Atlas 后端接口文档')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Server running on http://localhost:${port}/api`);
    // keep process alive
    setInterval(() => {}, 10000);
    process.stdin.resume();
    process.on('SIGTERM', () => console.log('SIGTERM received'));
    process.on('SIGINT', () => console.log('SIGINT received'));
    process.on('exit', (code) => console.log('Process exiting with code:', code));
  } catch (e) {
    console.error('Bootstrap error:', e);
    process.exit(1);
  }
}
bootstrap();

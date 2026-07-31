import { Module } from '@nitrostack/core';
import { EmailService } from './email.service.js';

@Module({
  name: 'email',
  description: 'Email automation — SMTP wrapper for notifications and templates',
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}

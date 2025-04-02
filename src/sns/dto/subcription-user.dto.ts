import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { protocolSNS } from 'src/common/enums/sns-protocol.enum';

export class SubscriptionUserSnsDto {
  @ApiProperty({
    enum: protocolSNS,
    description: 'El protocolo de suscripción (email, sms, http o https)',
    example: protocolSNS.EMAIL,
  })
  @IsString()
  @IsEnum(protocolSNS, {
    message: 'El protocolo debe ser EMAIL, SMS, HTTP o HTTPS',
  })
  protocol: protocolSNS;

  @ApiProperty({
    description: 'El endpoint al que se enviarán las notificaciones',
    example: '',
  })
  @IsString()
  endpoint: string;
}

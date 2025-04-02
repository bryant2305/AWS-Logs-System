import { Controller, Post, Body } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { SnsService } from 'src/sns/sns.service';
import { SubscriptionUserSnsDto } from './dto/subcription-user.dto';

@Controller('subscriptions')
@ApiTags('subscriptions')
export class SubscriptionsController {
  constructor(private readonly snsService: SnsService) {}

  @Post('subscribe')
  @ApiBody({ type: SubscriptionUserSnsDto })
  async subscribeUser(@Body() body: SubscriptionUserSnsDto) {
    const { protocol, endpoint } = body;
    return await this.snsService.subscribeToUserNotifications(
      protocol,
      endpoint,
    );
  }
}

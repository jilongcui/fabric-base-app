import { Test, TestingModule } from '@nestjs/testing';
import { InviteUserController } from './invite-user.controller';

describe('InviteUserController', () => {
  let controller: InviteUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InviteUserController],
    }).compile();

    controller = module.get<InviteUserController>(InviteUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FabcarService } from './fabcar.service';
import { CreateFabcarDto } from './dto/create-fabcar.dto';
import { UpdateFabcarDto } from './dto/update-fabcar.dto';

@Controller('fabcar')
export class FabcarController {
  constructor(private readonly fabcarService: FabcarService) {}

  @Post()
  create(@Body() createFabcarDto: CreateFabcarDto) {
    return this.fabcarService.create(createFabcarDto);
  }

  @Get()
  findAll() {
    return this.fabcarService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fabcarService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFabcarDto: UpdateFabcarDto) {
    return this.fabcarService.update(+id, updateFabcarDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fabcarService.remove(+id);
  }
}

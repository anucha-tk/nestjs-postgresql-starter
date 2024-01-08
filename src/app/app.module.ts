import { Module } from "@nestjs/common";
import { CommonModule } from "src/common/common.module";
import { RouterModule } from "src/router/router.module";

@Module({
  imports: [CommonModule, RouterModule.forRoot()],
  controllers: [],
  providers: [],
})
export class AppModule {}

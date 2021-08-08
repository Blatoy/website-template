import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { APIModule } from "./api/api.module.js";

@Module({
    imports: [
        TypeOrmModule.forRoot(),
        APIModule
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }

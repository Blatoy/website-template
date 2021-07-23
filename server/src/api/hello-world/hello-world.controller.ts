import { Controller, Get } from "@nestjs/common";
import { HelloWorldService } from "./hello-world.service.js";

@Controller("hello-world")
export class HelloWorldController {
    constructor(private readonly helloWorldService: HelloWorldService) { }
    @Get()
    getIndex(): string {
        return this.helloWorldService.getHelloWorld();
    }
}

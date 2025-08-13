import { Module } from "@nestjs/common";
import { AddressRepository } from "./address.repository";
import { AddressService } from "./address.service";

@Module({
    providers: [AddressRepository, AddressService],
    exports: [AddressService]
})
export class AddressModule {}
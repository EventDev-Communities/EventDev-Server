import { Injectable } from "@nestjs/common";
import { AddressDto } from "./dto/address.dto";
import { AddressRepository } from "./address.repository";
import { IAddress } from "./interfaces/createAddress.interface";

@Injectable()
export class AddressService {
    constructor(private readonly addressRepository: AddressRepository) {}

    async create(address: AddressDto){
        return await this.addressRepository.create(address);
    }
}
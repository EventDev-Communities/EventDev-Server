import { Test, TestingModule } from "@nestjs/testing";
import { CommunityService } from "./community.service"
import { CommunityRepository } from "./community.repository";
import { NotFoundException } from "@nestjs/common";

describe('Community Tests', () => {
    let communityService: CommunityService;

    const mockCommunityRepository = {
        getAll: jest.fn(),
        create: jest.fn(),
        getByID: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        isExistCommunity: jest.fn()
    }

    beforeAll(async () => {
        const moduleInit : TestingModule = await Test.createTestingModule({
            providers: [CommunityService,
                {
                    provide: CommunityRepository,
                    useValue: mockCommunityRepository 
                }
            ]
        }).compile()

        communityService = moduleInit.get<CommunityService>(CommunityService);
    })

    it('Should be defined', () => {
        expect(communityService).toBeDefined();
    })

    it('Should delete a community sucessfully', async () => {

        mockCommunityRepository.getByID.mockResolvedValue({id: 1, name: 'Levy'});
        mockCommunityRepository.delete.mockResolvedValue(undefined);

        const result = await communityService.delete(1);

        expect(result).toBeUndefined();
        expect(mockCommunityRepository.getByID).toHaveBeenCalledWith(1);
        expect(mockCommunityRepository.delete).toHaveBeenCalledWith(1);

    })

    it('Should throw NotFoundException if community does not exist', async () => {
        mockCommunityRepository.getByID.mockResolvedValue(undefined);

        await expect(communityService.delete(1))
        .rejects
        .toThrow(NotFoundException);
    })

    it('Should update a community sucessfully', async () => {
        const updatedCommunity = {id: 2, name: 'New Name'};

        mockCommunityRepository.getByID.mockResolvedValue({id: 2, name: 'House JS'});
        mockCommunityRepository.update.mockResolvedValue(updatedCommunity);

        const result = await communityService.update(2, {name: 'New Name'});        

        expect(result).toEqual(updatedCommunity);
    });

    it('Should throw NotFoundException when trying to update a non-existing community', async () => {
        mockCommunityRepository.getByID.mockResolvedValue(undefined);

        await expect(
            communityService.update(1, {name: 'Levy'})
        ).rejects.toThrow(NotFoundException);
    })

    it('Should return a community', async () => {
        const resultGetById = {id: 10, name: "House JS"}
        mockCommunityRepository.getByID.mockResolvedValue(resultGetById);

        const result = await communityService.getByID(10);
        expect(result).toEqual(resultGetById)

    })

    it('Should throw NotFoundException when trying find a non-existing community', async () => {
        mockCommunityRepository.getByID(undefined)

        expect(communityService.getByID(10))
        .rejects
        .toThrow(NotFoundException)
    })
})
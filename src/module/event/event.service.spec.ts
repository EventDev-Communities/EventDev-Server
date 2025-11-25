import { LoggerService } from '@common/logger/logger.service'
import { AddressService } from '@module/address/address.service'
import { CommunityService } from '@module/community/community.service'
import { ModalityEvent } from '@module/event/dto/event.dto'
import { EventRepository } from '@module/event/event.repository'
import { EventService } from '@module/event/event.service'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

describe('EventService', () => {
  let service: EventService
  let _eventRepository: EventRepository
  let _communityService: CommunityService
  let _addressService: AddressService
  let moduleRef: TestingModule

  const mockEventRepository = {
    create: jest.fn(),
    getByID: jest.fn(),
    getAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }

  const mockCommunityService = {
    isExistCommunity: jest.fn()
  }

  const mockAddressService = {
    create: jest.fn(),
    update: jest.fn()
  }

  const mockLogger = {
    setContext: jest.fn(),
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: EventRepository, useValue: mockEventRepository },
        { provide: CommunityService, useValue: mockCommunityService },
        { provide: AddressService, useValue: mockAddressService },
        { provide: LoggerService, useValue: mockLogger }
      ]
    }).compile()

    service = moduleRef.get<EventService>(EventService)
    _eventRepository = moduleRef.get<EventRepository>(EventRepository)
    _communityService = moduleRef.get<CommunityService>(CommunityService)
    _addressService = moduleRef.get<AddressService>(AddressService)

    jest.clearAllMocks()
  })

  afterEach(async () => {
    await moduleRef.close()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create an online event successfully', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      const futureEndDate = new Date(futureDate)
      futureEndDate.setHours(futureDate.getHours() + 2)

      const createEventDto = {
        title: 'Test Event',
        description: 'Test Description',
        startDateTime: futureDate.toISOString(),
        endDateTime: futureEndDate.toISOString(),
        modality: ModalityEvent.ONLINE,
        link: 'https://meet.google.com/test',
        coverUrl: 'https://example.com/cover.jpg',
        isActive: true
      }

      const mockEvent = {
        id: 1,
        title: 'Test Event',
        communityId: 1
      }

      mockCommunityService.isExistCommunity.mockResolvedValue(true)
      mockEventRepository.create.mockResolvedValue(mockEvent)

      const result = await service.create(1, createEventDto)

      expect(result).toEqual(mockEvent)
      expect(mockCommunityService.isExistCommunity).toHaveBeenCalledWith(1)
      expect(mockEventRepository.create).toHaveBeenCalled()
      expect(mockAddressService.create).not.toHaveBeenCalled()
    })

    it('should create a presential event with address', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      const futureEndDate = new Date(futureDate)
      futureEndDate.setHours(futureDate.getHours() + 2)

      const createEventDto = {
        title: 'Test Event',
        description: 'Test Description',
        startDateTime: futureDate.toISOString(),
        endDateTime: futureEndDate.toISOString(),
        modality: ModalityEvent.PRESENTIAL,
        address: {
          cep: '12345678',
          streetAddress: 'Main St',
          number: '123',
          neighborhood: 'Downtown',
          city: 'TestCity',
          state: 'TS'
        }
      }

      const mockAddress = { id: 1 }
      const mockEvent = { id: 1, title: 'Test Event' }

      mockCommunityService.isExistCommunity.mockResolvedValue(true)
      mockAddressService.create.mockResolvedValue(mockAddress)
      mockEventRepository.create.mockResolvedValue(mockEvent)

      const result = await service.create(1, createEventDto)

      expect(result).toEqual(mockEvent)
      expect(mockAddressService.create).toHaveBeenCalledWith(createEventDto.address)
      expect(mockEventRepository.create).toHaveBeenCalled()
    })

    it('should throw BadRequestException if start date is after end date', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      const pastDate = new Date(futureDate)
      pastDate.setHours(futureDate.getHours() - 2)

      const createEventDto = {
        title: 'Test Event',
        description: 'Test Description',
        startDateTime: futureDate.toISOString(),
        endDateTime: pastDate.toISOString(),
        modality: ModalityEvent.ONLINE
      }

      mockCommunityService.isExistCommunity.mockResolvedValue(true)

      await expect(service.create(1, createEventDto)).rejects.toThrow(BadRequestException)
      await expect(service.create(1, createEventDto)).rejects.toThrow('Data de início deve ser anterior à data de fim')
    })

    it('should throw BadRequestException if start date is in the past', async () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)

      const createEventDto = {
        title: 'Test Event',
        description: 'Test Description',
        startDateTime: pastDate.toISOString(),
        endDateTime: futureDate.toISOString(),
        modality: ModalityEvent.ONLINE
      }

      mockCommunityService.isExistCommunity.mockResolvedValue(true)

      await expect(service.create(1, createEventDto)).rejects.toThrow(BadRequestException)
      await expect(service.create(1, createEventDto)).rejects.toThrow('Data de início não pode ser no passado')
    })

    it('should throw BadRequestException if presential event has no address', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      const futureEndDate = new Date(futureDate)
      futureEndDate.setHours(futureDate.getHours() + 2)

      const createEventDto = {
        title: 'Test Event',
        description: 'Test Description',
        startDateTime: futureDate.toISOString(),
        endDateTime: futureEndDate.toISOString(),
        modality: ModalityEvent.PRESENTIAL
      }

      mockCommunityService.isExistCommunity.mockResolvedValue(true)

      await expect(service.create(1, createEventDto)).rejects.toThrow(BadRequestException)
      await expect(service.create(1, createEventDto)).rejects.toThrow('Eventos presenciais e híbridos devem ter endereço')
    })
  })

  describe('getById', () => {
    it('should return an event by id', async () => {
      const mockEvent = {
        id: 1,
        title: 'Test Event',
        description: 'Test Description'
      }

      mockEventRepository.getByID.mockResolvedValue(mockEvent)

      const result = await service.getById(1)

      expect(result).toEqual(mockEvent)
      expect(mockEventRepository.getByID).toHaveBeenCalledWith(1)
      expect(mockEventRepository.getByID).toHaveBeenCalledTimes(2) // Once for verification, once for return
    })

    it('should throw NotFoundException if event does not exist', async () => {
      mockEventRepository.getByID.mockResolvedValue(null)

      await expect(service.getById(999)).rejects.toThrow(NotFoundException)
      await expect(service.getById(999)).rejects.toThrow('Evento não encontrado!')
    })
  })

  describe('getAll', () => {
    it('should return paginated events', async () => {
      const mockEvents = [
        { id: 1, title: 'Event 1' },
        { id: 2, title: 'Event 2' }
      ]

      mockEventRepository.getAll.mockResolvedValue({
        data: mockEvents,
        total: 2
      })

      const result = await service.getAll(10, 0, { baseUrl: '/events' })

      expect(result).toMatchSnapshot()
      expect(mockEventRepository.getAll).toHaveBeenCalledWith(10, 0, {
        communityId: undefined,
        modality: undefined,
        isActive: undefined
      })
    })

    it('should return paginated events with filters', async () => {
      const mockEvents = [{ id: 1, title: 'Event 1' }]

      mockEventRepository.getAll.mockResolvedValue({
        data: mockEvents,
        total: 1
      })

      const result = await service.getAll(10, 0, {
        communityId: 1,
        modality: 'ONLINE',
        isActive: true,
        baseUrl: '/events'
      })

      expect(result).toMatchSnapshot()
      expect(mockEventRepository.getAll).toHaveBeenCalledWith(10, 0, {
        communityId: 1,
        modality: 'ONLINE',
        isActive: true
      })
    })
  })

  describe('delete', () => {
    it('should delete an event', async () => {
      const mockEvent = { id: 1, title: 'Test Event' }

      mockEventRepository.getByID.mockResolvedValue(mockEvent)
      mockEventRepository.delete.mockResolvedValue(undefined)

      await service.delete(1)

      expect(mockEventRepository.delete).toHaveBeenCalledWith(1)
    })

    it('should throw NotFoundException if event to delete does not exist', async () => {
      mockEventRepository.getByID.mockResolvedValue(null)

      await expect(service.delete(999)).rejects.toThrow(NotFoundException)
    })
  })
})

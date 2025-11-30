import { UserRole } from '@common/enums/roles.enum'
import { IAuthUser } from '@common/interfaces/auth-user.interface'
import { LoggerService } from '@common/logger/logger.service'
import { ModalityEvent } from '@module/event/dto/event.dto'
import { EventController } from '@module/event/event.controller'
import { EventService } from '@module/event/event.service'
import { Test, TestingModule } from '@nestjs/testing'

describe('EventController', () => {
  let controller: EventController
  let _eventService: EventService
  let moduleRef: TestingModule

  const mockEventService = {
    create: jest.fn(),
    getById: jest.fn(),
    getAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
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
      controllers: [EventController],
      providers: [
        {
          provide: EventService,
          useValue: mockEventService
        },
        {
          provide: LoggerService,
          useValue: mockLogger
        }
      ]
    }).compile()

    controller = moduleRef.get<EventController>(EventController)
    _eventService = moduleRef.get<EventService>(EventService)

    jest.clearAllMocks()
  })

  afterEach(async () => {
    await moduleRef.close()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('create', () => {
    it('should create an event successfully', async () => {
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
        link: 'https://meet.google.com/test'
      }

      const user: IAuthUser = {
        id: 'user-1',
        email: 'community@test.com',
        roles: [UserRole.COMMUNITY],
        communityId: 1,
        permissions: []
      }

      const mockEvent = {
        id: 1,
        ...createEventDto,
        communityId: 1
      }

      mockEventService.create.mockResolvedValue(mockEvent)

      const result = await controller.create(createEventDto, user)

      expect(result).toEqual(mockEvent)
      expect(mockEventService.create).toHaveBeenCalledWith(1, createEventDto)
    })

    it('should throw error if user has no communityId', async () => {
      const createEventDto = {
        title: 'Test Event',
        description: 'Test Description',
        startDateTime: new Date().toISOString(),
        endDateTime: new Date().toISOString(),
        modality: ModalityEvent.ONLINE
      }

      const user: IAuthUser = {
        id: 'user-1',
        email: 'user@test.com',
        roles: [UserRole.USER],
        permissions: []
      }

      await expect(controller.create(createEventDto, user)).rejects.toThrow('Community ID is required')
    })

    it('should handle non-Error objects in catch block', async () => {
      const createEventDto = {
        title: 'Test Event',
        description: 'Test Description',
        startDateTime: new Date().toISOString(),
        endDateTime: new Date().toISOString(),
        modality: ModalityEvent.ONLINE
      }
      const user: IAuthUser = {
        id: 'user-1',
        email: 'community@test.com',
        roles: [UserRole.COMMUNITY],
        communityId: 1,
        permissions: []
      }

      mockEventService.create.mockRejectedValue('String Error')

      await expect(controller.create(createEventDto, user)).rejects.toEqual('String Error')
      expect(mockLogger.error).toHaveBeenCalledWith('Error creating event', 'Unknown error')
    })

    it('should handle errors gracefully', async () => {
      const createEventDto = {
        title: 'Test Event',
        description: 'Test Description',
        startDateTime: new Date().toISOString(),
        endDateTime: new Date().toISOString(),
        modality: ModalityEvent.ONLINE
      }

      const user: IAuthUser = {
        id: 'user-1',
        email: 'community@test.com',
        roles: [UserRole.COMMUNITY],
        communityId: 1,
        permissions: []
      }

      mockEventService.create.mockRejectedValue(new Error('Database error'))

      await expect(controller.create(createEventDto, user)).rejects.toThrow('Database error')
    })
  })

  describe('getByID', () => {
    it('should return an event by id', async () => {
      const mockEvent = {
        id: 1,
        title: 'Test Event',
        description: 'Test Description',
        modality: ModalityEvent.ONLINE
      }

      mockEventService.getById.mockResolvedValue(mockEvent)

      const result = await controller.getByID(1)

      expect(result).toEqual(mockEvent)
      expect(mockEventService.getById).toHaveBeenCalledWith(1)
    })
  })

  describe('getAll', () => {
    it('should return paginated events', async () => {
      const mockResponse = {
        data: [
          { id: 1, title: 'Event 1' },
          { id: 2, title: 'Event 2' }
        ],
        meta: {
          take: 25,
          skip: 0,
          total: 2,
          totalPages: 1,
          currentPage: 1,
          hasNext: false,
          hasPrev: false
        },
        links: {
          first: '/events?take=25&skip=0',
          last: '/events?take=25&skip=0',
          self: '/events?take=25&skip=0'
        }
      }

      mockEventService.getAll.mockResolvedValue(mockResponse)

      const mockRequest = {
        protocol: 'http',
        get: jest.fn().mockReturnValue('localhost:3000'),
        baseUrl: '/events'
      }

      const result = await controller.getAll(25, 0, undefined, undefined, undefined, mockRequest as any)

      expect(result).toEqual(mockResponse)
      expect(mockEventService.getAll).toHaveBeenCalledWith(25, 0, {
        isActive: undefined,
        search: undefined,
        baseUrl: 'http://localhost:3000/events'
      })
    })

    it('should return filtered events', async () => {
      const mockResponse = {
        data: [{ id: 1, title: 'Online Event', modality: 'ONLINE' }],
        meta: {
          take: 25,
          skip: 0,
          total: 1,
          totalPages: 1,
          currentPage: 1,
          hasNext: false,
          hasPrev: false
        },
        links: {
          first: '/events?take=25&skip=0&modality=ONLINE',
          last: '/events?take=25&skip=0&modality=ONLINE',
          self: '/events?take=25&skip=0&modality=ONLINE'
        }
      }

      mockEventService.getAll.mockResolvedValue(mockResponse)

      const mockRequest = {
        protocol: 'http',
        get: jest.fn().mockReturnValue('localhost:3000'),
        baseUrl: '/events'
      }

      const result = await controller.getAll(25, 0, 1, 'ONLINE', true, mockRequest as any)

      expect(result).toEqual(mockResponse)
      expect(mockEventService.getAll).toHaveBeenCalledWith(25, 0, {
        communityId: 1,
        modality: 'ONLINE',
        isActive: true,
        baseUrl: 'http://localhost:3000/events'
      })
    })

    it('should handle missing request object gracefully', async () => {
      const mockResponse = {
        data: [],
        meta: { take: 25, skip: 0, total: 0, totalPages: 0, currentPage: 1, hasNext: false, hasPrev: false },
        links: { first: '/events?take=25&skip=0', last: '/events?take=25&skip=0', self: '/events?take=25&skip=0' }
      }

      mockEventService.getAll.mockResolvedValue(mockResponse)

      const result = await controller.getAll(25, 0)

      expect(result).toEqual(mockResponse)
    })
  })

  describe('delete', () => {
    it('should delete an event', async () => {
      mockEventService.delete.mockResolvedValue(undefined)

      await controller.delete(1)

      expect(mockEventService.delete).toHaveBeenCalledWith(1)
    })
  })

  describe('Additional Coverage', () => {
    it('should throw error if communityId is missing in create', async () => {
      const user = { id: 'user-1', roles: [UserRole.COMMUNITY] } as IAuthUser
      const dto = { title: 'Event' } as any

      await expect(controller.create(dto, user)).rejects.toThrow('Community ID is required')
    })

    it('should handle errors during creation', async () => {
      const user = { id: 'user-1', communityId: 1, roles: [UserRole.COMMUNITY] } as IAuthUser
      const dto = { title: 'Event' } as any
      mockEventService.create.mockRejectedValue(new Error('Creation failed'))

      await expect(controller.create(dto, user)).rejects.toThrow('Creation failed')
      expect(mockLogger.error).toHaveBeenCalled()
    })

    it('should handle request object for baseUrl in getAll', async () => {
      const req = { protocol: 'http', get: () => 'localhost', baseUrl: '/api/events' } as any
      mockEventService.getAll.mockResolvedValue({ data: [], meta: {} })

      await controller.getAll(10, 0, undefined, undefined, undefined, req)

      expect(mockEventService.getAll).toHaveBeenCalledWith(10, 0, expect.objectContaining({ baseUrl: 'http://localhost/api/events' }))
    })

    it('should handle missing request object in getAll', async () => {
      mockEventService.getAll.mockResolvedValue({ data: [], meta: {} })

      await controller.getAll(10, 0)

      expect(mockEventService.getAll).toHaveBeenCalledWith(10, 0, expect.objectContaining({ baseUrl: '/events' }))
    })
  })

  describe('update', () => {
    it('should update an event successfully', async () => {
      const updateEventDto = { event: { title: 'Updated Event' } }
      const mockEvent = { id: 1, title: 'Updated Event' }
      mockEventService.update.mockResolvedValue(mockEvent)

      const result = await controller.update(1, 10, updateEventDto)

      expect(result).toEqual(mockEvent)
      expect(mockEventService.update).toHaveBeenCalledWith(1, updateEventDto, 10)
    })

    it('should update an event without address ID', async () => {
      const updateEventDto = { event: { title: 'Updated Event' } }
      const mockEvent = { id: 1, title: 'Updated Event' }
      mockEventService.update.mockResolvedValue(mockEvent)

      const result = await controller.update(1, null as any, updateEventDto)

      expect(result).toEqual(mockEvent)
      expect(mockEventService.update).toHaveBeenCalledWith(1, updateEventDto, null)
    })
  })
})

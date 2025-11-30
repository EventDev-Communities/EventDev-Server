import { PrismaService } from '@db/prisma.service'
import { EventDto, ModalityEvent } from '@module/event/dto/event.dto'
import { EventRepository } from '@module/event/event.repository'
import { Test, TestingModule } from '@nestjs/testing'

describe('EventRepository', () => {
  let repository: EventRepository

  const mockPrismaService = {
    event: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn()
    },
    eventModality: {
      findUnique: jest.fn()
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventRepository,
        { provide: PrismaService, useValue: mockPrismaService }
      ]
    }).compile()

    repository = module.get<EventRepository>(EventRepository)
  })

  it('should be defined', () => {
    expect(repository).toBeDefined()
  })

  describe('create', () => {
    it('should create an event', async () => {
      const data: EventDto = {
        title: 'Event',
        description: 'Desc',
        startDateTime: new Date(),
        endDateTime: new Date(),
        modality: ModalityEvent.ONLINE,
        isActive: true,
        link: 'http://link.com',
        coverUrl: 'http://cover.com',
        addressId: 1
      }
      const modality = { id: 1, code: 'ONLINE' }
      mockPrismaService.eventModality.findUnique.mockResolvedValue(modality)
      const result = { id: 1, ...data }
      mockPrismaService.event.create.mockResolvedValue(result)

      expect(await repository.create(data, 1)).toEqual(result)
      expect(mockPrismaService.eventModality.findUnique).toHaveBeenCalledWith({
        where: { code: 'ONLINE' }
      })
      expect(mockPrismaService.event.create).toHaveBeenCalledWith({
        data: {
          title: data.title,
          description: data.description,
          startDateTime: data.startDateTime,
          endDateTime: data.endDateTime,
          modalityId: 1,
          isActive: data.isActive,
          link: data.link,
          coverUrl: data.coverUrl,
          communityId: 1,
          addressId: data.addressId
        }
      })
    })

    it('should throw error if modality not found', async () => {
      mockPrismaService.eventModality.findUnique.mockResolvedValue(null)
      const data: EventDto = {
        title: 'Event',
        description: 'Desc',
        startDateTime: new Date(),
        endDateTime: new Date(),
        modality: 'INVALID' as ModalityEvent,
        isActive: true,
        link: 'link',
        coverUrl: 'cover'
      }
      await expect(repository.create(data, 1)).rejects.toThrow(
        'Event modality INVALID not found'
      )
    })
  })

  describe('getByID', () => {
    it('should return event by id', async () => {
      const result = { id: 1 }
      mockPrismaService.event.findUnique.mockResolvedValue(result)
      expect(await repository.getByID(1)).toEqual(result)
      expect(mockPrismaService.event.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      })
    })
  })

  describe('getAll', () => {
    it('should return paginated events', async () => {
      const result = [{ id: 1 }]
      mockPrismaService.event.findMany.mockResolvedValue(result)
      mockPrismaService.event.count.mockResolvedValue(1)

      expect(await repository.getAll(10, 0)).toEqual({ data: result, total: 1 })
    })

    it('should filter by modality', async () => {
      const modality = { id: 1, code: 'ONLINE' }
      mockPrismaService.eventModality.findUnique.mockResolvedValue(modality)
      mockPrismaService.event.findMany.mockResolvedValue([])
      mockPrismaService.event.count.mockResolvedValue(0)

      await repository.getAll(10, 0, { modality: 'ONLINE' })
      expect(mockPrismaService.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ modalityId: 1 })
        })
      )
    })
  })

  describe('update', () => {
    it('should update an event', async () => {
      const data: EventDto = {
        title: 'Updated Event',
        description: 'Desc',
        startDateTime: new Date(),
        endDateTime: new Date(),
        modality: ModalityEvent.ONLINE,
        isActive: true,
        link: 'link',
        coverUrl: 'cover'
      }
      const result = { count: 1 }
      mockPrismaService.event.updateMany.mockResolvedValue(result)

      expect(await repository.update(1, data)).toEqual(result)
      expect(mockPrismaService.event.updateMany).toHaveBeenCalledWith({
        where: { id: 1 },
        data
      })
    })
  })

  describe('delete', () => {
    it('should delete an event', async () => {
      const result = { id: 1 }
      mockPrismaService.event.delete.mockResolvedValue(result)

      await repository.delete(1)
      expect(mockPrismaService.event.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      })
    })
  })

  describe('Additional Coverage', () => {
    it('should throw error if modality not found in create', async () => {
      const data: EventDto = {
        title: 'Event',
        modality: ModalityEvent.ONLINE
      } as any
      mockPrismaService.eventModality.findUnique.mockResolvedValue(null)

      await expect(repository.create(data, 1)).rejects.toThrow('Event modality ONLINE not found')
    })

    it('should filter by communityId in getAll', async () => {
      mockPrismaService.event.findMany.mockResolvedValue([])
      mockPrismaService.event.count.mockResolvedValue(0)

      await repository.getAll(10, 0, { communityId: 1 })

      expect(mockPrismaService.event.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ communityId: 1 })
      }))
    })

    it('should filter by modality in getAll', async () => {
      mockPrismaService.eventModality.findUnique.mockResolvedValue({ id: 1 })
      mockPrismaService.event.findMany.mockResolvedValue([])
      mockPrismaService.event.count.mockResolvedValue(0)

      await repository.getAll(10, 0, { modality: 'ONLINE' })

      expect(mockPrismaService.event.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ modalityId: 1 })
      }))
    })

    it('should handle modality not found in getAll', async () => {
      mockPrismaService.eventModality.findUnique.mockResolvedValue(null)
      mockPrismaService.event.findMany.mockResolvedValue([])
      mockPrismaService.event.count.mockResolvedValue(0)

      await repository.getAll(10, 0, { modality: 'ONLINE' })

      expect(mockPrismaService.event.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.not.objectContaining({ modalityId: expect.anything() })
      }))
    })

    it('should filter by isActive in getAll', async () => {
      mockPrismaService.event.findMany.mockResolvedValue([])
      mockPrismaService.event.count.mockResolvedValue(0)

      await repository.getAll(10, 0, { isActive: false })

      expect(mockPrismaService.event.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ isActive: false })
      }))
    })
  })
})

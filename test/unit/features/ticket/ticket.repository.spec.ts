import { LoggerService } from '@common/logger/logger.service'
import { PrismaService } from '@db/prisma.service'
import { TicketRepository } from '@module/ticket/ticket.repository'
import { Test, TestingModule } from '@nestjs/testing'

describe('TicketRepository', () => {
  let repository: TicketRepository
  // let prismaService: PrismaService

  const mockPrismaService = {
    ticketType: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    ticket: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn()
    },
    ticketStatus: {
      findUnique: jest.fn()
    }
  }

  const mockLogger = {
    log: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketRepository,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: LoggerService, useValue: mockLogger }
      ]
    }).compile()

    repository = module.get<TicketRepository>(TicketRepository)
    // prismaService = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(repository).toBeDefined()
  })

  describe('createTicketType', () => {
    it('should create a ticket type', async () => {
      const data = {
        eventId: 1,
        name: 'VIP',
        description: 'VIP Ticket',
        price: 100,
        quantity: 50
      }
      const result = { id: 1, ...data }
      mockPrismaService.ticketType.create.mockResolvedValue(result)

      expect(await repository.createTicketType(data)).toEqual(result)
      expect(mockPrismaService.ticketType.create).toHaveBeenCalledWith({
        data: { ...data, isActive: true }
      })
    })
  })

  describe('getTicketTypeById', () => {
    it('should return ticket type by id', async () => {
      const result = { id: 1, name: 'VIP' }
      mockPrismaService.ticketType.findUnique.mockResolvedValue(result)

      expect(await repository.getTicketTypeById(1)).toEqual(result)
      expect(mockPrismaService.ticketType.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { event: true }
      })
    })
  })

  describe('getTicketTypesByEvent', () => {
    it('should return ticket types by event', async () => {
      const result = [{ id: 1, name: 'VIP' }]
      mockPrismaService.ticketType.findMany.mockResolvedValue(result)

      expect(await repository.getTicketTypesByEvent(1)).toEqual(result)
      expect(mockPrismaService.ticketType.findMany).toHaveBeenCalledWith({
        where: { eventId: 1 },
        orderBy: { price: 'asc' }
      })
    })
  })

  describe('updateTicketType', () => {
    it('should update ticket type', async () => {
      const data = { name: 'Updated' }
      const result = { id: 1, ...data }
      mockPrismaService.ticketType.update.mockResolvedValue(result)

      expect(await repository.updateTicketType(1, data)).toEqual(result)
      expect(mockPrismaService.ticketType.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data
      })
    })
  })

  describe('deleteTicketType', () => {
    it('should delete ticket type', async () => {
      const result = { id: 1 }
      mockPrismaService.ticketType.delete.mockResolvedValue(result)

      expect(await repository.deleteTicketType(1)).toEqual(result)
      expect(mockPrismaService.ticketType.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      })
    })
  })

  describe('createTicket', () => {
    it('should create a ticket', async () => {
      const data = {
        eventId: 1,
        userId: 1,
        ticketTypeId: 1,
        ticketStatusId: 1,
        value: 100,
        purchasedAt: new Date()
      }
      const result = { id: 1, ...data }
      mockPrismaService.ticket.create.mockResolvedValue(result)

      expect(await repository.createTicket(data)).toEqual(result)
      expect(mockPrismaService.ticket.create).toHaveBeenCalledWith({ data })
    })
  })

  describe('decrementTicketTypeQuantity', () => {
    it('should decrement ticket type quantity', async () => {
      const result = { id: 1, quantity: 49 }
      mockPrismaService.ticketType.update.mockResolvedValue(result)

      expect(await repository.decrementTicketTypeQuantity(1, 1)).toEqual(result)
      expect(mockPrismaService.ticketType.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { quantity: { decrement: 1 } }
      })
    })
  })

  describe('getTicketStatusByCode', () => {
    it('should return ticket status by code', async () => {
      const result = { id: 1, code: 'VALID' }
      mockPrismaService.ticketStatus.findUnique.mockResolvedValue(result)

      expect(await repository.getTicketStatusByCode('VALID')).toEqual(result)
      expect(mockPrismaService.ticketStatus.findUnique).toHaveBeenCalledWith({
        where: { code: 'VALID' }
      })
    })
  })

  describe('getAllTickets', () => {
    it('should return paginated tickets', async () => {
      const result = [{ id: 1 }]
      mockPrismaService.ticket.findMany.mockResolvedValue(result)
      mockPrismaService.ticket.count.mockResolvedValue(1)

      expect(await repository.getAllTickets(10, 0)).toEqual({
        data: result,
        total: 1
      })
      expect(mockPrismaService.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10, skip: 0 })
      )
    })
  })

  describe('getTicketById', () => {
    it('should return ticket by id', async () => {
      const result = { id: 1 }
      mockPrismaService.ticket.findUnique.mockResolvedValue(result)

      expect(await repository.getTicketById(1)).toEqual(result)
      expect(mockPrismaService.ticket.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } })
      )
    })
  })

  describe('updateTicketStatus', () => {
    it('should update ticket status', async () => {
      const result = { id: 1, ticketStatusId: 2 }
      mockPrismaService.ticket.update.mockResolvedValue(result)

      expect(await repository.updateTicketStatus(1, 2)).toEqual(result)
      expect(mockPrismaService.ticket.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { ticketStatusId: 2 }
      })
    })
  })

  describe('Additional Coverage', () => {
    it('should use default isActive in createTicketType', async () => {
      const data = { eventId: 1, name: 'Ticket', price: 100, quantity: 10 } as any
      await repository.createTicketType(data)
      expect(mockPrismaService.ticketType.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ isActive: true })
      }))
    })

    it('should use transaction client in createTicket', async () => {
      const tx = { ticket: { create: jest.fn() } } as any
      const data = { eventId: 1, userId: 1, ticketTypeId: 1, ticketStatusId: 1, value: 100, purchasedAt: new Date() }
      await repository.createTicket(data, tx)
      expect(tx.ticket.create).toHaveBeenCalled()
    })

    it('should use transaction client in decrementTicketTypeQuantity', async () => {
      const tx = { ticketType: { update: jest.fn() } } as any
      await repository.decrementTicketTypeQuantity(1, 1, tx)
      expect(tx.ticketType.update).toHaveBeenCalled()
    })

    it('should filter by eventId in getAllTickets', async () => {
      mockPrismaService.ticket.findMany.mockResolvedValue([])
      mockPrismaService.ticket.count.mockResolvedValue(0)
      await repository.getAllTickets(10, 0, { eventId: 1 })
      expect(mockPrismaService.ticket.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ eventId: 1 })
      }))
    })

    it('should filter by userId in getAllTickets', async () => {
      mockPrismaService.ticket.findMany.mockResolvedValue([])
      mockPrismaService.ticket.count.mockResolvedValue(0)
      await repository.getAllTickets(10, 0, { userId: 1 })
      expect(mockPrismaService.ticket.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ userId: 1 })
      }))
    })
  })
})

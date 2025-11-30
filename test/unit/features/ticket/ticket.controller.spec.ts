import { LoggerService } from '@common/logger/logger.service'
import { CreateTicketTypeDto } from '@module/ticket/dto/create-ticket-type.dto'
import { TicketController } from '@module/ticket/ticket.controller'
import { TicketService } from '@module/ticket/ticket.service'
import { Test, TestingModule } from '@nestjs/testing'

describe('TicketController', () => {
  let controller: TicketController

  const mockTicketService = {
    createTicketType: jest.fn(),
    getTicketTypeById: jest.fn(),
    getTicketTypesByEvent: jest.fn(),
    updateTicketType: jest.fn(),
    deleteTicketType: jest.fn(),
    getAllTickets: jest.fn(),
    checkIn: jest.fn(),
    getTicketById: jest.fn()
  }

  const mockLogger = {
    debug: jest.fn(),
    log: jest.fn(),
    error: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketController],
      providers: [
        {
          provide: TicketService,
          useValue: mockTicketService
        },
        {
          provide: LoggerService,
          useValue: mockLogger
        }
      ]
    }).compile()

    controller = module.get<TicketController>(TicketController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('createTicketType', () => {
    it('should create a ticket type', async () => {
      const dto: CreateTicketTypeDto = {
        eventId: 1,
        name: 'VIP',
        description: 'VIP Ticket',
        price: 100,
        quantity: 50
      }
      const result = { id: 1, ...dto }
      mockTicketService.createTicketType.mockResolvedValue(result)

      expect(await controller.createTicketType(dto)).toBe(result)
      expect(mockTicketService.createTicketType).toHaveBeenCalledWith(dto)
    })

    it('should handle errors', async () => {
      const dto: CreateTicketTypeDto = {
        eventId: 1,
        name: 'VIP',
        description: 'VIP Ticket',
        price: 100,
        quantity: 50
      }
      const error = new Error('Error creating ticket type')
      mockTicketService.createTicketType.mockRejectedValue(error)

      await expect(controller.createTicketType(dto)).rejects.toThrow(error)
      expect(mockLogger.error).toHaveBeenCalled()
    })

    it('should handle non-Error objects in catch block', async () => {
      const dto: CreateTicketTypeDto = {
        eventId: 1,
        name: 'VIP',
        description: 'VIP Ticket',
        price: 100,
        quantity: 50
      }
      mockTicketService.createTicketType.mockRejectedValue('String Error')

      await expect(controller.createTicketType(dto)).rejects.toEqual('String Error')
      expect(mockLogger.error).toHaveBeenCalledWith('Error creating ticket type', 'Unknown error')
    })
  })

  describe('getTicketTypeById', () => {
    it('should return a ticket type', async () => {
      const result = { id: 1, name: 'VIP' }
      mockTicketService.getTicketTypeById.mockResolvedValue(result)

      expect(await controller.getTicketTypeById(1)).toBe(result)
      expect(mockTicketService.getTicketTypeById).toHaveBeenCalledWith(1)
    })
  })

  describe('getTicketTypesByEvent', () => {
    it('should return ticket types for an event', async () => {
      const result = [{ id: 1, name: 'VIP' }]
      mockTicketService.getTicketTypesByEvent.mockResolvedValue(result)

      expect(await controller.getTicketTypesByEvent(1)).toBe(result)
      expect(mockTicketService.getTicketTypesByEvent).toHaveBeenCalledWith(1)
    })
  })

  describe('updateTicketType', () => {
    it('should update a ticket type', async () => {
      const dto = { name: 'Updated VIP' }
      const result = { id: 1, ...dto }
      mockTicketService.updateTicketType.mockResolvedValue(result)

      expect(await controller.updateTicketType(1, dto)).toBe(result)
      expect(mockTicketService.updateTicketType).toHaveBeenCalledWith(1, dto)
    })
  })

  describe('deleteTicketType', () => {
    it('should delete a ticket type', async () => {
      mockTicketService.deleteTicketType.mockResolvedValue(undefined)

      expect(await controller.deleteTicketType(1)).toBeUndefined()
      expect(mockTicketService.deleteTicketType).toHaveBeenCalledWith(1)
    })
  })

  describe('getAllTickets', () => {
    it('should return tickets', async () => {
      const result = { data: [], meta: {} }
      mockTicketService.getAllTickets.mockResolvedValue(result)

      expect(await controller.getAllTickets(20, 0)).toBe(result)
      expect(mockTicketService.getAllTickets).toHaveBeenCalledWith(20, 0, expect.any(Object))
    })
  })

  describe('checkIn', () => {
    it('should check in a ticket', async () => {
      const result = { success: true }
      const ticket = { id: 1, event: { communityId: 123 } }
      mockTicketService.getTicketById.mockResolvedValue(ticket)
      mockTicketService.checkIn.mockResolvedValue(result)

      const user = { id: 'user-id', communityId: 123 }
      expect(await controller.checkIn(1, user as any)).toBe(result)
      expect(mockTicketService.getTicketById).toHaveBeenCalledWith(1)
      expect(mockTicketService.checkIn).toHaveBeenCalledWith(1, 'user-id')
    })
  })

  describe('Additional Coverage', () => {
    it('should handle errors during ticket type creation', async () => {
      const dto = { name: 'Ticket' } as CreateTicketTypeDto
      mockTicketService.createTicketType.mockRejectedValue(new Error('Creation failed'))

      await expect(controller.createTicketType(dto)).rejects.toThrow('Creation failed')
      expect(mockLogger.error).toHaveBeenCalled()
    })

    it('should handle request object for baseUrl in getAllTickets', async () => {
      const req = { protocol: 'http', get: () => 'localhost', baseUrl: '/api/tickets' } as any
      mockTicketService.getAllTickets.mockResolvedValue({ data: [], meta: {} })

      await controller.getAllTickets(10, 0, undefined, undefined, req)

      expect(mockTicketService.getAllTickets).toHaveBeenCalledWith(10, 0, expect.objectContaining({ baseUrl: 'http://localhost/api/tickets' }))
    })

    it('should handle missing request object in getAllTickets', async () => {
      mockTicketService.getAllTickets.mockResolvedValue({ data: [], meta: {} })

      await controller.getAllTickets(10, 0)

      expect(mockTicketService.getAllTickets).toHaveBeenCalledWith(10, 0, expect.objectContaining({ baseUrl: '/tickets' }))
    })

    it('should throw ForbiddenException if user has no communityId in checkIn', async () => {
      const user = { id: 'user-1', communityId: null } as any
      mockTicketService.getTicketById.mockResolvedValue({ id: 1, event: { communityId: 1 } })

      await expect(controller.checkIn(1, user)).rejects.toThrow('Você precisa estar logado como uma comunidade para realizar check-in')
    })

    it('should throw ForbiddenException if user communityId does not match event communityId in checkIn', async () => {
      const user = { id: 'user-1', communityId: 2 } as any
      mockTicketService.getTicketById.mockResolvedValue({ id: 1, event: { communityId: 1 } })

      await expect(controller.checkIn(1, user)).rejects.toThrow('Este ingresso não pertence a um evento da sua comunidade')
    })
  })
})

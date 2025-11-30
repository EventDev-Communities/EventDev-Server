import { LoggerService } from '@common/logger/logger.service'
import { CreateTicketTypeDto } from '@module/ticket/dto/create-ticket-type.dto'
import { UpdateTicketTypeDto } from '@module/ticket/dto/update-ticket-type.dto'
import { TicketRepository } from '@module/ticket/ticket.repository'
import { TicketService } from '@module/ticket/ticket.service'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

describe('TicketService', () => {
  let service: TicketService

  const mockRepository = {
    createTicketType: jest.fn(),
    getTicketTypeById: jest.fn(),
    getTicketById: jest.fn(),
    getTicketTypesByEvent: jest.fn(),
    updateTicketType: jest.fn(),
    deleteTicketType: jest.fn(),
    getAllTickets: jest.fn(),
    checkIn: jest.fn(),
    getTicketStatusByCode: jest.fn(),
    updateTicketStatus: jest.fn(),
    createTicket: jest.fn(),
    decrementTicketTypeQuantity: jest.fn()
  }

  const mockLogger = {
    log: jest.fn(),
    debug: jest.fn(),
    error: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketService,
        { provide: TicketRepository, useValue: mockRepository },
        { provide: LoggerService, useValue: mockLogger }
      ]
    }).compile()

    service = module.get<TicketService>(TicketService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
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
      mockRepository.createTicketType.mockResolvedValue(result)

      expect(await service.createTicketType(dto)).toBe(result)
      expect(mockRepository.createTicketType).toHaveBeenCalledWith(dto)
    })

    it('should throw BadRequestException on error', async () => {
      const dto: CreateTicketTypeDto = {
        eventId: 1,
        name: 'VIP',
        description: 'VIP Ticket',
        price: 100,
        quantity: 50
      }
      mockRepository.createTicketType.mockRejectedValue(new Error('Error'))

      await expect(service.createTicketType(dto)).rejects.toThrow(BadRequestException)
    })

    it('should handle non-Error objects in catch block', async () => {
      const dto: CreateTicketTypeDto = {
        eventId: 1,
        name: 'VIP',
        description: 'VIP Ticket',
        price: 100,
        quantity: 50
      }
      mockRepository.createTicketType.mockRejectedValue('String Error')

      await expect(service.createTicketType(dto)).rejects.toThrow(BadRequestException)
      expect(mockLogger.error).toHaveBeenCalledWith('Error creating ticket type:', 'String Error')
    })
  })

  describe('getTicketTypeById', () => {
    it('should return a ticket type', async () => {
      const result = { id: 1, name: 'VIP' }
      mockRepository.getTicketTypeById.mockResolvedValue(result)

      expect(await service.getTicketTypeById(1)).toBe(result)
      expect(mockRepository.getTicketTypeById).toHaveBeenCalledWith(1)
    })

    it('should throw NotFoundException if not found', async () => {
      mockRepository.getTicketTypeById.mockResolvedValue(null)

      await expect(service.getTicketTypeById(1)).rejects.toThrow(NotFoundException)
    })
  })

  describe('getTicketById', () => {
    it('should return a ticket', async () => {
      const result = { id: 1, status: 'VALID' }
      mockRepository.getTicketById.mockResolvedValue(result)

      expect(await service.getTicketById(1)).toBe(result)
      expect(mockRepository.getTicketById).toHaveBeenCalledWith(1)
    })

    it('should throw NotFoundException if not found', async () => {
      mockRepository.getTicketById.mockResolvedValue(null)

      await expect(service.getTicketById(1)).rejects.toThrow(NotFoundException)
    })
  })

  describe('getTicketTypesByEvent', () => {
    it('should return ticket types for an event', async () => {
      const result = [{ id: 1, name: 'VIP' }]
      mockRepository.getTicketTypesByEvent.mockResolvedValue(result)

      expect(await service.getTicketTypesByEvent(1)).toBe(result)
      expect(mockRepository.getTicketTypesByEvent).toHaveBeenCalledWith(1)
    })
  })

  describe('updateTicketType', () => {
    it('should update a ticket type', async () => {
      const dto: UpdateTicketTypeDto = { name: 'Updated VIP' }
      const result = { id: 1, ...dto }
      mockRepository.getTicketTypeById.mockResolvedValue({ id: 1 })
      mockRepository.updateTicketType.mockResolvedValue(result)

      expect(await service.updateTicketType(1, dto)).toBe(result)
      expect(mockRepository.updateTicketType).toHaveBeenCalledWith(1, dto)
    })

    it('should throw NotFoundException if ticket type not found', async () => {
      mockRepository.getTicketTypeById.mockResolvedValue(null)

      await expect(service.updateTicketType(1, {})).rejects.toThrow(NotFoundException)
    })
  })

  describe('deleteTicketType', () => {
    it('should delete a ticket type', async () => {
      mockRepository.getTicketTypeById.mockResolvedValue({ id: 1 })
      mockRepository.deleteTicketType.mockResolvedValue(undefined)

      expect(await service.deleteTicketType(1)).toBeUndefined()
      expect(mockRepository.deleteTicketType).toHaveBeenCalledWith(1)
    })

    it('should throw NotFoundException if ticket type not found', async () => {
      mockRepository.getTicketTypeById.mockResolvedValue(null)

      await expect(service.deleteTicketType(1)).rejects.toThrow(NotFoundException)
    })
  })

  describe('getAllTickets', () => {
    it('should return paginated tickets', async () => {
      const mockTickets = [
        { id: 1, title: 'Ticket 1' },
        { id: 2, title: 'Ticket 2' }
      ]
      mockRepository.getAllTickets.mockResolvedValue({ data: mockTickets, total: 2 })

      const result = await service.getAllTickets(10, 0, { baseUrl: '/tickets' })

      expect(result).toMatchSnapshot()
      expect(mockRepository.getAllTickets).toHaveBeenCalledWith(10, 0, {
        eventId: undefined,
        userId: undefined
      })
    })

    it('should use default baseUrl if not provided', async () => {
      mockRepository.getAllTickets.mockResolvedValue({ data: [], total: 0 })

      const result = await service.getAllTickets(10, 0)

      expect(result.links.self).toContain('/tickets')
    })

    it('should return empty list when no tickets found', async () => {
      mockRepository.getAllTickets.mockResolvedValue({ data: [], total: 0 })

      const result = await service.getAllTickets(10, 0, { baseUrl: '/tickets' })

      expect(result.data).toEqual([])
      expect(result.meta.total).toBe(0)
    })
  })

  describe('checkIn', () => {
    it('should check in a ticket', async () => {
      const ticket = {
        id: 1,
        status: { code: 'CONFIRMED', name: 'Confirmed' },
        order: { userId: 'user-id' },
        event: { title: 'Event Title' },
        user: { email: 'user@example.com' },
        ticketType: { name: 'VIP' }
      }
      mockRepository.getTicketById.mockResolvedValue(ticket)
      mockRepository.getTicketStatusByCode.mockResolvedValue({
        id: 2,
        code: 'USED',
        name: 'Used'
      })
      mockRepository.updateTicketStatus.mockResolvedValue({
        ...ticket,
        status: { code: 'USED', name: 'Used' }
      })

      const result = await service.checkIn(1, 'user-id')
      expect(result.status).toBe('success')
    })

    it('should throw BadRequestException if ticket is not valid', async () => {
      const ticket = {
        id: 1,
        status: { code: 'USED', name: 'Used' },
        order: { userId: 'user-id' }
      }
      mockRepository.getTicketById.mockResolvedValue(ticket)

      await expect(service.checkIn(1, 'user-id')).rejects.toThrow(
        BadRequestException
      )
    })

    it('should throw NotFoundException if ticket not found', async () => {
      mockRepository.getTicketById.mockResolvedValue(null)
      await expect(service.checkIn(1, 'user-id')).rejects.toThrow(NotFoundException)
    })

    it('should throw BadRequestException if ticket already used', async () => {
      const ticket = {
        id: 1,
        status: { code: 'USED', name: 'Used' }
      }
      mockRepository.getTicketById.mockResolvedValue(ticket)
      await expect(service.checkIn(1, 'user-id')).rejects.toThrow(BadRequestException)
      await expect(service.checkIn(1, 'user-id')).rejects.toThrow('Ticket já utilizado')
    })

    it('should throw BadRequestException if ticket status is not CONFIRMED', async () => {
      const ticket = {
        id: 1,
        status: { code: 'PENDING', name: 'Pending' }
      }
      mockRepository.getTicketById.mockResolvedValue(ticket)
      await expect(service.checkIn(1, 'user-id')).rejects.toThrow(BadRequestException)
      await expect(service.checkIn(1, 'user-id')).rejects.toThrow('Ticket inválido para check-in')
    })

    it('should throw InternalServerErrorException if USED status not found', async () => {
      const ticket = {
        id: 1,
        status: { code: 'CONFIRMED', name: 'Confirmed' }
      }
      mockRepository.getTicketById.mockResolvedValue(ticket)
      mockRepository.getTicketStatusByCode.mockResolvedValue(null)
      await expect(service.checkIn(1, 'user-id')).rejects.toThrow('Status USED não encontrado no sistema')
    })
  })

  describe('createTicket', () => {
    it('should create a ticket successfully', async () => {
      const data = { eventId: 1, userId: 1, ticketTypeId: 1, value: 100 }
      const status = { id: 1, code: 'CONFIRMED' }
      const ticket = { id: 1, ...data, ticketStatusId: 1 }

      mockRepository.getTicketStatusByCode.mockResolvedValue(status)
      mockRepository.createTicket.mockResolvedValue(ticket)

      const result = await service.createTicket(data)
      expect(result).toEqual(ticket)
      expect(mockRepository.createTicket).toHaveBeenCalledWith(expect.objectContaining({
        ...data,
        ticketStatusId: 1
      }), undefined)
    })

    it('should throw Error if CONFIRMED status not found', async () => {
      const data = { eventId: 1, userId: 1, ticketTypeId: 1, value: 100 }
      mockRepository.getTicketStatusByCode.mockResolvedValue(null)
      await expect(service.createTicket(data)).rejects.toThrow('Ticket Status CONFIRMED not found')
    })
  })

  describe('decrementStock', () => {
    it('should decrement stock successfully', async () => {
      const ticketType = { id: 1, quantity: 49 }
      mockRepository.decrementTicketTypeQuantity.mockResolvedValue(ticketType)

      const result = await service.decrementStock(1, 1)
      expect(result).toEqual(ticketType)
      expect(mockRepository.decrementTicketTypeQuantity).toHaveBeenCalledWith(1, 1, undefined)
    })
  })
})

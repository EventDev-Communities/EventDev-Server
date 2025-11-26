import { LoggerService } from '@common/logger/logger.service'
import { TicketRepository } from '@module/ticket/ticket.repository'
import { TicketService } from '@module/ticket/ticket.service'
import { Test, TestingModule } from '@nestjs/testing'

describe('TicketService', () => {
  let service: TicketService

  const mockRepository = {
    createTicketType: jest.fn(),
    getTicketTypeById: jest.fn(),
    getAllTickets: jest.fn()
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

    it('should return empty list when no tickets found', async () => {
      mockRepository.getAllTickets.mockResolvedValue({ data: [], total: 0 })

      const result = await service.getAllTickets(10, 0, { baseUrl: '/tickets' })

      expect(result.data).toEqual([])
      expect(result.meta.total).toBe(0)
    })
  })
})

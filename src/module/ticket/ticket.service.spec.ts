import { LoggerService } from '@common/logger/logger.service'
import { AddressService } from '@module/address/address.service'
import { CommunityService } from '@module/community/community.service'
import { TicketRepository } from '@module/ticket/ticket.repository'
import { TicketService } from '@module/ticket/ticket.service'
import { Test, TestingModule } from '@nestjs/testing'

describe('TicketService', () => {
  let service: TicketService

  const mockRepository = {
    create: jest.fn(),
    getByID: jest.fn(),
    getAll: jest.fn()
  }

  const mockCommunityService = {
    isExistCommunity: jest.fn()
  }

  const mockAddressService = {
    create: jest.fn()
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
        { provide: CommunityService, useValue: mockCommunityService },
        { provide: AddressService, useValue: mockAddressService },
        { provide: LoggerService, useValue: mockLogger }
      ]
    }).compile()

    service = module.get<TicketService>(TicketService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getAll', () => {
    it('should return paginated tickets', async () => {
      const mockTickets = [
        { id: 1, title: 'Ticket 1' },
        { id: 2, title: 'Ticket 2' }
      ]
      mockRepository.getAll.mockResolvedValue({ data: mockTickets, total: 2 })

      const result = await service.getAll(10, 0, { baseUrl: '/tickets' })

      expect(result).toMatchSnapshot()
      expect(mockRepository.getAll).toHaveBeenCalledWith(10, 0, {
        eventId: undefined,
        isActive: undefined
      })
    })

    it('should return empty list when no tickets found', async () => {
      mockRepository.getAll.mockResolvedValue({ data: [], total: 0 })

      const result = await service.getAll(10, 0, { baseUrl: '/tickets' })

      expect(result.data).toEqual([])
      expect(result.meta.total).toBe(0)
    })
  })
})

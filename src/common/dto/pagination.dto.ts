import { ApiProperty } from '@nestjs/swagger'

export class PaginationLinks {
  @ApiProperty({ example: '/api/v1/events?take=25&skip=0', description: 'URL da primeira página' })
  first: string

  @ApiProperty({ example: '/api/v1/events?take=25&skip=25', description: 'URL da próxima página', required: false })
  next?: string

  @ApiProperty({ example: '/api/v1/events?take=25&skip=0', description: 'URL da página anterior', required: false })
  prev?: string

  @ApiProperty({ example: '/api/v1/events?take=25&skip=100', description: 'URL da última página' })
  last: string

  @ApiProperty({ example: '/api/v1/events?take=25&skip=25', description: 'URL da página atual' })
  self: string
}

export class PaginationMeta {
  @ApiProperty({ example: 25, description: 'Quantidade de itens por página' })
  take: number

  @ApiProperty({ example: 0, description: 'Quantidade de itens pulados' })
  skip: number

  @ApiProperty({ example: 125, description: 'Total de itens' })
  total: number

  @ApiProperty({ example: 5, description: 'Total de páginas' })
  totalPages: number

  @ApiProperty({ example: 1, description: 'Página atual' })
  currentPage: number

  @ApiProperty({ example: true, description: 'Se existe próxima página' })
  hasNext: boolean

  @ApiProperty({ example: false, description: 'Se existe página anterior' })
  hasPrev: boolean
}

export class PaginatedResponse<T> {
  @ApiProperty({ description: 'Dados da página atual' })
  data: T[]

  @ApiProperty({ type: PaginationMeta, description: 'Metadados de paginação' })
  meta: PaginationMeta

  @ApiProperty({ type: PaginationLinks, description: 'Links de navegação HATEOAS' })
  links: PaginationLinks
}

export interface PaginationParams {
  take: number
  skip: number
  baseUrl: string
  queryParams?: Record<string, string | number | boolean | undefined>
}

export function buildPaginatedResponse<T>(data: T[], total: number, params: PaginationParams): PaginatedResponse<T> {
  const { take, skip, baseUrl, queryParams = {} } = params

  const currentPage = Math.floor(skip / take) + 1
  const totalPages = Math.ceil(total / take)
  const hasNext = skip + take < total
  const hasPrev = skip > 0

  const buildUrl = (newSkip: number) => {
    const query = new URLSearchParams({
      take: take.toString(),
      skip: newSkip.toString(),
      ...Object.entries(queryParams).reduce(
        (acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            acc[key] = String(value)
          }
          return acc
        },
        {} as Record<string, string>
      )
    })
    return `${baseUrl}?${query.toString()}`
  }

  return {
    data,
    meta: {
      take,
      skip,
      total,
      totalPages,
      currentPage,
      hasNext,
      hasPrev
    },
    links: {
      first: buildUrl(0),
      next: hasNext ? buildUrl(skip + take) : undefined,
      prev: hasPrev ? buildUrl(Math.max(0, skip - take)) : undefined,
      last: buildUrl((totalPages - 1) * take),
      self: buildUrl(skip)
    }
  }
}

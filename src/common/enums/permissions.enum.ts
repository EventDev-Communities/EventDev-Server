export enum Permission {
  // Community permissions
  COMMUNITY_CREATE = 'community:create',
  COMMUNITY_READ = 'community:read',
  COMMUNITY_READ_ALL = 'community:read:all',
  COMMUNITY_UPDATE = 'community:update',
  COMMUNITY_UPDATE_ALL = 'community:update:all',
  COMMUNITY_UPDATE_OWN = 'community:update:own',
  COMMUNITY_DELETE = 'community:delete',
  COMMUNITY_DELETE_OWN = 'community:delete:own',
  COMMUNITY_MANAGE_OWN = 'community:manage:own',

  // Event permissions
  EVENT_CREATE = 'event:create',
  EVENT_READ = 'event:read',
  EVENT_READ_ALL = 'event:read:all',
  EVENT_UPDATE = 'event:update',
  EVENT_DELETE = 'event:delete',
  EVENT_MANAGE_OWN = 'event:manage:own',
  EVENT_MANAGE_ALL = 'event:manage:all',

  // Ticket permissions
  TICKET_CREATE = 'ticket:create',
  TICKET_READ = 'ticket:read',
  TICKET_READ_ALL = 'ticket:read:all',
  TICKET_UPDATE = 'ticket:update',
  TICKET_DELETE = 'ticket:delete',
  TICKET_MANAGE_OWN = 'ticket:manage:own',
  TICKET_MANAGE_ALL = 'ticket:manage:all',

  // Order permissions
  ORDER_CREATE = 'order:create',
  ORDER_READ = 'order:read',
  ORDER_READ_OWN = 'order:read:own',
  ORDER_UPDATE = 'order:update',
  ORDER_UPDATE_ALL = 'order:update:all',
  ORDER_UPDATE_OWN = 'order:update:own',
  ORDER_CANCEL = 'order:cancel',
  ORDER_READ_ALL = 'order:read:all',

  // User management permissions
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_READ_ALL = 'user:read:all',
  USER_UPDATE = 'user:update',
  USER_UPDATE_ALL = 'user:update:all',
  USER_DELETE = 'user:delete',
  USER_DELETE_ALL = 'user:delete:all',

  // Admin permissions
  ADMIN_ALL = 'admin:*'
}

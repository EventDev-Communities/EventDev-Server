import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import UserRoles from "supertokens-node/recipe/userroles";

@Injectable()
export class RoleSetupService implements OnApplicationBootstrap {
  async onApplicationBootstrap() {
    console.log('Garantindo a existência dos papéis...');
    await UserRoles.createNewRoleOrAddPermissions('admin', []);
    await UserRoles.createNewRoleOrAddPermissions('community', []);
    await UserRoles.createNewRoleOrAddPermissions('user', []);
    console.log('Papéis garantidos.');
  }
}

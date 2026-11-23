import { create } from "zustand";
import { devtools } from "zustand/middleware";

type RequestCommand =
    | {
          type: "edit";
          id: string;
          responsibilityId: string;
      }
    | {
          type: "create";
          responsibilityId?: string;
      };

type ResponsibilityCommand =
    | {
          type: "edit";
          id: string;
          roleId: string;
      }
    | {
          type: "create";
          roleId?: string;
      };

type RoleCommand =
    | {
          type: "edit";
          id: string;
      }
    | {
          type: "create";
      };

export type DialogState = {
    request: {
        id?: string;
        responsibilityId?: string;
    } | null;
    role: {
        id?: string;
    } | null;
    responsibility: {
        id?: string;
        roleId?: string;
    } | null;
};

function createNullState(): DialogState {
    return {
        request: null,
        responsibility: null,
        role: null,
    };
}

export type DialogStore = {
    data: DialogState;
    showRequest: (command: RequestCommand) => void;
    closeRequest: () => void;

    showRole: (command: RoleCommand) => void;
    closeRole: () => void;

    showResponsibility: (command: ResponsibilityCommand) => void;
    closeResponsibility: () => void;
};

export const useDialogStore = create<DialogStore>()(
    devtools(
        (setState) => {
            const data = createNullState();

            const showRequest = (command: RequestCommand) => {
                switch (command.type) {
                    case "create":
                        setState({
                            data: {
                                ...createNullState(),
                                request: command.responsibilityId ? { responsibilityId: command.responsibilityId } : {},
                            },
                        });
                        break;
                    case "edit":
                        setState({
                            data: {
                                ...createNullState(),
                                request: {
                                    id: command.id,
                                    responsibilityId: command.responsibilityId,
                                },
                            },
                        });
                }
            };

            const showRole = (command: RoleCommand) => {
                switch (command.type) {
                    case "edit":
                        setState({
                            data: {
                                ...createNullState(),
                                role: {
                                    id: command.id,
                                },
                            },
                        });
                        break;
                    case "create": {
                        setState({
                            data: {
                                ...createNullState(),
                                role: {},
                            },
                        });
                    }
                }
            };

            const showResponsibility = (command: ResponsibilityCommand) => {
                switch (command.type) {
                    case "edit":
                        setState({
                            data: {
                                ...createNullState(),
                                responsibility: {
                                    roleId: command.roleId,
                                    id: command.id,
                                },
                            },
                        });
                        break;
                    case "create":
                        setState({
                            data: {
                                ...createNullState(),
                                responsibility: command.roleId ? { roleId: command.roleId } : {},
                            },
                        });
                        break;
                }
            };

            const generalClose = () => {
                setState({
                    data: createNullState(),
                });
            };

            return {
                data,
                showRequest,
                showRole,
                showResponsibility,
                closeRequest: generalClose,
                closeResponsibility: generalClose,
                closeRole: generalClose,
            };
        },
        {
            name: "Dialog-Store",
            enabled: true,
        },
    ),
);

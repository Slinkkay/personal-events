import { create } from "zustand";

type RequestCommand =
    | {
          type: "edit";
          id: string;
          responsibilityId: string;
      }
    | {
          type: "create";
          responsibilityId: string;
      };

type ResponsibilityCommand =
    | {
          type: "edit";
          id: string;
          roleId: string;
      }
    | {
          type: "create";
          roleId: string;
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
    data: {
        request: {
            id?: string;
            responsibilityId: string;
        } | null;
        role: {
            id?: string;
        } | null;
        responsibility: {
            id?: string;
            roleId: string;
        } | null;
    };
    showRequest: (command: RequestCommand) => void;
    closeRequest: () => void;

    showRole: (command: RoleCommand) => void;
    closeRole: () => void;

    showResponsibility: (command: ResponsibilityCommand) => void;
    closeResponsibility: () => void;
};

export const useDialogStore = create<DialogState>((setState, getState, store) => {
    const data = {
        request: null,
        responsibility: null,
        role: null,
    };

    const showRequest = (command: RequestCommand) => {
        console.log(command);
        switch (command.type) {
            case "create":
                setState({
                    data: {
                        request: {
                            responsibilityId: command.responsibilityId,
                        },
                        responsibility: null,
                        role: null,
                    },
                });
                break;
            case "edit":
                setState({
                    data: {
                        request: {
                            id: command.id,
                            responsibilityId: command.responsibilityId,
                        },
                        responsibility: null,
                        role: null,
                    },
                });
        }
    };

    const showRole = (command: RoleCommand) => {
        console.log("Role Show");
        switch (command.type) {
            case "edit":
                setState({
                    data: {
                        role: {
                            id: command.id,
                        },
                        request: null,
                        responsibility: null,
                    },
                });
                break;
            case "create":
                setState({
                    data: {
                        role: {},
                        request: null,
                        responsibility: null,
                    },
                });
        }
    };

    const showResponsibility = (command: ResponsibilityCommand) => {
        switch (command.type) {
            case "edit":
                setState({
                    data: {
                        request: null,
                        responsibility: {
                            roleId: command.roleId,
                            id: command.id,
                        },
                        role: null,
                    },
                });
                break;
            case "create":
                setState({
                    data: {
                        request: null,
                        responsibility: {
                            roleId: command.roleId,
                        },
                        role: null,
                    },
                });
                break;
        }
    };

    const generalClose = () => {
        console.log("General Close");
        setState({
            data: {
                role: null,
                responsibility: null,
                request: null,
            },
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
});

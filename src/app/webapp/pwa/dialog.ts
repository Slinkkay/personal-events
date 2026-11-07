import { create } from "zustand";

export type DialogState = {
    data: {
        id: string | undefined;
        request: boolean;
        role: boolean;
        responsibility: boolean;
    };
    showRequest: (id?: string) => void;
    closeRequest: () => void;

    showRole: (id?: string) => void;
    closeRole: () => void;

    showResponsibility: (id?: string) => void;
    closeResponsibility: () => void;
};

export const useDialogStore = create<DialogState>((setState, getState, store) => {
    const data = {
        id: undefined,
        request: false,
        role: false,
        responsibility: false,
    };

    const showRequest = (id?: string) => {
        setState({
            data: {
                id,
                request: true,
                responsibility: false,
                role: false,
            },
        });
    };

    const showRole = (id?: string) => {
        console.log("Role Show");
        setState({
            data: {
                id,
                request: false,
                responsibility: false,
                role: true,
            },
        });
    };

    const showResponsibility = (id?: string) => {
        setState({
            data: {
                id,
                request: false,
                responsibility: false,
                role: true,
            },
        });
    };

    const generalClose = () => {
        console.log("General Close");
        setState({
            data: {
                id: undefined,
                request: false,
                responsibility: false,
                role: false,
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

import React, { useState, useEffect, useRef } from "react";
import { useOmniStore, RoleStatus } from "../useOmniStore";
import { X, FolderPlus, Edit3, Lock, Loader2 } from "lucide-react";
import { useDialogStore } from "@/app/webapp/pwa/dialog";

interface FieldComponentProps {
    roleId: string | undefined;
}

// 1. Role Title Field Component
const TitleField: React.FC<
    FieldComponentProps & {
        title: string;
        setTitle: (val: string) => void;
        isUnlocked: boolean;
        onToggleLock: () => void;
        isAnyLocked: boolean;
        originalValue: string;
    }
> = ({ roleId, title, setTitle, isUnlocked, onToggleLock, isAnyLocked, originalValue }) => {
    const [savingField, setSavingField] = useState(false);
    const isEditMode = Boolean(roleId);
    const { updateRoleTitle } = useOmniStore();
    const saveButtonRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditMode && isUnlocked) {
            inputRef.current?.focus();
        }
    }, [isEditMode, isUnlocked]);

    const handleSave = async () => {
        setSavingField(true);
        if (roleId === undefined) {
            return;
        }
        await updateRoleTitle(roleId, title);
        setSavingField(false);
        onToggleLock();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Tab" && !e.shiftKey && isUnlocked) {
            e.preventDefault();
            saveButtonRef.current?.focus();
        } else if (e.key === "Escape" && isUnlocked) {
            e.preventDefault();
            e.stopPropagation();
            setTitle(originalValue);
            onToggleLock();
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">Role Title</label>
                {isEditMode && (
                    <div className="flex items-center gap-2">
                        {isUnlocked ? (
                            <button
                                ref={saveButtonRef}
                                type="button"
                                onClick={handleSave}
                                disabled={savingField}
                                className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded text-[11px] flex items-center gap-1 transition-all disabled:opacity-50"
                            >
                                {savingField ? (
                                    <>
                                        <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                                    </>
                                ) : (
                                    "Save"
                                )}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    if (!isAnyLocked) onToggleLock();
                                }}
                                disabled={isAnyLocked}
                                className="text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 flex items-center gap-1 transition-colors text-[11px]"
                            >
                                <Lock className="w-3 h-3" /> Locked
                            </button>
                        )}
                    </div>
                )}
            </div>
            <input
                ref={inputRef}
                type="text"
                required
                disabled={isEditMode && !isUnlocked}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Director of Technology"
                className={`w-full px-3 py-2 border rounded-xl text-xs transition-colors ${
                    isEditMode && !isUnlocked
                        ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                        : "bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                }`}
            />
        </div>
    );
};

// 2. Role Description Field Component
const DescriptionField: React.FC<
    FieldComponentProps & {
        description: string;
        setDescription: (val: string) => void;
        isUnlocked: boolean;
        onToggleLock: () => void;
        isAnyLocked: boolean;
        originalValue: string;
    }
> = ({ roleId, description, setDescription, isUnlocked, onToggleLock, isAnyLocked, originalValue }) => {
    const [savingField, setSavingField] = useState(false);
    const isEditMode = Boolean(roleId);
    const { updateRoleDescription } = useOmniStore();
    const saveButtonRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isEditMode && isUnlocked) {
            inputRef.current?.focus();
        }
    }, [isEditMode, isUnlocked]);

    const handleSave = async () => {
        setSavingField(true);

        if (roleId === undefined) {
            return;
        }

        await updateRoleDescription(roleId, description);
        setSavingField(false);
        onToggleLock();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Tab" && !e.shiftKey && isUnlocked) {
            e.preventDefault();
            saveButtonRef.current?.focus();
        } else if (e.key === "Escape" && isUnlocked) {
            e.preventDefault();
            e.stopPropagation();
            setDescription(originalValue);
            onToggleLock();
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">
                    Description (Markdown Supported: Tables, Links, Lists)
                </label>
                {isEditMode && (
                    <div className="flex items-center gap-2">
                        {isUnlocked ? (
                            <button
                                ref={saveButtonRef}
                                type="button"
                                onClick={handleSave}
                                disabled={savingField}
                                className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded text-[11px] flex items-center gap-1 transition-all disabled:opacity-50"
                            >
                                {savingField ? (
                                    <>
                                        <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                                    </>
                                ) : (
                                    "Save"
                                )}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    if (!isAnyLocked) onToggleLock();
                                }}
                                disabled={isAnyLocked}
                                className="text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 flex items-center gap-1 transition-colors text-[11px]"
                            >
                                <Lock className="w-3 h-3" /> Locked
                            </button>
                        )}
                    </div>
                )}
            </div>
            <textarea
                ref={inputRef}
                rows={6}
                disabled={isEditMode && !isUnlocked}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={"## Overview\nDescribe responsibilities and resources..."}
                className={`w-full px-3 py-2 border rounded-xl font-mono text-[11px] transition-colors ${
                    isEditMode && !isUnlocked
                        ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                        : "bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                }`}
            />
        </div>
    );
};

// 3. Role Status Field Component
const StatusField: React.FC<
    FieldComponentProps & {
        status: RoleStatus;
        setStatus: (val: RoleStatus) => void;
        isUnlocked: boolean;
        onToggleLock: () => void;
        isAnyLocked: boolean;
        originalValue: RoleStatus;
    }
> = ({ roleId, status, setStatus, isUnlocked, onToggleLock, isAnyLocked, originalValue }) => {
    const [savingField, setSavingField] = useState(false);
    const isEditMode = Boolean(roleId);
    const { updateRoleStatus } = useOmniStore();
    const saveButtonRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLSelectElement>(null);

    useEffect(() => {
        if (isEditMode && isUnlocked) {
            inputRef.current?.focus();
        }
    }, [isEditMode, isUnlocked]);

    const handleSave = async () => {
        if (roleId === undefined) {
            return;
        }
        setSavingField(true);
        await updateRoleStatus(roleId, status);
        setSavingField(false);
        onToggleLock();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Tab" && !e.shiftKey && isUnlocked) {
            e.preventDefault();
            saveButtonRef.current?.focus();
        } else if (e.key === "Escape" && isUnlocked) {
            e.preventDefault();
            e.stopPropagation();
            setStatus(originalValue);
            onToggleLock();
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">Status</label>
                {isEditMode && (
                    <div className="flex items-center gap-2">
                        {isUnlocked ? (
                            <button
                                ref={saveButtonRef}
                                type="button"
                                onClick={handleSave}
                                disabled={savingField}
                                className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded text-[11px] flex items-center gap-1 transition-all disabled:opacity-50"
                            >
                                {savingField ? (
                                    <>
                                        <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                                    </>
                                ) : (
                                    "Save"
                                )}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    if (!isAnyLocked) onToggleLock();
                                }}
                                disabled={isAnyLocked}
                                className="text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 flex items-center gap-1 transition-colors text-[11px]"
                            >
                                <Lock className="w-3 h-3" /> Locked
                            </button>
                        )}
                    </div>
                )}
            </div>
            <select
                ref={inputRef}
                value={status}
                disabled={isEditMode && !isUnlocked}
                onChange={(e) => setStatus(e.target.value as RoleStatus)}
                onKeyDown={handleKeyDown}
                className={`w-full px-3 py-2 border rounded-xl text-xs font-semibold transition-colors ${
                    isEditMode && !isUnlocked
                        ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                        : "bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                }`}
            >
                <option value="OPEN">OPEN</option>
                <option value="CLOSED">CLOSED</option>
            </select>
        </div>
    );
};

export const RoleModal: React.FC = ({}) => {
    const { data, addRole } = useOmniStore();
    const { data: dialogData, closeRole } = useDialogStore();

    const isOpen = dialogData.role !== null;

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<RoleStatus>("OPEN");

    // Track original values when a field is unlocked so we can revert on escape
    const [originalTitle, setOriginalTitle] = useState("");
    const [originalDescription, setOriginalDescription] = useState("");
    const [originalStatus, setOriginalStatus] = useState<RoleStatus>("OPEN");

    // Track which field is currently unlocked (null means all are locked)
    const [unlockedField, setUnlockedField] = useState<"title" | "description" | "status" | null>(null);

    const roleId = dialogData.role?.id;

    // Populate form fields if editing an existing role
    useEffect(() => {
        if (roleId) {
            const existingRole = data.roles.find((r) => r.id === roleId);
            if (existingRole) {
                setTitle(existingRole.title);
                setDescription(existingRole.description);
                setStatus(existingRole.status);
            }
            // Edit state: all fields locked by default
            setUnlockedField(null);
        } else {
            setTitle("");
            setDescription("");
            setStatus("OPEN");
            setUnlockedField(null);
        }
    }, [roleId, data.roles, isOpen]);

    // Close modal on Escape when open and no field is actively being edited
    useEffect(() => {
        if (!isOpen) return;

        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && unlockedField === null) {
                e.preventDefault();
                closeRole();
            }
        };

        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }, [isOpen, unlockedField, closeRole]);

    // Handle unlocking a field and capturing its starting value for Escape-reverts
    const handleToggleLock = (field: "title" | "description" | "status") => {
        if (unlockedField === field) {
            setUnlockedField(null);
        } else {
            if (unlockedField === null) {
                setOriginalTitle(title);
                setOriginalDescription(description);
                setOriginalStatus(status);
            }
            setUnlockedField(field);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        if (!roleId) {
            addRole({ title, description, status: "OPEN" });
            closeRole();
        }
    };

    const isEditMode = Boolean(roleId);
    const isAnyLocked = unlockedField !== null;

    return (
        <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
                // Close only if clicking the backdrop directly, not the modal content box
                if (e.target === e.currentTarget) {
                    closeRole();
                }
            }}
        >
            <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        {isEditMode ? (
                            <Edit3 className="w-4 h-4 text-indigo-600" />
                        ) : (
                            <FolderPlus className="w-4 h-4 text-indigo-600" />
                        )}
                        {isEditMode ? "Edit Role" : "Create New Role"}
                    </h3>
                    <button
                        onClick={closeRole}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Modal Form Body */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
                    {isEditMode && (
                        <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between font-mono text-slate-600">
                            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                                Role ID
                            </span>
                            <span className="bg-white px-2 py-0.5 rounded border border-slate-200 select-all font-bold text-indigo-600">
                                {roleId}
                            </span>
                        </div>
                    )}

                    <TitleField
                        roleId={roleId}
                        title={title}
                        setTitle={setTitle}
                        isUnlocked={unlockedField === "title"}
                        onToggleLock={() => handleToggleLock("title")}
                        isAnyLocked={isAnyLocked}
                        originalValue={originalTitle}
                    />

                    <DescriptionField
                        roleId={roleId}
                        description={description}
                        setDescription={setDescription}
                        isUnlocked={unlockedField === "description"}
                        onToggleLock={() => handleToggleLock("description")}
                        isAnyLocked={isAnyLocked}
                        originalValue={originalDescription}
                    />

                    {isEditMode && (
                        <StatusField
                            roleId={roleId}
                            status={status}
                            setStatus={setStatus}
                            isUnlocked={unlockedField === "status"}
                            onToggleLock={() => handleToggleLock("status")}
                            isAnyLocked={isAnyLocked}
                            originalValue={originalStatus}
                        />
                    )}

                    {/* Modal Actions */}
                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={closeRole}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        {!isEditMode && (
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-sm"
                            >
                                Create Role
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

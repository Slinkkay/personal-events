import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Command, Plus, FolderPlus, ListTodo } from "lucide-react";
import { useDialogStore } from "../dialog";

type OmniAction = {
    id: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    action: () => void;
};

export const Omnibar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const { showRole, showResponsibility, showRequest } = useDialogStore();

    // Static actions: only the three create commands
    const actions: OmniAction[] = [
        {
            id: "create-role",
            label: "Create Role",
            description: "Add a new role to the hierarchy",
            icon: <FolderPlus className="w-4 h-4" />,
            action: () => showRole({ type: "create" }),
        },
        {
            id: "create-responsibility",
            label: "Create Responsibility",
            description: "Add a new responsibility to a role",
            icon: <ListTodo className="w-4 h-4" />,
            action: () => showResponsibility({ type: "create" }),
        },
        {
            id: "create-request",
            label: "Create Request",
            description: "Add a new request to a responsibility",
            icon: <Plus className="w-4 h-4" />,
            action: () => showRequest({ type: "create" }),
        },
    ];

    // Filter actions based on query
    const filtered = actions.filter((a) => {
        const haystack = `${a.label} ${a.description}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
    });

    // Reset selected index when query changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    // Keyboard shortcut: Ctrl/Cmd + K to toggle
    useEffect(() => {
        const handler = (e: KeyboardEvent<Document>) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen((v) => !v);
            }
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };
        document.addEventListener("keydown", handler as any);
        return () => document.removeEventListener("keydown", handler as any);
    }, []);

    // Click outside to close
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setQuery("");
                setSelectedIndex(0);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [isOpen]);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    // Reset selected index when filtered list changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    const handleSelect = (action: OmniAction) => {
        action.action();
        setIsOpen(false);
        setQuery("");
        setSelectedIndex(0);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter" && filtered[selectedIndex]) {
            e.preventDefault();
            handleSelect(filtered[selectedIndex]);
        }
    };

    return (
        <div ref={containerRef} className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-medium px-3 py-2 rounded-xl border border-slate-700 transition-all flex items-center gap-2"
            >
                <Command className="w-4 h-4" />
                <span className="hidden sm:inline">Actions...</span>
                <kbd className="hidden sm:inline ml-1 px-1.5 py-0.5 text-[10px] bg-slate-700 rounded border border-slate-600">
                    ⌘K
                </kbd>
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                    {/* Input */}
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-700">
                        <Command className="w-4 h-4 text-slate-500" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Type an action..."
                            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
                        />
                    </div>

                    {/* Results */}
                    <div className="max-h-80 overflow-y-auto py-1">
                        {filtered.length === 0 ? (
                            <div className="px-3 py-6 text-center text-sm text-slate-500">No actions found</div>
                        ) : (
                            filtered.map((action, index) => (
                                <button
                                    key={action.id}
                                    onMouseDown={() => handleSelect(action)}
                                    className={`w-full text-left px-3 py-2 flex items-center gap-3 text-sm transition-colors ${
                                        index === selectedIndex
                                            ? "bg-indigo-600/20 text-white"
                                            : "text-slate-300 hover:bg-slate-700"
                                    }`}
                                >
                                    <span className="text-slate-500">{action.icon}</span>
                                    <div>
                                        <div className="font-medium">{action.label}</div>
                                        <div className="text-xs text-slate-500">{action.description}</div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    {/* Footer hint */}
                    <div className="px-3 py-1.5 border-t border-slate-700 text-[10px] text-slate-600 flex justify-between">
                        <span>↑↓ navigate</span>
                        <span>↵ select</span>
                        <span>esc close</span>
                    </div>
                </div>
            )}
        </div>
    );
};

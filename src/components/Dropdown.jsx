import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const DropdownContext = createContext(null);

export const Dropdown = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
            <div ref={containerRef} className="relative inline-block w-full">
                {children}
            </div>
        </DropdownContext.Provider>
    );
};

export const DropdownButton = ({ children, outline, className = '' }) => {
    const { isOpen, setIsOpen } = useContext(DropdownContext);

    const baseStyles = "flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-principal/50";
    const variants = outline
        ? "bg-white border border-gris-claro text-negro-principal hover:bg-gray-50 hover:border-gris-medio active:bg-gray-100 shadow-sm"
        : "bg-gray-50 text-negro-principal hover:bg-gray-100 active:bg-gray-200";

    return (
        <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`${baseStyles} ${variants} ${className}`}
        >
            {children}
        </button>
    );
};

export const DropdownMenu = ({ children, className = '' }) => {
    const { isOpen } = useContext(DropdownContext);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 1, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    transition={{ duration: 0.1, ease: "easeOut" }}
                    className={`absolute z-50 mt-1 w-full min-w-[160px] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden focus:outline-none ${className}`}
                >
                    <div className="p-1.5 max-h-60 overflow-auto no-scrollbar flex flex-col gap-0.5">
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export const DropdownItem = ({ children, onClick, active, className = '' }) => {
    const { setIsOpen } = useContext(DropdownContext);
    const [isHovered, setIsHovered] = useState(false);

    const getBackgroundColor = () => {
        if (active && isHovered) return 'bg-verde-oscuro';
        if (active) return 'bg-verde-principal';
        if (isHovered) return 'bg-gray-100';
        return 'bg-white';
    };

    const getTextColor = () => {
        if (active) return 'text-white';
        if (isHovered) return 'text-verde-principal';
        return 'text-negro-principal';
    };

    return (
        <button
            type="button"
            onClick={() => {
                if (onClick) onClick();
                setIsOpen(false);
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`w-full text-left px-3 py-2 text-sm transition-all duration-150 flex items-center gap-2 rounded-md ${getBackgroundColor()} ${getTextColor()} ${active ? 'font-semibold' : ''} ${className}`}
        >
            {children}
        </button>
    );
};

import React from 'react';

export default function NavItem({ icon, label, active = false, expanded, onClick, isSubmenu = false }) {
    return (
        <div
            className={`flex items-center px-4 py-2 cursor-pointer hover:bg-blue-700 ${active ? 'bg-blue-700' : ''}`}
            onClick={onClick}
        >
            <div className={`flex items-center ${expanded ? `justify-start ${isSubmenu ? 'pl-6' : ''}` : 'justify-center w-full'}`}>
                {icon}
            </div>
            {expanded && <span className={`ml-3 ${active ? 'font-bold' : ''}`}>{label}</span>}
        </div>
    );
}
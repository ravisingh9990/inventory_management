// client/src/components/MessageBox.js
import React from 'react';

const MessageBox = ({ message, type }) => {
    if (!message) return null;

    const bgColor = type === 'success' ? 'bg-green-100' : 'bg-red-100';
    const textColor = type === 'success' ? 'text-green-700' : 'text-red-700';

    return (
        <div className={`p-3 rounded-md mb-4 text-center ${bgColor} ${textColor}`}>
            {message}
        </div>
    );
};

export default MessageBox;
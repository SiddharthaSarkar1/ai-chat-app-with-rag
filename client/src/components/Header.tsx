import type React from "react";
import type { Message } from "../App";
import { RotateCcw } from "lucide-react";
import api from "../config/axios";

interface HeaderProps {
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    setThreadId: React.Dispatch<React.SetStateAction<number>>;
    setIsPdfReady: React.Dispatch<React.SetStateAction<boolean>>;
    resetDatabase: () => void;
    isPdfReady: boolean;
}

const Header: React.FC<HeaderProps> = ({ setMessages, setThreadId, setIsPdfReady, resetDatabase, isPdfReady }) => {

    const resetChat = () => {
        resetDatabaseRecord();
        setMessages([]);
        setThreadId(Date.now());
        setIsPdfReady(false); // Reset the PDF state as well
    };

    const handleResetDatabase = () => {
        resetDatabase();
        setMessages([]);
        setThreadId(Date.now());
        setIsPdfReady(false);
    }

    const resetDatabaseRecord = async () => {
        try {
            const { data } = await api.post(
                `/api/reset`
            );
            console.log(data);
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <>
            <header className='chat-header'>
                <h1>DocuChat AI</h1>
                {isPdfReady && <button className='reset-button' onClick={resetChat}>
                    <svg
                        width='16'
                        height='16'
                        viewBox='0 0 16 16'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                    >
                        <path
                            d='M8 3V1L4 5L8 9V7C10.21 7 12 8.79 12 11C12 13.21 10.21 15 8 15C5.79 15 4 13.21 4 11H2C2 14.31 4.69 17 8 17C11.31 17 14 14.31 14 11C14 7.69 11.31 5 8 5V3Z'
                            fill='currentColor'
                        />
                    </svg>
                    New Chat
                </button>}
                {isPdfReady && <button className='reset-button' onClick={handleResetDatabase}>
                    <RotateCcw />
                    Reset DB
                </button>}
            </header>
        </>
    )
}

export default Header
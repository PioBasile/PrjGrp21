import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/start.css';

const Start = () => {
    console.log("test");
    const [isButtonFaded, setIsButtonFaded] = useState(false);
    const navigate = useNavigate();

    const clickAnimation = () => {
        setIsButtonFaded(true);
        setTimeout(() => {
            navigate('/login-signup');
        }, 1000);
    };

    return (
        <div className={`start-container ${isButtonFaded ? 'start-container-fade-out' : ''}`}>
            <button 
                className={`start-button ${isButtonFaded ? 'start-button-fade-out' : ''}`}
                onClick={clickAnimation}
            >
                START
            </button>
        </div>
    );
};

export default Start;

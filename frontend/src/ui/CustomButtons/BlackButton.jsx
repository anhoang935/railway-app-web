import React from 'react';
import styled from 'styled-components';

const BlackButton = ({ text = "Button", onClick, className = "" }) => {
    return (
        <StyledWrapper className={className}>
            <button onClick={onClick}>
                <span>{text}</span>
            </button>
        </StyledWrapper>
    );
}

const StyledWrapper = styled.div`
  margin-top: 2px; 
  
  button {
    outline: none;
    cursor: pointer;
    border: none;
    padding: 0.5rem 1.2rem; 
    margin: 0;
    font-family: inherit;
    position: relative;
    display: inline-flex; 
    align-items: center;
    justify-content: center; 
    letter-spacing: 0.05rem;
    font-weight: 700; 
    font-size: 16px; 
    height: 36px;
    border-radius: 500px; 
    overflow: hidden;
    background: #66ff66; 
    color: ghostwhite;
    transition: all 0.3s ease;
  }

  button span {
    position: relative;
    z-index: 10;
    transition: color 0.4s;
  }

  button:hover span {
    color: black; 
  }

  button::before,
  button::after {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  button::before {
    content: "";
    background: #000;
    width: 120%;
    left: -10%;
    transform: skew(30deg); 
    transition: transform 0.4s cubic-bezier(0.3, 1, 0.8, 1);
  }

  button:hover::before {
    transform: translate3d(100%, 0, 0); 
  }
`;

export default BlackButton;

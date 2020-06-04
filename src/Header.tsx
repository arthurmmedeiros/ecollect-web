import React from 'react';

interface IHeader {
    title: string;
}

const Header:React.FC<IHeader> = ({
    title
}) => {
    return(
        <h1> {title}</h1>
    )
};

export default Header;
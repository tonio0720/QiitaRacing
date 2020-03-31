import React, { useState } from 'react';

export const GlobalContext = React.createContext({});

export const GlobalProvider = ({
    children
}) => {
    const [someState, setSomeState] = useState(null);
    const [someState2, setSomeState2] = useState(null);

    return (
        <GlobalContext.Provider
            value={{
                someState,
                setSomeState,
                someState2,
                setSomeState2
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

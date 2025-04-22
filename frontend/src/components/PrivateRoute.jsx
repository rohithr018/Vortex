import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ element }) => {
    const { user } = useSelector((state) => state.user); // Get the user from Redux
    return user ? element : <Navigate to="/" replace />;
};

export default PrivateRoute;

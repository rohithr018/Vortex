import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/user/UserSlice'; // Your logout action

const AUTO_LOGOUT_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const AutoLogout = () => {
    const dispatch = useDispatch();
    const loginTime = useSelector((state) => state.user.loginTime);
    const user = useSelector((state) => state.user.user);

    useEffect(() => {
        if (loginTime) {
            const currentTime = Date.now();
            const timeElapsed = currentTime - loginTime;

            if (timeElapsed > AUTO_LOGOUT_TIME) {
                dispatch(logout());
            } else {
                const timeout = setTimeout(() => {
                    dispatch(logout());
                }, AUTO_LOGOUT_TIME - timeElapsed);

                return () => clearTimeout(timeout);
            }
        }
    }, [dispatch, loginTime, user]);

    return null;
};

export default AutoLogout;

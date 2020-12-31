import React, { useEffect, useState } from "react";

import UsersList from "../components/usersList";
import ErrorModal from "../../shared/components/UIelements/ErrorModal";
import { useHttpClient } from "../../shared/Hooks/http-hook";
import LoadingSpinner from "../../shared/components/UIelements/LoadingSpinner";

const Users = () => {
    const [loadedUsers, setLoadedUsers] = useState();
    const { isLoading, error, sendRequest, clearError } = useHttpClient();

    useEffect(() => {

        const fetchUsers = async () => {
            try {
                const responseData = await sendRequest(process.env.REACT_APP_BACKEND_URL+"/users");
                
                
                setLoadedUsers(responseData.users);
                
                
            } catch (err) {
                // setError(err.message || "Something went wrong!!");
                console.log(err);
                
            }
        }
        fetchUsers();
        
    }, [sendRequest])

    const errorHandler = () => {
        clearError();
    }


    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={errorHandler} />
            {isLoading && (
                <div className="center" >
                    <LoadingSpinner />
                </div>
            )}
            {!isLoading && loadedUsers && <UsersList items={loadedUsers} />}
        </React.Fragment>
    );
}

export default Users;
import React from "react";

import Card from "../../shared/components/UIelements/Card";
import UserItem from "./userItem";

import "./usersList.css";

function usersList(props) {
    if(props.items.length === 0) {
        return (
        <div  className="center" >
        <Card>
        <h2>No users found!</h2>
        </Card>
        </div>
        );
    }

    return (
        <ul className="users-list">
        {props.items.map(function(user) {
                return (
                <UserItem
                key={user.id}
                id={user.id}
                image={user.image}
                name={user.name}
                placeCount={user.places.length}
                 />);
        })}
        </ul>
    );

}

export default usersList;
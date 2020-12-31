import React from "react";

import Card from "../../shared/components/UIelements/Card";
import "./PlaceList.css";
import PlaceItem from "./PlaceItem";
import Button from "../../shared/components/FormElements/Button";

function PlaceList(props) {
    // console.log(props.items.length === 0);
    
    if (props.items.length === 0) {
        return <div className="place-list center" >
            <Card>
                <h2>No Places Found.</h2>
                <Button to="/places/new" >Share Place</Button>
            </Card>
        </div>
    }

    return <ul className="place-list" >
        {props.items.map(function (place) {
            return <PlaceItem key={place.id} 
            id={place.id} 
            image={place.image} 
            title={place.title} 
            description={place.description} 
            address={place.address} 
            creatorId={place.creator} 
            coordinates={place.location} 
            onDelete={props.onDeletePlace}
            />
        })}
    </ul>
}

export default PlaceList;
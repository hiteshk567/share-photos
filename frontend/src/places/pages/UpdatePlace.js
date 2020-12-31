import React, { useEffect, useState, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";

import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import "./PlaceForm.css";
import Card from "../../shared/components/UIelements/Card";
import { useForm } from "../../shared/Hooks/form-hook";
import { useHttpClient } from "../../shared/Hooks/http-hook";
import { VALIDATOR_REQUIRE, VALIDATOR_MINLENGTH } from "../../shared/utility/Validators"
import ErrorModal from "../../shared/components/UIelements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIelements/LoadingSpinner";
import { AuthContext } from "../../shared/context/auth-context";


const UpdatePlace = () => {
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    // const [isLoading, setIsLoading] = useState(true);
    const [loadedPlace, setLoadedPlace] = useState();
    const history = useHistory();
    const placeId = useParams().placeId;
    // console.log(placeId);
    const auth = useContext(AuthContext);

    
    const [formState, inputHandler, setFormData] = useForm({
        title: {
            value: "",
            isValid: false
        },
        description: {
            value: "",
            isValid: false
        }
    }, false)

    // const identifiedPlace = DUMMY_PLACES.find(p => p.id === placeId);
    // console.log(identifiedPlace);

    useEffect(() => {
        const fetchPlace = async () => {

            try {
                
            const responseData = await sendRequest(process.env.REACT_APP_BACKEND_URL+"/places/"+placeId) 
            // "PATCH", 
            // JSON.stringify({
            //     title: formState.inputs.title.value,
            //     description: formState.inputs.description.value
            // }), 
            // {
            //     "Content-Type": "application/json"
            // }  
            // )
            // console.log("http://localhost:5000/api/places/"+placeId);
            
            setLoadedPlace(responseData.place);
            setFormData({
                title: {
                    value: responseData.place.title,
                    isValid: true
                },
                description: {
                    value: responseData.place.description,
                    isValid: true
                }
            }, true);
            // console.log(updatedPlace);
            
            } catch (err) {
                console.log("frontend update needs to be edited");
            }
        }
        fetchPlace();
    }, [sendRequest, placeId, setFormData])
    
    
    const placeSubmitInputHandler = async event => {
        event.preventDefault();
        
        try {
            await sendRequest(process.env.REACT_APP_BACKEND_URL+"/places/" + placeId, "PATCH", JSON.stringify({
                title: formState.inputs.title.value,
                description: formState.inputs.description.value
            }),
            {
                "Content-Type": "application/json",
                Authorization: "Bearer " + auth.token
            }
            )
            history.push('/'+auth.userId+"/places");
        } catch (err) {
            console.log("Something went wrong in frontend while updating place");
            
        }
        
    }

    
    if(isLoading) {
        return <div className="center">
        <LoadingSpinner />                                                
    </div>
    }

    if(!loadedPlace && !error) {
        return <div className="center">
            <Card>
                <h2>Could not find the place!</h2>
            </Card>
        </div>
    }



    return (
    <React.Fragment>
        <ErrorModal error={error} onClear={clearError} />
    {!isLoading && loadedPlace && <form className="place-form" onSubmit={placeSubmitInputHandler} >
        <Input id="title" 
        element="input" 
        type="text" 
        label="Title" 
        validators={[VALIDATOR_REQUIRE()]} 
        errorText="Please enter a valid Title" 
        onInput={inputHandler} 
        initialValue={loadedPlace.title} 
        initialValid={true} />

        <Input id="description" 
        element="textarea" 
        label="Description" 
        validators={[VALIDATOR_MINLENGTH(5)]} 
        errorText="Please enter a valid Description (min 5 characters)" 
        onInput={inputHandler} 
        initialValue={loadedPlace.description} 
        initialValid={true} />

        <Button type="submit" disabled={!formState.isValid} >UPDATE PLACE</Button>
    </form>}
    </React.Fragment>)
};


export default UpdatePlace;
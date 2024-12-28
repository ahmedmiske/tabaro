import React from 'react';
import './TitleMain.css';

function TitleMain ({text1, text2}){
    return (
        <div className='title-main'>
           <h1>{text1} / {text2}</h1>        
        </div>
    )
}



export default TitleMain;